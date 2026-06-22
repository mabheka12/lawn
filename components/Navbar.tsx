'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, Search, User, Globe, ChevronDown } from 'lucide-react'
import { createClient } from '@/utils/supabase/client' 
import Image from 'next/image'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<string>('USA')
  const [countries, setCountries] = useState<string[]>([])
  const [isLoadingCountries, setIsLoadingCountries] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Fetch available countries
  const fetchCountries = useCallback(async () => {
    try {
      setIsLoadingCountries(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('businesses')
        .select('country')
        .not('country', 'is', null)
      
      if (error) {
        console.error('Error fetching countries:', error)
        return
      }
      
      if (data && data.length > 0) {
        const uniqueCountries = [...new Set(data.map(b => b.country).filter(Boolean))]
        setCountries(uniqueCountries as string[])
        
        // If selected country isn't in the list, update it
        if (uniqueCountries.length > 0 && !uniqueCountries.includes(selectedCountry)) {
          setSelectedCountry(uniqueCountries[0])
          localStorage.setItem('selectedCountry', uniqueCountries[0])
        }
      }
    } catch (err) {
      console.error('Failed to fetch countries:', err)
    } finally {
      setIsLoadingCountries(false)
    }
  }, [selectedCountry])

  // Load selected country from localStorage and fetch countries
  useEffect(() => {
    // Load saved country
    const savedCountry = localStorage.getItem('selectedCountry')
    if (savedCountry) {
      setSelectedCountry(savedCountry)
    }
    
    // Fetch countries
    fetchCountries()
  }, [fetchCountries])

  // Update countries when pathname changes (in case new businesses are added)
  useEffect(() => {
    fetchCountries()
  }, [pathname, fetchCountries])

  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country)
    localStorage.setItem('selectedCountry', country)
    setIsCountryDropdownOpen(false)
    
    // Only navigate if we're not already on a country page
    if (!pathname.includes('/countries/')) {
      router.push(`/countries/${country.toLowerCase().replace(/ /g, '-')}`)
    } else {
      // If on a country page, refresh to show new country
      router.push(`/countries/${country.toLowerCase().replace(/ /g, '-')}`)
    }
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center overflow-hidden rounded-lg">
              <Image
                src="/law-logo.png"
                alt="logo" 
                width={50} 
                height={50} 
                className="h-auto w-auto object-cover" 
                priority 
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Country Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                <Globe size={18} />
                <span>{selectedCountry}</span>
                <ChevronDown size={16} className={`transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isCountryDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setIsCountryDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-50 overflow-hidden">
                    <div className="p-2 max-h-80 overflow-y-auto">
                      {isLoadingCountries ? (
                        <div className="px-4 py-2 text-gray-500 text-sm">Loading countries...</div>
                      ) : countries.length === 0 ? (
                        <div className="px-4 py-2 text-gray-500 text-sm">No countries available</div>
                      ) : (
                        countries.map((country) => (
                          <button
                            key={country}
                            onClick={() => handleCountrySelect(country)}
                            className={`w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 transition ${
                              selectedCountry === country ? 'bg-green-50 text-green-600' : ''
                            }`}
                          >
                            {country}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <Link href="/" className="text-gray-700 hover:text-green-600 transition">
              Home
            </Link>
            <Link href="/categories" className="text-gray-700 hover:text-green-600 transition">
              Categories
            </Link>
            <Link href="/near-me" className="text-gray-700 hover:text-green-600 transition">
              Near Me
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-green-600 transition">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-green-600 transition">
              Contact
            </Link>
            
            {/* Quick Search by City */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search city..."
                className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const city = (e.target as HTMLInputElement).value
                    if (city) {
                      router.push(`/near-me/${encodeURIComponent(city.replace(/ /g, '-'))}`)
                      // Clear input after search
                      ;(e.target as HTMLInputElement).value = ''
                    }
                  }
                }}
              />
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
               <Link href="/add-listing" className="text-gray-700 hover:text-green-600 transition">
                List Your Business
              </Link>
            </button>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-3">
              {/* Country Selector for Mobile */}
              <div className="border-b pb-3 mb-2">
                <label className="text-sm text-gray-500 mb-2 block">Select Country</label>
                <select 
                  value={selectedCountry}
                  onChange={(e) => handleCountrySelect(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  {isLoadingCountries ? (
                    <option>Loading countries...</option>
                  ) : countries.length === 0 ? (
                    <option>No countries available</option>
                  ) : (
                    countries.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))
                  )}
                </select>
              </div>
              
              <Link href="/" className="text-gray-700 hover:text-green-600 py-2" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <Link href="/categories" className="text-gray-700 hover:text-green-600 py-2" onClick={() => setIsMenuOpen(false)}>
                Categories
              </Link>
              <Link href="/near-me" className="text-gray-700 hover:text-green-600 py-2" onClick={() => setIsMenuOpen(false)}>
                Near Me 
              </Link>
              <Link href="/services" className="text-gray-700 hover:text-green-600 py-2" onClick={() => setIsMenuOpen(false)}>
                Services
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-green-600 py-2" onClick={() => setIsMenuOpen(false)}>
                About
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-green-600 py-2" onClick={() => setIsMenuOpen(false)}>
                Contact
              </Link>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                List Your Business
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}