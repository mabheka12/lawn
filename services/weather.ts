interface WeatherData {
  location: string
  current: {
    temp: number
    condition: string
    icon: string
    humidity: number
    windSpeed: number
    feelsLike: number
  }
  forecast: Array<{
    date: string
    day: string
    high: number
    low: number
    condition: string
    icon: string
  }>
}

// Map OpenWeatherMap conditions to our icon names
const mapWeatherCondition = (condition: string): string => {
  const mapping: Record<string, string> = {
    'Clear': 'sunny',
    'Clouds': 'cloudy',
    'Rain': 'rain',
    'Drizzle': 'rain',
    'Thunderstorm': 'thunderstorm',
    'Snow': 'snow',
    'Mist': 'fog',
    'Fog': 'fog',
    'Haze': 'fog',
    'Smoke': 'fog'
  }
  return mapping[condition] || 'partly-cloudy'
}

export async function fetchWeather(city: string, state?: string, country?: string): Promise<WeatherData | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
    
    // If no API key, return null (we'll handle fallback in the component)
    if (!apiKey) {
      console.warn('No OpenWeatherMap API key found')
      return null
    }

    // Build location string
    const locationParts = [city]
    if (state) locationParts.push(state)
    if (country) locationParts.push(country)
    const location = locationParts.join(', ')

    console.log(`🌤️ Fetching weather for: ${location}`)

    // Step 1: Geocode the city name to get coordinates
    const geoResponse = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`
    )
    
    if (!geoResponse.ok) {
      throw new Error(`Geocoding API error: ${geoResponse.status}`)
    }
    
    const geoData = await geoResponse.json()

    if (!geoData || geoData.length === 0) {
      console.warn(`Location not found: ${location}`)
      return null
    }

    const { lat, lon, name, country: countryCode } = geoData[0]
    console.log(`📍 Found coordinates for ${name}: ${lat}, ${lon}`)

    // Step 2: Fetch current weather
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`
    )
    
    if (!weatherResponse.ok) {
      throw new Error(`Weather API error: ${weatherResponse.status}`)
    }
    
    const currentData = await weatherResponse.json()

    // Step 3: Fetch 5-day forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`
    )
    
    if (!forecastResponse.ok) {
      throw new Error(`Forecast API error: ${forecastResponse.status}`)
    }
    
    const forecastData = await forecastResponse.json()

    // Map current weather
    const currentCondition = mapWeatherCondition(currentData.weather[0].main)
    
    // Map forecast (take one entry per day)
    const dailyForecasts = forecastData.list
      .filter((item: any, index: number) => index % 8 === 0) // Every 8th entry = 24 hours
      .slice(0, 5)
      .map((item: any) => {
        const date = new Date(item.dt * 1000)
        return {
          date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          high: Math.round(item.main.temp_max),
          low: Math.round(item.main.temp_low || item.main.temp_min),
          condition: item.weather[0].main,
          icon: mapWeatherCondition(item.weather[0].main)
        }
      })

    return {
      location: name,
      current: {
        temp: Math.round(currentData.main.temp),
        condition: currentData.weather[0].main,
        icon: currentCondition,
        humidity: currentData.main.humidity,
        windSpeed: Math.round(currentData.wind.speed),
        feelsLike: Math.round(currentData.main.feels_like)
      },
      forecast: dailyForecasts
    }

  } catch (error) {
    console.error('Weather fetch error:', error)
    return null
  }
}

// Fallback weather data when API fails
export function getFallbackWeather(city: string): WeatherData {
  return {
    location: city,
    current: {
      temp: 72,
      condition: 'Partly Cloudy',
      icon: 'partly-cloudy',
      humidity: 65,
      windSpeed: 8,
      feelsLike: 70
    },
    forecast: [
      { date: 'Today', day: 'Today', high: 75, low: 60, condition: 'Partly Cloudy', icon: 'partly-cloudy' },
      { date: 'Tomorrow', day: 'Tomorrow', high: 78, low: 62, condition: 'Sunny', icon: 'sunny' },
      { date: 'Day 2', day: 'Day 2', high: 72, low: 58, condition: 'Cloudy', icon: 'cloudy' },
      { date: 'Day 3', day: 'Day 3', high: 70, low: 55, condition: 'Rain', icon: 'rain' },
      { date: 'Day 4', day: 'Day 4', high: 73, low: 57, condition: 'Sunny', icon: 'sunny' },
    ]
  }
}