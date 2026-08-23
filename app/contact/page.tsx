import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Mail,
  MessageSquare,
  Building2,
  HelpCircle,
  ArrowRight,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Lawn Mowing Near Me',
  description:
    'Contact Lawn Mowing Near Me with questions, corrections, business listing requests or general feedback.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Contact Us
          </h1>

          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Have a question, correction, suggestion or business listing
            enquiry? Get in touch with Lawn Mowing Near Me.
          </p>

        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-4 py-14">

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

          {/* PRIMARY CONTACT */}
          <section className="lg:col-span-2">

            <div className="bg-white border rounded-2xl p-8 shadow-sm">

              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <MessageSquare
                    size={24}
                    className="text-green-600"
                  />
                </div>

                <div>
                  <h2 className="text-2xl font-bold">
                    How Can We Help?
                  </h2>

                  <p className="text-gray-500 text-sm mt-1">
                    Choose the option that best matches your enquiry.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mt-8">

                {/* BUSINESS LISTING */}
                <div className="border rounded-xl p-6">

                  <Building2
                    size={28}
                    className="text-green-600 mb-4"
                  />

                  <h3 className="font-bold text-lg mb-2">
                    Add a Business
                  </h3>

                  <p className="text-gray-600 text-sm leading-relaxed mb-5">
                    If a lawn care, landscaping, garden or mower business is
                    missing from the directory, you can submit it for review.
                  </p>

                  <Link
                    href="/submit-business"
                    className="inline-flex items-center gap-2 text-green-700 font-semibold hover:underline"
                  >
                    Submit a Business
                    <ArrowRight size={16} />
                  </Link>

                </div>

                {/* CORRECTIONS */}
                <div className="border rounded-xl p-6">

                  <HelpCircle
                    size={28}
                    className="text-green-600 mb-4"
                  />

                  <h3 className="font-bold text-lg mb-2">
                    Report Incorrect Information
                  </h3>

                  <p className="text-gray-600 text-sm leading-relaxed mb-5">
                    Business details can change. Contact us if you notice an
                    incorrect phone number, address, website, category or other
                    listing information.
                  </p>

                  <a
                    href="mailto:info@lawnmowingnearme.org?subject=Business Listing Correction"
                    className="inline-flex items-center gap-2 text-green-700 font-semibold hover:underline"
                  >
                    Report a Correction
                    <ArrowRight size={16} />
                  </a>

                </div>

              </div>

              {/* EMAIL */}
              <div className="mt-8 pt-8 border-t">

                <h3 className="text-xl font-bold mb-3">
                  General Enquiries
                </h3>

                <p className="text-gray-600 leading-relaxed mb-5">
                  For general questions, feedback or enquiries that do not fit
                  the options above, you can contact us by email.
                </p>

                <a
                  href="mailto:info@lawnmowingnearme.org"
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  <Mail size={18} />
                  info@lawnmowingnearme.org
                </a>

              </div>

            </div>

          </section>

          {/* SIDEBAR */}
          <aside className="space-y-6">

            {/* CONTACT DETAILS */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm">

              <h2 className="text-xl font-bold mb-5">
                Get in Touch
              </h2>

              <div className="flex items-start gap-3">

                <Mail
                  size={20}
                  className="text-green-600 mt-1 shrink-0"
                />

                <div>
                  <p className="font-semibold">
                    Email
                  </p>

                  <a
                    href="mailto:info@lawnmowingnearme.org"
                    className="text-gray-600 text-sm hover:text-green-600 break-all"
                  >
                    info@lawnmowingnearme.org
                  </a>
                </div>

              </div>

            </div>

            {/* QUICK HELP */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 border rounded-2xl p-6">

              <h2 className="font-bold text-xl mb-5">
                Quick Help
              </h2>

              <div className="space-y-5">

                <div>
                  <h3 className="font-semibold text-sm">
                    How do I list a business?
                  </h3>

                  <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                    Use the business submission page and provide the available
                    business details.
                  </p>

                  <Link
                    href="/submit-business"
                    className="inline-block text-green-700 text-sm font-medium mt-2 hover:underline"
                  >
                    Submit a business →
                  </Link>
                </div>

                <div>
                  <h3 className="font-semibold text-sm">
                    Can I update an existing listing?
                  </h3>

                  <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                    Business owners can use the claim option on eligible
                    listings. You can also contact us about incorrect
                    information.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-sm">
                    Does Lawn Mowing Near Me provide the services listed?
                  </h3>

                  <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                    No. Lawn Mowing Near Me is a directory. Services are
                    provided by the individual businesses shown in the
                    directory.
                  </p>
                </div>

              </div>

            </div>

          </aside>

        </div>

      </main>

      {/* FINAL CTA */}
      <section className="pb-16">
        <div className="container mx-auto px-4">

          <div className="max-w-5xl mx-auto bg-green-600 rounded-2xl px-8 py-10 text-white text-center">

            <h2 className="text-3xl font-bold">
              Looking for Lawn or Mower Services?
            </h2>

            <p className="text-white/90 mt-3 mb-7 max-w-2xl mx-auto">
              Browse businesses by country, state, city and service type.
            </p>

            <Link
              href="/near-me"
              className="inline-flex bg-white text-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Browse Locations
            </Link>

          </div>

        </div>
      </section>

    </div>
  )
}