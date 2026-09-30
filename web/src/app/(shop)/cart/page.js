"use client";

import CartItemCard from "@/components/cart/CartItemCard";
import { getDeliveryFee } from "@/components/cart/constants";
import InfoBadge from "@/components/cart/InfoBadge";
import NoReturnNotice from "@/components/cart/NoReturnNotice";
import OrderSummaryFooter from "@/components/cart/OrderSummaryFooter";
import BottomNav from "@/components/layout/BottomNav";
import PageHeader from "@/components/layout/PageHeader";
import { useMyCoupons } from "@/hooks/useCoupons";
import { useCartStore } from "@/store/cartStore";
import { DeleteOutlined, TagOutlined } from "@ant-design/icons";
import { App, Button, Input, Modal } from "antd";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

/**
 * Shopping Cart Page
 *
 * The page fills exactly the viewport below the global header (and the
 * mobile bottom nav's height on <lg). Header and order summary are shrink-0
 * flex children; only the item list (`main`) scrolls, so the summary/checkout
 * button stay pinned above the bottom nav no matter how many items are in
 * the cart.
 */
export default function CartPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const { items, addItem, removeItem, incrementItem, decrementItem, clearCart } =
    useCartStore();

  // Coupons are only ever earned as loyalty rewards (see profile page) —
  // matched against the user's own unused, unexpired coupons.
  const { data: couponsData } = useMyCoupons();
  const myCoupons = couponsData?.data || [];
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [clearModalVisible, setClearModalVisible] = useState(false);

  const { subtotal, discount, deliveryFee, total, itemCount } = useMemo(() => {
    const sub = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const disc = appliedCoupon?.discount ?? 0;
    const fee = appliedCoupon?.freeDelivery ? 0 : getDeliveryFee(sub);
    return {
      subtotal: sub,
      discount: disc,
      deliveryFee: fee,
      total: Math.max(0, sub - disc + fee),
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    };
  }, [items, appliedCoupon]);

  // Items that expose sizes must have one selected before checkout.
  const canCheckout = useMemo(
    () =>
      items.every((item) =>
        item.sizes && item.sizes.length > 0
          ? Boolean(item.size && item.size.trim())
          : true,
      ),
    [items],
  );

  const handleVariantChange = (item, newVariant) => {
    const newVariantId = newVariant._id || newVariant.id;
    const newKey = newVariantId ? `${item._id}_${newVariantId}` : item._id;
    const qty = item.quantity;
    removeItem(item.id);
    addItem(
      {
        ...item,
        id: newKey,
        price: newVariant.price,
        compareAtPrice: newVariant.compareAtPrice ?? null,
        selectedVariant: newVariant,
      },
      qty,
    );
  };

  const handleRemoveItem = (itemId) => {
    removeItem(itemId);
    message.info("Item removed from cart");
  };

  const handleIncrementItem = (itemId) => {
    incrementItem(itemId);
  };

  const handleDecrementItem = (itemId) => {
    const item = items.find((i) => i.id === itemId);
    if (item && item.quantity > 1) {
      decrementItem(itemId);
    } else {
      handleRemoveItem(itemId);
    }
  };

  const handleClearCart = () => {
    clearCart();
    message.success("Cart cleared successfully");
    setClearModalVisible(false);
  };

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    const coupon = myCoupons.find((c) => c.code === code);
    if (!coupon) {
      setCouponError("Invalid coupon code");
      return;
    }
    if (coupon.isUsed) {
      setCouponError("This coupon has already been used");
      return;
    }
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      setCouponError("This coupon has expired");
      return;
    }

    const discount =
      coupon.discountType === "percentage"
        ? Math.round((subtotal * coupon.discountValue) / 100)
        : coupon.discountValue;

    setAppliedCoupon({ code: coupon.code, discount, freeDelivery: coupon.freeDelivery });
    setCouponError("");
    message.success(`Coupon "${coupon.code}" applied!`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  const handleCheckout = () => {
    const params = new URLSearchParams();
    if (appliedCoupon) {
      params.set("coupon", JSON.stringify(appliedCoupon));
    }
    router.push(`/checkout?${params.toString()}`);
  };

  const header = (
    <PageHeader
      title="Shopping Cart"
      subtitle={`${itemCount} item${itemCount !== 1 ? "s" : ""} in your cart`}
      onBack={() => router.push("/")}
      rightContent={
        items.length > 0 && (
          <button
            type="button"
            onClick={() => setClearModalVisible(true)}
            className="flex items-center gap-1 rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-500 transition-all hover:bg-red-100 hover:text-red-600">
            <DeleteOutlined />
            Clear All
          </button>
        )
      }
    />
  );

  if (items.length === 0) {
    return (
      <div className="flex h-[calc(100dvh-var(--app-header-h)-5rem)] flex-col overflow-hidden bg-white/95 lg:h-[calc(100dvh-var(--app-header-h))] dark:bg-background">
        {header}
        <div className="flex flex-1 min-h-0 items-center justify-center overflow-y-auto px-4">
          <div className="max-w-md text-center">
            <div className="mb-6 inline-block rounded-3xl bg-linear-to-br from-emerald-100 to-teal-100 p-12">
              <div className="text-7xl" aria-hidden="true">
                🛒
              </div>
            </div>
            <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-text-primary">
              Your Cart is Empty
            </h3>
            <p className="mb-8 text-gray-600 dark:text-text-secondary">
              Add some amazing products to get started!
            </p>
            <Button
              type="primary"
              size="large"
              className="h-12 rounded-xl border-0 bg-linear-to-r from-emerald-600 to-teal-600 px-8 font-semibold shadow-md hover:shadow-lg"
              onClick={() => router.push("/products")}>
              Start Shopping
            </Button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-var(--app-header-h)-5rem)] flex-col overflow-hidden bg-white/95 lg:h-[calc(100dvh-var(--app-header-h))] dark:bg-background">
      {header}

      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="space-y-3">
            {items.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onVariantChange={handleVariantChange}
                onIncrement={handleIncrementItem}
                onDecrement={handleDecrementItem}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <InfoBadge icon="🚚" title="Free Delivery" subtitle="on ₹199+" />
            <InfoBadge
              icon="⚠️"
              title="No Returns"
              subtitle="Perishable items"
              tone="warning"
            />
            <InfoBadge icon="🔒" title="Secure" subtitle="Payment" />
          </div>

          <div className="mt-3">
            <NoReturnNotice />
          </div>

          {/* Coupon */}
          <div className="mt-4 rounded-xl border border-gray-200 p-3">
            {appliedCoupon ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TagOutlined className="text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-700">
                      {appliedCoupon.code} applied
                    </p>
                    <p className="text-xs text-gray-500">
                      You saved ₹{appliedCoupon.discount}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-xs font-semibold text-red-500 hover:underline">
                  Remove
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <Input
                    prefix={<TagOutlined className="text-gray-400" />}
                    placeholder="Have a coupon code?"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value);
                      setCouponError("");
                    }}
                    onPressEnter={handleApplyCoupon}
                  />
                  <Button onClick={handleApplyCoupon}>Apply</Button>
                </div>
                {couponError && (
                  <p className="mt-1.5 text-xs text-red-600">{couponError}</p>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <OrderSummaryFooter
        subtotal={subtotal}
        discount={discount}
        deliveryFee={deliveryFee}
        total={total}
        canCheckout={canCheckout}
        onCheckout={handleCheckout}
      />

      <BottomNav />

      <Modal
        title="Clear Cart"
        open={clearModalVisible}
        onOk={handleClearCart}
        onCancel={() => setClearModalVisible(false)}
        okText="Yes, Clear Cart"
        cancelText="Cancel"
        okButtonProps={{ danger: true, className: "rounded-lg h-10" }}
        cancelButtonProps={{ className: "rounded-lg h-10" }}>
        <p>Are you sure you want to remove all items from your cart?</p>
      </Modal>
    </div>
  );
}
