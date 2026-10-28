
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Lawn Mowing Cost Calculator | US & Australia',
  description:
    'Estimate lawn mowing costs in the United States or Australia. Choose your country for local currency, area units and pricing estimates.',
  alternates: {
    canonical: '/lawn-mowing-cost-calculator',
  },
}

const countries = [
  {
    name: 'United States',
    description:
      'Estimate lawn mowing costs in US dollars using square feet.',
    href: '/us/lawn-mowing-cost-calculator',
    currency: 'USD ($)',
    area: 'Square feet',
  },
  {
    name: 'Australia',
    description:
      'Estimate lawn mowing costs in Australian dollars using square metres.',
    href: '/au/lawn-mowing-cost-calculator',
    currency: 'AUD (A$)',
    area: 'Square metres',
  },
]

export default function LawnMowingCostCalculatorIndexPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="mx-auto mb-10 max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
          Free cost estimator
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Lawn Mowing Cost Calculator
        </h1>

        <p className="mt-4 text-base leading-7 text-gray-600">
          Choose where your property is located to estimate lawn mowing costs
          using the appropriate currency and measurement units.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {countries.map((country) => (
          <section
            key={country.href}
            className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900">
              {country.name}
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              {country.description}
            </p>

            <dl className="mt-5 space-y-2 text-sm text-gray-700">
              <div>
                <dt className="inline font-semibold">Currency: </dt>
                <dd className="inline">{country.currency}</dd>
              </div>
              <div>
                <dt className="inline font-semibold">Lawn size: </dt>
                <dd className="inline">{country.area}</dd>
              </div>
            </dl>

            <Link
              href={country.href}
              className="mt-7 inline-flex items-center justify-center rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
            >
              Calculate {country.name} costs
            </Link>
          </section>
        ))}
      </div>

      <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-6 text-gray-500">
        Estimates are for budgeting purposes only. Actual prices depend on
        your lawn, location and the services included.
      </p>
    </main>
  )
}
