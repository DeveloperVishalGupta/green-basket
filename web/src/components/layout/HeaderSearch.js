"use client";

import { categoriesAPI, productsAPI } from "@/lib/api";
import { LoadingOutlined, SearchOutlined } from "@ant-design/icons";
import { Input, Modal, Spin } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Header Search Component
 * Provides search functionality with dropdown suggestions for products and categories.
 * - Desktop (lg+): inline search bar in the header
 * - Mobile: a single search icon that opens the search bar inside a modal
 */
export default function HeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [results, setResults] = useState({ products: [], categories: [] });
  const searchRef = useRef(null);
  const modalSearchRef = useRef(null);
  const debounceTimer = useRef(null);

  // Handle click outside to close dropdown. The mobile search lives in a
  // modal (rendered in a portal, outside searchRef), so it must count as
  // "inside" too — otherwise tapping a result closes the dropdown on
  // mousedown/touchstart, before the click reaches the link.
  useEffect(() => {
    const handleClickOutside = (event) => {
      const inside = [searchRef.current, modalSearchRef.current].some(
        (el) => el && el.contains(event.target),
      );
      if (!inside) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Debounced search function
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!query.trim()) {
      setResults({ products: [], categories: [] });
      setShowDropdown(false);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Search both products and categories in parallel
        const [productsResponse, categoriesResponse] = await Promise.all([
          productsAPI.getAll({ search: query, limit: 5 }),
          categoriesAPI.getAll(),
        ]);

        const products = productsResponse.data?.data || [];
        const allCategories = categoriesResponse.data?.data || [];

        // Filter categories that match the search query
        const categories = allCategories
          .filter((cat) => cat.name.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 3);

        setResults({ products, categories });
        setShowDropdown(true);
      } catch (error) {
        console.error("Search error:", error);
        setResults({ products: [], categories: [] });
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  const closeAll = () => {
    setShowDropdown(false);
    setModalOpen(false);
  };

  const handleSearch = () => {
    const term = query.trim();
    if (term) {
      router.push(`/products?search=${encodeURIComponent(term)}`);
    } else {
      router.push("/products");
    }
    closeAll();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleResultClick = () => {
    setQuery("");
    closeAll();
  };

  const hasResults =
    results.products.length > 0 || results.categories.length > 0;

  const renderInput = ({ autoFocus = false, showButton = false } = {}) => (
    <Input
      size="large"
      autoFocus={autoFocus}
      placeholder="Search products, categories..."
      prefix={<SearchOutlined className="text-emerald-600" />}
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyPress={handleKeyPress}
      onFocus={() => query.trim() && setShowDropdown(true)}
      suffix={
        <>
          {isSearching && <LoadingOutlined className="text-emerald-600 mr-2" />}
          <button
            onClick={handleSearch}
            className={`bg-emerald-600 hover:bg-emerald-700 border-0 rounded-lg px-3 py-1 text-sm font-semibold text-white transition-colors ${
              showButton ? "inline-flex" : "hidden lg:inline-flex"
            }`}>
            Search
          </button>
        </>
      }
      className="rounded-xl border-2 border-gray-200 hover:border-emerald-400 focus:border-emerald-500 transition-all"
    />
  );

  const renderDropdown = () =>
    showDropdown && (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-200 max-h-96 overflow-y-auto z-50">
        {isSearching ? (
          <div className="flex items-center justify-center py-8">
            <Spin size="large" />
          </div>
        ) : hasResults ? (
          <div className="py-2">
            {/* Categories Section */}
            {results.categories.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase border-b border-gray-100">
                  Categories
                </div>
                {results.categories.map((category) => (
                  <Link
                    key={category._id}
                    href={`/products?category=${category.slug}`}
                    onClick={handleResultClick}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors border-b border-gray-50 last:border-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 flex-shrink-0">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {category.name}
                      </p>
                      <p className="text-xs text-gray-500">Category</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Products Section */}
            {results.products.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase border-b border-gray-100">
                  Products
                </div>
                {results.products.map((product) => (
                  <Link
                    key={product._id}
                    href={`/products/${product.slug}`}
                    onClick={handleResultClick}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors border-b border-gray-50 last:border-0">
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {product.images?.[0]?.url || product.images?.[0] ? (
                        <img
                          src={product.images[0]?.url || product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl">
                          📦
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 line-clamp-1">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-sm font-bold text-emerald-600">
                          ₹{product.price}
                        </p>
                        <p className="text-xs text-gray-500">Product</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* View All Results Link */}
            <div className="border-t border-gray-200">
              <button
                onClick={handleSearch}
                className="w-full px-4 py-3 text-center text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors">
                View all results for &quot;{query}&quot;
              </button>
            </div>
          </div>
        ) : query.trim() && !isSearching ? (
          <div className="py-8 px-4 text-center text-gray-500">
            <svg
              className="w-16 h-16 mx-auto mb-3 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="font-semibold mb-1">No results found</p>
            <p className="text-sm">Try different keywords</p>
          </div>
        ) : null}
      </div>
    );

  return (
    <>
      {/* Desktop: inline search bar */}
      <div ref={searchRef} className="relative flex-1 min-w-0 hidden lg:block">
        {renderInput()}
        {renderDropdown()}
      </div>

      {/* Mobile: search icon only */}
      <button
        onClick={() => setModalOpen(true)}
        aria-label="Search"
        className="lg:hidden flex items-center justify-center h-10 w-10 rounded-xl border-2 border-gray-200 text-emerald-600 shrink-0 transition-colors hover:border-emerald-400 dark:border-border-default">
        <SearchOutlined className="text-lg" />
      </button>

      {/* Mobile: search modal */}
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        closable={false}
        destroyOnHidden
        // destroyOnClose
        style={{ top: 12 }}
        styles={{ body: { padding: 12 } }}
        className="lg:hidden">
        <div ref={modalSearchRef} className="relative">
          {renderInput({ autoFocus: true, showButton: true })}
          {renderDropdown()}
        </div>
      </Modal>
    </>
  );
}
