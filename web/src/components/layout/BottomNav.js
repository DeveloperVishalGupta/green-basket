'use client';

import { useAuth } from '@/hooks/useAuth';
import { useCartStore } from '@/store/cartStore';
import {
  CloseOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  MenuOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Badge, Drawer } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  const [activeNav, setActiveNav] = useState('home');
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { getTotalItems } = useCartStore();
  const { user, loading } = useAuth();
  const cartCount = getTotalItems();

  // Prevent hydration mismatch by only showing cart count after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update active state based on current path
  useEffect(() => {
    if (pathname === '/' || pathname.startsWith('/(shop)')) {
      setActiveNav('home');
    } else if (pathname.startsWith('/categories') || pathname.startsWith('/products')) {
      setActiveNav('shop');
    } else if (pathname.startsWith('/orders')) {
      setActiveNav('track');
    } else if (pathname.startsWith('/cart')) {
      setActiveNav('cart');
    } else if (pathname.startsWith('/profile')) {
      setActiveNav('profile');
    }
  }, [pathname]);

  // Hide bottom nav for admin and vendor (after all hooks)
  if (loading || !user || user.role === 'admin' || user.role === 'vendor') {
    return null;
  }

  const navItems = [
    {
      key: 'home',
      label: 'Home',
      icon: <HomeOutlined className="text-2xl" />,
      path: '/',
    },
    {
      key: 'shop',
      label: 'Shop',
      icon: <ShopOutlined className="text-2xl" />,
      path: '/categories',
    },
    {
      key: 'track',
      label: 'Track',
      icon: <EnvironmentOutlined className="text-2xl" />,
      path: '/orders',
    },
    {
      key: 'cart',
      label: 'Cart',
      icon: (
        mounted && cartCount > 0 ? (
          <Badge count={cartCount} offset={[0, -4]} size="small">
            <ShoppingCartOutlined className="text-2xl" />
          </Badge>
        ) : (
          <ShoppingCartOutlined className="text-2xl" />
        )
      ),
      path: '/cart',
    },
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined className="text-2xl" />,
      path: '/profile',
    },
  ];

  const handleNavClick = (item) => {
    setActiveNav(item.key);
    setDrawerOpen(false); // Close drawer on navigation
    router.push(item.path);
  };

  return (
    <>
      {/* Mobile/Tablet Bottom Navigation (< 1024px) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white safe-area-bottom lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-around px-2 py-2">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => handleNavClick(item)}
              className={`flex flex-col items-center gap-1 px-3 sm:px-4 py-2 transition-colors ${
                activeNav === item.key ? 'text-[#ED6C30]' : 'text-gray-500'
              }`}
            >
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Desktop Drawer Toggle Button (>= 1024px) */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="hidden lg:flex fixed left-4 top-4 z-40 items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-200 shadow-md hover:bg-gray-50 transition-all"
        title="Open Menu"
      >
        <MenuOutlined className="text-lg text-gray-700" />
      </button>

      {/* Desktop Side Navigation Drawer (>= 1024px) */}
      <Drawer
        placement="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        closable={false}
        size={280}
        className="hidden lg:block"
        styles={{
          body: { padding: 0 },
        }}
      >
        <div className="flex flex-col h-full bg-linear-to-b from-gray-50 to-white">
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#ED6C30] flex items-center justify-center text-white font-bold text-lg">
                IF
              </div>
              <span className="text-xl font-bold text-gray-800">Apna Bazaar</span>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <CloseOutlined className="text-gray-600" />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  activeNav === item.key
                    ? 'bg-[#ED6C30] text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-base font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          {/* User Info Footer */}
          {user && (
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#ED6C30] flex items-center justify-center text-white font-semibold text-lg">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Drawer>
    </>
  );
}
