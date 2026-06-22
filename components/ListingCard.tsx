import Link from 'next/link'
import { Star, MapPin, Phone, Globe } from 'lucide-react'

interface Business {
  id: number
  name: string
  slug: string
  address?: string | null
  phone?: string | null
  website?: string | null
  rating?: string | null
  category?: string | null
  city?: string | null
  state?: string | null
  description?: string | null
  listing_type?: 'repairs' | 'mowing' | null

}

interface ListingCardProps {
  business: Business
  variant?: 'default' | 'compact' | 'featured'
  showActions?: boolean
}

export default function ListingCard({ 
  business, 
  variant = 'default', 
  showActions = true 
}: ListingCardProps) {
  const ratingNumber = business.rating ? parseFloat(business.rating) : 0
  const fullStars = Math.floor(ratingNumber)
  const hasHalfStar = ratingNumber % 1 >= 0.5
  const getListingLabel = (type?: 'repairs' | 'mowing' | null) => {
    switch (type) {
      case 'repairs':
        return 'Repair Shop'
      case 'mowing':
        return 'Lawn Care'
      default:
        return 'Service'
    }
  }

  if (variant === 'compact') {
    return (
      <Link href={`/listings/${business.slug}`}>
        <div className="bg-white rounded-lg p-4 hover:shadow-md transition cursor-pointer border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <span className={`
                  inline-block text-xs font-semibold px-2 py-1 rounded-full
                  ${business.listing_type === 'repairs'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-green-100 text-green-700'}
                `}>
                  {getListingLabel(business.listing_type)}
                </span>
              <h3 className="font-semibold text-lg text-gray-800 hover:text-green-600">
                {business.name}
              </h3>
              {business.city && (
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                  <MapPin size={14} />
                  <span>{business.city}, {business.state}</span>
                </div>
              )}
            </div>
            {business.rating && (
              <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded">
                <Star size={14} className="text-yellow-500 fill-current" />
                <span className="font-medium text-sm">{business.rating}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    )
  }

  if (variant === 'featured') {
    return (
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-md overflow-hidden border border-green-100">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">Featured</span>
                {business.category && (
                  <span className="text-xs text-gray-500">{business.category}</span>
                )}
              </div>
              <Link href={`/listings/${business.slug}`}>
                <h2 className="text-2xl font-bold text-gray-800 hover:text-green-600 transition">
                  {business.name}
                </h2>
              </Link>
            </div>
            {business.rating && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={`${
                        i < fullStars 
                          ? 'text-yellow-500 fill-current' 
                          : i === fullStars && hasHalfStar
                          ? 'text-yellow-500 fill-current opacity-50'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-lg">{business.rating}</span>
              </div>
            )}
          </div>

          {business.description && (
            <p className="text-gray-600 mb-4 line-clamp-2">{business.description}</p>
          )}

          <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-500">
            {business.address && (
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                <span>{business.city}, {business.state}</span>
              </div>
            )}
            {business.phone && (
              <div className="flex items-center gap-1">
                <Phone size={16} />
                <span>{business.phone}</span>
              </div>
            )}
          </div>

          {showActions && (
            <div className="flex gap-3">
              <Link href={`/listings/${business.slug}`}>
                <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
                  View Details
                </button>
              </Link>
              {business.website && (
                <a href={business.website} target="_blank" rel="noopener noreferrer">
                  <button className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition">
                    Visit Website
                  </button>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <Link href={`/listings/${business.slug}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group">
        <div className="p-6">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h2 className="text-xl font-bold text-gray-800 group-hover:text-green-600 transition mb-1">
                {business.name}
              </h2>
              {business.category && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {business.category}
                </span>
              )}
            </div>
            {business.rating && (
              <div className="flex items-center gap-1">
                <Star className="text-yellow-500 fill-current" size={18} />
                <span className="font-semibold">{business.rating}</span>
                <span className="text-gray-400 text-sm">(24)</span>
              </div>
            )}
          </div>

          {business.address && (
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <MapPin size={16} />
              <span className="text-sm">
                {business.address}, {business.city}, {business.state}
              </span>
            </div>
          )}

          {business.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {business.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex gap-3">
              {business.phone && (
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <Phone size={14} />
                  <span>Call</span>
                </div>
              )}
              {business.website && (
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <Globe size={14} />
                  <span>Website</span>
                </div>
              )}
            </div>
            <div className="text-green-600 group-hover:translate-x-1 transition-transform">
              →
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}