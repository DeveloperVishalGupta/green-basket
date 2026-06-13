/**
 * New Arrivals Section Component
 * Displays newly added products with API integration
 */
'use client';

import ProductCard from '@/components/home/ProductCard';
import { useNewArrivals } from '@/hooks/useProducts';
import { RightOutlined } from '@ant-design/icons';
import { Alert, Spin } from 'antd';
import Link from 'next/link';

export default function NewArrivalsSection() {
  const { data, isLoading, error } = useNewArrivals();

  const products = data?.data || [];

  if (error) {
    return (
      <section className="px-3 py-6 md:px-6 md:py-10 bg-linear-to-b from-white to-gray-50">
        <Alert
          title="Failed to load new arrivals"
          description="Please try again later"
          type="error"
          showIcon
        />
      </section>
    );
  }

  return (
    <section className="px-3 py-6 md:px-6 md:py-10 bg-linear-to-b from-white to-gray-50">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl md:text-2xl">✨</span>
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-gray-900">
            New Arrivals
          </h2>
        </div>
        <Link
          href="/products?tag=new"
          className="text-sm md:text-base font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:gap-2 transition-all"
        >
          View all <RightOutlined className="text-xs" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spin size="large" />
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
          {products.slice(0, 5).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No new arrivals available
        </div>
      )}
    </section>
  );
}
