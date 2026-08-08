"use client";

import BottomNav from "@/components/layout/BottomNav";
import { useCartStore } from "@/store/cartStore";
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  MinusOutlined,
  PlusOutlined,
  ShoppingOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { App, Button, Modal } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Shopping Cart Page - Enhanced
 * Modern design with proper cart management and API integration
 */
export default function CartPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    getTotalPrice,
    clearCart,
  } = useCartStore();
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [clearModalVisible, setClearModalVisible] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = getTotalPrice();
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  // Set delivery fee: ₹90 if subtotal < 1000, else free
  const deliveryFee = subtotal > 199 ? 0 : 25;
  const total = subtotal - discount + deliveryFee;

  // Check if all items with sizes have size selected
  const canProceedToCheckout = items.every((item) => {
    // If product has sizes available, size selection is mandatory
    if (item.sizes && item.sizes.length > 0) {
      return item.size && item.size.trim() !== "";
    }
    return true; // If no sizes available, no validation needed
  });

  const handleVariantChange = (item, newVariant) => {
    const productBaseId = item._id;
    const newVariantId = newVariant._id || newVariant.id;
    const newKey = newVariantId
      ? `${productBaseId}_${newVariantId}`
      : productBaseId;
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

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      message.warning("Please enter a coupon code");
      return;
    }

    setCouponLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Mock coupon validation
      const validCoupons = {
        NEW10026: { discount: 26, name: "NEW10026", freeDelivery: true },
        // 'WELCOME10': { discount: subtotal * 0.1, name: 'WELCOME10' },
        // 'SAVE50': { discount: 50, name: 'SAVE50' },
        // 'FLAT100': { discount: 100, name: 'FLAT100' },
      };

      const upperCode = couponCode.toUpperCase();
      if (validCoupons[upperCode]) {
        setAppliedCoupon(validCoupons[upperCode]);
        if (upperCode === "NEW10026") {
          message.success("Coupon applied! ₹26 off + Free delivery! 🎉");
        } else {
          message.success("Coupon applied successfully!");
        }
      } else {
        message.error("Invalid coupon code");
      }
      setCouponLoading(false);
    }, 800);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    message.info("Coupon removed");
  };

  const handleClearCart = () => {
    clearCart();
    message.success("Cart cleared successfully");
    setClearModalVisible(false);
  };

  const handleRemoveItem = (itemId) => {
    removeItem(itemId);
    message.info("Item removed from cart");
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-white/95 pb-20">
        {/* Enhanced Header */}
        <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg px-4 py-4">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-all hover:scale-105">
              <ArrowLeftOutlined className="text-xl" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-sm text-gray-600">0 items in your cart</p>
            </div>
          </div>
        </header>

        {/* Enhanced Empty State */}
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="bg-linear-to-br from-emerald-100 to-teal-100 rounded-3xl p-12 inline-block mb-6">
              <div className="text-7xl">🛒</div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Your Cart is Empty
            </h3>
            <p className="text-gray-600 mb-8">
              Add some amazing products to get started!
            </p>
            <Button
              type="primary"
              size="large"
              className="bg-linear-to-r from-emerald-600 to-teal-600 border-0 rounded-xl h-12 px-8 font-semibold shadow-md hover:shadow-lg"
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
    <div className="min-h-screen bg-white/95 pb-20 lg:pb-0 lg:pl-0">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg px-4 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-all hover:scale-105">
              <ArrowLeftOutlined className="text-xl" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-sm text-gray-600">
                {/* <Badge count={items.length} showZero color="#10b981" className="mr-2" /> */}
                {items.length} item{items.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={() => setClearModalVisible(true)}
            className="text-sm font-semibold text-red-500 hover:text-red-600 flex items-center gap-1 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-all">
            <DeleteOutlined />
            Clear All
          </button>
        </div>
      </header>

      {/* Cart Items */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="space-y-3">
          {items.map((item) => {
            const hasVariants =
              Array.isArray(item.variants) && item.variants.length > 1;
            const selectedVariantId =
              item.selectedVariant?._id || item.selectedVariant?.id;
            const comparePrice =
              item.compareAtPrice ??
              item.selectedVariant?.compareAtPrice ??
              null;
            const savingsPerUnit =
              comparePrice && comparePrice > item.price
                ? comparePrice - item.price
                : 0;
            const totalSavings = savingsPerUnit * item.quantity;
            const discountPct =
              comparePrice && comparePrice > item.price
                ? Math.round(((comparePrice - item.price) / comparePrice) * 100)
                : 0;

            return (
              <div
                key={item.id}
                className="rounded-2xl bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
                {/* Top section: image + details */}
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="relative h-28 w-28 sm:h-32 sm:w-32 shrink-0 overflow-hidden rounded-xl bg-gray-50 border border-gray-100">
                    {item.images?.[0]?.url ? (
                      <Image
                        src={item.images[0].url}
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                        sizes="128px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-4xl">
                        📦
                      </div>
                    )}
                    {discountPct > 0 && (
                      <span className="absolute top-1.5 left-1.5 text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                        {discountPct}%
                      </span>
                    )}
                  </div>

                  {/* Info column */}
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    {/* Name + Delete */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-snug line-clamp-2 flex-1 capitalize">
                        {item.name}
                      </h3>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="shrink-0 h-8 w-8 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-all">
                        <DeleteOutlined className="text-sm" />
                      </button>
                    </div>

                    <div className=" flex justify-between items-center">
                      {/* Variant pills */}
                      {hasVariants && (
                        <div className="flex flex-wrap gap-1.5">
                          {item.variants.map((v) => {
                            const vId = v._id || v.id;
                            const isSelected = selectedVariantId === vId;
                            return (
                              <button
                                key={vId}
                                onClick={() => handleVariantChange(item, v)}
                                className={`text-xs px-3 py-1 rounded-lg font-semibold border transition-all ${
                                  isSelected
                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                    : "bg-white text-gray-600 border-gray-300 hover:border-emerald-500 hover:text-emerald-700"
                                }`}>
                                {v.label}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Stock + Unit badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.selectedVariant?.label && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-semibold">
                            {item.selectedVariant.label}
                          </span>
                        )}
                        {item.stockUnit && (
                          <span className="text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full font-medium capitalize">
                            {item.stockUnit}
                          </span>
                        )}
                        {item.stock !== undefined && (
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              item.stock > 10
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : item.stock > 0
                                  ? "bg-orange-50 text-orange-700 border border-orange-200"
                                  : "bg-red-50 text-red-600 border border-red-200"
                            }`}>
                            {item.stock > 10
                              ? "✓ In Stock"
                              : item.stock > 0
                                ? `Only ${item.stock} left`
                                : "Out of Stock"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-lg font-bold text-emerald-700">
                        ₹{item.price.toLocaleString()}
                      </span>
                      {comparePrice && comparePrice > item.price && (
                        <>
                          <span className="text-sm text-gray-400 line-through">
                            ₹{comparePrice.toLocaleString()}
                          </span>
                          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            Save ₹{savingsPerUnit}/unit
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom section: quantity + item total (full width, always below) */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-3 rounded-xl border-2 border-emerald-500 bg-emerald-50 px-3 py-1.5">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity - 1)
                      }
                      className="flex h-6 w-6 items-center justify-center font-bold text-emerald-600 hover:scale-110 transition-transform">
                      <MinusOutlined className="text-sm" />
                    </button>
                    <span className="w-7 text-center text-base font-bold text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity + 1)
                      }
                      className="flex h-6 w-6 items-center justify-center font-bold text-emerald-600 hover:scale-110 transition-transform">
                      <PlusOutlined className="text-sm" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-base sm:text-lg font-bold text-gray-900">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                    {totalSavings > 0 && (
                      <p className="text-xs text-green-600 font-semibold">
                        You save ₹{totalSavings.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <div className="text-xl mb-1">🚚</div>
            <p className="text-xs font-semibold text-gray-700">Free Delivery</p>
            <p className="text-xs text-gray-500">on ₹199+</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center shadow-sm">
            <div className="text-xl mb-1">⚠️</div>
            <p className="text-xs font-semibold text-amber-700">No Returns</p>
            <p className="text-xs text-amber-600">Perishable items</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <div className="text-xl mb-1">🔒</div>
            <p className="text-xs font-semibold text-gray-700">Secure</p>
            <p className="text-xs text-gray-500">Payment</p>
          </div>
        </div>
        {/* No Return Policy Notice */}
        <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-semibold">⚠️ No Return Policy:</span> Due to
            the perishable nature of fruits and vegetables, returns are not
            accepted. Please inspect the product before accepting delivery.
          </p>
        </div>

        {/* Coupon Section */}
        {/* <div className="mt-6 bg-white rounded-2xl p-4 shadow-md border-2 border-dashed border-emerald-200">
          <div className="flex items-center gap-2 mb-3">
            <GiftOutlined className="text-emerald-600 text-xl" />
            <h3 className="font-semibold text-gray-900">Have a Coupon Code?</h3>
          </div>
          
          {appliedCoupon ? (
            <div className="flex items-center justify-between bg-emerald-50 border-2 border-emerald-300 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <TagOutlined className="text-emerald-600" />
                <span className="font-semibold text-emerald-700">{appliedCoupon.name}</span>
                <span className="text-sm text-gray-600">
                  (₹{Math.round(appliedCoupon.discount)} off)
                </span>
              </div>
              <button
                onClick={handleRemoveCoupon}
                className="text-sm text-red-500 hover:text-red-600 font-semibold"
              >
                Remove
              </button>
            </div>
          ) : (
            <div>
              <div className="flex gap-2">
                <Input
                  size="large"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onPressEnter={handleApplyCoupon}
                  className="rounded-xl"
                  prefix={<TagOutlined className="text-gray-400" />}
                />
                <Button
                  size="large"
                  onClick={handleApplyCoupon}
                  loading={couponLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 rounded-xl px-6 font-semibold"
                >
                  Apply
                </Button>
              </div>
              
              //Available Coupons Section 
              <div className="mt-4 space-y-3">
                <p className="text-sm font-semibold text-gray-700">Available Coupons:</p>
                
                <button
                  onClick={() => {
                    setCouponCode('NEW10026');
                    setTimeout(() => handleApplyCoupon(), 100);
                  }}
                  className="w-full text-left bg-linear-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl px-4 py-3 hover:border-emerald-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-emerald-800">NEW10026</p>
                      <p className="text-xs text-gray-600 mt-1">₹26 off</p>
                    </div>
                    <div className="bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg group-hover:bg-emerald-700 transition-colors">
                      ADD COUPON
                    </div>
                  </div>
                </button>

                
              </div>
            </div>
          )}
        </div> */}

        {/* Delivery Info */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
          <ClockCircleOutlined className="text-blue-600 text-xl mt-0.5" />
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">
              Delivery Schedule
            </h4>
            <p className="text-sm text-gray-600">
              Your order will be delivered during the{" "}
              <strong className="text-blue-600">
                delivery slot selected at checkout
              </strong>
              .
            </p>
          </div>
        </div>
      </main>

      {/* Enhanced Price Summary - Fixed at Bottom */}
      <div className="bottom-16 left-0 right-0 z-20 border-t border-gray-200 bg-linear-to-r from-white to-emerald-50/30 px-4 py-4 shadow-2xl backdrop-blur-sm">
        <div className="mx-auto max-w-7xl">
          <div className="mb-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">
                ₹{subtotal.toLocaleString()}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600 font-semibold">
                <span className="flex items-center gap-1">
                  <TagOutlined /> Discount
                </span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="font-semibold">
                {deliveryFee === 0 ? (
                  <span className="text-green-600">FREE</span>
                ) : (
                  `₹${deliveryFee}`
                )}
              </span>
            </div>
            <div className="flex justify-between border-t-2 border-dashed border-gray-300 pt-2 text-base">
              <span className="font-bold text-gray-900">Total</span>
              <span className="text-xl font-bold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                ₹{total.toLocaleString()}
              </span>
            </div>
          </div>

          {!canProceedToCheckout && (
            <div className="mb-3 bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-center gap-2">
              <span className="text-red-600 text-xl">⚠️</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-700">
                  Action Required
                </p>
                <p className="text-xs text-red-600">
                  Please select size for all items that require it
                </p>
              </div>
            </div>
          )}

          <Button
            type="primary"
            size="large"
            icon={<ShoppingOutlined />}
            onClick={() => {
              const params = new URLSearchParams();
              if (appliedCoupon) {
                params.set("coupon", JSON.stringify(appliedCoupon));
              }
              router.push(`/checkout?${params?.toString()}`);
            }}
            disabled={!canProceedToCheckout}
            className="w-full bg-linear-to-r from-emerald-600 to-teal-600 border-0 rounded-xl h-12 text-base font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
            Proceed to Checkout
          </Button>
        </div>
      </div>

      <BottomNav />

      {/* Clear Cart Confirmation Modal */}
      <Modal
        title="Clear Cart"
        open={clearModalVisible}
        onOk={handleClearCart}
        onCancel={() => setClearModalVisible(false)}
        okText="Yes, Clear Cart"
        cancelText="Cancel"
        okButtonProps={{
          danger: true,
          className: "rounded-lg h-10",
        }}
        cancelButtonProps={{
          className: "rounded-lg h-10",
        }}>
        <p>Are you sure you want to remove all items from your cart?</p>
      </Modal>
    </div>
  );
}
