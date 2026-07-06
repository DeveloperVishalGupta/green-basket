"use client";

import ProductCard from "@/components/home/ProductCard";
import { useFeaturedProducts } from "@/hooks/useProducts";
import { RightOutlined } from "@ant-design/icons";
import { Alert, Spin } from "antd";
import Link from "next/link";

export default function TopPicksSection() {
  const { data, isLoading, error } = useFeaturedProducts();

  const products = data?.data || [];

  if (error) {
    return (
      <section className="px-3 py-6 md:px-6 md:py-10 bg-linear-to-b from-transparent to-gray-50">
        <Alert
          title="Failed to load products"
          description="Please try again later"
          type="error"
          showIcon
        />
      </section>
    );
  }

  return (
    <section className="px-3 py-6 md:px-6 md:py-10 bg-linear-to-b from-transparent to-gray-50">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* <FireOutlined className="text-red-500 text-xl md:text-2xl" /> */}
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-gray-900">
            🔥 Top Picks for You
          </h2>
        </div>
        <Link
          href="/products"
          className="text-sm md:text-base font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:gap-2 transition-all">
          View all <RightOutlined className="text-xs" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spin size="large" />
        </div>
      ) : products.length > 0 ? (
        <>
          {/* Mobile: Scroll, Desktop: Grid */}
          <div className="md:hidden grid grid-cols-2 gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {products.slice(0, 6).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4  gap-4 lg:gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No products available
        </div>
      )}
    </section>
  );
}
