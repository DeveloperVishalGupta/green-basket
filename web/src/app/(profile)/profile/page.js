"use client";

import BottomNav from "@/components/layout/BottomNav";
import HelpCenterModal from "@/components/ui/HelpCenterModal";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import {
  ArrowLeftOutlined,
  BellOutlined,
  CrownOutlined,
  CustomerServiceOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  HeartOutlined,
  LogoutOutlined,
  MailOutlined,
  PhoneOutlined,
  RightOutlined,
  SettingOutlined,
  ShopOutlined,
  ShoppingOutlined,
  TrophyOutlined,
  UserOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Badge, Card, message, Modal, Progress, Tag } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Enhanced Profile Page
 * Modern and user-friendly profile interface
 * Accessible by all user roles (customer, admin, vendor)
 */
export default function ProfilePage() {
  const router = useRouter();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const { user, logout, loading } = useAuth();
  const { data: ordersData } = useOrders();
  const [stats, setStats] = useState({
    orders: 0,
    completed: 0,
    points: 0,
  });

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-linear-to-br from-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      // message.success('Logged out successfully');
    } catch (error) {
      message.error("Logout failed", error.message);
    }
  };

  // Role-based menu items
  const getAccountOptions = () => {
    const common = [
      {
        icon: <ShoppingOutlined className="text-xl" />,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        label: "My Orders",
        description: "View and track orders",
        onClick: () => router.push("/orders"),
      },
      {
        icon: <EnvironmentOutlined className="text-xl" />,
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
        label: "Addresses",
        description: "Manage delivery addresses",
        onClick: () => router.push("/addresses"),
      },
      {
        icon: <HeartOutlined className="text-xl" />,
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        label: "Wishlist",
        description: "Your saved items",
        onClick: () => router.push("/wishlist"),
        badge: user.wishlist?.length || 0,
      },
      {
        icon: <WalletOutlined className="text-xl" />,
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600",
        label: "Wallet & Rewards",
        description: `₹${user.wallet || 0} balance`,
        onClick: () => message.info("Wallet coming soon!"),
      },
    ];

    if (user.role === "admin") {
      return [
        {
          icon: <CrownOutlined className="text-xl" />,
          iconBg: "bg-red-100",
          iconColor: "text-red-600",
          label: "Admin Dashboard",
          description: "Manage your store",
          onClick: () => router.push("/admin/dashboard"),
        },
        ...common,
      ];
    }

    if (user.role === "vendor") {
      return [
        {
          icon: <ShopOutlined className="text-xl" />,
          iconBg: "bg-indigo-100",
          iconColor: "text-indigo-600",
          label: "Vendor Dashboard",
          description: "Manage products",
          onClick: () => router.push("/vendor/dashboard"),
        },
        ...common,
      ];
    }

    return common;
  };

  const getSettingsOptions = () => [
    {
      icon: <BellOutlined className="text-xl" />,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      label: "Notifications",
      description: "Manage alerts",
      onClick: () => router.push("/notifications"),
    },
    {
      icon: <CustomerServiceOutlined className="text-xl" />,
      iconBg: "bg-pink-100",
      iconColor: "text-pink-600",
      label: "Help & Support",
      description: "Get assistance",
      onClick: () => setHelpModalVisible(true),
    },
    {
      icon: <FileTextOutlined className="text-xl" />,
      iconBg: "bg-gray-100",
      iconColor: "text-gray-600",
      label: "Terms & Policies",
      description: "Legal information",
      onClick: () => router.push("/terms-and-policies"),
    },
  ];

  const accountOptions = getAccountOptions();
  const settingsOptions = getSettingsOptions();

  const completionRate =
    stats.orders > 0 ? (stats.completed / stats.orders) * 100 : 0;

  useEffect(() => {
    // Calculate stats from orders data
    if (ordersData?.data) {
      const orders = ordersData.data;
      const completedOrders = orders.filter(
        (order) => order.status === "delivered" || order.status === "completed",
      ).length;

      // Calculate points: 10 points per completed order + 1 point per ₹100 spent
      const totalSpent = orders.reduce(
        (sum, order) => sum + (order.totalAmount || 0),
        0,
      );
      const calculatedPoints =
        completedOrders * 10 + Math.floor(totalSpent / 100);

      setStats({
        orders: orders.length,
        completed: completedOrders,
        points: calculatedPoints,
      });
    }
  }, [ordersData]);

  return (
    <div className="min-h-screen bg-white/95 pb-20 md:pb-4 lg:pl-0">
      {/* Enhanced Header with Gradient */}
      <header className="relative bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-600 px-4 sm:px-6 py-6 sm:py-8 md:py-10 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-4xl">
          <div className="flex gap-6 items-start">
            {/* Back button */}
            <button
              onClick={() => router.back()}
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm sm:mb-6 transition-all hover:scale-105 md:hidden">
              <ArrowLeftOutlined className="text-base sm:text-xl" />
            </button>
            <div className="flex flex-col gap-1">
              <div className="flex sm:flex-row items-center sm:items-center gap-2 ">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                  {user.firstName} {user.lastName}
                </h1>
                <Tag
                  color={
                    user.role === "admin"
                      ? "red"
                      : user.role === "vendor"
                        ? "blue"
                        : "green"
                  }
                  icon={
                    user.role === "admin" ? (
                      <CrownOutlined />
                    ) : user.role === "vendor" ? (
                      <ShopOutlined />
                    ) : (
                      <UserOutlined />
                    )
                  }
                  className="text-xs uppercase font-semibold px-3 py-1">
                  {user.role}
                </Tag>
              </div>
              <p className="text-sm font-semibold">
                <MailOutlined /> {user.email}
              </p>
              {user.phone && (
                <p className="font-semibold text-sm">
                  <PhoneOutlined /> {user.phone}
                </p>
              )}
            </div>
          </div>

          {/* User Profile Section */}
          <div className="text-start"></div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6">
            <div className=" text-center sm:text-left">
              <div className="space-y-2 text-white/90"></div>

              {/* Loyalty Badge */}
              {/* {user.role === "customer" && (
                <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <StarOutlined className="text-yellow-300" />
                  <span className="text-sm font-semibold">
                    {stats.points} Reward Points
                  </span>
                </div>
              )} */}
            </div>

            {/* <div className="relative flex-1">
                            <Avatar 
                                size={{ xs: 160, sm: 96, md: 1120 }} 
                                icon={<UserOutlined />} 
                                className="bg-white/20 backdrop-blur-md border-4 border-white/30 shadow-2xl" 
                            />
                            <button 
                                className="absolute bottom-0 right-0 h-8 w-8 sm:h-10 sm:w-10 bg-white/25 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                onClick={() => message.info('Edit profile picture coming soon!')}
                            >
                                <EditOutlined className="text-emerald-600 text-sm sm:text-base" />
                            </button>
                        </div> */}
          </div>

          {/* Quick Stats for Customers */}
          {user.role === "customer" && (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 text-center border border-white/20">
                <div className="text-2xl sm:text-3xl font-bold mb-1">
                  {stats.orders}
                </div>
                <div className="text-xs sm:text-sm opacity-90">
                  Total Orders
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 text-center border border-white/20">
                <div className="text-2xl sm:text-3xl font-bold mb-1">
                  {user.wishlist?.length || 0}
                </div>
                <div className="text-xs sm:text-sm opacity-90">Wishlist</div>
              </div>
              {/* <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 text-center border border-white/20">
                <div className="text-2xl sm:text-3xl font-bold mb-1">
                  ₹{user.wallet || 0}
                </div>
                <div className="text-xs sm:text-sm opacity-90">Wallet</div>
              </div> */}
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Achievement Card for Customers */}
        {user.role === "customer" && completionRate > 0 && (
          <Card className="shadow-md hover:shadow-lg transition-shadow border-0">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-linear-to-br from-yellow-400 to-orange-500 shrink-0">
                <TrophyOutlined className="text-white text-xl sm:text-2xl" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1">
                  Order Achievement
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  You've completed {stats.completed} out of {stats.orders}{" "}
                  orders!
                </p>
                <Progress
                  percent={Math.round(completionRate)}
                  strokeColor={{
                    "0%": "#10b981",
                    "100%": "#059669",
                  }}
                  size="small"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Account Section */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <UserOutlined className="text-emerald-600" />
            Account
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {accountOptions.map((item, index) => (
              <Card
                key={index}
                hoverable
                className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer"
                onClick={item.onClick}>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl ${item.iconBg} ${item.iconColor} shrink-0`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                        {item.label}
                      </p>
                      {item.badge > 0 && (
                        <Badge count={item.badge} className="shrink-0" />
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                      {item.description}
                    </p>
                  </div>
                  <RightOutlined className="text-gray-400 text-xs shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Settings Section */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <SettingOutlined className="text-emerald-600" />
            Settings & More
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {settingsOptions.map((item, index) => (
              <Card
                key={index}
                hoverable
                className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer"
                onClick={item.onClick}>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl ${item.iconBg} ${item.iconColor} shrink-0`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                      {item.label}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                      {item.description}
                    </p>
                  </div>
                  <RightOutlined className="text-gray-400 text-xs shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <Card className="border-2 border-red-100 shadow-sm hover:shadow-md transition-all">
          <button
            onClick={() => setLogoutModalVisible(true)}
            className="w-full flex items-center justify-center gap-3 py-2 text-red-600 font-semibold text-base sm:text-lg hover:text-red-700 transition-colors">
            <LogoutOutlined className="text-xl" />
            Logout from Account
          </button>
        </Card>
      </main>

      {/* Logout Confirmation Modal */}
      <Modal
        title="Confirm Logout"
        open={logoutModalVisible}
        onOk={handleLogout}
        onCancel={() => setLogoutModalVisible(false)}
        okText="Logout"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
        centered
        width={
          window.innerWidth < 640 ? "90%" : window.innerWidth < 768 ? 400 : 480
        }>
        <p className="text-sm sm:text-base">Are you sure you want to logout?</p>
      </Modal>

      {/* Help Center Modal */}
      <HelpCenterModal
        open={helpModalVisible}
        onClose={() => setHelpModalVisible(false)}
      />

      <BottomNav />
    </div>
  );
}
