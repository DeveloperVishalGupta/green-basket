'use client';

import { Layout, Menu, Avatar, Dropdown, Button, Drawer, Badge } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuOutlined,
  BellOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { ROLES } from '@/lib/roles';
import Link from 'next/link';

const { Header, Sider, Content } = Layout;

/**
 * Vendor Portal Layout
 * Responsive layout for all devices with Ant Design + Tailwind CSS
 * - Mobile: Drawer navigation
 * - Tablet/Laptop/Desktop: Collapsible sidebar
 */
export default function VendorLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileDrawerOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Redirect if not vendor
  // Only vendors may be here; others are sent to their own home
  useRoleGuard(ROLES.VENDOR);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Return null if not vendor (will redirect)
  if (!user || user.role !== 'vendor') {
    return null;
  }

  const menuItems = [
    {
      key: '/vendor/dashboard',
      icon: <DashboardOutlined />,
      label: <Link href="/vendor/dashboard">Dashboard</Link>,
    },
    {
      key: '/vendor/products',
      icon: <ShoppingOutlined />,
      label: <Link href="/vendor/products">Products</Link>,
    },
    {
      key: '/vendor/orders',
      icon: <ShoppingCartOutlined />,
      label: <Link href="/vendor/orders">Orders</Link>,
    },
    {
      key: '/vendor/analytics',
      icon: <BarChartOutlined />,
      label: <Link href="/vendor/analytics">Analytics</Link>,
    },
    {
      key: '/vendor/settings',
      icon: <SettingOutlined />,
      label: <Link href="/vendor/settings">Settings</Link>,
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />,
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <SettingOutlined />,
      onClick: () => router.push('/vendor/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: logout,
      danger: true,
    },
  ];

  const SidebarContent = () => (
    <Menu
      mode="inline"
      selectedKeys={[pathname]}
      items={menuItems}
      className="border-r-0"
      style={{ height: '100%', borderRight: 0 }}
    />
  );

  return (
    <Layout className="min-h-screen">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          breakpoint="lg"
          className="!bg-white border-r border-gray-200"
          width={250}
          collapsedWidth={80}
        >
          <div className="h-16 flex items-center justify-center border-b border-gray-200">
            {!collapsed ? (
              <h1 className="text-xl font-bold text-emerald-600">Vendor Portal</h1>
            ) : (
              <ShoppingOutlined className="text-2xl text-emerald-600" />
            )}
          </div>
          <SidebarContent />
        </Sider>
      )}

      {/* Mobile Drawer */}
      <Drawer
        title={<span className="text-emerald-600 font-bold">Vendor Portal</span>}
        placement="left"
        onClose={() => setMobileDrawerOpen(false)}
        open={mobileDrawerOpen}
        width={280}
        className="md:hidden"
        styles={{ body: { padding: 0 } }}
      >
        <SidebarContent />
      </Drawer>

      <Layout>
        {/* Header */}
        <Header className="!bg-white border-b border-gray-200 !px-4 md:!px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setMobileDrawerOpen(true)}
                className="!text-gray-700"
              />
            )}
            {!isMobile && (
              <Button
                type="text"
                icon={collapsed ? <MenuOutlined /> : <MenuOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className="!text-gray-700"
              />
            )}
            <h2 className="text-base md:text-lg font-semibold text-gray-800 m-0 hidden sm:block">
              {pathname.includes('dashboard') && 'Dashboard'}
              {pathname.includes('products') && 'Products'}
              {pathname.includes('orders') && 'Orders'}
              {pathname.includes('analytics') && 'Analytics'}
              {pathname.includes('settings') && 'Settings'}
            </h2>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Badge count={3} className="hidden sm:block">
              <Button
                type="text"
                icon={<BellOutlined className="text-lg" />}
                className="!text-gray-700"
              />
            </Badge>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors">
                <Avatar
                  size={isMobile ? 32 : 40}
                  icon={<UserOutlined />}
                  src={user?.avatar}
                  className="bg-emerald-600"
                />
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-800">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-xs text-gray-500">Vendor</div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Main Content */}
        <Content className="bg-gray-50 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
