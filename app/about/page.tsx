import { Metadata } from 'next'
import Link from 'next/link'
import {  Target, Heart, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us - Lawn Mowing Directory',
  description: 'Learn about Lawn Mowing Directory - your trusted source for finding professional lawn mowing services across the country.',
  keywords: 'lawn mowing directory about, lawn mowing services, lawn care platform',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">About Lawn Mowing Near Me</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Connecting homeowners with trusted lawn mowing professionals.  
          </p>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <Target size={32} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            To simplify the process of finding reliable lawn mower services by providing 
            a comprehensive, easy-to-use directory that connects homeowners with trusted 
            professionals in their area.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12 items-center max-w-6xl mx-auto">
          <div className="lg:w-1/2">
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8">
              <div className="text-6xl mb-4">🌿</div>
              <h3 className="text-2xl font-bold mb-4">Our Story</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Lawn Mowing Directory was born from a simple frustration: finding a reliable 
                lawn mowing service shouldn't be difficult. We created this platform 
                to bring together the best lawn mowing professionals in one place, making it 
                easy for homeowners to find trusted services.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Today, we're proud to help thousands of homeowners connect with local 
                professionals who keep their lawns looking perfect all year round.
              </p>
            </div>
          </div>
          <div className="lg:w-1/2">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Heart size={28} className="text-green-600" />
                Our Values
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Trust & Transparency</h4>
                    <p className="text-gray-600 text-sm">Verified reviews and transparent business information</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Quality Service</h4>
                    <p className="text-gray-600 text-sm">Only featuring businesses with proven track records</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Community Focus</h4>
                    <p className="text-gray-600 text-sm">Supporting local businesses and communities</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Continuous Improvement</h4>
                    <p className="text-gray-600 text-sm">Constantly updating and improving our platform</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      {/* CTA Section */}
      <section className="py-16 container mx-auto px-4 text-center">
        <div className="bg-green-600 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Lawn Mower Pro?</h2>
          <p className="text-xl mb-6">Join thousands of satisfied customers who found trusted services through us</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/categories" 
              className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Browse Services
            </Link>
            <Link 
              href="/contact" 
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}