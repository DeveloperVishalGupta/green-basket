/**
 * Best Sellers Section Component
 * Displays best selling products with API integration
 */
'use client';

import Link from 'next/link';
import { Spin, Alert } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { useBestSellers } from '@/hooks/useProducts';
import ProductCard from '@/components/home/ProductCard';

export default function BestSellersSection() {
  const { data, isLoading, error } = useBestSellers();

  const products = data?.data || [];

  if (error) {
    return (
      <section className="px-3 py-6 md:px-6 md:py-10 bg-linear-to-b from-gray-50 to-white">
        <Alert
          title="Failed to load best sellers"
          description="Please try again later"
          type="error"
          showIcon
        />
      </section>
    );
  }

  return (
    <section className="px-3 py-6 md:px-6 md:py-10 bg-linear-to-b from-gray-50 to-white">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl md:text-2xl">⭐</span>
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-gray-900">
            Best Sellers
          </h2>
        </div>
        <Link
          href="/products?sort=-salesCount"
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No best sellers available
        </div>
      )}
    </section>
  );
}
