"use client";

import BestSellersSection from "@/components/home/BestSellersSection";
import CategoriesModal from "@/components/home/CategoriesModal";
import CategoriesSection from "@/components/home/CategoriesSection";
import NewArrivalsSection from "@/components/home/NewArrivalsSection";
import TopPicksSection from "@/components/home/TopPicksSection";
import TrendingSection from "@/components/home/TrendingSection";
import BottomNav from "@/components/layout/BottomNav";
import Header from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import { useCartStore } from "@/store/cartStore";
import {
  RightOutlined,
  ShoppingCartOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { Badge, Button } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const { getTotalItems } = useCartStore();
  const cartCount = getTotalItems();
  const { user, loading } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [deliveryTime] = useState("7-10 days");

  const [categoryModalStatus, setCategoryModalStatus] = useState(false);

  // Fetch products with discounts for flash sale
  // const { data: flashSaleProducts } = useProducts({
  //   hasDiscount: true,
  //   limit: 50
  // });

  // console.log('Flash Sale Products:', flashSaleProducts);

  // Calculate highest discount percentage
  // const highestDiscount = flashSaleProducts?.data?.reduce((max, product) => {
  //   if (product.compareAtPrice && product.price) {
  //     const discount = Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
  //     return Math.max(max, discount);
  //   }
  //   return max;
  // }, 0) || 70;

  // Fetch orders to check if user has any orders
  const { data: ordersData } = useOrders({
    enabled: !!user && user.role === "customer",
  });

  const hasOrders = ordersData?.data?.length > 0;

  // Redirect admins and vendors to their dashboards
  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else if (user.role === "vendor") {
        router.push("/vendor/dashboard");
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Return null if redirecting
  if (user && (user.role === "admin" || user.role === "vendor")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white pb-20 lg:pb-0 lg:pl-0">
      {/* Enhanced Compact Header */}
      <Header hasOrders={hasOrders} />
      {/* Hero Banner - Desktop/Tablet */}
      <section className="hidden md:block bg-linear-to-r from-green-600 via-green-700 to-emerald-600 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-semibold mb-4 backdrop-blur-sm">
                🌱 Farm Fresh Daily - Limited Time Offer
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Fresh Vegetables & <br />
                <span className="text-yellow-300">Fruits Daily</span>
              </h1>
              <p className="text-xl text-green-50 mb-8 leading-relaxed">
                Get farm-fresh produce delivered to your doorstep. 100% fresh
                guarantee, same-day delivery available in your area
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/products">
                  <Button
                    type="primary"
                    size="large"
                    className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 border-0 h-14 px-10 text-lg font-semibold shadow-xl">
                    Shop Now <RightOutlined />
                  </Button>
                </Link>
                <Button
                  onClick={() => {
                    console.log("Opening Categories Modal");
                    setCategoryModalStatus(true);
                  }}
                  size="large"
                  className="bg-transparent text-white border-2 border-white hover:bg-white/10 h-14 px-10 text-lg font-semibold">
                  Browse Categories
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 rounded-3xl blur-3xl"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl p-6 text-center">
                      <div className="text-4xl mb-2">🚀</div>
                      <div className="text-2xl font-bold text-green-600">
                        Same Day
                      </div>
                      <div className="text-sm text-gray-600">Delivery</div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 text-center">
                      <div className="text-4xl mb-2">💰</div>
                      <div className="text-2xl font-bold text-green-600">
                        Up to 40%
                      </div>
                      <div className="text-sm text-gray-600">Savings</div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 text-center">
                      <div className="text-4xl mb-2">🥬</div>
                      <div className="text-2xl font-bold text-green-600">
                        500+
                      </div>
                      <div className="text-sm text-gray-600">Fresh Items</div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 text-center">
                      <div className="text-4xl mb-2">❤️</div>
                      <div className="text-2xl font-bold text-green-600">
                        10000+
                      </div>
                      <div className="text-sm text-gray-600">
                        Happy Customers
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Mobile Hero Banner */}
      <section className="md:hidden bg-linear-to-br from-green-600 to-emerald-600 px-4 py-8 text-white">
        <div className="text-center">
          <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold mb-3 backdrop-blur-sm">
            🌱 Farm Fresh Daily
          </div>
          <h1 className="text-2xl font-bold mb-3">
            Fresh Vegetables & <span className="text-yellow-300">Fruits</span>
          </h1>
          <p className="text-sm text-green-50 mb-6">
            Same-day delivery with 100% fresh guarantee
          </p>
          <div className="grid grid-cols-4 gap-2 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl mb-1">🚀</div>
              <div className="text-xs font-semibold">Same Day</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl mb-1">💰</div>
              <div className="text-xs font-semibold">40% OFF</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl mb-1">🥬</div>
              <div className="text-xs font-semibold">500+</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl mb-1">❤️</div>
              <div className="text-xs font-semibold">10K+</div>
            </div>
          </div>
        </div>
      </section>
      {/* Main Content */}
      <main className="mx-auto max-w-7xl">
        {/* Categories Section - Using React Query */}
        <CategoriesSection />

        {/* Fresh Produce of the Day Banner */}
        <section className="px-3 py-4 md:px-6 md:py-6">
          <div className="bg-linear-to-r from-yellow-400 via-orange-400 to-red-400 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative md:flex items-center justify-between">
              <div className="flex items-center mb-3 gap-3 md:gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 md:p-4">
                  <ThunderboltOutlined className="text-3xl md:text-5xl" />
                </div>
                <div>
                  <h3 className="text-xl md:text-3xl font-bold mb-1">
                    🥬 Fresh Produce Today
                  </h3>
                  <p className="text-sm md:text-lg font-semibold opacity-90">
                    Organic vegetables & fruits - Up to 40% OFF!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Top Picks Products - Using React Query */}
        <TopPicksSection />

        {/* Quality & Service Badges */}
        <section className="px-3 py-8 md:px-6 md:py-12 bg-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div className="text-center p-4 rounded-2xl bg-linear-to-br from-green-50 to-green-100 hover:shadow-lg transition-all">
              <div className="text-4xl md:text-5xl mb-3">🚚</div>
              <h3 className="font-bold text-gray-900 mb-1 text-sm md:text-base">
                Same Day Delivery
              </h3>
              <p className="text-xs md:text-sm text-gray-600">
                In select areas
              </p>
            </div>
            <div className="text-center p-4 rounded-2xl bg-linear-to-br from-yellow-50 to-yellow-100 hover:shadow-lg transition-all">
              <div className="text-4xl md:text-5xl mb-3">✅</div>
              <h3 className="font-bold text-gray-900 mb-1 text-sm md:text-base">
                100% Fresh
              </h3>
              <p className="text-xs md:text-sm text-gray-600">
                Farm-to-table guarantee
              </p>
            </div>
            <div className="text-center p-4 rounded-2xl bg-linear-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-all">
              <div className="text-4xl md:text-5xl mb-3">💳</div>
              <h3 className="font-bold text-gray-900 mb-1 text-sm md:text-base">
                Secure Payment
              </h3>
              <p className="text-xs md:text-sm text-gray-600">
                100% Safe & Secure
              </p>
            </div>
            <div className="text-center p-4 rounded-2xl bg-linear-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-all">
              <div className="text-4xl md:text-5xl mb-3">🌱</div>
              <h3 className="font-bold text-gray-900 mb-1 text-sm md:text-base">
                Organic Options
              </h3>
              <p className="text-xs md:text-sm text-gray-600">
                Certified organic available
              </p>
            </div>
          </div>
        </section>

        {/* Trending Products - Using React Query */}
        <TrendingSection />

        {/* Mega Savings Banner */}
        <section className="px-3 py-6 md:px-6 md:py-8">
          <button className="group flex w-full items-center justify-between rounded-2xl md:rounded-3xl bg-linear-to-r from-emerald-600 via-emerald-700 to-teal-600 px-6 py-6 md:px-10 md:py-8 text-white shadow-2xl hover:shadow-3xl transition-all hover:scale-[1.02]">
            <div className="flex items-center gap-3 md:gap-6">
              <div className="text-3xl md:text-5xl">🏪</div>
              <div className="text-left">
                <span className="block text-lg md:text-2xl lg:text-3xl font-bold mb-1">
                  Explore Store
                </span>
                <span className="block text-xs md:text-sm opacity-90">
                  Discover exclusive collections
                </span>
              </div>
              <span className="rounded-xl bg-linear-to-r from-orange-500 to-red-500 px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm font-bold shadow-lg animate-pulse">
                MEGA SAVINGS
              </span>
            </div>
            <svg
              className="h-6 w-6 md:h-8 md:w-8 group-hover:translate-x-2 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        </section>

        {/* Best Sellers - Using React Query */}
        <BestSellersSection />

        {/* Must Have Items - Using Mock Data for now
        <section className="px-4 py-6 md:py-10">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl md:text-2xl">💎</span>
              <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-gray-900">Must Have Items</h2>
            </div>
          </div>
          <div className="text-center py-8 text-gray-500">
            <p>Curated collection coming soon...</p>
          </div>
        </section> */}

        {/* Free Delivery Promotional Banner */}
        <section className="px-4 py-6 md:py-10">
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-green-400 via-emerald-400 to-teal-500 p-8 md:p-12 shadow-2xl">
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-block rounded-xl bg-white/90 backdrop-blur-sm px-4 py-2 mb-4 shadow-lg">
                  <span className="text-sm md:text-base font-bold text-green-600">
                    🌱 LIMITED TIME OFFER
                  </span>
                </div>
                <h2 className="mb-4 text-4xl md:text-6xl font-black text-white leading-tight">
                  Free Delivery
                  <br />
                  Above ₹499
                </h2>
                <p className="mb-6 text-lg md:text-xl font-semibold text-white/90">
                  Get fresh vegetables & fruits delivered free
                  <br />
                  Plus enjoy same-day delivery in your area
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/products">
                    <Button
                      type="primary"
                      size="large"
                      className="rounded-xl bg-white px-8 py-4 text-base md:text-lg font-bold text-green-600 shadow-xl hover:bg-gray-100 transition-all hover:scale-105">
                      Shop Now <RightOutlined />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border-4 border-white/30">
                  <div className="text-center">
                    <div className="text-8xl mb-4">🥬</div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Farm Fresh Guarantee
                    </h3>
                    <p className="text-white/90">
                      100% fresh produce or money back!
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -right-20 -top-20 w-60 h-60 bg-white/20 rounded-full blur-3xl"></div>
            <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-white/20 rounded-full blur-3xl"></div>
          </div>
        </section>

        {/* New Arrivals - Using React Query */}
        <NewArrivalsSection />
      </main>
      {/* Floating Cart Button */}
      {mounted && cartCount > 0 && (
        <Link href="/cart" className="fixed bottom-20 right-4 z-40">
          <Badge count={cartCount} offset={[-5, 5]}>
            <button className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ED6C30] text-white shadow-lg transition-transform hover:scale-110 active:scale-95">
              <ShoppingCartOutlined className="text-2xl" />
            </button>
          </Badge>
        </Link>
      )}
      {/* Bottom Navigation */}
      <BottomNav />
      <CategoriesModal
        modalOpen={categoryModalStatus}
        setOpen={setCategoryModalStatus}
      />
    </div>
  );
}
