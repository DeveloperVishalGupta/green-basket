"use client";

import BottomNav from "@/components/layout/BottomNav";
import Header from "@/components/layout/Header";
import PageHeader from "@/components/layout/PageHeader";
import HelpCenterModal from "@/components/ui/HelpCenterModal";
import { useAuth } from "@/hooks/useAuth";
import { useMyCoupons } from "@/hooks/useCoupons";
import { useOrders } from "@/hooks/useOrders";
import {
  BellOutlined,
  CopyOutlined,
  CrownOutlined,
  CustomerServiceOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  GiftOutlined,
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
import { Badge, message, Modal, Progress, Spin, Tag } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Profile Page
 * Accessible by all user roles (customer, admin, vendor)
 */
export default function ProfilePage() {
  const router = useRouter();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const { user, logout, loading } = useAuth();
  const { data: ordersData } = useOrders();
  const { data: couponsData } = useMyCoupons({ enabled: user?.role === "customer" });
  const coupons = couponsData?.data || [];
  const availableCoupons = coupons.filter((c) => !c.isUsed);
  const [stats, setStats] = useState({
    orders: 0,
    completed: 0,
    points: 0,
  });

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

  if (loading || !user) {
    return (
      <>
        <Header />
        <div className="flex min-h-below-header items-center justify-center bg-white/95">
          <div className="text-center">
            <Spin size="large" />
            <p className="mt-4 text-gray-600 font-medium">
              Loading your profile...
            </p>
          </div>
        </div>
      </>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      message.error("Logout failed", error.message);
    }
  };

  // Role-based menu items
  const getAccountOptions = () => {
    const common = [
      {
        icon: <ShoppingOutlined className="text-lg" />,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        label: "My Orders",
        description: "View and track orders",
        onClick: () => router.push("/orders"),
      },
      {
        icon: <EnvironmentOutlined className="text-lg" />,
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
        label: "Addresses",
        description: "Manage delivery addresses",
        onClick: () => router.push("/addresses"),
      },
      {
        icon: <HeartOutlined className="text-lg" />,
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        label: "Wishlist",
        description: "Your saved items",
        onClick: () => router.push("/wishlist"),
        badge: user.wishlist?.length || 0,
      },
      {
        icon: <WalletOutlined className="text-lg" />,
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
          icon: <CrownOutlined className="text-lg" />,
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
          icon: <ShopOutlined className="text-lg" />,
          iconBg: "bg-indigo-100",
          iconColor: "text-indigo-600",
          label: "Vendor Dashboard",
          description: "Manage products",
          onClick: () => router.push("/vendor/dashboard"),
        },
        ...common,
      ];
    }

    if (user.role === "delivery_partner") {
      return [
        {
          icon: <ShopOutlined className="text-lg" />,
          iconBg: "bg-purple-100",
          iconColor: "text-purple-600",
          label: "Delivery Dashboard",
          description: "View your deliveries",
          onClick: () => router.push("/delivery/dashboard"),
        },
        ...common,
      ];
    }

    return common;
  };

  const getSettingsOptions = () => [
    {
      icon: <BellOutlined className="text-lg" />,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      label: "Notifications",
      description: "Manage alerts",
      onClick: () => router.push("/notifications"),
    },
    {
      icon: <CustomerServiceOutlined className="text-lg" />,
      iconBg: "bg-pink-100",
      iconColor: "text-pink-600",
      label: "Help & Support",
      description: "Get assistance",
      onClick: () => setHelpModalVisible(true),
    },
    {
      icon: <FileTextOutlined className="text-lg" />,
      iconBg: "bg-gray-100",
      iconColor: "text-gray-600",
      label: "Terms & Policies",
      description: "Legal information",
      onClick: () => router.push("/terms-and-policies"),
    },
  ];

  const accountOptions = getAccountOptions();
  const settingsOptions = getSettingsOptions();

  // Every 10 delivered orders unlocks a loyalty coupon (see
  // services/loyaltyService.js on the backend) — this tracks progress
  // toward that next milestone, not overall completion rate.
  const REWARD_MILESTONE = 10;
  const milestoneProgress = stats.completed % REWARD_MILESTONE;
  const ordersUntilNextReward =
    stats.completed > 0 && milestoneProgress === 0
      ? REWARD_MILESTONE
      : REWARD_MILESTONE - milestoneProgress;
  const milestonePercent = (milestoneProgress / REWARD_MILESTONE) * 100;

  const handleCopyCoupon = (code) => {
    navigator.clipboard
      .writeText(code)
      .then(() => message.success(`Copied "${code}" to clipboard`))
      .catch(() => message.error("Couldn't copy the code"));
  };

  const roleTagProps =
    user.role === "admin"
      ? { color: "red", icon: <CrownOutlined /> }
      : user.role === "vendor"
        ? { color: "blue", icon: <ShopOutlined /> }
        : user.role === "delivery_partner"
          ? { color: "purple", icon: <ShopOutlined /> }
          : { color: "green", icon: <UserOutlined /> };

  const OptionRow = ({ item, isLast }) => (
    <button
      onClick={item.onClick}
      className={`flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-gray-50 ${
        isLast ? "" : "border-b border-gray-100"
      }`}>
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.iconBg} ${item.iconColor}`}>
        {item.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm text-gray-900 truncate">
            {item.label}
          </p>
          {item.badge > 0 && (
            <Badge count={item.badge} size="small" className="shrink-0" />
          )}
        </div>
        <p className="text-xs text-gray-500 truncate">{item.description}</p>
      </div>
      <RightOutlined className="text-gray-400 text-xs shrink-0" />
    </button>
  );

  return (
    <div className="min-h-below-header bg-gray-50 pb-20 lg:pb-0">
      <Header />
      <PageHeader title="Profile" subtitle={user.email} />

      <main className="mx-auto max-w-4xl px-4 py-4 space-y-4">
        {/* Profile Summary */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-700">
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold text-gray-900 truncate">
                  {user.firstName} {user.lastName}
                </h1>
                <Tag
                  {...roleTagProps}
                  className="text-[10px] uppercase font-semibold m-0">
                  {user.role}
                </Tag>
              </div>
              <p className="text-sm text-gray-600 truncate">
                <MailOutlined /> {user.email}
              </p>
              {user.phone && (
                <p className="text-sm text-gray-600 truncate">
                  <PhoneOutlined /> {user.phone}
                </p>
              )}
            </div>
          </div>

          {user.role === "customer" && (
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-xl font-bold text-gray-900">
                  {stats.orders}
                </div>
                <div className="text-xs text-gray-500">Total Orders</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-xl font-bold text-gray-900">
                  {user.wishlist?.length || 0}
                </div>
                <div className="text-xs text-gray-500">Wishlist</div>
              </div>
            </div>
          )}
        </div>

        {/* Loyalty Milestone Progress for Customers */}
        {user.role === "customer" && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-yellow-400 to-orange-500">
                <TrophyOutlined className="text-white text-lg" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm text-gray-900 mb-1">
                  Next Reward
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  {ordersUntilNextReward === REWARD_MILESTONE &&
                  stats.completed === 0
                    ? `Complete ${REWARD_MILESTONE} orders to unlock a ₹50 coupon!`
                    : `${ordersUntilNextReward} more delivered order${ordersUntilNextReward !== 1 ? "s" : ""} to unlock your next ₹50 coupon`}
                </p>
                <Progress
                  percent={Math.round(milestonePercent)}
                  strokeColor={{
                    "0%": "#10b981",
                    "100%": "#059669",
                  }}
                  size="small"
                />
              </div>
            </div>
          </div>
        )}

        {/* Unlocked Rewards */}
        {user.role === "customer" && availableCoupons.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <GiftOutlined className="text-emerald-600" />
              Your Rewards
            </h2>
            <div className="space-y-2">
              {availableCoupons.map((coupon) => (
                <div
                  key={coupon._id}
                  className="flex items-center gap-3 rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 p-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 tracking-wide">
                      {coupon.code}
                    </p>
                    <p className="text-xs text-gray-600">
                      {coupon.discountType === "percentage"
                        ? `${coupon.discountValue}% off`
                        : `₹${coupon.discountValue} off`}
                      {coupon.expiresAt &&
                        ` · Valid until ${new Date(coupon.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopyCoupon(coupon.code)}
                    className="flex shrink-0 items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 border border-amber-300 hover:bg-amber-100 transition-all">
                    <CopyOutlined /> Copy
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Account Section */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
            <UserOutlined className="text-emerald-600" />
            Account
          </h2>
          <div>
            {accountOptions.map((item, index) => (
              <OptionRow
                key={index}
                item={item}
                isLast={index === accountOptions.length - 1}
              />
            ))}
          </div>
        </div>

        {/* Settings Section */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
            <SettingOutlined className="text-emerald-600" />
            Settings & More
          </h2>
          <div>
            {settingsOptions.map((item, index) => (
              <OptionRow
                key={index}
                item={item}
                isLast={index === settingsOptions.length - 1}
              />
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => setLogoutModalVisible(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-red-600 border-2 border-red-600 rounded-xl bg-white hover:bg-red-600 hover:text-white transition-all">
          <LogoutOutlined />
          Logout from Account
        </button>
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
        centered>
        <p>Are you sure you want to logout?</p>
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
