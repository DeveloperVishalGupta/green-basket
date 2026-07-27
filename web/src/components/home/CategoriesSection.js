/**
 * Categories Section Component
 * Displays category carousel on landing page with API integration
 */
"use client";

import { useCategories } from "@/hooks/useCategories";
import { RightOutlined } from "@ant-design/icons";
import { Alert, Spin } from "antd";
import Link from "next/link";
import CategoryCard from "./CategoryCard";

// Custom arrow components for Carousel
const CustomPrevArrow = ({ currentSlide, slideCount, ...props }) => (
  <button {...props} className="slick-prev">
    {/* <LeftOutlined /> */}Prev
  </button>
);

const CustomNextArrow = ({ currentSlide, slideCount, ...props }) => (
  <button {...props} className="slick-next">
    {/* <RightOutlined /> */}Next
  </button>
);

export default function CategoriesSection() {
  const { data, isLoading, error } = useCategories();

  const categories = data?.data || [];

  if (error) {
    return (
      <section className="px-3 py-6 md:px-6 md:py-10">
        <Alert
          title="Failed to load categories"
          description="Please try again later"
          type="error"
          showIcon
        />
      </section>
    );
  }

  return (
    <section className="px-3 py-6 md:px-6 md:py-10">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* <FireOutlined className="text-orange-500 text-xl md:text-2xl" /> */}
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-gray-900">
            🔥 Shop by Category
          </h2>
        </div>
        <Link
          href="/categories"
          className="text-sm md:text-base font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:gap-2 transition-all">
          View all <RightOutlined className="text-xs" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spin size="large" />
        </div>
      ) : categories.length > 0 ? (
        <div className="flex  overflow-x-auto ">
          {categories.map((category) => (
            <div key={category._id} className="px-2 min-w-[8rem] md:px-3">
              <CategoryCard category={category} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No categories available
        </div>
      )}
    </section>
  );
}
