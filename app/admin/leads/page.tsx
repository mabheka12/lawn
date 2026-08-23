import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import {
  Mail,
  Phone,
  MapPin,
  Clock,
} from 'lucide-react'

interface PageProps {
  searchParams: Promise<{
    status?: string
  }>
}

export default async function AdminLeadsPage({
  searchParams,
}: PageProps) {
  const params = await searchParams

  const selectedStatus =
    params.status || 'all'

  const supabase =
    await createClient()

  let query = supabase
    .from('leads')
    .select(`
      id,
      name,
      email,
      phone,
      service,
      city,
      state,
      country,
      message,
      source_page,
      business_id,
      status,
      created_at
    `)
    .order('created_at', {
      ascending: false,
    })

  if (selectedStatus !== 'all') {
    query = query.eq(
      'status',
      selectedStatus
    )
  }

  const {
    data: leads,
    error,
  } = await query

  if (error) {
    console.error(
      'Lead fetch error:',
      error
    )
  }

  const filters = [
    {
      value: 'all',
      label: 'All',
    },
    {
      value: 'new',
      label: 'New',
    },
    {
      value: 'contacted',
      label: 'Contacted',
    },
    {
      value: 'closed',
      label: 'Closed',
    },
    {
      value: 'spam',
      label: 'Spam',
    },
  ]

  return (
    <div className="p-6 md:p-8">

      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Leads
        </h1>

        <p className="text-gray-600 mt-2">
          Manage quote requests and enquiries
          submitted through the directory.
        </p>

      </div>

      {/* FILTERS */}

      <div className="flex flex-wrap gap-2 mb-8">

        {filters.map((filter) => (
          <Link
            key={filter.value}
            href={
              filter.value === 'all'
                ? '/admin/leads'
                : `/admin/leads?status=${filter.value}`
            }
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
              selectedStatus ===
              filter.value
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {filter.label}
          </Link>
        ))}

      </div>

      {!leads ||
      leads.length === 0 ? (

        <div className="bg-white border rounded-xl p-12 text-center">

          <Mail
            size={40}
            className="text-gray-400 mx-auto mb-4"
          />

          <h2 className="text-xl font-bold">
            No leads found
          </h2>

          <p className="text-gray-500 mt-2">
            Quote requests will appear here.
          </p>

        </div>

      ) : (

        <div className="space-y-5">

          {leads.map((lead) => (

            <div
              key={lead.id}
              className="bg-white border rounded-xl p-6"
            >

              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

                <div className="flex-1">

                  <div className="flex flex-wrap items-center gap-3 mb-3">

                    <h2 className="text-xl font-bold">
                      {lead.name}
                    </h2>

                    <StatusBadge
                      status={
                        lead.status
                      }
                    />

                  </div>

                  <div className="text-lg font-semibold text-green-700">
                    {lead.service}
                  </div>

                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600 mt-3">

                    <a
                      href={`mailto:${lead.email}`}
                      className="inline-flex items-center gap-2 hover:text-green-700"
                    >
                      <Mail size={16} />

                      {lead.email}
                    </a>

                    {lead.phone && (
                      <a
                        href={`tel:${lead.phone}`}
                        className="inline-flex items-center gap-2 hover:text-green-700"
                      >
                        <Phone
                          size={16}
                        />

                        {lead.phone}
                      </a>
                    )}

                    <div className="inline-flex items-center gap-2">

                      <MapPin
                        size={16}
                      />

                      {lead.city}

                      {lead.state &&
                        `, ${lead.state}`}

                      {lead.country &&
                        `, ${lead.country}`}

                    </div>

                  </div>

                  {lead.message && (
                    <div className="bg-gray-50 rounded-lg p-4 mt-5">

                      <div className="text-xs font-semibold uppercase text-gray-500 mb-2">
                        Message
                      </div>

                      <p className="text-gray-700 whitespace-pre-wrap">
                        {lead.message}
                      </p>

                    </div>
                  )}

                  <div className="flex flex-wrap gap-4 mt-5 text-xs text-gray-500">

                    <div className="inline-flex items-center gap-1">

                      <Clock
                        size={14}
                      />

                      {new Date(
                        lead.created_at
                      ).toLocaleString()}

                    </div>

                    {lead.source_page && (
                      <div>
                        Source:{' '}
                        <a
                          href={
                            lead.source_page
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-700 hover:underline"
                        >
                          {
                            lead.source_page
                          }
                        </a>
                      </div>
                    )}

                    {lead.business_id && (
                      <div>
                        Business ID:{' '}
                        {lead.business_id}
                      </div>
                    )}

                  </div>

                </div>

                <LeadStatusActions
                  id={lead.id}
                  currentStatus={
                    lead.status
                  }
                />

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  )
}

function StatusBadge({
  status,
}: {
  status: string
}) {
  const classes =
    status === 'new'
      ? 'bg-blue-100 text-blue-700'
      : status === 'contacted'
      ? 'bg-yellow-100 text-yellow-700'
      : status === 'closed'
      ? 'bg-green-100 text-green-700'
      : 'bg-gray-100 text-gray-600'

  return (
    <span
      className={`text-xs font-semibold px-3 py-1 rounded-full ${classes}`}
    >
      {status}
    </span>
  )
}

function LeadStatusActions({
  id,
  currentStatus,
}: {
  id: number
  currentStatus: string
}) {
  return (
    <div className="flex flex-wrap lg:flex-col gap-2">

      {[
        'new',
        'contacted',
        'closed',
        'spam',
      ].map((status) => (

        <form
          key={status}
          action={`/api/admin/leads/${id}`}
          method="post"
        >

          <input
            type="hidden"
            name="status"
            value={status}
          />

          <button
            type="submit"
            disabled={
              currentStatus ===
              status
            }
            className="w-full px-4 py-2 border rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-50 capitalize"
          >
            {status}
          </button>

        </form>

      ))}

    </div>
  )
}