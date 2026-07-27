"use client";

import BestSellersSection from "@/components/home/BestSellersSection";
import CategoriesModal from "@/components/home/CategoriesModal";
import CategoriesSection from "@/components/home/CategoriesSection";
import TopPicksSection from "@/components/home/TopPicksSection";
import TrendingSection from "@/components/home/TrendingSection";
import BottomNav from "@/components/layout/BottomNav";
import Header from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import { useCartStore } from "@/store/cartStore";
import {
  CheckCircleFilled,
  RightOutlined,
  ShoppingCartOutlined,
  StarFilled,
} from "@ant-design/icons";
import { Badge, Button } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { getTotalItems } = useCartStore();
  const cartCount = getTotalItems();

  const [mounted, setMounted] = useState(false);
  const [deliveryTime] = useState("7-10 days");

  const [categoryModalStatus, setCategoryModalStatus] = useState(false);

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
      {/* <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-100 py-12 sm:py-16 lg:py-20"> */}
      <section className=" md:block md:h-[calc(100vh-7rem)] relative overflow-hidden bg-linear-to-br from-green-50 via-white to-emerald-100">
        {/* Decorative Background */}
        <div className="absolute -top-20 -left-20 h-48 w-48 sm:h-72 sm:w-72 rounded-full bg-green-200/40 blur-3xl" />

        <div className="absolute top-1/2 -right-20 h-52 w-52 sm:h-80 sm:w-80 rounded-full bg-emerald-200/40 blur-3xl" />

        <div className="absolute bottom-0 left-1/3 h-40 w-40 sm:h-56 sm:w-56 rounded-full bg-lime-200/30 blur-3xl" />
        <div className="relative md:h-full  items-center  mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:h-full grid-cols-1 mb-7 lg:grid-cols-2 items-center md:gap-10 lg:gap-16">
            {/* LEFT CONTENT */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <div className="hidden mt-7 md:inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-xs sm:text-sm font-semibold text-green-700 shadow-sm">
                🌱 Farm Fresh Everyday
              </div>

              <h1 className=" mt-7 md:mt-5 text-4xl sm:text-5xl md:text-5xl font-black leading-tight text-gray-900">
                Fresh
                <span className="block text-green-600">Vegetables &</span>
                Fruits Delivered
              </h1>

              <p className="mt-6 mx-auto lg:mx-0 max-w-xl text-base  leading-7 sm:leading-8 text-gray-600">
                Fresh vegetables, fruits, and groceries sourced from trusted
                local sellers and delivered to your doorstep at your preferred
                time.
              </p>

              {/* Features */}

              <div className="mb-8 mt-8 md:mt-0 md:mb-4 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircleFilled className="text-green-600" />
                  <span>100% Fresh</span>
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircleFilled className="text-green-600" />
                  <span>Scheduled Delivery</span>
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircleFilled className="text-green-600" />
                  <span>Best Prices</span>
                </div>
              </div>

              {/* Buttons */}

              <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/products" className="w-full sm:w-auto">
                  <Button
                    type="primary"
                    size="large"
                    className="w-full sm:w-auto h-14 rounded-xl bg-green-600 px-8 text-base font-semibold shadow-lg">
                    Shop Now
                    <RightOutlined />
                  </Button>
                </Link>

                <Button
                  size="large"
                  onClick={() => setCategoryModalStatus(true)}
                  className="w-full sm:w-auto h-14 rounded-xl border-2 border-green-600 px-8 font-semibold text-green-700">
                  Browse Categories
                </Button>
              </div>

              {/* Stats */}

              <div className="hidden md:block mt-12 md:grid grid-cols-3 gap-4 sm:gap-8">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    100+
                  </h3>

                  <p className="text-sm text-gray-500">Products</p>
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Fresh
                  </h3>

                  <p className="text-sm text-gray-500">Daily</p>
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    4.9
                  </h3>

                  <div className="flex justify-center lg:justify-start items-center gap-1 text-sm">
                    <StarFilled className="text-yellow-400" />

                    <span className="text-gray-500">Rating</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT CONTENT */}

            <div className="relative order-1 lg:order-2">
              <div className="absolute inset-0 rounded-[40px] bg-gradient-to-br from-green-300/20 to-emerald-400/20 blur-3xl" />

              <div className="relative hidden md:block overflow-hidden rounded-[32px] border border-white bg-white/70 shadow-2xl backdrop-blur-xl">
                <Image
                  src="/images/hero-vegetables.png"
                  alt="Fresh Vegetables"
                  width={700}
                  height={700}
                  priority
                  className="w-full h-auto object-contain"
                />
              </div>
              {/* <div className="relative block  md:hidden overflow-hidden rounded-[32px] border border-white  shadow-2xl backdrop-blur-xl">
                <Image
                  src="/images/hero-transparent.png"
                  alt="Fresh Vegetables"
                  width={700}
                  height={700}
                  priority
                  className="w-full h-auto object-contain"
                />
              </div> */}
              <div className=" mt-6  md:hidden  border border-white   backdrop-blur-xl">
                <Image
                  src="/images/hero-transparent.png"
                  alt="Fresh Vegetables"
                  width={700}
                  height={700}
                  priority
                  className="w-full h-auto object-contain"
                />
              </div>
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
          <div className="relative overflow-hidden rounded-3xl border border-green-100 bg-linear-to-r from-green-50 via-emerald-50 to-lime-50 shadow-sm">
            {/* Decorative circles */}
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-green-200/20" />
            <div className="absolute -left-8 -bottom-8 h-28 w-28 rounded-full bg-lime-200/20" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div>
                  <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    🌿 Fresh Every Day
                  </span>

                  <h3 className="mt-3 text-2xl md:text-3xl font-bold text-gray-900">
                    Fresh Fruits & Vegetables
                  </h3>

                  <p className="mt-2 max-w-lg text-sm md:text-base text-gray-600">
                    Freshly sourced produce delivered at your preferred time
                    slot.
                  </p>
                </div>
              </div>

              <button className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700">
                Shop Now
              </button>
            </div>
          </div>
        </section>

        {/* Top Picks Products - Using React Query */}
        <TopPicksSection />

        {/* Quality & Service Badges */}

        <section className="px-3 py-8 md:px-6 md:py-12 bg-white">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">
            Shopping Made Simple
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div className="text-center border rounded-2xl hover:shadow-md transition">
              <div className="rounded-3xl  p-5 bg-linear-to-r from-emerald-50 via-white to-lime-50 border border-emerald-100 md:p-8">
                <div className="text-5xl mb-3">🛒</div>
                <h3 className="font-semibold mb-2">Browse</h3>
                <p className="text-sm text-gray-500">
                  Explore fresh groceries and daily essentials.
                </p>
              </div>
            </div>

            <div className="text-center border rounded-2xl hover:shadow-md transition">
              <div className="rounded-3xl bg-linear-to-r from-emerald-50 via-white to-lime-50 border border-emerald-100 p-5 md:p-8">
                <div className="text-5xl mb-3">➕</div>
                <h3 className="font-semibold mb-2">Add to Cart</h3>
                <p className="text-sm text-gray-500">
                  Pick the products you need in seconds.
                </p>
              </div>
            </div>

            <div className="text-center border rounded-2xl hover:shadow-md transition">
              <div className="rounded-3xl bg-linear-to-r from-emerald-50 via-white to-lime-50 border border-emerald-100 p-5 md:p-8">
                <div className="text-5xl mb-3">🕒</div>
                <h3 className="font-semibold mb-2">Choose Slot</h3>
                <p className="text-sm text-gray-500">
                  Select a delivery time that works for you.
                </p>
              </div>
            </div>

            <div className="text-center border rounded-2xl hover:shadow-md transition">
              <div className="rounded-3xl bg-linear-to-r from-emerald-50 via-white to-lime-50 border border-emerald-100 p-5 md:p-8">
                <div className="text-5xl mb-3">🏠</div>
                <h3 className="font-semibold mb-2">Get Delivered</h3>
                <p className="text-sm text-gray-500">
                  Receive fresh groceries at your doorstep.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trending Products - Using React Query */}
        <TrendingSection />

        {/* Mega Savings Banner */}

        <section className="px-3 py-6 md:px-6 md:py-8">
          <button className="group relative w-full overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-lime-50 px-6 py-6 md:px-8 md:py-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            {/* Decorative background */}
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-100/50 blur-2xl" />
            <div className="absolute -left-8 -bottom-8 h-24 w-24 rounded-full bg-lime-100/50 blur-2xl" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-3xl">
                  🛒
                </div>

                <div className="text-left">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                    Explore Our Store
                  </h3>

                  <p className="mt-1 text-sm md:text-base text-gray-600">
                    Fresh groceries, daily essentials & exclusive offers.
                  </p>

                  <div className="mt-3 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    🌿 Fresh Picks • 💰 Up to 25% OFF
                  </div>
                </div>
              </div>

              <div className="hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm transition group-hover:translate-x-1">
                <svg
                  className="h-6 w-6 text-emerald-600"
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
              </div>
            </div>
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
          <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-lime-50 shadow-sm">
            {/* Decorative Shapes */}
            <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-emerald-100/40 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-lime-100/40 blur-3xl" />

            <div className="relative grid items-center gap-8 p-6 md:grid-cols-2 md:p-10">
              {/* Left Content */}
              <div>
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-700">
                  🚚 Free Delivery Available
                </span>

                <h2 className="mt-5 text-3xl font-bold leading-tight text-gray-900 md:text-5xl">
                  Free Delivery
                  <br />
                  <span className="text-emerald-600">on Orders Above ₹149</span>
                </h2>

                <p className="mt-4 max-w-lg text-base leading-7 text-gray-600">
                  Shop fresh fruits, vegetables and daily essentials with the
                  convenience of choosing your preferred delivery slot.
                </p>

                {/* Features */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-gray-700">
                    🥬 Fresh Produce
                  </span>

                  <span className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-gray-700">
                    🕒 Flexible Delivery Slots
                  </span>

                  <span className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-gray-700">
                    💳 Secure Checkout
                  </span>
                </div>

                <Link href="/products">
                  <Button
                    type="primary"
                    size="large"
                    className="mt-8 rounded-xl bg-emerald-600 px-8 py-6 font-semibold shadow-sm hover:bg-emerald-700">
                    Shop Now <RightOutlined />
                  </Button>
                </Link>
              </div>

              {/* Right Illustration */}
              <div className="hidden md:flex justify-center">
                <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-md">
                  <div className="text-center">
                    <div className="text-7xl">🛒</div>

                    <h3 className="mt-4 text-2xl font-bold text-gray-900">
                      Fresh Groceries
                    </h3>

                    <p className="mt-2 text-gray-600">
                      Quality products delivered with care, right to your
                      doorstep.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* New Arrivals - Using React Query */}
        {/* <NewArrivalsSection /> */}
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
