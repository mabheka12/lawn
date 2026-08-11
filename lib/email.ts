import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev'
const ADMIN_EMAILS = (process.env.ADMIN_EMAIL || '')
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean)
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

// Best-effort — email failures should never break the request that triggered them.
async function safeSend(params: { to: string[]; subject: string; html: string }) {
  if (params.to.length === 0) {
    console.warn('Skipped email — no recipients:', params.subject)
    return
  }
  try {
    await resend.emails.send({ from: FROM, ...params })
  } catch (err) {
    console.error('Email send failed:', params.subject, err)
  }
}

export async function notifyAdminNewListing(listing: { name: string; city: string | null; listing_type: string }) {
  await safeSend({
    to: ADMIN_EMAILS,
    subject: `New listing submitted: ${listing.name}`,
    html: `
      <p>A new listing was submitted and is awaiting review.</p>
      <ul>
        <li><strong>Name:</strong> ${listing.name}</li>
        <li><strong>City:</strong> ${listing.city ?? 'N/A'}</li>
        <li><strong>Type:</strong> ${listing.listing_type}</li>
      </ul>
      <p><a href="${SITE_URL}/admin/listings">Review pending listings →</a></p>
    `,
  })
}

export async function notifyAdminNewClaim(claim: { full_name: string; email: string; business_name: string }) {
  await safeSend({
    to: ADMIN_EMAILS,
    subject: `New claim request: ${claim.business_name}`,
    html: `
      <p>A new claim request was submitted and is awaiting review.</p>
      <ul>
        <li><strong>Business:</strong> ${claim.business_name}</li>
        <li><strong>Claimed by:</strong> ${claim.full_name} (${claim.email})</li>
      </ul>
      <p><a href="${SITE_URL}/admin/claims">Review pending claims →</a></p>
    `,
  })
}

export async function notifyAdminNewEdit(edit: { business_name: string; changed_fields: string[] }) {
  await safeSend({
    to: ADMIN_EMAILS,
    subject: `New edit request: ${edit.business_name}`,
    html: `
      <p>A listing edit was submitted and is awaiting review.</p>
      <ul>
        <li><strong>Business:</strong> ${edit.business_name}</li>
        <li><strong>Fields changed:</strong> ${edit.changed_fields.join(', ')}</li>
      </ul>
      <p><a href="${SITE_URL}/admin/edits">Review pending edits →</a></p>
    `,
  })
}

export async function notifyAdminNewFeatureRequest(request: { business_name: string; price_cents: number; days: number }) {
  await safeSend({
    to: ADMIN_EMAILS,
    subject: `New feature request: ${request.business_name}`,
    html: `
      <p>A new feature request was submitted and is awaiting payment + review.</p>
      <ul>
        <li><strong>Business:</strong> ${request.business_name}</li>
        <li><strong>Price:</strong> $${(request.price_cents / 100).toFixed(2)} / ${request.days} days</li>
      </ul>
      <p><a href="${SITE_URL}/admin/features">Review feature requests →</a></p>
    `,
  })
}

export async function notifyOwnerFeatured(params: { to: string; business_name: string; business_slug: string; featured_until: string }) {
  await safeSend({
    to: [params.to],
    subject: `${params.business_name} is now featured!`,
    html: `
      <p>Good news — your listing is now featured and will appear in the homepage spotlight.</p>
      <ul>
        <li><strong>Business:</strong> ${params.business_name}</li>
        <li><strong>Featured until:</strong> ${new Date(params.featured_until).toLocaleDateString()}</li>
      </ul>
      <p><a href="${SITE_URL}/listings/${params.business_slug}">View your listing →</a></p>
    `,
  })
}