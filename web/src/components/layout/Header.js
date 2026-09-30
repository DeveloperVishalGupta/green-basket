"use client";

/**
 * Main Header Component
 * Contains navigation, search, cart, and user menu
 */

import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import { formatDeliveryLabel } from "@/lib/delivery";
import { useDeliveryStore } from "@/store/deliveryStore";
import { useUIStore } from "@/store/uiStore";
import {
  ClockCircleOutlined,
  MenuOutlined,
  ShoppingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HeaderSearch from "./HeaderSearch";
import NotificationBell from "./NotificationBell";

export default function Header() {
  const router = useRouter();

  const { user } = useAuth();
  const {
    date: deliveryDate,
    setDate,
    setPromptedForUserId,
  } = useDeliveryStore();
  const { openDrawer } = useUIStore();

  // Fetch orders to check if user has any orders
  const { data: ordersData } = useOrders({
    enabled: !!user && user.role === "customer",
  });

  const hasOrders = ordersData?.data?.length > 0;

  return (
    <header className="sticky top-0 z-30 shadow-md border-b border-gray-200 backdrop-blur-md bg-white/95 dark:bg-surface/95 dark:border-border-default">
      <div className="mx-auto max-w-7xl">
        {/* Main Header Row - Combined Layout */}
        <div className="h-app-header px-3 md:px-6">
          <div className="flex h-full items-center gap-3 md:gap-4">
            {/* Desktop Menu Toggle (>= 1024px) */}
            {user?.role === "customer" && (
              <button
                onClick={openDrawer}
                className="hidden lg:flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-all hover:scale-105 shrink-0 dark:bg-emerald-950 dark:border-emerald-800 dark:hover:bg-emerald-900"
                title="Open Menu"
                aria-label="Open navigation menu">
                <MenuOutlined className="text-base md:text-lg text-emerald-700 dark:text-emerald-300" />
              </button>
            )}

            {/* Logo & Brand */}
            <Link
              href="/"
              className="flex items-center justify-center rounded-2xl shrink-0">
              <Image
                src="/images/green-basket-43.png"
                alt="green basket"
                width={120}
                height={120}
                className="h-14 w-auto md:h-12"
              />
            </Link>

            {/* Search Bar - Integrated */}
            <HeaderSearch />

            {/* Delivery date badge - only for logged-in customers who've picked a date */}
            {user?.role === "customer" && deliveryDate && (
              <button
                onClick={() => {
                  setDate(null);
                  setPromptedForUserId(null);
                }}
                title="Change delivery date"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-all shrink-0 dark:bg-emerald-950 dark:border-emerald-800 dark:hover:bg-emerald-900">
                <ClockCircleOutlined className="text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  Delivering {formatDeliveryLabel(deliveryDate)}
                </span>
                <span className="text-xs text-emerald-600 underline dark:text-emerald-400">
                  Change
                </span>
              </button>
            )}

            {/* Order Status Badge - Only if has orders */}
            {hasOrders && (
              <button
                onClick={() => router.push("/orders")}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-all shrink-0 dark:bg-emerald-950 dark:border-emerald-800 dark:hover:bg-emerald-900">
                <ShoppingOutlined className="text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  My Orders
                </span>
              </button>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 shrink-0 ml-auto">
              {/* <ThemeToggle /> */}

              {/* Notification Bell */}
              {user && <NotificationBell />}

              {user ? (
                <Link
                  href="/profile"
                  className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl bg-emerald-100 hover:bg-emerald-200 transition-all hover:scale-105 border border-emerald-300 dark:bg-emerald-900 dark:hover:bg-emerald-800 dark:border-emerald-700"
                  title="Profile">
                  <UserOutlined className="text-base md:text-lg text-emerald-700 dark:text-emerald-300" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1 px-3 md:px-4 h-9 md:h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 transition-all hover:scale-105 text-white font-semibold text-sm">
                  <UserOutlined className="text-base" />
                  <span className="inline">Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
