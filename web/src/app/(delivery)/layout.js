"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { ROLES } from "@/lib/roles";
import {
  CarOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button } from "antd";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    key: "deliveries",
    label: "Deliveries",
    href: "/delivery/dashboard",
    match: (p) => p.startsWith("/delivery/dashboard") || p.startsWith("/delivery/orders"),
    icon: <CarOutlined className="text-2xl" />,
  },
  {
    key: "profile",
    label: "Profile",
    href: "/delivery/profile",
    match: (p) => p.startsWith("/delivery/profile"),
    icon: <UserOutlined className="text-2xl" />,
  },
];

/**
 * Delivery Partner Portal Layout
 * Only delivery partners may enter; everyone else is redirected by the guard.
 * Mirrors the customer shell: white header with the logo, bottom navigation
 * on mobile, emerald accents on a gray-50 page.
 */
export default function DeliveryLayout({ children }) {
  const { logout } = useAuth();
  const pathname = usePathname();
  const { user, loading, allowed } = useRoleGuard(ROLES.DELIVERY_PARTNER);

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

  // Redirecting (wrong role / logged out)
  if (!allowed) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-8">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
          <Link href="/delivery/dashboard" className="flex shrink-0 items-center">
            <Image
              src="/images/green-basket-169.png"
              alt="Green Basket"
              width={120}
              height={44}
              priority
            />
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                  item.match(pathname)
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden max-w-40 truncate text-sm font-medium text-gray-800 sm:inline">
              {user.firstName} {user.lastName}
            </span>
            <Button
              icon={<LogoutOutlined />}
              onClick={logout}
              className="rounded-xl">
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-4">{children}</main>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-around px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 px-6 py-2 transition-colors ${
                  active ? "text-emerald-600" : "text-gray-500"
                }`}>
                {item.icon}
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
