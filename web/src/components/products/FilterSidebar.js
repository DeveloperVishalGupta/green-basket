'use client';

import { SearchOutlined } from '@ant-design/icons';
import { Button, Checkbox, Input, Select, Slider } from 'antd';

export default function FilterSidebar({
  searchQuery,
  setSearchQuery,
  selectedCategories,
  setSelectedCategories,
  priceRange,
  setPriceRange,
  priceMin = 0,
  priceMax = 5000,
  priceMarks = {},
  sortBy,
  setSortBy,
  groceryFilters = {},
  setGroceryFilters,
  categories = [],
  clearFilters,
}) {
  const handleGroceryFilterChange = (filterName) => {
    if (setGroceryFilters) {
      setGroceryFilters(prev => ({
        ...prev,
        [filterName]: !prev[filterName]
      }));
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Search Products</h3>
        <Input
          size="large"
          placeholder="Search products"
          prefix={<SearchOutlined className="text-green-600" />}
          className="rounded-xl border-2 border-gray-200 hover:border-green-400 focus:border-green-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
        />
      </div>

      {/* Category Filter */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Categories</h3>
        <Select
          mode="multiple"
          value={selectedCategories}
          onChange={setSelectedCategories}
          placeholder="Select categories to filter"
          className="w-full"
          size="large"
          maxTagCount="responsive"
          allowClear
          options={categories.map((cat) => ({
            label: cat.name || cat.title || cat.slug,
            value: cat._id || cat.id || cat.slug,
          }))}
        />
        <p className="text-xs text-gray-500 mt-2">
          {selectedCategories.length === 0
            ? '🔥 Showing all categories'
            : `Filtering by ${selectedCategories.length} ${
                selectedCategories.length === 1 ? 'category' : 'categories'
              }`}
        </p>
      </div>

      {/* Grocery-Specific Filters */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">🌱 Special Filters</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox 
              checked={groceryFilters.organic}
              onChange={() => handleGroceryFilterChange('organic')}
            />
            <span className="text-sm text-gray-700">🌱 Organic Products</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox 
              checked={groceryFilters.fresh}
              onChange={() => handleGroceryFilterChange('fresh')}
            />
            <span className="text-sm text-gray-700">✨ Fresh Arrival</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox 
              checked={groceryFilters.bestSelling}
              onChange={() => handleGroceryFilterChange('bestSelling')}
            />
            <span className="text-sm text-gray-700">⭐ Best Selling</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox 
              checked={groceryFilters.inStock}
              onChange={() => handleGroceryFilterChange('inStock')}
            />
            <span className="text-sm text-gray-700">📦 In Stock Only</span>
          </label>
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Price Range</h3>
        <Slider
          range
          min={priceMin}
          max={priceMax}
          value={priceRange}
          onChange={setPriceRange}
          marks={priceMarks}
        />
        <div className="flex justify-between mt-4 text-sm">
          <span className="font-semibold text-green-600">₹{priceRange[0]}</span>
          <span className="font-semibold text-green-600">₹{priceRange[1]}</span>
        </div>
      </div>

      {/* Sort By */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Sort By</h3>
        <Select
          value={sortBy}
          onChange={setSortBy}
          className="w-full"
          size="large"
          options={[
            { value: 'featured', label: '⭐ Featured' },
            { value: 'fresh', label: '✨ Fresh Arrival' },
            { value: 'bestselling', label: '🔥 Best Selling' },
            { value: 'price-low', label: '💰 Price: Low to High' },
            { value: 'price-high', label: '💎 Price: High to Low' },
            { value: 'name', label: '🔤 Name: A to Z' },
          ]}
        />
      </div>

      {/* Clear Filters Button */}
      <Button block size="large" className="rounded-xl bg-green-600 text-white hover:bg-green-700" onClick={() => {
        clearFilters();
        if (setGroceryFilters) {
          setGroceryFilters({ organic: false, fresh: false, bestSelling: false, inStock: false });
        }
      }}>
        Clear All Filters
      </Button>
    </div>
  );
}
