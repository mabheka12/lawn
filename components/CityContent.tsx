'use client'

import { 
  Wrench, Calendar, Shield, Clock, Award, TrendingUp, 
  Sparkles, Leaf, Droplets, Sun, Zap, CheckCircle 
} from 'lucide-react'

interface CityContentProps {
  city: string
  totalBusinesses: number
  avgRating: number
  categoriesInCity: string[]
  variant?: 'sidebar' | 'sidebar-full' | 'full'
}

export default function CityContent({ 
  city, 
  totalBusinesses, 
  avgRating, 
  categoriesInCity,
  variant = 'full' 
}: CityContentProps) {
  const cityName = city
  const hasBusinesses = totalBusinesses > 0

  if (!hasBusinesses) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h2 className="text-xl font-bold mb-3 text-green-800">
          Help Build {city}'s Lawn Mower Community
        </h2>
        <p className="text-gray-600 text-sm">
          Be the first to list your lawn mower business in {city}.
        </p>
      </div>
    )
  }

  // Sidebar variant - Compact version for sidebar
  if (variant === 'sidebar') {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-bold mb-3 text-green-800 flex items-center gap-2">
          <Award size={18} />
          About {city} Lawn Services
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Sparkles size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{totalBusinesses}</span> lawn mower professionals in {city}
            </p>
          </div>
          
          <div className="flex items-start gap-2">
            <Award size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600">
              Average rating: <span className="font-semibold">{avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}</span> stars
            </p>
          </div>
          
          {categoriesInCity.length > 0 && (
            <div className="flex items-start gap-2">
              <Wrench size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600">
                Services: <span className="font-medium">{categoriesInCity.slice(0, 3).join(', ')}</span>
                {categoriesInCity.length > 3 && ` +${categoriesInCity.length - 3} more`}
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            🌿 Seasonal lawn care tips available for {city}
          </p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
              <Calendar size={12} /> Spring
            </span>
            <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
              <Leaf size={12} /> Summer
            </span>
            <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
              <Shield size={12} /> Fall
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Sidebar-Full variant - More detailed content for 50/50 layout
  if (variant === 'sidebar-full') {
    const seasonalTips = [
      {
        icon: Calendar,
        title: 'Seasonal Lawn Care',
        description: `Spring: Fertilize & aerate. Summer: Mow & water. Fall: Overseed & prepare for winter.`
      },
      {
        icon: Wrench,
        title: 'Local Mower Issues',
        description: `${cityName}'s climate causes blade rust, battery drain, and seasonal wear. Regular maintenance prevents breakdowns.`
      },
      {
        icon: Shield,
        title: 'Choosing a Pro',
        description: `Look for ${cityName} professionals with certifications, local experience, and positive reviews.`
      }
    ]

    const lawnCareTips = [
      {
        icon: Leaf,
        title: 'Best Grass Types',
        description: `Choose grass varieties that thrive in ${cityName}'s specific climate conditions.`
      },
      {
        icon: Droplets,
        title: 'Watering Schedule',
        description: `Early morning (5-9 AM) watering minimizes evaporation in ${cityName}.`
      },
      {
        icon: Sun,
        title: 'Sun Management',
        description: `Professional services help manage shade and sun patterns for a healthy lawn.`
      }
    ]

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4 text-green-800 flex items-center gap-2">
          <Award size={20} />
          Lawn Care Guide for {city}
        </h3>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{totalBusinesses}</div>
            <div className="text-xs text-gray-600">Local Pros</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}</div>
            <div className="text-xs text-gray-600">Avg Rating</div>
          </div>
        </div>
        
        {/* Seasonal Tips */}
        <div className="space-y-3 mb-4">
          <h4 className="font-semibold text-gray-700 flex items-center gap-2">
            <Calendar size={16} />
            Seasonal Tips
          </h4>
          {seasonalTips.map((tip, index) => {
            const Icon = tip.icon
            return (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Icon size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-gray-800">{tip.title}</p>
                    <p className="text-xs text-gray-600">{tip.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Lawn Care Tips */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-700 flex items-center gap-2">
            <Leaf size={16} />
            Lawn Care Tips
          </h4>
          {lawnCareTips.map((tip, index) => {
            const Icon = tip.icon
            return (
              <div key={index} className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Icon size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-gray-800">{tip.title}</p>
                    <p className="text-xs text-gray-600">{tip.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Categories */}
        {categoriesInCity.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="font-semibold text-gray-700 mb-2">Available Services</h4>
            <div className="flex flex-wrap gap-2">
              {categoriesInCity.slice(0, 6).map(cat => (
                <span key={cat} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {cat}
                </span>
              ))}
              {categoriesInCity.length > 6 && (
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  +{categoriesInCity.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Full variant - Complete content (used elsewhere)
  const seasonalTips = [
    {
      icon: Calendar,
      title: 'Seasonal Lawn Care Calendar',
      description: `The best times for lawn maintenance in ${cityName}: Spring (March-May) for fertilizing, Summer (June-August) for mowing and watering, Fall (September-November) for aeration and overseeding.`
    },
    {
      icon: Wrench,
      title: 'Common Mower Issues in Local Climate',
      description: `${cityName}'s climate can cause specific issues: dry spells requiring blade adjustments, seasonal rust from humidity, and battery drain in extreme temperatures.`
    },
    {
      icon: Shield,
      title: 'Choosing the Right Service',
      description: `Look for ${cityName} lawn mower professionals with certifications, local experience, and positive reviews. Ask about warranties and maintenance packages.`
    },
    {
      icon: Clock,
      title: 'Emergency Repair Services',
      description: `When your mower breaks during peak season in ${cityName}, look for services offering same-day repairs and emergency call-outs.`
    }
  ]

  const tips = [
    {
      icon: Sparkles,
      title: `${totalBusinesses} Local Experts Available`,
      description: `With ${totalBusinesses} lawn mower professionals in ${cityName}, you have access to a wide range of expertise. Compare ratings and reviews to find your perfect match.`
    },
    {
      icon: Award,
      title: `Average Rating: ${avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}`,
      description: avgRating > 0 
        ? `${cityName} lawn mower professionals maintain a strong average rating of ${avgRating.toFixed(1)} stars. The reviews whether outsourced or user-generated ensure you get the best service.`
        : `Help establish ${cityName}'s lawn mower rating system by leaving reviews for services you've used.`
    },
    {
      icon: TrendingUp,
      title: 'Seasonal Demand Patterns',
      description: `${cityName} sees peak lawn mower service demand during spring and fall. Plan ahead for regular maintenance and book services during off-peak times.`
    }
  ]

  const lawnCareTips = [
    {
      icon: Leaf,
      title: `Best Grass Types for ${cityName}`,
      description: `Choose grass varieties that thrive in ${cityName}'s climate. Local lawn mower professionals can advise on the best options for your specific microclimate.`
    },
    {
      icon: Droplets,
      title: `Watering Schedule for ${cityName}`,
      description: `Optimal watering times in ${cityName} are early morning (5-9 AM) to minimize evaporation. Adjust based on seasonal rainfall patterns.`
    },
    {
      icon: Sun,
      title: `Sun Exposure Management`,
      description: `${cityName} has varying sun exposure. Professional lawn mower services can help you manage shade and sun patterns for a healthy lawn.`
    },
    {
      icon: Zap,
      title: `Electric vs Gas Mowers in ${cityName}`,
      description: `Consider ${cityName}'s climate and property size when choosing between electric and gas mowers. Local professionals can guide you to the best option.`
    }
  ]

  return (
    <div className="mt-8 space-y-8">
      {/* Seasonal Tips Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-green-800 flex items-center gap-2">
          <Calendar size={24} />
          Seasonal Lawn Care Tips for {city}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {seasonalTips.map((tip, index) => {
            const Icon = tip.icon
            return (
              <div key={index} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Icon size={20} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">{tip.title}</h3>
                    <p className="text-gray-600 text-sm">{tip.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Lawn Care Tips */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-green-800 flex items-center gap-2">
          <Leaf size={24} />
          Lawn Care Tips for {city}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lawnCareTips.map((tip, index) => {
            const Icon = tip.icon
            return (
              <div key={index} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Icon size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">{tip.title}</h3>
                    <p className="text-gray-600 text-sm">{tip.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* City Statistics and Tips */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-green-800 flex items-center gap-2">
          <Award size={24} />
          Why Choose Lawn Mower Services in {city}?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tips.map((tip, index) => {
            const Icon = tip.icon
            return (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={20} className="text-green-600" />
                  <h3 className="font-semibold text-gray-800">{tip.title}</h3>
                </div>
                <p className="text-gray-600 text-sm">{tip.description}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-green-800 flex items-center gap-2">
          <CheckCircle size={24} />
          Frequently Asked Questions About Lawn Mower Services in {city}
        </h2>
        <div className="space-y-4">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="font-semibold text-gray-800 mb-1">How much do lawn mower services cost in {city}?</h3>
            <p className="text-gray-600 text-sm">Lawn mower service costs in {city} typically range from $50-$150 for basic maintenance, $100-$300 for repairs, and $200-$500 for full service. Prices vary based on the service provider and specific needs.</p>
          </div>
          <div className="border-b border-gray-100 pb-4">
            <h3 className="font-semibold text-gray-800 mb-1">How often should I service my lawn mower in {city}?</h3>
            <p className="text-gray-600 text-sm">Given {city}'s climate, it's recommended to service your lawn mower at least twice a year - once in spring before the growing season, and once in fall before winter storage.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">What types of lawn mower services are available in {city}?</h3>
            <p className="text-gray-600 text-sm">Lawn mower services in {city} include repair, maintenance, sharpening, sales, parts and accessories, and emergency repairs. {categoriesInCity.length > 0 ? `Popular categories include: ${categoriesInCity.join(', ')}.` : 'Check our directory for available services.'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}