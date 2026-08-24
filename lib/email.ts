// lib/email.ts

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM =
  process.env.EMAIL_FROM ||
  'Lawn Mowing Near Me <notifications@lawnmowingnearme.org>'

const ADMIN_EMAILS = (process.env.ADMIN_EMAIL || '')
  .split(',')
  .map((email) => email.trim())
  .filter(Boolean)

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'http://localhost:3000'

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

async function safeSend(params: {
  to: string[]
  subject: string
  html: string
}) {
  if (params.to.length === 0) {
    console.warn(
      '⚠️ Email skipped — no recipients:',
      params.subject
    )

    return null
  }

  if (!process.env.RESEND_API_KEY) {
    console.error(
      '❌ Email skipped — RESEND_API_KEY is missing'
    )

    return null
  }

  try {
    const { data, error } =
      await resend.emails.send({
        from: FROM,
        to: params.to,
        subject: params.subject,
        html: params.html,
      })

    if (error) {
      console.error(
        '❌ Resend email error:',
        {
          subject: params.subject,
          to: params.to,
          error,
        }
      )

      return null
    }

    console.log(
      '✅ Resend email accepted:',
      {
        subject: params.subject,
        to: params.to,
        id: data?.id,
      }
    )

    return data
  } catch (error) {
    console.error(
      '❌ Unexpected email error:',
      {
        subject: params.subject,
        to: params.to,
        error,
      }
    )

    return null
  }
}

// --------------------------------------------------
// New Listing
// --------------------------------------------------

export async function notifyAdminNewListing(listing: {
  name: string
  city: string | null
  listing_type: string
}) {
  return safeSend({
    to: ADMIN_EMAILS,

    subject:
      `New listing submitted: ${listing.name}`,

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #1f2937;">

        <h1 style="font-size: 24px;">
          New Listing Submission
        </h1>

        <p>
          A new business listing has been submitted and is awaiting review.
        </p>

        <table
          style="
            width: 100%;
            border-collapse: collapse;
            margin: 24px 0;
          "
        >
          <tbody>

            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">
                Name
              </td>

              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                ${escapeHtml(listing.name)}
              </td>
            </tr>

            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">
                City
              </td>

              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                ${escapeHtml(listing.city ?? 'N/A')}
              </td>
            </tr>

            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">
                Type
              </td>

              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                ${escapeHtml(listing.listing_type)}
              </td>
            </tr>

          </tbody>
        </table>

        <a
          href="${SITE_URL}/admin/listings"
          style="
            display: inline-block;
            background: #16a34a;
            color: white;
            text-decoration: none;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 600;
          "
        >
          Review Pending Listings
        </a>

      </div>
    `,
  })
}

// --------------------------------------------------
// New Claim
// --------------------------------------------------

export async function notifyAdminNewClaim(claim: {
  full_name: string
  email: string
  business_name: string
}) {
  return safeSend({
    to: ADMIN_EMAILS,

    subject:
      `New claim request: ${claim.business_name}`,

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #1f2937;">

        <h1 style="font-size: 24px;">
          New Claim Request
        </h1>

        <p>
          A new business claim request has been submitted and is awaiting review.
        </p>

        <table
          style="
            width: 100%;
            border-collapse: collapse;
            margin: 24px 0;
          "
        >
          <tbody>

            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">
                Business
              </td>

              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                ${escapeHtml(claim.business_name)}
              </td>
            </tr>

            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">
                Claimed By
              </td>

              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                ${escapeHtml(claim.full_name)}
              </td>
            </tr>

            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">
                Email
              </td>

              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                <a href="mailto:${escapeHtml(claim.email)}">
                  ${escapeHtml(claim.email)}
                </a>
              </td>
            </tr>

          </tbody>
        </table>

        <a
          href="${SITE_URL}/admin/claims"
          style="
            display: inline-block;
            background: #16a34a;
            color: white;
            text-decoration: none;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 600;
          "
        >
          Review Pending Claims
        </a>

      </div>
    `,
  })
}

// --------------------------------------------------
// New Edit
// --------------------------------------------------

export async function notifyAdminNewEdit(edit: {
  business_name: string
  changed_fields: string[]
}) {
  return safeSend({
    to: ADMIN_EMAILS,

    subject:
      `New edit request: ${edit.business_name}`,

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #1f2937;">

        <h1 style="font-size: 24px;">
          New Listing Edit
        </h1>

        <p>
          A listing edit has been submitted and is awaiting review.
        </p>

        <table
          style="
            width: 100%;
            border-collapse: collapse;
            margin: 24px 0;
          "
        >
          <tbody>

            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">
                Business
              </td>

              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                ${escapeHtml(edit.business_name)}
              </td>
            </tr>

            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">
                Fields Changed
              </td>

              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                ${escapeHtml(edit.changed_fields.join(', '))}
              </td>
            </tr>

          </tbody>
        </table>

        <a
          href="${SITE_URL}/admin/edits"
          style="
            display: inline-block;
            background: #16a34a;
            color: white;
            text-decoration: none;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 600;
          "
        >
          Review Pending Edits
        </a>

      </div>
    `,
  })
}

// --------------------------------------------------
// Feature Request
// --------------------------------------------------

export async function notifyAdminNewFeatureRequest(request: {
  business_name: string
  price_cents: number
  days: number
}) {
  return safeSend({
    to: ADMIN_EMAILS,

    subject:
      `New feature request: ${request.business_name}`,

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #1f2937;">

        <h1 style="font-size: 24px;">
          New Feature Request
        </h1>

        <p>
          A featured-listing request has been submitted.
        </p>

        <table
          style="
            width: 100%;
            border-collapse: collapse;
            margin: 24px 0;
          "
        >
          <tbody>

            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">
                Business
              </td>

              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                ${escapeHtml(request.business_name)}
              </td>
            </tr>

            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">
                Price
              </td>

              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                $${(request.price_cents / 100).toFixed(2)}
              </td>
            </tr>

            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">
                Duration
              </td>

              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                ${request.days} days
              </td>
            </tr>

          </tbody>
        </table>

        <a
          href="${SITE_URL}/admin/features"
          style="
            display: inline-block;
            background: #16a34a;
            color: white;
            text-decoration: none;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 600;
          "
        >
          Review Feature Requests
        </a>

      </div>
    `,
  })
}

