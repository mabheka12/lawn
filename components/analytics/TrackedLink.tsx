'use client'

import type { ReactNode } from 'react'

import {
  trackPhoneClick,
  trackWebsiteClick,
  trackClaimClick,
  trackSubmitBusinessClick,
} from '@/lib/analytics'

type AnalyticsProperties = Record<
  string,
  string | number | boolean | null | undefined
>

interface TrackedLinkProps {
  href: string
  children: ReactNode

  className?: string
  target?: string
  rel?: string

  event:
    | 'phone'
    | 'website'
    | 'claim'
    | 'submit-business'

  properties?: AnalyticsProperties
}

export default function TrackedLink({
  href,
  children,
  className,
  target,
  rel,
  event,
  properties = {},
}: TrackedLinkProps) {
  function handleClick() {
    const eventProperties = {
      ...properties,

      // Only fill this automatically when the caller
      // hasn't supplied a more specific source page.
      source_page:
        properties.source_page ||
        window.location.pathname,
    }

    switch (event) {
      case 'phone':
        trackPhoneClick(
          eventProperties
        )
        break

      case 'website':
        trackWebsiteClick(
          eventProperties
        )
        break

      case 'claim':
        trackClaimClick(
          eventProperties
        )
        break

      case 'submit-business':
        trackSubmitBusinessClick(
          eventProperties
        )
        break
    }
  }

  return (
    <a
      href={href}
      className={className}
      target={target}
      rel={rel}
      onClick={handleClick}
    >
      {children}
    </a>
  )
}