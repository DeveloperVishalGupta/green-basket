'use client';

import { categoriesAPI, productsAPI } from '@/lib/api';
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import { Input, Spin } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/**
 * Header Search Component
 * Provides search functionality with dropdown suggestions for products and categories
 */
export default function HeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [results, setResults] = useState({ products: [], categories: [] });
  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
        const categories = allCategories.filter(cat => 
          cat.name.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 3);

        setResults({ products, categories });
        setShowDropdown(true);
      } catch (error) {
        console.error('Search error:', error);
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

  const handleSearch = () => {
    const term = query.trim();
    if (term) {
      router.push(`/products?search=${encodeURIComponent(term)}`);
    } else {
      router.push('/products');
    }
    setShowDropdown(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleResultClick = () => {
    setShowDropdown(false);
    setQuery('');
  };

  const hasResults = results.products.length > 0 || results.categories.length > 0;

  return (
    <div ref={searchRef} className="relative flex-1 min-w-0">
      <Input
        size="large"
        placeholder="Search products, categories..."
        prefix={<SearchOutlined className="text-emerald-600" />}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        onFocus={() => query.trim() && setShowDropdown(true)}
        suffix={
          <>
            {isSearching && (
              <LoadingOutlined className="text-emerald-600 mr-2" />
            )}
            <button
              onClick={handleSearch}
              className="bg-emerald-600 hover:bg-emerald-700 border-0 rounded-lg px-3 py-1 text-sm font-semibold text-white hidden lg:inline-flex transition-colors"
            >
              Search
            </button>
          </>
        }
        className="rounded-xl border-2 border-gray-200 hover:border-emerald-400 focus:border-emerald-500 transition-all"
      />

      {/* Dropdown Results */}
      {showDropdown && (
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
                      className="flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors border-b border-gray-50 last:border-0"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{category.name}</p>
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
                      className="flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors border-b border-gray-50 last:border-0"
                    >
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
                        <p className="font-semibold text-gray-900 line-clamp-1">{product.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-sm font-bold text-emerald-600">₹{product.price}</p>
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
                  className="w-full px-4 py-3 text-center text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
                >
                  View all results for "{query}"
                </button>
              </div>
            </div>
          ) : query.trim() && !isSearching ? (
            <div className="py-8 px-4 text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-semibold mb-1">No results found</p>
              <p className="text-sm">Try different keywords</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
