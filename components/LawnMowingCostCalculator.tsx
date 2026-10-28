
'use client'

import { useMemo, useState } from 'react'

type Country = 'us' | 'au'
type Frequency = 'weekly' | 'fortnightly' | 'four-weekly' | 'one-off'
type Condition = 'maintained' | 'long' | 'difficult'

type Props = {
  country: Country
}

type PriceRange = {
  low: number
  high: number
}

const frequencyOptions: {
  value: Frequency
  label: string
  visitsPerMonth: number
  priceMultiplier: number
}[] = [
  {
    value: 'weekly',
    label: 'Weekly',
    visitsPerMonth: 4.33,
    priceMultiplier: 1,
  },
  {
    value: 'fortnightly',
    label: 'Every 2 weeks',
    visitsPerMonth: 2.17,
    priceMultiplier: 1.3,
  },
  {
    value: 'four-weekly',
    label: 'Every 4 weeks',
    visitsPerMonth: 1.08,
    priceMultiplier: 1.55,
  },
  {
    value: 'one-off',
    label: 'One-time mow',
    visitsPerMonth: 0,
    priceMultiplier: 1.2,
  },
]

const conditionOptions: {
  value: Condition
  label: string
  multiplier: number
}[] = [
  { value: 'maintained', label: 'Regularly maintained', multiplier: 1 },
  { value: 'long', label: 'Long or overgrown grass', multiplier: 1.4 },
  { value: 'difficult', label: 'Slopes or difficult access', multiplier: 1.25 },
]

function getPriceRange(country: Country, area: number): PriceRange {
  if (country === 'us') {
    // Area is entered in square feet.
    if (area <= 5445) return { low: 30, high: 40 }
    if (area <= 10890) return { low: 45, high: 85 }
    if (area <= 21780) return { low: 50, high: 100 }
    if (area <= 43560) return { low: 60, high: 150 }
    if (area <= 87120) return { low: 100, high: 260 }

    const acres = area / 43560
    return {
      low: 100 + Math.ceil(acres - 2) * 60,
      high: 260 + Math.ceil(acres - 2) * 150,
    }
  }

  // Australian indicative bands in square metres.
  if (area <= 80) return { low: 40, high: 80 }
  if (area <= 160) return { low: 60, high: 120 }
  if (area <= 500) return { low: 80, high: 160 }
  if (area <= 1000) return { low: 100, high: 220 }

  const blocks = Math.ceil(area / 1000)
  return {
    low: 100 * blocks,
    high: 220 * blocks,
  }
}

function roundToFive(value: number) {
  return Math.round(value / 5) * 5
}

export default function LawnMowingCostCalculator({ country }: Props) {
  const isUS = country === 'us'
  const currency = isUS ? 'USD' : 'AUD'
  const areaUnit = isUS ? 'sq ft' : 'm²'
  const minimumArea = 1

  const [area, setArea] = useState(isUS ? '5000' : '100')
  const [frequency, setFrequency] = useState<Frequency>('fortnightly')
  const [condition, setCondition] = useState<Condition>('maintained')

  const estimate = useMemo(() => {
    const parsedArea = Number(area)
    const safeArea =
      Number.isFinite(parsedArea) && parsedArea >= minimumArea
        ? parsedArea
        : minimumArea

    const base = getPriceRange(country, safeArea)
    const frequencyMultiplier =
      frequencyOptions.find((item) => item.value === frequency)
        ?.priceMultiplier ?? 1
    const conditionMultiplier =
      conditionOptions.find((item) => item.value === condition)
        ?.multiplier ?? 1

    const multiplier = frequencyMultiplier * conditionMultiplier
    const low = roundToFive(base.low * multiplier)
    const high = roundToFive(base.high * multiplier)
    const visitsPerMonth =
      frequencyOptions.find((item) => item.value === frequency)
        ?.visitsPerMonth ?? 0

    return {
      low,
      high,
      monthlyLow: roundToFive(low * visitsPerMonth),
      monthlyHigh: roundToFive(high * visitsPerMonth),
    }
  }, [area, country, frequency, condition])

  const money = (value: number) =>
    new Intl.NumberFormat(isUS ? 'en-US' : 'en-AU', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value)

  const inputClass =
    'mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900 shadow-sm focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-700/20'

  return (
    <section className="mx-auto w-full max-w-3xl rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
          Free cost estimator
        </p>
        <h2 className="mt-2 text-2xl font-bold text-gray-900">
          Estimate your lawn mowing cost
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Adjust the lawn size, mowing schedule and grass condition to get an
          indicative price range.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`lawn-area-${country}`}
            className="block text-sm font-semibold text-gray-800"
          >
            Lawn area ({areaUnit})
          </label>
          <input
            id={`lawn-area-${country}`}
            type="number"
            min={minimumArea}
            step="1"
            inputMode="numeric"
            value={area}
            onChange={(event) => setArea(event.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter the grass area only, not the entire property.
          </p>
        </div>

        <div>
          <label
            htmlFor={`lawn-frequency-${country}`}
            className="block text-sm font-semibold text-gray-800"
          >
            Mowing frequency
          </label>
          <select
            id={`lawn-frequency-${country}`}
            value={frequency}
            onChange={(event) =>
              setFrequency(event.target.value as Frequency)
            }
            className={inputClass}
          >
            {frequencyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor={`lawn-condition-${country}`}
            className="block text-sm font-semibold text-gray-800"
          >
            Lawn condition and access
          </label>
          <select
            id={`lawn-condition-${country}`}
            value={condition}
            onChange={(event) =>
              setCondition(event.target.value as Condition)
            }
            className={inputClass}
          >
            {conditionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        aria-live="polite"
        className="mt-7 rounded-xl bg-green-50 p-5 sm:p-6"
      >
        <p className="text-sm font-medium text-green-900">
          Estimated price per visit
        </p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-green-900">
          {money(estimate.low)} – {money(estimate.high)}
        </p>

        {frequency !== 'one-off' ? (
          <div className="mt-5 border-t border-green-200 pt-4">
            <p className="text-sm font-medium text-green-900">
              Estimated monthly mowing budget
            </p>
            <p className="mt-1 text-xl font-bold text-green-900">
              {money(estimate.monthlyLow)} – {money(estimate.monthlyHigh)}
            </p>
            <p className="mt-1 text-xs text-green-800">
              Based on an average month and your selected mowing schedule.
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-green-900">
            This is a one-time estimate; no monthly total is calculated.
          </p>
        )}
      </div>

      <p className="mt-5 text-xs leading-5 text-gray-500">
        Estimates are general planning guides, not quotes. Actual prices vary
        by location, lawn layout, grass growth, travel, disposal requirements
        and the services included. Frequency and condition adjustments are
        calculator assumptions, not guaranteed market rates. Request local
        quotes before budgeting for a specific job.
      </p>
    </section>
  )
}
