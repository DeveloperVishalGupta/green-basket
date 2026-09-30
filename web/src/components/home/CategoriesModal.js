/**
 * Categories Section Component
 * Displays category carousel on landing page with API integration
 */
"use client";

import CategoryCard from "@/components/home/CategoryCard";
import { useCategories } from "@/hooks/useCategories";
import { Alert, Modal } from "antd";

export default function CategoriesModal({ modalOpen, setOpen }) {
  const { data, error } = useCategories();

  const categories = data?.data || [];

  // Calculate total products across all categories
  const totalProducts = categories.reduce(
    (sum, cat) => sum + (cat.productCount || 0),
    0,
  );

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
    <Modal
      onCancel={() => setOpen(false)}
      width={900}
      centered
      footer={null}
      title={
        <>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Shop by Category
              </h1>
              <p className="text-sm text-gray-600">
                {categories.length} categories • {totalProducts} products
              </p>
            </div>
          </div>
        </>
      }
      styles={{
        mask: {
          backgroundImage: `linear-gradient(to top, #18181b 0, rgba(21, 21, 22, 0.2) 100%)`,
        },
      }}
      open={modalOpen}>
      <div className="bg-linear-to-br from-gray-50 via-emerald-50/20 to-teal-50/20 pb-20 lg:pb-0 lg:pl-0">
        {/* Categories Grid */}
        <main className="mx-auto max-w-7xl px-4 py-8">
          {categories.length === 0 ? (
            <div className="text-center py-20">
              <div className="rounded-3xl p-12 inline-block mb-6">
                <div className="text-6xl">🔍</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Categories Found
              </h3>
              <p className="text-gray-600">Try a different search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white border-slate-200 p-3 shadow-sm hover:shadow-lg rounded-2xl transition-all duration-500  hover:-translate-y-1"
                  // -2xl  transition-all duration-300 overflow-hidden hover:-translate-y-1"
                >
                  <CategoryCard category={category} />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </Modal>
  );
}
