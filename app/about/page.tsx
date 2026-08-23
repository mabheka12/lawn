import { Metadata } from 'next'
import Link from 'next/link'
import {
  Target,
  Heart,
  CheckCircle,
  Search,
  MapPin,
  Building2,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Lawn Mowing Near Me',
  description:
    'Learn about Lawn Mowing Near Me, a directory for discovering lawn care, landscaping, garden and lawn mower services across the United States and Australia.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            About Lawn Mowing Near Me
          </h1>

          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            A directory designed to make it easier to discover lawn care,
            landscaping and lawn mower businesses in your area.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <Target
                size={32}
                className="text-green-600"
              />
            </div>

            <h2 className="text-3xl font-bold mb-4">
              Our Mission
            </h2>

            <p className="text-xl text-gray-600 leading-relaxed">
              Our goal is to make local lawn and mower services easier to
              discover by organizing businesses into useful categories,
              locations and service pages.
            </p>
          </div>
        </div>
      </section>

      {/* What the site does */}
      <section className="py-16 bg-white border-y">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-3xl font-bold">
              What You Can Do Here
            </h2>

            <p className="text-gray-600 mt-3">
              Lawn Mowing Near Me brings local business information together
              in one place so visitors can browse and compare available
              services.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="bg-gray-50 border rounded-2xl p-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Search
                  className="text-green-600"
                  size={24}
                />
              </div>

              <h3 className="text-xl font-bold mb-2">
                Find Local Services
              </h3>

              <p className="text-gray-600 leading-relaxed">
                Browse businesses offering lawn care, landscaping, garden
                services, tree services and lawn mower repair.
              </p>
            </div>

            <div className="bg-gray-50 border rounded-2xl p-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <MapPin
                  className="text-green-600"
                  size={24}
                />
              </div>

              <h3 className="text-xl font-bold mb-2">
                Browse by Location
              </h3>

              <p className="text-gray-600 leading-relaxed">
                Explore businesses by country, state and city to narrow your
                search to services available in a particular area.
              </p>
            </div>

            <div className="bg-gray-50 border rounded-2xl p-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Building2
                  className="text-green-600"
                  size={24}
                />
              </div>

              <h3 className="text-xl font-bold mb-2">
                Compare Business Information
              </h3>

              <p className="text-gray-600 leading-relaxed">
                View available contact details, business hours, location
                information, ratings and service categories before deciding
                who to contact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story + values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-10 items-stretch max-w-6xl mx-auto">

            {/* Story */}
            <div className="lg:w-1/2">
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 h-full border border-green-100">
                <div className="text-5xl mb-4">
                  🌿
                </div>

                <h2 className="text-2xl font-bold mb-4">
                  Why We Built the Directory
                </h2>

                <p className="text-gray-600 leading-relaxed mb-4">
                  Local lawn and outdoor services are often spread across
                  search engines, individual websites and business listings.
                  Lawn Mowing Near Me was created to organize that information
                  into a simpler location-based directory.
                </p>

                <p className="text-gray-600 leading-relaxed">
                  The directory covers both lawn and garden services and lawn
                  mower-related businesses, allowing visitors to browse by
                  service type and location.
                </p>
              </div>
            </div>

            {/* Values */}
            <div className="lg:w-1/2">
              <div className="bg-white rounded-2xl border shadow-sm p-8 h-full">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Heart
                    size={28}
                    className="text-green-600"
                  />
                  What We Focus On
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle
                      size={20}
                      className="text-green-600 mt-1 shrink-0"
                    />

                    <div>
                      <h3 className="font-semibold mb-1">
                        Useful Information
                      </h3>

                      <p className="text-gray-600 text-sm leading-relaxed">
                        Presenting available business details in a clear format
                        that helps visitors compare local options.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle
                      size={20}
                      className="text-green-600 mt-1 shrink-0"
                    />

                    <div>
                      <h3 className="font-semibold mb-1">
                        Clear Organization
                      </h3>

                      <p className="text-gray-600 text-sm leading-relaxed">
                        Grouping businesses by country, state, city and service
                        so relevant listings are easier to discover.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle
                      size={20}
                      className="text-green-600 mt-1 shrink-0"
                    />

                    <div>
                      <h3 className="font-semibold mb-1">
                        Local Business Visibility
                      </h3>

                      <p className="text-gray-600 text-sm leading-relaxed">
                        Giving lawn, garden and mower businesses another place
                        where potential customers can discover their services.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle
                      size={20}
                      className="text-green-600 mt-1 shrink-0"
                    />

                    <div>
                      <h3 className="font-semibold mb-1">
                        Ongoing Improvement
                      </h3>

                      <p className="text-gray-600 text-sm leading-relaxed">
                        Improving the directory structure, business information
                        and browsing experience as the platform grows.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Accuracy / transparency */}
      <section className="py-14 bg-white border-y">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">
              About Business Information
            </h2>

            <p className="text-gray-600 leading-relaxed mb-4">
              Business information displayed on Lawn Mowing Near Me may come
              from publicly available sources, business submissions and
              listing updates. Details such as opening hours, services,
              websites and contact information can change over time.
            </p>

            <p className="text-gray-600 leading-relaxed">
              Visitors should confirm important information directly with a
              business before making arrangements or purchasing services.
              Business owners can also request updates to their listings.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-green-600 rounded-2xl p-8 md:p-10 text-white text-center max-w-5xl mx-auto">

            <h2 className="text-3xl font-bold mb-4">
              Find Lawn & Mower Services Near You
            </h2>

            <p className="text-lg text-white/90 mb-7 max-w-2xl mx-auto">
              Browse local businesses by country, state, city and service type.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">

              <Link
                href="/near-me"
                className="bg-white text-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Browse Locations
              </Link>

              <Link
                href="/categories"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
              >
                Browse Services
              </Link>

            </div>

          </div>
        </div>
      </section>
    </div>
  )
}