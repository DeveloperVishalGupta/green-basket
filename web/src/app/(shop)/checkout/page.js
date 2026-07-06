"use client";

import { useSetDefaultAddress } from "@/hooks/useAddresses";
import { useAuth } from "@/hooks/useAuth";
import { ordersAPI, paymentAPI } from "@/lib/api";
import { DELIVERY_SLOTS } from "@/lib/constants";
import { useCartStore } from "@/store/cartStore";
import {
  ArrowLeftOutlined,
  LockOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { App, Button, Divider, Input, Tag } from "antd";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

/**
 * Checkout Page - Modern 2-Column Layout
 * Left: Address, Items, Schedule, Notes
 * Right: Payment, Summary, Sticky Button
 */
export default function CheckoutPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuth();
  const setDefaultAddress = useSetDefaultAddress();
  const queryClient = useQueryClient();
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Preselect address from query param if present, or default address, or first address
  const addressIdFromQuery = searchParams?.get("addressId");
  const defaultAddress = user?.addresses.find((add) => add.isDefault);
  const firstAddress = user?.addresses?.[0];
  const defaultAddressId =
    addressIdFromQuery || defaultAddress?._id || firstAddress?._id || null;
  const [selectedAddress, setSelectedAddress] = useState(defaultAddressId);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDeliverySlot, setSelectedDeliverySlot] = useState(null);
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState(null);
  const [orderNotes, setOrderNotes] = useState("");

  // Generate next 5 delivery date options
  const dateOptions = (() => {
    const opts = [];
    const now = new Date();
    for (let i = 0; i < 5; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      opts.push({
        id: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
        label:
          i === 0
            ? "Today"
            : i === 1
              ? "Tomorrow"
              : d.toLocaleDateString("en-IN", { weekday: "short" }),
        sub: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        fullDate: d,
      });
    }
    return opts;
  })();

  // Filter delivery slots based on selected date and current time
  const availableSlots = useMemo(() => {
    if (!selectedDeliveryDate) return [];

    const now = new Date();
    const selectedDateObj = dateOptions.find(
      (d) => d.id === selectedDeliveryDate,
    )?.fullDate;
    const isToday = selectedDateObj?.toDateString() === now.toDateString();

    if (isToday) {
      const currentHour = now.getHours();
      return DELIVERY_SLOTS.filter((slot) => slot.startHour > currentHour);
    }

    return DELIVERY_SLOTS;
  }, [selectedDeliveryDate, dateOptions]);

  // If all slots for today have passed, auto-select tomorrow
  useEffect(() => {
    const now = new Date();
    const selectedDateObj = dateOptions.find(
      (d) => d.id === selectedDeliveryDate,
    )?.fullDate;
    const isToday = selectedDateObj?.toDateString() === now.toDateString();

    if (isToday && availableSlots.length === 0) {
      const tomorrowDateId = dateOptions[1]?.id;
      if (tomorrowDateId) {
        setSelectedDeliveryDate(tomorrowDateId);
        setSelectedDeliverySlot(null);
      }
    }
  }, [availableSlots, selectedDeliveryDate, dateOptions]);

  // Update selected address when user data loads
  useEffect(() => {
    if (user?.addresses && !selectedAddress) {
      const addressIdFromQuery = searchParams?.get("addressId");
      const defaultAddress = user.addresses.find((add) => add.isDefault);
      const firstAddress = user.addresses[0];
      const newDefaultAddressId =
        addressIdFromQuery || defaultAddress?._id || firstAddress?._id || null;
      if (newDefaultAddressId) {
        setSelectedAddress(newDefaultAddressId);
      }
    }
  }, [user?.addresses, selectedAddress, searchParams]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      console.log("✅ Razorpay script loaded");
      setRazorpayLoaded(true);
    };
    script.onerror = () => {
      console.error("❌ Failed to load Razorpay script");
      message.error("Failed to load payment gateway");
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup: remove script when component unmounts
      document.body.removeChild(script);
    };
  }, [message]);

  // Get coupon from URL params
  const couponParam = searchParams?.get("coupon");
  const appliedCoupon = couponParam ? JSON.parse(couponParam) : null;

  // Check if user has already used this coupon
  useEffect(() => {
    const checkCouponUsage = async () => {
      if (appliedCoupon && appliedCoupon.name && user) {
        try {
          // Fetch user's orders to check if coupon was already used
          const response = await ordersAPI.getAll();
          const userOrders = response?.data?.data || [];

          const couponUsed = userOrders.some(
            (order) => order.coupon?.code === appliedCoupon.name,
          );

          if (couponUsed) {
            message.warning({
              content: `You have already used the coupon "${appliedCoupon.name}". Each coupon can only be used once per user.`,
              duration: 5,
            });
            // Remove coupon from URL by navigating to checkout without coupon param
            const urlSearchParams = new URLSearchParams(window.location.search);
            urlSearchParams.delete("coupon");
            const newSearch = urlSearchParams.toString();
            const newPath =
              window.location.pathname + (newSearch ? "?" + newSearch : "");
            router.replace(newPath);
          }
        } catch (error) {
          console.error("Failed to check coupon usage:", error);
        }
      }
    };

    checkCouponUsage();
  }, [appliedCoupon, user, router, message]);

  // Calculate pricing for display
  const subtotal = getTotalPrice();
  let discount = 0;
  let deliveryFee = subtotal > 199 ? 0 : 25;
  const total = Math.max(0, subtotal - discount + deliveryFee);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      message.error("Please select a delivery address");
      return;
    }

    if (!selectedDeliveryDate) {
      message.error("Please select a delivery date");
      return;
    }

    if (!selectedDeliverySlot) {
      message.error("Please select a delivery time slot");
      return;
    }

    if (!razorpayLoaded) {
      message.error("Payment gateway is loading. Please wait...");
      return;
    }

    setIsProcessing(true);

    try {
      const addressObj = user?.addresses.find((a) => a._id === selectedAddress);

      const payload = {
        items: items.map((i) => ({
          product: i._id || i.id,
          quantity: i.quantity,
          size: i.selectedVariant?.label || i.size,
          color: i.color,
          name: i.name,
        })),
        shippingAddress: addressObj || { _id: selectedAddress },
        paymentMethod: "card",
        pricing: {
          subtotal,
          discount,
          shippingFee: deliveryFee,
          total,
        },
        coupon: appliedCoupon
          ? {
              code: appliedCoupon.name,
              discount: appliedCoupon.discount,
              freeDelivery:
                appliedCoupon.freeDelivery || appliedCoupon.name === "NEW10026",
            }
          : null,
        deliveryDate: selectedDeliveryDate,
        deliveryTimeSlot: selectedDeliverySlot,
        deliveryFee,
        subtotal,
        totalAmount: total,
        notes: orderNotes || undefined,
      };

      console.log("📦 Creating order with payload:", payload);

      const res = await ordersAPI.create(payload);

      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Failed to create order");
      }

      const createdOrder = res.data.data;
      console.log("✅ Order created:", createdOrder);

      await handleRazorpayPayment(createdOrder._id);
    } catch (err) {
      const errorMessage =
        err?.message || err?.response?.data?.message || "Failed to place order";

      if (err?.status === 401 || err?.response?.status === 401) {
        message.error("Please login to place an order");
        router.push("/login");
      } else {
        message.error(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRazorpayPayment = async (orderId) => {
    try {
      console.log("💳 Initiating Razorpay payment for order:", orderId);

      if (!total || total <= 0) {
        console.error("❌ Invalid total amount:", total);
        message.error("Invalid order total. Please refresh and try again.");
        setIsProcessing(false);
        return;
      }

      const razorpayRes = await paymentAPI.createRazorpayOrder(orderId, {
        subtotal,
        discount,
        shippingFee: deliveryFee,
        total,
      });

      console.log("📥 Razorpay response:", razorpayRes?.data);

      if (!razorpayRes?.data?.success) {
        const backendMsg =
          razorpayRes?.data?.message || "Failed to create payment order";
        console.error("❌ Razorpay init failed:", {
          success: razorpayRes?.data?.success,
          message: razorpayRes?.data?.message,
        });
        message.error(backendMsg);
        setIsProcessing(false);
        return;
      }

      const {
        orderId: razorpayOrderId,
        amount,
        currency,
        keyId,
      } = razorpayRes.data.data;

      if (!razorpayOrderId || !amount || !keyId) {
        console.error("❌ Invalid Razorpay response:", razorpayRes.data.data);
        message.error("Payment initialization failed. Please try again.");
        setIsProcessing(false);
        return;
      }

      console.log("✅ Razorpay order created:", {
        razorpayOrderId,
        amount: amount / 100,
        currency,
      });

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "Iqra Fashion",
        description: `Order Payment - ₹${(amount / 100).toFixed(2)}`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          console.log("✅ Payment successful from Razorpay, verifying...");

          try {
            setIsProcessing(true);

            const verifyRes = await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            console.log("📥 Verification response:", verifyRes?.data);

            if (verifyRes?.data?.success) {
              clearCart();
              message.success("Payment successful! Order confirmed.");

              queryClient.invalidateQueries({ queryKey: ["orders"] });

              router.push(`/orders/${orderId}`);
            } else {
              const errMsg =
                verifyRes?.data?.message || "Payment verification failed";
              console.error("❌ Verification failed:", {
                success: verifyRes?.data?.success,
                message: verifyRes?.data?.message,
              });
              throw new Error(errMsg);
            }
          } catch (verifyError) {
            console.error(
              "❌ Payment verification error:",
              verifyError.message,
            );
            message.error(
              "Payment verification failed. Please contact support with your Order ID.",
            );
            setIsProcessing(false);
            router.push("/orders");
          }
        },
        prefill: {
          name: `${user?.firstName} ${user?.lastName}`,
          email: user?.email,
          contact: user?.phone || "",
        },
        theme: {
          color: "#0F8A5F",
        },
        modal: {
          ondismiss: async function () {
            console.log("⚠️ Payment cancelled by user");

            try {
              console.log(
                "🚫 Cancelling order due to payment cancellation:",
                orderId,
              );
              await ordersAPI.cancel(orderId, {
                reason: "Payment cancelled by user",
              });

              message.warning("Payment cancelled. Order has been cancelled.");
              setIsProcessing(false);
              router.push("/cart");
            } catch (cancelError) {
              console.error("❌ Error cancelling order:", cancelError);
              message.warning("Payment cancelled. Please check your orders.");
              setIsProcessing(false);
              router.push("/orders");
            }
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", async function (response) {
        console.error("❌ Payment failed:", response.error);

        const errorMsg =
          response.error?.description ||
          response.error?.reason ||
          "Payment failed. Please try again";

        try {
          console.log("🚫 Cancelling order due to payment failure:", orderId);
          await ordersAPI.cancel(orderId, {
            reason: `Payment failed: ${response.error?.reason || "Unknown error"}`,
          });

          message.error(`${errorMsg}. Order has been cancelled.`);
          setIsProcessing(false);
          router.push("/cart");
        } catch (cancelError) {
          console.error("❌ Error cancelling order:", cancelError);
          message.error(errorMsg);
          setIsProcessing(false);
          router.push("/orders");
        }
      });

      console.log("🚀 Opening Razorpay checkout modal...");
      razorpay.open();
    } catch (error) {
      console.error("❌ Razorpay payment error:", error.message);

      const errMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to initialize payment. Please try again.";
      message.error(errMsg);
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Button
            type="primary"
            size="large"
            onClick={() => router.push("/products")}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <button
            onClick={() => router.push("/cart")}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeftOutlined className="text-xl" />
          </button>
          <h1 className="text-xl font-bold">Checkout</h1>
        </div>
      </header>

      {/* Coupon Applied Banner */}
      {appliedCoupon && (
        <div className="mx-auto max-w-7xl px-4 my-4">
          <div className="bg-linear-to-r from-green-50 to-emerald-50 border border-green-300 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🎉</div>
              <div>
                <p className="font-semibold text-green-800">Coupon Applied!</p>
                <p className="text-sm text-green-700">
                  {appliedCoupon.name} - ₹{appliedCoupon.discount} off
                  {appliedCoupon.freeDelivery && " + Free Delivery"}
                </p>
              </div>
            </div>
            <Tag color="green" className="font-semibold">
              -₹{discount}
            </Tag>
          </div>
        </div>
      )}

      {/* Main 2-Column Layout */}
      <main className="mx-auto max-w-7xl px-4 py-6 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">📍</span>
                  Delivery Address
                </h2>
                <div className="flex gap-2">
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      const couponParam = searchParams?.get("coupon");
                      const url = couponParam
                        ? `/addresses/add?coupon=${encodeURIComponent(couponParam)}`
                        : "/addresses/add";
                      router.push(url);
                    }}>
                    Add Address
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      const couponParam = searchParams?.get("coupon");
                      const url = couponParam
                        ? `/addresses?coupon=${encodeURIComponent(couponParam)}`
                        : "/addresses";
                      router.push(url);
                    }}>
                    Manage
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user?.addresses.map((address) => {
                  const isSelected =
                    selectedAddress === (address.id || address._id);

                  return (
                    <div
                      key={address.id || address._id}
                      onClick={() =>
                        setSelectedAddress(address.id || address._id)
                      }
                      className={`cursor-pointer border-2 rounded-xl p-4 transition-all duration-200 ${
                        isSelected
                          ? "border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-md"
                          : "border-gray-200 hover:border-green-300 hover:shadow-sm"
                      }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <p className="text-sm text-gray-700 mb-1">
                              <span className="font-medium capitalize">
                                {address.fullName}
                              </span>
                              <span className="text-gray-600">
                                {" "}
                                • {address.phone}
                              </span>
                            </p>
                            <span className="font-semibold text-gray-900">
                              {address.label}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 mb-1">
                            {address.street}
                          </p>

                          {/* {address.area && (
                            <p className="text-sm text-gray-600">
                              {address.area}
                            </p>
                          )} */}

                          <p className="text-sm text-gray-600">
                            {address?.area || ""}, {address.city},{" "}
                            {address.state} - {address.zipCode}
                          </p>

                          {address.landmark && (
                            <Tag className="mt-2 text-xs">
                              Landmark: {address.landmark}
                            </Tag>
                          )}
                        </div>
                      </div>

                      {!address.isDefault ? (
                        <Button
                          size="small"
                          type="link"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await setDefaultAddress.mutateAsync(
                                address.id || address._id,
                              );
                              message.success("Set as default address");
                            } catch (err) {
                              message.error(
                                err?.message || "Failed to set default",
                              );
                            }
                          }}
                          className="pl-0 text-emerald-600 mt-2">
                          Make Default
                        </Button>
                      ) : (
                        address.isDefault && (
                          <Tag color="green" className="text-xs font-semibold">
                            Default
                          </Tag>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                <span className="text-2xl">🛍️</span>
                Order Items ({items.length})
              </h2>
              <div className="space-y-3">
                {items?.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 flex gap-4 hover:border-gray-300 hover:shadow-sm px-4 py-2 rounded-xl shadow-sm transition-all">
                    {/* Product Image */}
                    <div className="h-20 w-20 border border-slate-300 rounded-xl shrink-0 relative  overflow-hidden bg-gray-100">
                      {item.images?.[0] ? (
                        <Image
                          src={item.images[0]?.url}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl">
                          📦
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-lg  capitalize text-gray-700 line-clamp-1 ">
                            {item.name}
                          </span>
                          <span className="flex flex-wrap gap-2 ">
                            {item.selectedVariant && (
                              <Tag className="bg-blue-50 text-blue-700 border-blue-200">
                                {item.selectedVariant.label}
                              </Tag>
                            )}
                          </span>
                          <span className="text-sm text-gray-600">
                            Qty:{" "}
                            <span className="font-semibold">
                              ×{item.quantity}
                            </span>
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-600">
                            ₹{item.price}/unit
                          </p>
                          <p className="font-bold text-lg    text-gray-800">
                            ₹{item.price * item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Schedule Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                <span className="text-2xl">📅</span>
                Delivery Schedule
              </h2>

              {/* Date Selection */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Select Delivery Date
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {dateOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setSelectedDeliveryDate(opt.id);
                        setSelectedDeliverySlot(null);
                      }}
                      className={`rounded-lg p-3 border-2 transition-all text-center font-medium ${
                        selectedDeliveryDate === opt.id
                          ? "border-green-600 bg-green-50 text-green-700 shadow-md"
                          : "border-gray-200 hover:border-green-300 text-gray-700"
                      }`}>
                      <div className="text-sm font-bold leading-tight">
                        {opt.label}
                      </div>
                      <div className="text-xs opacity-70 mt-1">{opt.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slot Selection */}
              {selectedDeliveryDate && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Select Delivery Time
                  </p>
                  {availableSlots.length === 0 ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                      <p className="text-sm text-yellow-800">
                        All delivery slots for today have passed. Please select
                        another date.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Morning Slots */}
                      {availableSlots.some((s) => s.window === "morning") && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-2">
                            <span>🌅</span> Morning (8:00 AM - 10:00 AM)
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {availableSlots
                              .filter((s) => s.window === "morning")
                              .map((slot) => (
                                <button
                                  key={slot.id}
                                  onClick={() =>
                                    setSelectedDeliverySlot(slot.id)
                                  }
                                  className={`rounded-lg p-3 border-2 transition-all text-center font-medium ${
                                    selectedDeliverySlot === slot.id
                                      ? "border-green-600 bg-green-50 text-green-700 shadow-md"
                                      : "border-gray-200 hover:border-green-300 text-gray-700 hover:bg-gray-50"
                                  }`}>
                                  <p className="text-sm font-semibold">
                                    {slot.label}
                                  </p>
                                </button>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Evening Slots */}
                      {availableSlots.some((s) => s.window === "evening") && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-2">
                            <span>🌙</span> Evening (7:00 PM - 10:00 PM)
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {availableSlots
                              .filter((s) => s.window === "evening")
                              .map((slot) => (
                                <button
                                  key={slot.id}
                                  onClick={() =>
                                    setSelectedDeliverySlot(slot.id)
                                  }
                                  className={`rounded-lg p-3 border-2 transition-all text-center font-medium ${
                                    selectedDeliverySlot === slot.id
                                      ? "border-green-600 bg-green-50 text-green-700 shadow-md"
                                      : "border-gray-200 hover:border-green-300 text-gray-700 hover:bg-gray-50"
                                  }`}>
                                  <p className="text-sm font-semibold">
                                    {slot.label}
                                  </p>
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Order Notes Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span className="text-xl">📝</span>
                Delivery Instructions (Optional)
              </h2>
              <Input.TextArea
                placeholder="e.g., 'Leave at gate', 'Call before delivery', 'Ring the bell twice'"
                rows={3}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="rounded-lg"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 {200 - orderNotes.length} characters remaining
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Premium Payment Section */}
              <div className="bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 shadow-lg border-2 border-indigo-200">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      Payment Method
                    </h3>
                    <Tag color="blue" className="font-semibold">
                      Online Only
                    </Tag>
                  </div>

                  {/* Razorpay Branding */}
                  <div className="bg-white rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 justify-center">
                      {/* <ShieldOutlined className="text-lg text-blue-600" /> */}
                      <p className="text-sm font-semibold text-gray-800">
                        Powered by{" "}
                        <span className="text-blue-600">Razorpay</span>
                      </p>
                    </div>
                  </div>

                  {/* Payment Methods Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-white rounded-lg p-3 text-center hover:shadow-md transition-shadow">
                      <p className="text-2xl mb-1">💳</p>
                      <p className="text-xs font-medium text-gray-700">
                        Credit/Debit Cards
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center hover:shadow-md transition-shadow">
                      <p className="text-2xl mb-1">📱</p>
                      <p className="text-xs font-medium text-gray-700">UPI</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center hover:shadow-md transition-shadow">
                      <p className="text-2xl mb-1">💰</p>
                      <p className="text-xs font-medium text-gray-700">
                        Wallets
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center hover:shadow-md transition-shadow">
                      <p className="text-2xl mb-1">🏦</p>
                      <p className="text-xs font-medium text-gray-700">
                        Net Banking
                      </p>
                    </div>
                  </div>

                  {/* Trust Message */}
                  <div className="bg-white rounded-lg p-3 flex items-start gap-2">
                    <LockOutlined className="text-green-600 mt-1 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-800">
                        Secure & Encrypted
                      </p>
                      <p className="text-xs text-gray-600">
                        100% safe transactions with SSL encryption
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary Section */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>📊</span>
                  Order Summary
                </h3>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">
                      ₹{subtotal}
                    </span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Coupon Discount</span>
                      <span className="font-semibold text-green-600">
                        -₹{discount}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    {deliveryFee === 0 ? (
                      <span className="font-semibold text-green-600 flex items-center gap-1">
                        <span>FREE</span>
                        <span className="text-xs">🎁</span>
                      </span>
                    ) : (
                      <span className="font-semibold text-gray-900">
                        ₹{deliveryFee}
                      </span>
                    )}
                  </div>

                  <Divider className="my-2" />

                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">
                      Total Amount
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      ₹{total}
                    </span>
                  </div>
                </div>

                {deliveryFee === 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center mb-4">
                    <p className="text-xs font-semibold text-green-800">
                      ✓ Free Delivery!
                    </p>
                  </div>
                )}

                {/* Pay Now Button - Sticky */}
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={handlePlaceOrder}
                  disabled={
                    isProcessing ||
                    !razorpayLoaded ||
                    !selectedAddress ||
                    !selectedDeliveryDate ||
                    !selectedDeliverySlot
                  }
                  className="h-12 text-base font-semibold rounded-lg"
                  style={{
                    background: isProcessing ? "#ccc" : "#0F8A5F",
                    borderColor: "#0F8A5F",
                  }}>
                  {!razorpayLoaded
                    ? "⏳ Loading Payment Gateway..."
                    : isProcessing
                      ? "⏳ Processing Payment..."
                      : `💳 Pay Now • ₹${total}`}
                </Button>

                {!selectedAddress && (
                  <p className="text-xs text-red-600 mt-2 text-center">
                    Please select an address
                  </p>
                )}
                {selectedAddress && !selectedDeliveryDate && (
                  <p className="text-xs text-red-600 mt-2 text-center">
                    Please select a delivery date
                  </p>
                )}
                {selectedDeliveryDate && !selectedDeliverySlot && (
                  <p className="text-xs text-red-600 mt-2 text-center">
                    Please select a time slot
                  </p>
                )}
              </div>

              {/* Security Badge */}
              <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
                <p className="text-xs text-gray-600 mb-2">
                  🔐 Your payment is protected by
                </p>
                <p className="text-sm font-bold text-gray-900">
                  Razorpay Security
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
