'use client';

/**
 * Main Header Component
 * Contains navigation, search, cart, and user menu
 */

import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { useCartStore } from '@/store/cartStore';
import { FireOutlined, ShoppingOutlined, UserOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import HeaderSearch from './HeaderSearch';
import NotificationBell from './NotificationBell';

export default function Header() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
    const { getTotalItems } = useCartStore();
  

    const { user } = useAuth();
  const cartCount = getTotalItems();

    
    // Fetch orders to check if user has any orders
    const { data: ordersData } = useOrders({
      enabled: !!user && user.role === 'customer',
    });
    
    const hasOrders = ordersData?.data?.length > 0;

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
   <header className="sticky top-0 z-30 shadow-md border-b border-gray-200 backdrop-blur-md bg-white/95">
        <div className="mx-auto max-w-7xl">
          {/* Main Header Row - Combined Layout */}
          <div className="px-3 py-2 md:px-6 md:py-3">
            <div className="flex items-center gap-3 md:gap-4 mb-3">
              {/* Logo & Brand */}
              <Link href="/" className="flex items-center gap-2 shrink-0">
                <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-600 to-teal-600 shadow-lg">
                  <span className="text-sm md:text-lg font-bold text-white">AB</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-base md:text-lg font-bold text-gray-900 leading-tight">Apna Bazaar</h1>
                </div>
              </Link>

              {/* Search Bar - Integrated */}
              <HeaderSearch />

              {/* Action Buttons */}
              <div className="flex gap-2 shrink-0">
                {/* Notification Bell */}
                {user && <NotificationBell />}
                
                {user ? (
                  <Link 
                    href="/profile" 
                    className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl bg-emerald-100 hover:bg-emerald-200 transition-all hover:scale-105 border border-emerald-300"
                    title="Profile"
                  >
                    <UserOutlined className="text-base md:text-lg text-emerald-700" />
                  </Link>
                ) : (
                  <Link 
                    href="/login" 
                    className="flex items-center gap-1 px-3 md:px-4 h-9 md:h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 transition-all hover:scale-105 text-white font-semibold text-sm"
                  >
                    <UserOutlined className="text-base" />
                    <span className="hidden md:inline">Login</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Quick Actions Bar - Compact */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {/* Order Status Badge - Only if has orders */}
              {hasOrders && (
                <button
                  onClick={() => router.push('/orders')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-all shrink-0"
                >
                  <ShoppingOutlined className="text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-700">My Orders</span>
                </button>
              )}

              {/* Quick Links */}
              <Link 
                href="/categories" 
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all shrink-0"
              >
                <FireOutlined className="text-orange-500 text-sm" />
                <span className="text-xs font-medium text-gray-700">Categories</span>
              </Link>
              
              <Link 
                href="/products?tag=trending" 
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all shrink-0"
              >
                <span className="text-sm">📈</span>
                <span className="text-xs font-medium text-gray-700">Trending</span>
              </Link>
              
              <Link 
                href="/products?tag=new" 
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all shrink-0"
              >
                <span className="text-sm">✨</span>
                <span className="text-xs font-medium text-gray-700 hidden sm:inline">New Arrivals</span>
                <span className="text-xs font-medium text-gray-700 sm:hidden">New</span>
              </Link>
              
              <Link 
                href="/products?tag=sale" 
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 transition-all shrink-0"
              >
                <span className="text-sm">🔥</span>
                <span className="text-xs font-semibold text-red-600">Sale</span>
              </Link>
            </div>
          </div>
        </div>
      </header>
  );
}
