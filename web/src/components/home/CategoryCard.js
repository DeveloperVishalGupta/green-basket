"use client";

import Image from "next/image";
import Link from "next/link";

/**
 * Category Card Component
 * Displays a category with circular image and name
 */
export default function CategoryCard({ category }) {
  return (
    <Link
      href={`/products?category=${category._id || category.id}`}
      className="group block text-center">
      <div className="mb-3 mx-auto h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 overflow-hidden rounded-3xl bg-linear-to-br from-gray-100 to-gray-200 shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:scale-105">
        {category.image?.url ? (
          <Image
            src={category.image?.url}
            alt={category.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover max-w-36 transition-transform relative! duration-1000 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl sm:text-3xl text-gray-400">
            🏪
          </div>
        )}
      </div>
      <p className="text-xs line-clamp-1 sm:text-sm md:text-base leading-tight text-gray-800 font-semibold  flex items-center justify-center">
        {category.name}
      </p>
      {category.productCount !== undefined && (
        <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
          {category.productCount}{" "}
          {category.productCount === 1 ? "item" : "items"}
        </p>
      )}
    </Link>
  );
}
