'use client'

import { useState, useEffect } from 'react'
import { 
  Sun, Cloud, CloudRain, CloudSnow, Wind, 
  Droplets, Thermometer, Calendar, MapPin,
  CloudLightning, CloudFog, Loader2
} from 'lucide-react'
import { fetchWeather, getFallbackWeather } from '@/services/weather'

interface WeatherWidgetProps {
  city: string
  state?: string
  country?: string
}

const weatherIcons: Record<string, { icon: any; color: string; bg: string }> = {
  'sunny': { icon: Sun, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  'clear': { icon: Sun, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  'partly-cloudy': { icon: Cloud, color: 'text-gray-500', bg: 'bg-gray-50' },
  'cloudy': { icon: Cloud, color: 'text-gray-600', bg: 'bg-gray-100' },
  'rain': { icon: CloudRain, color: 'text-blue-500', bg: 'bg-blue-50' },
  'showers': { icon: CloudRain, color: 'text-blue-500', bg: 'bg-blue-50' },
  'thunderstorm': { icon: CloudLightning, color: 'text-purple-500', bg: 'bg-purple-50' },
  'snow': { icon: CloudSnow, color: 'text-blue-300', bg: 'bg-blue-50' },
  'windy': { icon: Wind, color: 'text-gray-400', bg: 'bg-gray-50' },
  'fog': { icon: CloudFog, color: 'text-gray-400', bg: 'bg-gray-50' },
}

const getWeatherIcon = (condition: string) => {
  return weatherIcons[condition] || weatherIcons['partly-cloudy']
}

const getLawnRecommendation = (condition: string, temp: number) => {
  if (condition.includes('Rain') || condition.includes('rain')) {
    return '🌧️ Avoid mowing during rain. Wait for grass to dry to prevent damage.'
  }
  if (temp > 85) {
    return '☀️ Water your lawn early morning (5-9 AM). Consider mowing in the evening.'
  }
  if (temp < 50) {
    return '❄️ Cold weather slows growth. Avoid mowing when grass is frosty.'
  }
  if (condition.includes('Sunny') || condition.includes('Clear')) {
    return '☀️ Perfect weather for mowing! Keep blade height at 3-4 inches.'
  }
  if (condition.includes('Cloud')) {
    return '☁️ Good day for lawn care. Consider fertilizing before expected rain.'
  }
  return '🌿 Check soil moisture before mowing. Adjust mower height based on season.'
}

export default function WeatherWidget({ city, state, country }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)

  useEffect(() => {
    async function loadWeather() {
      try {
        setLoading(true)
        setError(null)
        
        console.log(`🌤️ WeatherWidget loading for: ${city}`)
        
        const data = await fetchWeather(city, state, country)
        
        if (data) {
          setWeather(data)
          setUsingFallback(false)
          console.log(`✅ Weather loaded for ${data.location}`)
        } else {
          // Use fallback data
          console.log(`⚠️ Using fallback weather data for ${city}`)
          setWeather(getFallbackWeather(city))
          setUsingFallback(true)
        }
      } catch (err) {
        console.error('Weather widget error:', err)
        setWeather(getFallbackWeather(city))
        setUsingFallback(true)
        setError('Using fallback weather data')
      } finally {
        setLoading(false)
      }
    }

    if (city) {
      loadWeather()
    }
  }, [city, state, country])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-32">
          <Loader2 size={24} className="text-green-600 animate-spin" />
          <span className="ml-2 text-gray-500">Loading weather...</span>
        </div>
      </div>
    )
  }

  if (!weather) {
    return null
  }

  const currentWeather = getWeatherIcon(weather.current.icon)
  const CurrentIcon = currentWeather.icon

  return (
    <div className="bg-green-600 rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-0.1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            <span className="font-semibold">{weather.location}</span>
          </div>
          {usingFallback && (
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded">Demo Data</span>
          )}
        </div>
      </div>

      {/* Current Weather */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${currentWeather.bg}`}>
              <CurrentIcon size={32} className={currentWeather.color} />
            </div>
            <div>
              <div className="text-3xl font-bold">{weather.current.temp}°F</div>
              <div className="text-sm text-gray-600">{weather.current.condition}</div>
              <div className="text-xs text-gray-500">
                Feels like {weather.current.feelsLike}°F
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Droplets size={14} />
              <span>{weather.current.humidity}%</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Wind size={14} />
              <span>{weather.current.windSpeed} mph</span>
            </div>
          </div>
        </div>

        {/* Lawn Care Recommendation */}
        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
          <div className="text-sm text-green-700">
            {getLawnRecommendation(weather.current.condition, weather.current.temp)}
          </div>
        </div>

        {/* 5-Day Forecast */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={14} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">5-Day Forecast</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {weather.forecast.map((day: any, index: number) => {
              const forecastWeather = getWeatherIcon(day.icon)
              const ForecastIcon = forecastWeather.icon
              
              return (
                <div key={index} className="text-center p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                  <div className="text-xs font-medium text-gray-600">{day.day}</div>
                  <div className={`flex justify-center my-1 ${forecastWeather.color}`}>
                    <ForecastIcon size={20} />
                  </div>
                  <div className="text-sm font-semibold">{day.high}°</div>
                  <div className="text-xs text-gray-500">{day.low}°</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Best Mowing Days */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Sun size={12} className="text-yellow-500" />
              Best mowing days: 
            </span>
            <span className="font-medium text-white">
              {weather.forecast
                .filter((day: any) => 
                  !day.condition.toLowerCase().includes('rain') && 
                  day.high > 60 && day.high < 90
                )
                .map((day: any) => day.day)
                .slice(0, 3)
                .join(', ') || 'Check back for updates'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}