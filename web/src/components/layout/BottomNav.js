"use client";

import { useAuth } from "@/hooks/useAuth";
import { isPortalRole } from "@/lib/roles";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";
import {
  AppstoreOutlined,
  CloseOutlined,
  FileTextOutlined,
  HomeOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Badge, Drawer } from "antd";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Bottom Navigation Component
 * Fixed navigation bar for customer users
 * - Mobile/Tablet: Bottom navigation bar
 * - Desktop: Drawer-based side navigation (collapsible)
 * - Hidden for admin and vendor users
 */
export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeNav, setActiveNav] = useState("home");
  const [mounted, setMounted] = useState(false);
  const { drawerOpen, closeDrawer } = useUIStore();
  // Number of distinct products in the cart, not the summed quantity — the
  // badge should only grow when a new item is added, not when an existing
  // item's quantity is bumped up.
  const { items } = useCartStore();
  const { user, loading } = useAuth();
  const cartCount = items.length;

  // Prevent hydration mismatch by only showing cart count after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update active state based on current path
  useEffect(() => {
    if (pathname === "/" || pathname.startsWith("/(shop)")) {
      setActiveNav("home");
    } else if (pathname.startsWith("/categories")) {
      setActiveNav("categories");
    } else if (pathname.startsWith("/products")) {
      setActiveNav("shop");
    } else if (pathname.startsWith("/orders")) {
      setActiveNav("track");
    } else if (pathname.startsWith("/cart")) {
      setActiveNav("cart");
    } else if (pathname.startsWith("/profile")) {
      setActiveNav("profile");
    }
  }, [pathname]);

  // Hide bottom nav for admin and vendor (after all hooks)
  if (loading || !user || isPortalRole(user.role)) {
    return null;
  }

  const navItems = [
    {
      key: "home",
      label: "Home",
      icon: <HomeOutlined className="text-2xl" />,
      path: "/",
    },
    {
      key: "categories",
      label: "Categories",
      icon: <AppstoreOutlined className="text-2xl" />,
      path: "/categories",
    },

    {
      key: "shop",
      label: "Shop",
      icon: <ShopOutlined className="text-2xl" />,
      path: "/products",
    },
    {
      key: "track",
      label: "Orders",
      icon: <FileTextOutlined className="text-2xl" />,
      path: "/orders",
    },
    {
      key: "cart",
      label: "Cart",
      icon:
        mounted && cartCount > 0 ? (
          <Badge count={cartCount} offset={[0, -4]} size="small">
            <ShoppingCartOutlined className="text-2xl" />
          </Badge>
        ) : (
          <ShoppingCartOutlined className="text-2xl" />
        ),
      path: "/cart",
    },
    {
      key: "profile",
      label: "Profile",
      icon: <UserOutlined className="text-2xl" />,
      path: "/profile",
    },
  ];

  const handleNavClick = (item) => {
    setActiveNav(item.key);
    closeDrawer(); // Close drawer on navigation
    router.push(item.path);
  };

  return (
    <>
      {/* Mobile/Tablet Bottom Navigation (< 1024px) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white safe-area-bottom lg:hidden dark:bg-surface dark:border-border-default">
        <div className="mx-auto flex max-w-7xl items-center justify-around px-2 py-2">
          {navItems
            .filter((item) => item.key !== "profile")
            .map((item) => (
            <button
              key={item.key}
              onClick={() => handleNavClick(item)}
              aria-current={activeNav === item.key ? "page" : undefined}
              className={`flex flex-col items-center gap-1 px-3 sm:px-4 py-2 transition-colors ${
                activeNav === item.key
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-gray-500 dark:text-text-muted"
              }`}>
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Desktop Side Navigation Drawer (>= 1024px) */}
      <Drawer
        placement="left"
        open={drawerOpen}
        onClose={closeDrawer}
        closable={false}
        size={280}
        className="hidden lg:block"
        styles={{
          body: { padding: 0 },
        }}>
        <div className="flex flex-col h-full bg-linear-to-b from-gray-50 to-white dark:from-surface-muted dark:to-surface">
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 border-b border-gray-200 dark:border-border-default">
            <Link
              href="/"
              className="mx-auto mb-0 flex items-center justify-center rounded-2xl">
              <Image
                src="/images/green-basket-169.png"
                alt="green basket"
                width={160}
                height={60}
              />
            </Link>
            <button
              onClick={closeDrawer}
              aria-label="Close navigation menu"
              className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors dark:hover:bg-surface-hover">
              <CloseOutlined className="text-gray-600 dark:text-text-secondary" />
            </button>
          </div>

          {/* Navigation Items */}

          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="space-y-2">
              {navItems.map((item) => {
                const active = activeNav === item.key;

                return (
                  <button
                    key={item.key}
                    onClick={() => handleNavClick(item)}
                    className={`group relative w-full flex items-center gap-4 rounded-2xl px-4 py-3 transition-all duration-300 ${
                      active
                        ? "text-gray-700 bg-green-50 shadow-md scale-[1.02] dark:text-text-primary dark:bg-emerald-950"
                        : "text-gray-700 hover:bg-green-50 hover:shadow-md hover:scale-[1.02] dark:text-text-secondary dark:hover:bg-emerald-950"
                    }`}>
                    {/* Active Indicator */}
                    {active && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-green-500" />
                    )}

                    {/* Icon */}
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all ${
                        active
                          ? "bg-green-100 text-green-600 dark:bg-emerald-900 dark:text-emerald-300"
                          : "bg-green-100 text-green-600 group-hover:bg-green-500 group-hover:text-white dark:bg-emerald-900 dark:text-emerald-300 dark:group-hover:bg-emerald-600"
                      }`}>
                      <span className="text-xl">{item.icon}</span>
                    </div>

                    {/* Label */}
                    <span className="flex-1 text-left text-[15px] font-semibold">
                      {item.label}
                    </span>

                    {/* Arrow */}
                    <svg
                      className={`h-4 w-4 transition-all ${
                        active
                          ? "translate-x-0 opacity-100"
                          : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Info Footer */}
          {user && (
            <>
              <div className="p-6 border-t border-gray-200 bg-gray-50 dark:border-border-default dark:bg-surface-muted">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold text-lg">
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate dark:text-text-primary">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-500 truncate dark:text-text-muted">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </Drawer>
    </>
  );
}
