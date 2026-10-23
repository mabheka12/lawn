
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const RESTRICTED_COUNTRIES = new Set(['CN', 'SG']);

const PROTECTED_WRITE_ENDPOINTS = [
  '/api/leads',
  '/api/claims',
  '/api/listings',
  '/api/secure-contact',
  '/api/business-submissions',
];

function isProtectedWriteEndpoint(pathname: string): boolean {
  return PROTECTED_WRITE_ENDPOINTS.some(
    (endpoint) =>
      pathname === endpoint || pathname.startsWith(`${endpoint}/`)
  );
}

function isWriteRequest(method: string): boolean {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply country restrictions only to selected API write requests.
  // Vercel supplies this country header at the edge.
  const country = request.headers
    .get('x-vercel-ip-country')
    ?.toUpperCase();

  if (
    country &&
    RESTRICTED_COUNTRIES.has(country) &&
    isWriteRequest(request.method) &&
    isProtectedWriteEndpoint(pathname)
  ) {
    return NextResponse.json(
      { error: 'Forbidden' },
      {
        status: 403,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }

  // Only check Supabase authentication for admin pages.
  // Keep real authorization checks in server-side data access and APIs too.
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables.');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    url.searchParams.set(
      'redirect',
      `${pathname}${request.nextUrl.search}`
    );

    return NextResponse.redirect(url);
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || profile?.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)',
  ],
};
