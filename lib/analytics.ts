'use client'

import { track } from '@vercel/analytics'

type AnalyticsValue =
  | string
  | number
  | boolean
  | null
  | undefined

type EventProperties = Record<
  string,
  AnalyticsValue
>

function cleanProperties(
  properties: EventProperties
) {
  return Object.fromEntries(
    Object.entries(properties).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== ''
    )
  ) as Record<
    string,
    string | number | boolean
  >
}

export function trackQuoteSubmitted(
  properties: EventProperties
) {
  track(
    'quote_request_submitted',
    cleanProperties(properties)
  )
}

export function trackPhoneClick(
  properties: EventProperties
) {
  track(
    'phone_click',
    cleanProperties(properties)
  )
}

export function trackWebsiteClick(
  properties: EventProperties
) {
  track(
    'website_click',
    cleanProperties(properties)
  )
}

export function trackClaimClick(
  properties: EventProperties
) {
  track(
    'claim_listing_click',
    cleanProperties(properties)
  )
}

export function trackSubmitBusinessClick(
  properties: EventProperties = {}
) {
  track(
    'submit_business_click',
    cleanProperties(properties)
  )
}

export function trackFeaturedListingClick(
  properties: EventProperties
) {
  track(
    'featured_listing_click',
    cleanProperties(properties)
  )
}