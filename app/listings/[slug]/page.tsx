import { notFound, permanentRedirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Star, MapPin, Phone, Globe, Share2, Bookmark, CheckCircle } from 'lucide-react'
import MapWrapper from '@/components/MapWrapper'
import WeatherWidget from '@/components/WeatherWidget'

interface PageProps {
  params: Promise<{ slug: string }>
}


type DayHours = { open: string | null; close: string | null };
type OpenHours = Record<string, DayHours>;

const DAY_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

function to12h(time24: string) {
  const [hStr, m] = time24.split(":");
  let h = parseInt(hStr, 10);
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
}
export default async function ListingPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  
   const id = Number(slug.split("-").pop())

  if (isNaN(id)) {
    notFound()
  }

  // Fetch by ID instead of slug
  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", id)
    .single()

  if (!business) {
    notFound()
  }

  // Redirect old or incorrect slugs to the canonical slug
  if (slug !== business.slug) {
    permanentRedirect(`/listings/${business.slug}`)
  }

  // Get similar businesses
  const { data: similar } = await supabase
    .from("businesses")
    .select("*")
    .eq("category", business.category)
    .neq("id", business.id)
    .limit(3)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-green-600">Home</Link> › 
          <Link href="/categories" className="hover:text-green-600"> Categories</Link> › 
          <Link href={`/categories/${business.category?.toLowerCase().replace(/ /g, '-')}`} className="hover:text-green-600">
            {business.category}
          </Link> › 
          <span className="text-gray-700">{business.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{business.name}</h1>

                  <h2 className="text-2xl font-bold mb-4">
                    {business.category} in {business.city}
                  </h2>

                  <p className="text-gray-700 leading-8">
                    {business.name} provides {business.category?.toLowerCase()} services in {business.city}, {business.state}. 
                    Whether you need regular maintenance,
                    one-time assistance, or professional advice, this business serves local
                    residential and commercial customers in the area.
                  </p>
                 {business.rating && business.rating > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="text-yellow-500" fill="currentColor" size={20} />
                      <span className="font-bold text-lg">{business.rating} Google Rating</span>
                      <span className="text-gray-500 text-sm">({business.google_reviews_count} Google reviews)</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                    <Bookmark size={20} />
                  </button>
                  <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">  
               { (
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                <span className="text-lg font-bold">{business.name.charAt(0)}</span>
              </div>
            )}
              </div>
                <h3 className="font-bold text-lg mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {business.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="text-gray-500 mt-1" size={18} />
                      <div>
                        <div>{business.address}</div>
                        <div>{business.city}, {business.state} {business.country}</div>
                      </div>
                    </div>
                  )}
                  {business.phone && (
                    <div className="flex items-center gap-3">
                      <Phone size={18} className="text-gray-500" />
                      <a href={`tel:${business.phone}`} className="text-green-600 hover:underline">
                        {business.phone}
                      </a>
                    </div>
                  )}
                  {business.website && (
                    <div className="flex items-center gap-3">
                      <Globe size={18} className="text-gray-500" />
                      <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                        {business.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {business.description && (
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-3">About {business.name}</h3>
                  <p className="text-gray-600 leading-relaxed">{business.description}</p>
                </div>
              )}

              {/* Business Hours */}
              {(() => {
                  const openHours = business.open_hours as OpenHours | null;
                  const hasAnyHours = openHours && DAY_ORDER.some(
                    (day) => openHours[day]?.open && openHours[day]?.close
                  );

                  return (
                    <div className="mb-6">
                      <h3 className="font-bold text-lg mb-3">Business Hours</h3>

                      {hasAnyHours ? (
                        <>
                          <div className="grid grid-cols-1 gap-2">
                            {DAY_ORDER.map((day) => {
                              const hours = openHours![day];
                              const isOpen = hours?.open && hours?.close;
                              return (
                                <div key={day} className="flex justify-between">
                                  <span className="capitalize">{day}</span>
                                  <span>
                                    {isOpen ? `${to12h(hours.open!)} - ${to12h(hours.close!)}` : "Closed"}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex justify-between">
                            <p className="text-red-500 ml-2">
                              <strong>Note: Please call to confirm hours</strong>
                            </p>
                          </div>
                        </>
                      ) : (
                        <p className="text-gray-500">
                          Hours not listed — please contact the business directly to confirm.
                        </p>
                      )}
                    </div>
                  );
                })()}              

            </div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                {/* 3. Why Choose This Business */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Why Choose {business.name}?</h2>
        <div className="bg-gray-50 p-6 rounded-lg">
          <ul className="space-y-3">
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span>Local business serving the community</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span>Serves {business.city} and surrounding suburbs</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span>Google reviewed business</span>
            </li>
            {business.phone && (
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span>Contactable by phone</span>
              </li>
            )}
            {business.website && (
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span>Website available for more information</span>
              </li>
            )}
          </ul>
        </div>
      </section>
            </div>
          </div>


          {/* Sidebar with Map */}
          <div className="lg:w-1/3">
          <WeatherWidget city={business.city || ''} />
            <MapWrapper
              businessName={business.name}
              address={business.address || ''}
              city={business.city || ''}
              state={business.state || ''}
              country={business.country || 'USA'}
            />
            

            {/* Similar Businesses */}
            {similar && similar.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-bold text-lg mb-4">Similar Businesses</h3>
                <div className="space-y-4">
                  {similar.map((biz) => (
                    <Link key={biz.id} href={`/listings/${biz.slug}`}>
                      <div className="hover:bg-gray-50 p-3 rounded-lg transition cursor-pointer">
                        <h4 className="font-semibold text-green-600">{biz.name}</h4>
                        {biz.city && (
                          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                            <MapPin size={12} />
                            <span>{biz.city}, {biz.state}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}