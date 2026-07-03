import fs from "fs";
import ws from "ws"
import csv from "fast-csv";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL="https://zoqpneghanhtseyzbdll.supabase.co"
const SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvcXBuZWdoYW5odHNleXpiZGxsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA3MzAxMywiZXhwIjoyMDk1NjQ5MDEzfQ.RtD4qW5pVEtzYS4Yc00Wb21i_v2dF1quC6bitwm9Ivk"
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    realtime: {
        transport: ws,
    },
});

// ---- matching logic ----
async function findListingId(row) {
    if (row.id) return row.id;

    if (row.slug) {
        const { data, error } = await supabase
            .from("businesses")
            .select("id")
            .eq("slug", row.slug)
            .maybeSingle();
        if (error) throw error;
        if (data) return data.id;
    }

    if (row.name && row.address) {
        const { data, error } = await supabase
            .from("businesses")
            .select("id")
            .eq("name", row.name)
            .eq("address", row.address)
            .maybeSingle();
        if (error) throw error;
        if (data) return data.id;
    }

    return null;
}

// ---- hours parsing (only needed if open_hours in your CSV is still a raw string) ----
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

function parseSquishedHours(raw) {
    if (!raw) return null;
    const dayPattern = new RegExp(`(?=(${DAYS.join("|")}):)`, "g");
    const lines = raw.split(dayPattern).map(s => s.trim()).filter(Boolean);

    const result = {};
    for (const line of lines) {
        const idx = line.indexOf(":");
        const day = line.slice(0, idx).trim();
        const range = line.slice(idx + 1).trim();
        if (!DAYS.includes(day)) continue;

        if (/closed/i.test(range)) {
            result[day.toLowerCase()] = { open: null, close: null };
            continue;
        }
        const match = range.match(/(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M)/i);
        if (!match) continue;

        result[day.toLowerCase()] = { open: to24h(match[1]), close: to24h(match[2]) };
    }
    return result;
}

function to24h(time) {
    const [, h, m, ap] = time.match(/(\d{1,2}):(\d{2})\s*([AP]M)/i);
    let hour = parseInt(h, 10);
    if (/PM/i.test(ap) && hour !== 12) hour += 12;
    if (/AM/i.test(ap) && hour === 12) hour = 0;
    return `${String(hour).padStart(2, "0")}:${m}`;
}

// ---- main ----
const rows = [];

fs.createReadStream("listings_clean.csv")
    .pipe(csv.parse({ headers: true }))
    .on("data", row => rows.push(row))
    .on("end", async () => {
        for (const row of rows) {
            const id = await findListingId(row);
            if (!id) {
                console.warn(`Skipping unmatched: ${row.name}`);
                continue;
            }

            const patch = {
                google_image_url: row.google_image_url,
                google_reviews_count: row.google_reviews_count
                    ? row.google_reviews_count
                    : null,
            };

            if (row.open_hours) {
                patch.open_hours = parseSquishedHours(row.open_hours);
            }

            const { error } = await supabase
                .from("businesses")
                .update(patch)
                .eq("id", id);

            if (error) console.error(`Failed for ${row.name}:`, error.message);
        }
        console.log("Done");
    });