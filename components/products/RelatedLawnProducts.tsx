// components/products/RelatedLawnProducts.tsx

import Link from 'next/link'

import {
  lawnProducts,
  lawnCategories,
} from '@/data/lawn-products'

interface RelatedLawnProductsProps {
  categories: string[]
  title?: string
  description?: string
  limit?: number
}

export default function RelatedLawnProducts({
  categories,
  title = 'Helpful Lawn Care Products',
  description = 'Browse lawn-care equipment and supplies related to this service.',
  limit = 3,
}: RelatedLawnProductsProps) {
  // Normalize incoming categories just in case
  const normalizedCategories =
    categories.map((category) =>
      category.trim().toLowerCase()
    )

  const products = lawnProducts
    .filter((product) =>
      normalizedCategories.includes(
        product.category
          .trim()
          .toLowerCase()
      )
    )
    .slice(0, limit)

  // Temporary diagnostic:
  // Remove this once products show correctly.
  if (products.length === 0) {
    console.warn(
      'No related lawn products found',
      {
        categories,
        availableProductCategories:
          [
            ...new Set(
              lawnProducts.map(
                (product) =>
                  product.category
              )
            ),
          ],
      }
    )

    return null
  }

  return (
    <section className="bg-white border rounded-2xl p-6 md:p-8">

      <div className="mb-6">

        <h2 className="text-2xl font-bold text-gray-900">
          {title}
        </h2>

        <p className="text-gray-600 mt-2 max-w-3xl">
          {description}
        </p>

      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

        {products.map((product) => {
          const category =
            lawnCategories.find(
              (item) =>
                item.slug ===
                product.category
            )

          return (
            <article
              key={product.id}
              className="border rounded-xl overflow-hidden bg-white hover:shadow-md transition"
            >

              <Link
                href={`/lawn-products/product/${product.slug}`}
                className="block h-full"
              >

                <div className="aspect-[4/3] bg-gray-50 p-5 flex items-center justify-center">

                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-contain"
                  />

                </div>

                <div className="p-5">

                  {category && (
                    <div className="text-xs font-medium text-green-700 mb-2">
                      {category.name}
                    </div>
                  )}

                  <h3 className="font-bold text-lg text-gray-900">
                    {product.title}
                  </h3>

                  <p className="text-sm text-gray-600 leading-6 mt-2 line-clamp-3">
                    {product.description}
                  </p>

                  <div className="text-green-700 font-semibold text-sm mt-4">
                    View Product →
                  </div>

                </div>

              </Link>

            </article>
          )
        })}

      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-6">

        {normalizedCategories.map(
          (categorySlug) => {
            const category =
              lawnCategories.find(
                (item) =>
                  item.slug ===
                  categorySlug
              )

            if (!category) {
              return null
            }

            return (
              <Link
                key={category.slug}
                href={`/lawn-products/category/${category.slug}`}
                className="text-sm text-green-700 font-medium hover:underline"
              >
                Browse all {category.name} →
              </Link>
            )
          }
        )}

      </div>

      <p className="text-xs text-gray-500 mt-6">
        As an Amazon Associate, we earn from
        qualifying purchases. Product availability
        and prices may change.
      </p>

    </section>
  )
}