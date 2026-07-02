// lib/service-config.ts
export const SERVICE_CONFIG = {
  'lawn-care': {
    listingType: 'mowing',
    label: 'Lawn Care',
    heroDescription: 'lawn mowing, edging, and maintenance services',
  },
  'mower-repair': {
    listingType: 'repairs',
    label: 'Mower Repair',
    heroDescription: 'lawn mower repair, servicing, and blade sharpening',
  },
} as const

export type ServiceSlug = keyof typeof SERVICE_CONFIG