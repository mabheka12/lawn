
import type { Metadata } from 'next'
import Link from 'next/link'
import LawnMowingCostCalculator from '@/components/LawnMowingCostCalculator'

export const metadata: Metadata = {
  title: 'Lawn Mowing Cost Calculator (US) | Lawn Mowing Near Me',
  description:
    'Estimate lawn mowing costs in the United States using lawn size, mowing frequency and grass condition. See estimated costs per visit and per month.',
  alternates: {
    canonical: '/us/lawn-mowing-cost-calculator',
  },
}

export default function USLawnMowingCostCalculatorPage() {
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
          United States
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Lawn Mowing Cost Calculator
        </h1>
        <p className="mt-4 text-base leading-7 text-gray-600">
          Estimate what it may cost to have your lawn mowed. Enter your grass
          area in square feet, choose how often you need service, and account
          for the condition of your lawn.
        </p>
      </header>

      <LawnMowingCostCalculator country="us" />

      <article className="mx-auto mt-12 max-w-3xl space-y-8 text-gray-700">
        <section>
          <h2 className="text-2xl font-bold text-gray-900">
            What affects lawn mowing prices?
          </h2>
          <p className="mt-3 leading-7">
            Lawn size is an important factor, but it is not the only one.
            Grass height, slopes, obstacles, access, travel distance and
            whether trimming or clipping cleanup is included can all affect a
            contractor&apos;s quote. Less frequent mowing may also cost more
            per visit if the grass has grown significantly between appointments.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900">
            How the estimate works
          </h2>
          <p className="mt-3 leading-7">
            The calculator starts with broad published US price ranges for
            different lawn sizes, then applies clearly disclosed adjustments
            for mowing frequency and lawn condition. The adjustments are
            planning assumptions; they are not a prediction of what a
            particular company will charge.
          </p>
          <p className="mt-3 leading-7">
            For additional context, see{' '}
            <a
              href="https://homeguide.com/costs/landscaping-costs/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-green-800 underline underline-offset-2"
            >
              HomeGuide&apos;s lawn care and mowing cost guide
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900">
            Find lawn mowing services
          </h2>
          <p className="mt-3 leading-7">
            Use this estimate as a starting point, then compare local
            providers. Ask whether the price includes mowing, edging,
            trimming, and clearing clippings from paths and driveways.
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
            Is the result a quote?
          </h3>
          <p className="mt-2 leading-7">
            No. It is an indicative estimate based on general price bands and
            selected assumptions. Contact providers for an accurate quote
            based on your property and location.
          </p>

          <h3 className="mt-5 text-lg font-semibold text-gray-900">
            Does lawn area mean my entire property?
          </h3>
          <p className="mt-2 leading-7">
            No. Enter the area of grass that needs mowing, excluding the
            house, driveway, patio and other areas that do not need cutting.
          </p>
        </section>
      </article>
    </main>
  )
}
