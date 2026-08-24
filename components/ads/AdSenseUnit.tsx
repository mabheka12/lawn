'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

interface AdSenseUnitProps {
  slot: string
  className?: string
  format?: 'auto' | 'horizontal' | 'rectangle' | 'vertical'
  fullWidthResponsive?: boolean
}

export default function AdSenseUnit({
  slot,
  className = '',
  format = 'auto',
  fullWidthResponsive = true,
}: AdSenseUnitProps) {
  useEffect(() => {
    try {
      ;(
        window.adsbygoogle =
          window.adsbygoogle || []
      ).push({})
    } catch (error) {
      console.error(
        'AdSense error:',
        error
      )
    }
  }, [])

  return (
    <div
      className={`w-full overflow-hidden ${className}`}
    >
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
        }}
        data-ad-client="ca-pub-6988145475779418"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={
          fullWidthResponsive
            ? 'true'
            : 'false'
        }
      />
    </div>
  )
}