import Link from 'next/link'

export default function RelatedListings({ businesses }: any) {
  return (
    <div className="bg-white p-6 rounded-lg mt-10">
      <h3 className="font-bold text-lg mb-4">
        Popular Nearby Businesses
      </h3>

      <div className="space-y-2">
        {businesses.slice(0, 5).map((b: any) => (
          <Link
            key={b.id}
            href={`/listings/${b.slug}`}
            className="block hover:bg-gray-50 p-2 rounded"
          >
            <div className="font-medium">{b.name}</div>
            <div className="text-sm text-gray-500">
              {b.city}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}