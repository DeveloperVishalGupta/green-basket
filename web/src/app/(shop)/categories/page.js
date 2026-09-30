"use client";

import CategoryCard from "@/components/home/CategoryCard";
import BottomNav from "@/components/layout/BottomNav";
import PageHeader from "@/components/layout/PageHeader";
import { useCategories } from "@/hooks/useCategories";
import { SearchOutlined } from "@ant-design/icons";
import { Alert, Input, Spin } from "antd";
import { useState } from "react";

/**
 * Categories Page
 * Shows all available product categories
 */
export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading, error } = useCategories();

  const categories = data?.data || [];

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-below-header bg-white/95 pb-20 lg:pb-0 lg:pl-0">
      <PageHeader
        title="Shop by Category"
        subtitle={`${filteredCategories.length} categories available`}
      />

      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="mx-auto max-w-7xl sm:flex sm:justify-end">
          <Input
            placeholder="Search categories..."
            prefix={<SearchOutlined className="text-emerald-600" />}
            className="rounded-xl border-2 border-gray-200 w-full sm:w-64 hover:border-emerald-400 focus:border-emerald-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
          />
        </div>
      </div>

      {/* Categories Grid */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {error ? (
          <div className="text-center py-20">
            <Alert
              message="Failed to load categories"
              description="Please try again later"
              type="error"
              showIcon
              className="max-w-md mx-auto"
            />
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-linear-to-br from-gray-100 to-gray-200 rounded-3xl p-12 inline-block mb-6">
              <div className="text-6xl">🔍</div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Categories Found
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? "Try a different search term"
                : "No categories available"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
            {filteredCategories.map((category) => (
              <div
                key={category._id}
                className="bg-white flex justify-center items-center rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden py-3 border-slate-100">
                <CategoryCard category={category} />
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
