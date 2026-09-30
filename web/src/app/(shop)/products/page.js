"use client";

import ProductCard from "@/components/home/ProductCard";
import BottomNav from "@/components/layout/BottomNav";
import PageHeader from "@/components/layout/PageHeader";
import FilterSidebar from "@/components/products/FilterSidebar";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/services/categories";
import {
  CloseOutlined,
  FilterOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { Button, Drawer, Spin } from "antd";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const searchParam = searchParams.get("search");

  const { data } = useProducts();
  const products = data?.data || [];
  const { data: categoriesData } = useCategories({ enabled: true });

  const [selectedCategories, setSelectedCategories] = useState(
    categoryParam ? [categoryParam] : [],
  );
  const [searchQuery, setSearchQuery] = useState(searchParam || "");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [groceryFilters, setGroceryFilters] = useState({
    organic: false,
    fresh: false,
    bestSelling: false,
    inStock: false,
  });
  const filteredProducts = products.filter((product) => {
    // categories[] is an array of populated objects or ObjectId strings
    const productCategoryIds = (product.categories || []).map((c) =>
      (typeof c === "object" ? c._id || c.id : c)?.toString(),
    );
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.some((sel) =>
        productCategoryIds.includes(sel?.toString()),
      );
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    // use startingPrice virtual (variants lowest price); fall back to 0
    const productPrice = product.startingPrice ?? product.price ?? 0;
    const matchesPrice =
      productPrice >= priceRange[0] && productPrice <= priceRange[1];

    // Grocery-specific filters (use correct schema field names)
    const matchesOrganic = !groceryFilters.organic || product.isOrganic;
    const matchesFresh = !groceryFilters.fresh || product.isSeasonal;
    const matchesBestSelling =
      !groceryFilters.bestSelling || product.isBestSeller;
    const matchesInStock = !groceryFilters.inStock || product.stock > 0;

    return (
      matchesCategory &&
      matchesSearch &&
      matchesPrice &&
      matchesOrganic &&
      matchesFresh &&
      matchesBestSelling &&
      matchesInStock
    );
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        const minpriceA = Math.min(
          ...(a.variants || []).map((v) => v.price ?? Infinity),
        );
        const minpriceB = Math.min(
          ...(b.variants || []).map((v) => v.price ?? Infinity),
        );
        return minpriceA - minpriceB;
      // return a.price - b.price;
      case "price-high":
        const maxpriceA = Math.min(
          ...(a.variants || []).map((v) => v.price ?? -Infinity),
        );
        const maxpriceB = Math.min(
          ...(b.variants || []).map((v) => v.price ?? -Infinity),
        );
        return maxpriceB - maxpriceA;
      case "name":
        return a.name.localeCompare(b.name);
      case "fresh":
        return (b.isSeasonal ? 1 : 0) - (a.isSeasonal ? 1 : 0);
      case "bestselling":
        return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
      default:
        return 0;
    }
  });

  // Clear filters handler (passed to FilterSidebar)
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setPriceRange([Math.round(minPrice), Math.round(maxPrice)]);
    setSortBy("featured");
    setGroceryFilters({
      organic: false,
      fresh: false,
      bestSelling: false,
      inStock: false,
    });
  };

  // If page was opened with ?category=<slug>, map it to the category _id once categories load
  useEffect(() => {
    if (!categoriesData) return;
    if (!categoryParam) return;
    // categoriesData may be the API response object or an array
    const cats = Array.isArray(categoriesData)
      ? categoriesData
      : categoriesData.data || categoriesData;
    const match = cats.find(
      (c) =>
        c.slug === categoryParam ||
        c.name === categoryParam ||
        c._id === categoryParam ||
        c.id === categoryParam,
    );
    if (match) setSelectedCategories([match._id || match.id || match.slug]);
  }, [categoriesData, categoryParam]);

  // If the URL has a ?search= param, update the local searchQuery when it changes
  useEffect(() => {
    if (searchParam == null) return;
    setSearchQuery(searchParam);
  }, [searchParam]);

  return (
    <div className="min-h-below-header bg-gray-50 pb-20 lg:pb-0 lg:min-h-0 lg:h-[calc(100vh-4.5rem)] lg:overflow-hidden dark:bg-background lg:flex lg:flex-col">
      <div className="lg:shrink-0">
        <PageHeader
          title="Products"
          subtitle={`${sortedProducts.length} products available`}
        />
      </div>

      {/* Main Content with Sidebar */}
      <div className="mx-auto max-w-7xl lg:min-h-0 lg:flex-1 lg:w-full">
        {/* On lg+ the row is viewport-height so the filter and product
            columns each scroll independently; on mobile the page scrolls normally. */}
        <div className="flex gap-6 py-6 lg:py-0 lg:h-full">
          {/* Desktop Left Sidebar - Always Open, scrolls on its own */}
          <aside className="hidden lg:block w-80 shrink-0 lg:h-full lg:overflow-y-auto lg:py-6 lg:pr-1">
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                <span className="text-sm text-emerald-600 font-semibold">
                  {sortedProducts.length} Results
                </span>
              </div>
              <FilterSidebar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                sortBy={sortBy}
                setSortBy={setSortBy}
                groceryFilters={groceryFilters}
                setGroceryFilters={setGroceryFilters}
                categories={categoriesData?.data || categoriesData || []}
                clearFilters={clearFilters}
              />
            </div>
          </aside>

          {/* Products Grid - scrolls on its own on lg+ */}
          <main className="flex-1 px-3 md:px-0 lg:h-full lg:overflow-y-auto lg:py-6">
            {/* Mobile filter trigger */}
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <Button
                icon={<FilterOutlined />}
                size="large"
                className="rounded-xl border-gray-300"
                onClick={() => setFilterDrawerOpen(true)}>
                Filters & Search
              </Button>
              <span className="text-sm font-semibold text-emerald-600">
                {sortedProducts.length} Results
              </span>
            </div>
            {sortedProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-md">
                <div className="bg-linear-to-br from-gray-100 to-gray-200 rounded-3xl p-12 inline-block mb-6">
                  <InboxOutlined className="text-6xl text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No Products Found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search query
                </p>
                <Button
                  type="primary"
                  size="large"
                  className="bg-linear-to-r from-emerald-600 to-teal-600 border-0 rounded-xl h-12 px-8"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategories([]);
                    setPriceRange([0, 5000]);
                  }}>
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3">
                {sortedProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <Drawer
        title={
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">Filters & Search</span>
            <span className="text-sm text-emerald-600 font-semibold">
              {sortedProducts.length} Results
            </span>
          </div>
        }
        placement="left"
        onClose={() => setFilterDrawerOpen(false)}
        open={filterDrawerOpen}
        size="85%"
        styles={{
          body: { padding: "24px" },
        }}
        closeIcon={<CloseOutlined />}>
        <FilterSidebar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          sortBy={sortBy}
          setSortBy={setSortBy}
          groceryFilters={groceryFilters}
          setGroceryFilters={setGroceryFilters}
          categories={categoriesData?.data || categoriesData || []}
          clearFilters={clearFilters}
        />
        <div className="mt-6">
          <Button
            type="primary"
            block
            size="large"
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
            onClick={() => setFilterDrawerOpen(false)}>
            Show {sortedProducts.length} Products
          </Button>
        </div>
      </Drawer>

      <BottomNav />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-below-header flex items-center justify-center">
          <Spin size="large" />
        </div>
      }>
      <ProductsContent />
    </Suspense>
  );
}
