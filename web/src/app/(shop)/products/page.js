'use client';

import ProductCard from '@/components/home/ProductCard';
import BottomNav from '@/components/layout/BottomNav';
import Header from '@/components/layout/Header';
import FilterSidebar from '@/components/products/FilterSidebar';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/services/categories';
import { useCartStore } from '@/store/cartStore';
import {
    CloseOutlined,
    InboxOutlined
} from '@ant-design/icons';
import { Button, Drawer, Spin } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

function ProductsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    const { getTotalItems } = useCartStore();
    const cartCount = getTotalItems();

    const { data, isLoading, error } = useProducts();
    const products = data?.data || [];
    

        const {
            data: categoriesData,
            isLoading: categoriesLoading,
            error: categoriesError,
            refetch: refetchCategories,
        } = useCategories({ enabled: true });
          

          
    

    const [selectedCategories, setSelectedCategories] = useState(
        categoryParam ? [categoryParam] : []
    );
    const [searchQuery, setSearchQuery] = useState(searchParam || '');
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [sortBy, setSortBy] = useState('featured');
    const [priceRange, setPriceRange] = useState([0, 5000]);
    const [groceryFilters, setGroceryFilters] = useState({
        organic: false,
        fresh: false,
        bestSelling: false,
        inStock: false,
    });

    // Compute dynamic min/max/mid points for prices from loaded products
    const productPrices = products.map((p) => Number(p.price || 0)).filter((v) => !isNaN(v));
    const minPrice = productPrices.length ? Math.min(...productPrices) : 0;
    const maxPrice = productPrices.length ? Math.max(...productPrices) : 5000;
    const range = Math.max(0, maxPrice - minPrice);
    const mid1 = Math.round(minPrice + range / 3);
    const mid2 = Math.round(minPrice + (2 * range) / 3);
    const priceMarks = {
        [Math.round(minPrice)]: `₹${Math.round(minPrice)}`,
        [mid1]: `₹${mid1}`,
        [mid2]: `₹${mid2}`,
        [Math.round(maxPrice)]: `₹${Math.round(maxPrice)}`,
    };

    // Initialize slider to full range when products first load (only if still defaults)
    useEffect(() => {
        if (!productPrices.length) return;
        const isDefault = priceRange[0] === 0 && priceRange[1] === 5000;
        if (isDefault) setPriceRange([Math.round(minPrice), Math.round(maxPrice)]);
    }, [products]);

    const filteredProducts = products.filter((product) => {
        const productCategoryId =
            product.category?._id || product.categoryId || product.category || product.categoryId?.toString?.();
        const matchesCategory =
            selectedCategories.length === 0 || selectedCategories.includes(productCategoryId);
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              product.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
        
        // Grocery-specific filters
        const matchesOrganic = !groceryFilters.organic || product.isOrganic;
        const matchesFresh = !groceryFilters.fresh || product.isSeasonalFresh;
        const matchesBestSelling = !groceryFilters.bestSelling || product.isBestSelling;
        const matchesInStock = !groceryFilters.inStock || product.stock > 0;
        
        return matchesCategory && matchesSearch && matchesPrice && matchesOrganic && matchesFresh && matchesBestSelling && matchesInStock;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'price-low': return a.price - b.price;
            case 'price-high': return b.price - a.price;
            case 'name': return a.name.localeCompare(b.name);
            case 'fresh': return (b.isSeasonalFresh ? 1 : 0) - (a.isSeasonalFresh ? 1 : 0);
            case 'bestselling': return (b.isBestSelling ? 1 : 0) - (a.isBestSelling ? 1 : 0);
            default: return 0;
        }
    });

    // Clear filters handler (passed to FilterSidebar)
    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategories([]);
        setPriceRange([0, 5000]);
        setSortBy('featured');
        setGroceryFilters({ organic: false, fresh: false, bestSelling: false, inStock: false });
    };

    // If page was opened with ?category=<slug>, map it to the category _id once categories load
    useEffect(() => {
        if (!categoriesData) return;
        if (!categoryParam) return;
        // categoriesData may be the API response object or an array
        const cats = Array.isArray(categoriesData) ? categoriesData : categoriesData.data || categoriesData;
        const match = cats.find((c) => c.slug === categoryParam || c.name === categoryParam || c._id === categoryParam || c.id === categoryParam);
        if (match) setSelectedCategories([match._id || match.id || match.slug]);
    }, [categoriesData, categoryParam]);

    // If the URL has a ?search= param, update the local searchQuery when it changes
    useEffect(() => {
        if (searchParam == null) return;
        setSearchQuery(searchParam);
    }, [searchParam]);

    return (
        <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
            {/* Header - Consistent with Home Page */}
         <Header/>

            {/* Main Content with Sidebar */}
            <div className="mx-auto max-w-7xl">
                <div className="flex gap-6 py-6">
                    {/* Desktop Left Sidebar - Always Open */}
                    <aside className="hidden lg:block w-80 shrink-0">
                        <div className="sticky top-24 bg-white rounded-2xl shadow-md p-6 border border-gray-200">
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
                                priceRange={priceRange}
                                setPriceRange={setPriceRange}
                                sortBy={sortBy}
                                setSortBy={setSortBy}
                                groceryFilters={groceryFilters}
                                setGroceryFilters={setGroceryFilters}
                                categories={categoriesData?.data || categoriesData || []}
                                clearFilters={clearFilters}
                            />
                        </div>
                    </aside>

                    {/* Products Grid */}
                    <main className="flex-1 px-3 md:px-0 ">
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
                                        setSearchQuery('');
                                        setSelectedCategories([]);
                                        setPriceRange([0, 5000]);
                                    }}
                                >
                                    Clear All Filters
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
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
                    body: { padding: '24px' },
                }}
                closeIcon={<CloseOutlined />}
            >
                <FilterSidebar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
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
                        onClick={() => setFilterDrawerOpen(false)}
                    >
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
                <div className="min-h-screen flex items-center justify-center">
                    <Spin size="large" />
                </div>
            }
        >
            <ProductsContent />
        </Suspense>
    );
}
