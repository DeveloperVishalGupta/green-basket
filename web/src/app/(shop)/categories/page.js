"use client";

import CategoryCard from "@/components/home/CategoryCard";
import BottomNav from "@/components/layout/BottomNav";
import { useCategories } from "@/hooks/useCategories";
import { ArrowLeftOutlined, SearchOutlined } from "@ant-design/icons";
import { Alert, Input, Spin } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Categories Page
 * Shows all available product categories
 */
export default function CategoriesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading, error } = useCategories();

  const categories = data?.data || [];

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-white/95 pb-20 lg:pb-0 lg:pl-0">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg">
        <div className="mx-auto flex justify-between items-center max-w-7xl px-4 py-4">
          <div className="flex w-full items-center gap-3 mb-3">
            <button
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-all hover:scale-105">
              <ArrowLeftOutlined className="text-xl" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Shop by Category
              </h1>
              <p className="text-sm text-gray-600">
                {filteredCategories.length} categories available
              </p>
            </div>
          </div>
          <div className="w-1/2 flex">
            {/* Search Bar */}
            <Input
              size="large"
              placeholder="Search categories..."
              prefix={<SearchOutlined className="text-emerald-600" />}
              className="rounded-xl border-2 border-gray-200 w-1/2 hover:border-emerald-400 focus:border-emerald-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
            />
          </div>
        </div>
      </header>

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
