'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, Search, User, Globe, ChevronDown, CirclePlus } from 'lucide-react'
import { createClient } from '@/utils/supabase/client' 
import Image from 'next/image'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false)
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false)
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
      }
    } catch (err) {
      console.error('Failed to fetch countries:', err)
    } finally {
      setIsLoadingCountries(false)
    }
  }, [])

  // Close dropdowns when changing pages
  useEffect(() => {
    setIsCountryDropdownOpen(false)
    setIsServicesDropdownOpen(false)
  }, [pathname])

  // Fetch countries on load
  useEffect(() => {
    fetchCountries()
  }, [fetchCountries])

  // Update countries when pathname changes
  useEffect(() => {
    fetchCountries()
  }, [pathname, fetchCountries])

  const handleCountrySelect = (country: string) => {
    localStorage.setItem('selectedCountry', country)
    setIsCountryDropdownOpen(false)
    
    if (!pathname.includes('/countries/')) {
      router.push(`/countries/${country.toLowerCase().replace(/ /g, '-')}`)
    } else {
      router.push(`/countries/${country.toLowerCase().replace(/ /g, '-')}`)
    }
  }

  // Purely map database text variations to your exact file names in public/flags/
  const getLocalFlagPath = (country: string) => {
    const normalized = country.trim().toLowerCase()
    
    const fileMapping: { [key: string]: string } = {
      'usa': 'us.png',
      'united states': 'us.png',
      'united states of america': 'us.png',
      'australia': 'au.png',
    }

    const fileName = fileMapping[normalized] || 'default.png'
    return `/flags/${fileName}`
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
                onClick={() => {
                  setIsCountryDropdownOpen(!isCountryDropdownOpen)
                  setIsServicesDropdownOpen(false)
                }}
                className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                <Globe size={15} />
                <span>Country</span>
                <ChevronDown size={10} className={`transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
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
                            className="w-full flex items-center px-4 py-2 rounded-lg hover:bg-gray-50 transition text-gray-700 text-left"
                          >
                            <img
                              src={getLocalFlagPath(country)}
                              alt={country}
                              className="w-6 h-4 object-cover mr-3 rounded-sm border border-gray-100 shadow-sm"
                            />
                            <span>{country}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <Link href="/categories" className="text-gray-700 hover:text-green-600 transition">
              Categories
            </Link>

            {/* Services Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsServicesDropdownOpen(!isServicesDropdownOpen)
                  setIsCountryDropdownOpen(false)
                }}
                className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                <span>Services</span>
                <ChevronDown size={10} className={`transition-transform ${isServicesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isServicesDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setIsServicesDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50 overflow-hidden">
                    <div className="p-2">
                      <Link
                        href="/type/mowing"
                        className="block px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      >
                        🌿 Lawn Mowing
                      </Link>
                      <Link
                        href="/type/repairs"
                        className="block px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-50 transition mt-1"
                      >
                        🔧 Repairs
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Link href="/near-me" className="text-gray-700 hover:text-green-600 transition">
              Near Me
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-green-600 transition">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-green-600 transition">
              Contact
            </Link>
            <Link href="/blog" className="text-gray-700 hover:text-green-600 transition">
              Blog
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
                      ;(e.target as HTMLInputElement).value = ''
                    }
                  }
                }}
              />
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <Link href="/add-listing" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition inline-block">
             <CirclePlus size={18} className="inline-block ml-1" /> Add Listing 
            </Link>
          </div>
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-green-600"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {/* Mobile Menu Panel */}
{isMenuOpen && (
  <div className="md:hidden border-t border-gray-100 py-4 space-y-1">
    <Link
      href="/categories"
      className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-green-600"
      onClick={() => setIsMenuOpen(false)}
    >
      Categories
    </Link>
    <Link
      href="/type/mowing"
      className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-green-600"
      onClick={() => setIsMenuOpen(false)}
    >
      🌿 Lawn Mowing
    </Link>
    <Link
      href="/type/repairs"
      className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-green-600"
      onClick={() => setIsMenuOpen(false)}
    >
      🔧 Repairs
    </Link>
    <Link
      href="/near-me"
      className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-green-600"
      onClick={() => setIsMenuOpen(false)}
    >
      Near Me
    </Link>
    <Link
      href="/about"
      className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-green-600"
      onClick={() => setIsMenuOpen(false)}
    >
      About
    </Link>
    <Link
      href="/contact"
      className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-green-600"
      onClick={() => setIsMenuOpen(false)}
    >
      Contact
    </Link>
    <Link
      href="/blog"
      className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-green-600"
      onClick={() => setIsMenuOpen(false)}
    >
      Blog
    </Link>

    <div className="px-3 pt-2">
      <input
        type="text"
        placeholder="Search city..."
        className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const city = (e.target as HTMLInputElement).value
            if (city) {
              router.push(`/near-me/${encodeURIComponent(city.replace(/ /g, '-'))}`)
              ;(e.target as HTMLInputElement).value = ''
              setIsMenuOpen(false)
            }
          }
        }}
      />
    </div>

    <div className="px-3 pt-2">
      <Link
        href="/add-listing"
        className="block text-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        onClick={() => setIsMenuOpen(false)}
      >
        <CirclePlus size={18} className="inline-block mr-1" /> Add Listing
      </Link>
    </div>
  </div>
)}
      </div>
    </nav>
  )
}
