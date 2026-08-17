import Link from "next/link";
import { lawnCategories } from "@/data/lawn-products";

export const metadata = {
  title: "Lawn Care Products & Equipment | Lawn Mowing Near Me",
  description:
    "Browse lawn mowers, grass trimmers, leaf blowers, lawn tools, grass seed, fertilizers, irrigation products and more.",
};

export default function LawnProductsPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-10">

      {/* Hero */}
      <section className="text-center mb-14">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-5">
          Lawn Care Products & Equipment
        </h1>

        <p className="text-gray-300 max-w-3xl mx-auto text-lg">
          Find useful lawn-care equipment, garden tools and lawn
          maintenance products to help keep your grass looking its best.
        </p>

        <p className="text-gray-400 text-sm max-w-2xl mx-auto mt-5">
          We may earn a commission from qualifying purchases made
          through links to Amazon.
        </p>
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
          Browse Lawn Care Categories
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {lawnCategories.map((item) => (
            <div
              key={item.slug}
              className="bg-white rounded-xl shadow hover:shadow-xl transition p-6"
            >
              <div className="text-5xl mb-4">
                {item.emoji}
              </div>

              <h3 className="font-bold text-xl mb-3">
                {item.name}
              </h3>

              <p className="text-gray-600 text-sm leading-6 mb-6">
                {item.description}
              </p>

              <Link
                href={`/lawn-products/${item.slug}`}
                className="text-green-600 hover:text-green-700 hover:underline font-semibold"
              >
                Browse {item.name} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Buying guidance */}
      <section className="mt-16 bg-white rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Choosing Lawn Care Equipment
        </h2>

        <p className="text-gray-600 leading-7 mb-4">
          The right lawn-care equipment depends on the size of your
          lawn, the type of grass, how frequently you maintain it and
          the amount of time you want to spend on lawn maintenance.
        </p>

        <p className="text-gray-600 leading-7">
          For smaller lawns, compact cordless equipment can be convenient.
          Larger properties may benefit from equipment designed for longer
          operating times and larger cutting areas.
        </p>
      </section>

      {/* Disclosure */}
      <section className="mt-10 text-center">
        <p className="text-gray-400 text-xs max-w-3xl mx-auto">
          As an Amazon Associate, we earn from qualifying purchases.
          Product availability and prices may change and should be
          confirmed on Amazon before purchasing.
        </p>
      </section>

    </main>
  );
}