// --------------------------------------------------
// Owner Featured Notification
// --------------------------------------------------

export async function notifyOwnerFeatured(params: {
  to: string
  business_name: string
  business_slug: string
  featured_until: string
}) {
  return safeSend({
    to: [params.to],

    subject:
      `${params.business_name} is now featured!`,

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #1f2937;">

        <h1 style="font-size: 24px;">
          Your Listing Is Featured
        </h1>

        <p>
          Your listing is now featured on Lawn Mowing Near Me.
        </p>

        <table
          style="
            width: 100%;
            border-collapse: collapse;
            margin: 24px 0;
          "
        >
          <tbody>

            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">
                Business
              </td>

              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                ${escapeHtml(params.business_name)}
              </td>
            </tr>

            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">
                Featured Until
              </td>

              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                ${new Date(params.featured_until).toLocaleDateString()}
              </td>
            </tr>

          </tbody>
        </table>

        <a
          href="${SITE_URL}/listings/${params.business_slug}"
          style="
            display: inline-block;
            background: #16a34a;
            color: white;
            text-decoration: none;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 600;
          "
        >
          View Your Listing
        </a>

      </div>
    `,
  })
}

// --------------------------------------------------
// New Lead
// --------------------------------------------------

interface NewLeadEmailData {
  name: string
  email: string
  phone?: string | null

  service: string

  city: string
  state?: string | null
  country?: string | null

  message?: string | null

  sourcePage?: string | null

  leadId: number
}

export async function notifyAdminNewLead({
  name,
  email,
  phone,
  service,
  city,
  state,
  country,
  message,
  sourcePage,
  leadId,
}: NewLeadEmailData) {
  const location = [
    city,
    state,
    country,
  ]
    .filter(Boolean)
    .join(', ')

  const adminLeadUrl =
    `${SITE_URL}/admin/leads`

  return safeSend({
    to: ADMIN_EMAILS,

    subject:
      `New ${service} lead in ${city}`,

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #1f2937;">

        <h1 style="font-size: 24px; margin-bottom: 8px;">
          New Quote Request
        </h1>

        <p style="color: #6b7280; margin-bottom: 24px;">
          A new lead has been submitted through Lawn Mowing Near Me.
        </p>

        <table
          style="
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
          "
        >
          <tbody>

            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">
                Lead ID
              </td>

              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                ${leadId}
              </td>
            </tr>

            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">
                Service
              </td>

              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                ${escapeHtml(service)}
              </td>
            </tr>

            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">
                Name
              </td>

              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                ${escapeHtml(name)}
              </td>
            </tr>

            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">
                Email
              </td>

              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                <a href="mailto:${escapeHtml(email)}">
                  ${escapeHtml(email)}
                </a>
              </td>
            </tr>

            ${
              phone
                ? `
                  <tr>

                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">
                      Phone
                    </td>

                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                      ${escapeHtml(phone)}
                    </td>

                  </tr>
                `
                : ''
            }

            <tr>

              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">
                Location
              </td>

              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                ${escapeHtml(location)}
              </td>

            </tr>

          </tbody>
        </table>

        ${
          message
            ? `
              <div
                style="
                  background: #f9fafb;
                  border: 1px solid #e5e7eb;
                  border-radius: 8px;
                  padding: 16px;
                  margin-bottom: 24px;
                "
              >
                <strong>
                  Customer Message
                </strong>

                <p
                  style="
                    margin-top: 10px;
                    white-space: pre-wrap;
                  "
                >
                  ${escapeHtml(message)}
                </p>
              </div>
            `
            : ''
        }

        ${
          sourcePage
            ? `
              <p style="font-size: 13px; color: #6b7280;">
                <strong>Source page:</strong>
                ${escapeHtml(sourcePage)}
              </p>
            `
            : ''
        }

        <div style="margin-top: 28px;">

          <a
            href="${adminLeadUrl}"
            style="
              display: inline-block;
              background: #16a34a;
              color: white;
              text-decoration: none;
              padding: 12px 20px;
              border-radius: 8px;
              font-weight: 600;
            "
          >
            View Leads
          </a>

        </div>

      </div>
    `,
  })
}