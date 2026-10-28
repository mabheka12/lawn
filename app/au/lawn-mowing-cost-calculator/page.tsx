
import type { Metadata } from 'next'
import Link from 'next/link'
import LawnMowingCostCalculator from '@/components/LawnMowingCostCalculator'

export const metadata: Metadata = {
  title: 'Lawn Mowing Cost Calculator (Australia) | Lawn Mowing Near Me',
  description:
    'Estimate lawn mowing costs in Australia in AUD. Calculate indicative costs by lawn size, mowing frequency and grass condition.',
  alternates: {
    canonical: '/au/lawn-mowing-cost-calculator',
  },
}

export default function AustralianLawnMowingCostCalculatorPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        {' / '}
        <span aria-current="page">Lawn mowing cost calculator</span>
      </nav>

      <header className="mx-auto mb-8 max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
          Australia
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Lawn Mowing Cost Calculator
        </h1>
        <p className="mt-4 text-base leading-7 text-gray-600">
          Estimate professional lawn mowing costs in Australia. Enter the
          grass area in square metres, select your mowing frequency and
          describe the lawn&apos;s condition to see a guide in Australian dollars.
        </p>
      </header>

      <LawnMowingCostCalculator country="au" />

      <article className="mx-auto mt-12 max-w-3xl space-y-8 text-gray-700">
        <section>
          <h2 className="text-2xl font-bold text-gray-900">
            How much does lawn mowing cost in Australia?
          </h2>
          <p className="mt-3 leading-7">
            Prices depend on the lawn&apos;s size, how quickly the grass grows,
            access to the area and the work included in the service. A small
            lawn may cost substantially less to maintain than a large block
            that needs extra trimming or equipment.
          </p>
          <p className="mt-3 leading-7">
            Published guides offer different price ranges because their
            locations, job definitions and data sources differ. For example,
            the Australian price guide from Blue Collar News publishes
            indicative state-level ranges, while hipages discusses pricing by
            lawn size and hourly rates.
          </p>
          <p className="mt-3 leading-7">
            Read the{' '}
            <a
              href="https://services.bluecollarnews.com.au/cost/landscaping/lawn-mowing/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-green-800 underline underline-offset-2"
            >
              Australian lawn mowing price guide
            </a>{' '}
            or the{' '}
            <a
              href="https://hipages.com.au/article/how_much_does_lawn_mowing_cost"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-green-800 underline underline-offset-2"
            >
              hipages lawn mowing cost guide
            </a>{' '}
            for more context.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900">
            How to use the calculator
          </h2>
          <p className="mt-3 leading-7">
            Enter the grass area in square metres, rather than the total land
            area. Select a mowing schedule and choose whether the lawn is
            regularly maintained, overgrown or difficult to access. The result
            is a general planning range, not a local contractor quote.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900">
            Find lawn mowing services
          </h2>
          <p className="mt-3 leading-7">
            Compare local providers and confirm what each quote includes.
            Mowing, edging, whipper-snipping, blowing paths clear and removing
            clippings may be priced differently between businesses.
          </p>
          <Link
            href="/near-me"
            className="mt-4 inline-flex rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
          >
            Find lawn mowing near you
          </Link>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900">
            Frequently asked questions
          </h2>

          <h3 className="mt-5 text-lg font-semibold text-gray-900">
            Are the estimates inclusive of GST?
          </h3>
          <p className="mt-2 leading-7">
            The calculator does not add or remove GST separately. Published
            Australian guides may specify whether their figures include GST;
            ask a provider to confirm whether their quote includes it.
          </p>

          <h3 className="mt-5 text-lg font-semibold text-gray-900">
            Why might my quote be different?
          </h3>
          <p className="mt-2 leading-7">
            Local labour costs, travel, grass height, terrain, lawn layout,
            clipping disposal and the services included can all change the
            final price.
          </p>
        </section>
      </article>
    </main>
  )
}
