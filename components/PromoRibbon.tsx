"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, ShoppingBag, ChevronRight } from "lucide-react";

const promos = [
  {
    title: "🌱 Lawn Care Deals",
    description:
      "Find lawn mowers, trimmers, blowers and garden tools on Amazon.",
  },
  {
    title: "🛒 Recommended Lawn Equipment",
    description:
      "Browse popular lawn-care products and equipment.",
  },
  {
    title: "🔥 Lawn & Garden Picks",
    description:
      "Discover recommended products for maintaining your lawn.",
  },
];

export default function PromoRibbon() {
  const [visible, setVisible] = useState(false);
  const [promo, setPromo] = useState(promos[0]);

  useEffect(() => {
    const hiddenUntil = localStorage.getItem(
      "lawnPromoRibbonHiddenUntil"
    );

    if (hiddenUntil && Number(hiddenUntil) > Date.now()) {
      return;
    }

    setPromo(
      promos[Math.floor(Math.random() * promos.length)]
    );

    setVisible(true);
  }, []);

  function dismiss() {
    const oneDay = Date.now() + 24 * 60 * 60 * 1000;

    localStorage.setItem(
      "lawnPromoRibbonHiddenUntil",
      oneDay.toString()
    );

    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="w-full bg-gradient-to-r from-green-700 via-emerald-600 to-green-700 text-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">

        <Link
          href="/lawn-products"
          className="flex items-center gap-3 flex-1 hover:opacity-95"
        >
          <ShoppingBag className="w-5 h-5 shrink-0" />

          <div className="flex flex-col md:flex-row md:items-center md:gap-2">
            <span className="font-semibold">
              {promo.title}
            </span>

            <span className="hidden md:inline text-green-100">
              {promo.description}
            </span>
          </div>

          <span className="hidden sm:flex items-center font-semibold ml-auto">
            View Products
            <ChevronRight className="w-4 h-4 ml-1" />
          </span>
        </Link>

        <button
          onClick={dismiss}
          className="hover:bg-white/20 rounded-full p-1"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

      </div>
    </div>
  );
}