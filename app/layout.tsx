import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Navbar, Footer } from '@/components'
import './globals.css'
import Script from "next/script";

const inter = Inter({ subsets: ['latin'] })


export const metadata: Metadata = {
  title: 'Lawn Care & Mower Repair Near Me | Find Local Services',
  description: 'Find trusted lawn care, lawn mowing, and lawn mower repair services near you. Compare ratings, read reviews, and connect with local specialists.',
  keywords: 'lawn care near me, lawn mower repair near me, lawn mowing service near me, lawn maintenance near me, lawnmower repair',
  authors: [{ name: 'LawnMowerDir' }],
  openGraph: {
    title: 'Lawn Mowing Near Me',
    description: 'Find the best lawn mower services near you',
    url: 'https://www.lawnmowingnearme.org',
    siteName: 'Lawn Mowing Near Me',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Lawn Mowing Near Me',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lawn Mowing Near Me',
    description: 'Find the best lawn mower services near you',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
         <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6988145475779418"
            crossOrigin="anonymous"
          />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-HS88FYGGK6"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-HS88FYGGK6');
          `}
        </Script>
        <Script
            type="application/ld+json"
            dangerouslySetInnerHTML={{__html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Lawn Mowing Near Me",
              "url": "https://lawnmowingnearme.org",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://lawnmowingnearme.org/services?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })}}
          />
   
      </head>
      <body className={inter.className}>     
        
        {/* Global Navbar */}
        <Navbar />        
        {/* Main content wrapper */}
        <div className="min-h-screen flex flex-col">
          <main id="main-content" className="flex-grow">
            {children}
          </main>          
          {/* Global Footer */}
          <Footer />
        </div>
      </body>
    </html>
  )
}