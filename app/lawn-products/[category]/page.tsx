import { notFound } from "next/navigation";
import Link from "next/link";
import {
  lawnProducts,
  lawnCategories,
} from "@/data/lawn-products";

type Props = {
  params: Promise<{
    category: string;
  }>;
};

export function generateStaticParams() {
  return lawnCategories.map((category) => ({
    category: category.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { category: categorySlug } = await params;

  const category = lawnCategories.find(
    (category) => category.slug === categorySlug
  );

  if (!category) return {};

  return {
    title: `${category.name} | Lawn Mowing Near Me`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category: categorySlug } = await params;

  const category = lawnCategories.find(
    (category) => category.slug === categorySlug
  );

  if (!category) {
    notFound();
  }

  const categoryProducts = lawnProducts.filter(
    (product) => product.category === categorySlug
  );

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-8">
        <Link
          href="/lawn-products"
          className="hover:text-green-400"
        >
          Lawn Products
        </Link>

        <span className="mx-2">/</span>

        <span>{category.name}</span>
      </nav>

      {/* Header */}
      <header className="mb-10">
        <div className="text-5xl mb-4">
          {category.emoji}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {category.name}
        </h1>

        <p className="text-gray-300 max-w-3xl leading-7">
          {category.description}
        </p>
      </header>

      {/* Products */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">
          Recommended {category.name}
        </h2>

        {categoryProducts.length === 0 ? (
          <div className="bg-white/10 rounded-xl p-8 text-center">
            <p className="text-gray-300">
              We are currently adding products to this category.
              Please check back soon.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryProducts.map((product) => (
              <article
                key={product.slug}
                className="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden"
              >
                <div className="aspect-video bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-3">
                    {product.title}
                  </h3>

                  <p className="text-gray-600 text-sm leading-6 mb-5">
                    {product.description}
                  </p>

                  <Link
                    href={`/lawn-products/product/${product.slug}`}
                    className="text-green-600 hover:text-green-700 font-semibold"
                  >
                    View Product →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Buying advice */}
      <section className="mt-14 bg-white rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Things to Consider
        </h2>

        <p className="text-gray-600 leading-7">
          Before choosing a {category.name.toLowerCase()}, consider
          the size of your lawn, how frequently you perform lawn
          maintenance, storage space, power requirements and the
          type of work you need the equipment to perform.
        </p>
      </section>

      {/* Amazon disclosure */}
      <section className="mt-8">
        <p className="text-gray-400 text-xs text-center max-w-3xl mx-auto">
          As an Amazon Associate, we earn from qualifying purchases.
          Product information, availability and prices may change.
          Please check Amazon for the latest information before purchasing.
        </p>
      </section>

      <Link
        href="/lawn-products"
        className="block mt-10 text-green-400 hover:text-green-300"
      >
        ← Back to Lawn Products
      </Link>

    </main>
  );
}