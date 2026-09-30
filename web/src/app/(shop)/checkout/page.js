"use client";

import PartialStockConfirmModal from "@/components/checkout/PartialStockConfirmModal";
import DeliveryScheduleNotice from "@/components/cart/DeliveryScheduleNotice";
import PageHeader from "@/components/layout/PageHeader";
import { useSetDefaultAddress } from "@/hooks/useAddresses";
import { useAuth } from "@/hooks/useAuth";
import {
  usePincodeServiceability,
  useSetDeliveryPreference,
} from "@/hooks/useDelivery";
import { deliveryAPI, ordersAPI, paymentAPI } from "@/lib/api";
import { DELIVERY_SLOTS } from "@/lib/constants";
import { getTodayId } from "@/lib/delivery";
import { useCartStore } from "@/store/cartStore";
import { useDeliveryStore } from "@/store/deliveryStore";
import { DeleteOutlined, LockOutlined, PlusOutlined } from "@ant-design/icons";
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
  const paymentMethod = "COD";
  const { message } = App.useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, getTotalPrice, clearCart, updateQuantity, removeItem } =
    useCartStore();
  const { user } = useAuth();
  const setDefaultAddress = useSetDefaultAddress();
  const { mutate: savePreference } = useSetDeliveryPreference();
  const queryClient = useQueryClient();
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Preselect address from query param if present, or default address, or first address
  const addressList = user?.addresses || [];
  const hasAddresses = addressList.length > 0;
  const addressIdFromQuery = searchParams?.get("addressId");
  const defaultAddress = addressList.find((add) => add.isDefault);
  const firstAddress = addressList[0];
  const defaultAddressId =
    addressIdFromQuery || defaultAddress?._id || firstAddress?._id || null;
  const [selectedAddress, setSelectedAddress] = useState(defaultAddressId);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDeliverySlot, setSelectedDeliverySlot] = useState(null);
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState(
    () => useDeliveryStore.getState().date,
  );
  const [orderNotes, setOrderNotes] = useState("");
  const [stockCheckItems, setStockCheckItems] = useState([]);
  const [partialStockModalOpen, setPartialStockModalOpen] = useState(false);

  // Address currently shown/used at checkout: user's selection, else default, else first
  const currentAddress =
    addressList.find((a) => (a.id || a._id) === selectedAddress) ||
    defaultAddress ||
    firstAddress ||
    null;

  // Delivery is only available in select pincodes (configured server-side —
  // see server/src/config/serviceableAreas.js). Re-checked here whenever
  // the address changes, and again server-side at order creation.
  const { data: pincodeCheck, isFetching: isCheckingPincode } =
    usePincodeServiceability(currentAddress?.zipCode);
  const isPincodeServiceable = pincodeCheck ? pincodeCheck.serviceable : true;

  // Delivery is only offered for Today/Tomorrow, matching the mandatory
  // delivery-date preference collected app-wide (see DeliveryPreferenceModal).
  const dateOptions = (() => {
    const opts = [];
    const now = new Date();
    for (let i = 0; i < 2; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      opts.push({
        id: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
        label: i === 0 ? "Today" : "Tomorrow",
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
      if (appliedCoupon && appliedCoupon.code && user) {
        try {
          // Fetch user's orders to check if coupon was already used
          const response = await ordersAPI.getAll();
          const userOrders = response?.data?.data || [];

          const couponUsed = userOrders.some(
            (order) => order.coupon?.code === appliedCoupon.code,
          );

          if (couponUsed) {
            message.warning({
              content: `You have already used the coupon "${appliedCoupon.code}". Each coupon can only be used once per user.`,
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
  const discount = appliedCoupon?.discount ?? 0;
  const deliveryFee = appliedCoupon?.freeDelivery
    ? 0
    : subtotal > 199
      ? 0
      : 25;
  const total = Math.max(0, subtotal - discount + deliveryFee);

  /**
   * Places the order for exactly `orderItems` (which may be a reduced
   * subset/quantity of the full cart, after a partial-stock confirmation).
   * Pricing is recomputed from `orderItems` so a partial order is only
   * charged for what's actually being shipped.
   */
  const submitOrder = async (orderItems) => {
    setIsProcessing(true);

    try {
      const shippingAddress = user?.addresses.find(
        (a) => a._id === selectedAddress,
      );

      const orderSubtotal = orderItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      );
      const orderDeliveryFee = appliedCoupon?.freeDelivery
        ? 0
        : orderSubtotal > 199
          ? 0
          : 25;
      const orderTotal = Math.max(
        0,
        orderSubtotal - discount + orderDeliveryFee,
      );

      const payload = {
        items: orderItems.map((i) => ({
          product: i._id || i.id,
          quantity: i.quantity,
          variant: i.selectedVariant?.label,
          name: i.name,
        })),
        shippingAddress,
        pricing: {
          subtotal: orderSubtotal,
          discount,
          shippingFee: orderDeliveryFee,
          total: orderTotal,
        },
        coupon: appliedCoupon ? { code: appliedCoupon.code } : undefined,
        deliveryDate: selectedDeliveryDate,
        deliveryTimeSlot:
          DELIVERY_SLOTS.find((s) => s.id === selectedDeliverySlot)?.label ||
          selectedDeliverySlot,
        notes: orderNotes || undefined,
      };

      console.log("📦 Creating order with payload:", payload);

      const res = await ordersAPI.create(payload);

      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Failed to create order");
      }

      const createdOrder = res.data.data;
      console.log("✅ Order created:", createdOrder);

      if (paymentMethod === "COD") {
        // COD: server already sent the confirmation email. Navigate away
        // first, then reconcile the cart (remove what was ordered, keep any
        // leftover that couldn't be fulfilled today) — emptying the cart
        // before the redirect kicks off can flash the checkout page's own
        // empty-cart screen for a frame while the route transition catches up.
        message.success("Order placed successfully! Pay on delivery.");
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        // Replace the checkout entry with home before pushing the order
        // details page, so pressing back from there lands on home instead
        // of back into checkout (which would otherwise show an empty cart).
        router.replace("/");
        router.push(`/orders/${createdOrder._id}`);

        const orderedQtyById = new Map(
          orderItems.map((i) => [i.id, i.quantity]),
        );
        items.forEach((cartItem) => {
          const orderedQty = orderedQtyById.get(cartItem.id) || 0;
          if (orderedQty > 0) {
            updateQuantity(cartItem.id, cartItem.quantity - orderedQty);
          }
        });
        return;
      }

      await handleRazorpayPayment(createdOrder._id);
    } catch (err) {
      const errorMessage =
        err?.response?.data?.errors?.[0]?.message ||
        err?.message ||
        err?.response?.data?.message ||
        "Failed to place order";

      if (err?.status === 401 || err?.response?.status === 401) {
        message.error("Please login to place an order");
        router.push("/login");
      } else if (err?.response?.data?.code === "DELIVERY_DATE_UNAVAILABLE") {
        setSelectedDeliveryDate(null);
        setSelectedDeliverySlot(null);
        useDeliveryStore.getState().setDate(null);
        message.error(
          "Your selected delivery date is no longer available. Please choose another date below.",
        );
      } else if (err?.response?.data?.code === "PINCODE_NOT_SERVICEABLE") {
        message.error(errorMessage, 6);
      } else {
        message.error(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveItem = (itemId) => {
    removeItem(itemId);
    message.info("Item removed from your order");
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      message.error("Please select a delivery address");
      return;
    }

    // Final pincode re-check right before placing the order — the address
    // may have changed since it was first selected/added, and this stays
    // the last line of defense before the authoritative server-side check.
    if (currentAddress?.zipCode) {
      setIsProcessing(true);
      try {
        const pincodeRes = await deliveryAPI.checkPincode(
          currentAddress.zipCode,
        );
        if (!pincodeRes?.data?.data?.serviceable) {
          setIsProcessing(false);
          message.error(
            pincodeRes?.data?.data?.message ||
              "Sorry, we don't deliver to this pincode yet.",
          );
          return;
        }
      } catch (err) {
        setIsProcessing(false);
        message.error(
          err?.message || "Could not verify delivery availability. Please try again.",
        );
        return;
      }
      setIsProcessing(false);
    }

    if (!selectedDeliveryDate) {
      message.error("Please select a delivery date");
      return;
    }

    if (!selectedDeliverySlot) {
      message.error("Please select a delivery time slot");
      return;
    }

    if (!razorpayLoaded && paymentMethod !== "COD") {
      message.error("Payment gateway is loading. Please wait...");
      return;
    }

    // Stock is only checked for "Today" delivery — "Tomorrow" skips this
    // entirely and orders the full requested quantity regardless of stock.
    if (selectedDeliveryDate === getTodayId()) {
      setIsProcessing(true);
      try {
        const res = await ordersAPI.checkStock(
          items.map((i) => ({
            product: i._id || i.id,
            quantity: i.quantity,
            name: i.name,
          })),
          selectedDeliveryDate,
        );

        const { items: checkedItems, hasPartial } = res.data.data;

        if (hasPartial) {
          setStockCheckItems(checkedItems);
          setPartialStockModalOpen(true);
          setIsProcessing(false);
          return;
        }
      } catch (err) {
        setIsProcessing(false);
        message.error(
          err?.response?.data?.message || "Failed to check stock availability",
        );
        return;
      }
    }

    await submitOrder(items);
  };

  const handlePartialStockConfirm = async () => {
    const availableQtyById = new Map(
      stockCheckItems.map((i) => [i.product, i.availableQty]),
    );

    const adjustedItems = items
      .map((item) => {
        const productId = item._id || item.id;
        const availableQty = availableQtyById.has(productId)
          ? availableQtyById.get(productId)
          : item.quantity;
        return { ...item, quantity: availableQty };
      })
      .filter((item) => item.quantity > 0);

    setPartialStockModalOpen(false);
    await submitOrder(adjustedItems);
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
        name: "Green Basket",
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

              // See the COD path above — replace checkout with home first so
              // back from the order details page lands on home.
              router.replace("/");
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

  // Skip the empty-cart screen while an order is being placed/just placed —
  // submitOrder empties the cart on success right before navigating away,
  // and without this guard that briefly flashes this screen on top of the
  // checkout page during the moment before the redirect completes.
  if (items.length === 0 && !isProcessing) {
    return (
      <div className="flex min-h-below-header items-center justify-center bg-gray-50">
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
    <div className="min-h-below-header bg-gray-50">
      <PageHeader title="Checkout" onBack={() => router.push("/cart")} />

      {/* Coupon Applied Banner */}
      {appliedCoupon && (
        <div className="mx-auto max-w-7xl px-4 my-4">
          <div className="bg-linear-to-r from-green-50 to-emerald-50 border border-green-300 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🎉</div>
              <div>
                <p className="font-semibold text-green-800">Coupon Applied!</p>
                <p className="text-sm text-green-700">
                  {appliedCoupon.code} - ₹{appliedCoupon.discount} off
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
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h2 className="text-base font-bold flex items-center gap-1.5">
                  <span className="text-lg">📍</span>
                  Delivery Address
                </h2>
                <div className="flex shrink-0 gap-1.5">
                  {hasAddresses && (
                    <Button
                      size="small"
                      onClick={() => {
                        const params = new URLSearchParams({
                          from: "/checkout",
                        });
                        const couponParam = searchParams?.get("coupon");
                        if (couponParam) params.set("coupon", couponParam);
                        router.push(`/addresses?${params.toString()}`);
                      }}>
                      Manage
                    </Button>
                  )}
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      const params = new URLSearchParams({ from: "/checkout" });
                      const couponParam = searchParams?.get("coupon");
                      if (couponParam) params.set("coupon", couponParam);
                      router.push(`/addresses/add?${params.toString()}`);
                    }}>
                    Add
                  </Button>
                </div>
              </div>

              {!hasAddresses ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center">
                  <p className="font-semibold text-gray-900">
                    No delivery address added yet.
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Add a delivery address to continue with your order.
                  </p>
                </div>
              ) : (
                <div className="grid gap-2">
                  {[currentAddress].filter(Boolean).map((address) => {
                    const isSelected =
                      selectedAddress === (address.id || address._id);

                    return (
                      <div
                        key={address.id || address._id}
                        onClick={() =>
                          setSelectedAddress(address.id || address._id)
                        }
                        className={`group cursor-pointer rounded-2xl border transition-all duration-200
          ${
            isSelected
              ? "border-emerald-500 bg-emerald-50 shadow-sm"
              : "border-gray-200 hover:border-emerald-400 hover:bg-gray-50"
          }`}>
                        <div className="flex items-center gap-3 p-3">
                          {/* Icon */}
                          <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                            <span className="text-xl">🏠</span>
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            {/* Name + Phone */}
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-gray-900">
                                {address.fullName}
                              </h3>

                              <span className="text-gray-400 hidden sm:inline">
                                •
                              </span>

                              <span className="text-gray-600 text-sm">
                                {address.phone}
                              </span>
                            </div>

                            {/* Address */}
                            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                              {address.street},{" "}
                              {address.area ? `${address.area}, ` : ""}
                              {address.city}, {address.state} -{" "}
                              {address.zipCode}
                            </p>

                            {/* Bottom */}
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              {address.isDefault && (
                                <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                  Default
                                </span>
                              )}

                              {address.landmark && (
                                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                  Landmark: {address.landmark}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Right Side */}
                          <div className="flex items-center gap-3">
                            <span className="hidden sm:inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                              🏠 {address.label || "Home"}
                            </span>

                            <svg
                              className="h-5 w-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 18l6-6-6-6"
                              />
                            </svg>
                          </div>
                        </div>

                        {!address.isDefault && (
                          <div className="px-3 pb-3">
                            <Button
                              type="link"
                              size="small"
                              className="p-0 text-emerald-600"
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  await setDefaultAddress.mutateAsync(
                                    address.id || address._id,
                                  );
                                  message.success("Set as default");
                                } catch (err) {
                                  message.error(
                                    err?.message || "Failed to set default",
                                  );
                                }
                              }}>
                              Make Default
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {hasAddresses && !isCheckingPincode && !isPincodeServiceable && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm font-semibold text-red-700">
                    😔 Delivery not available at this address
                  </p>
                  <p className="mt-1 text-xs text-red-600">
                    {pincodeCheck?.message ||
                      "We currently deliver only within select areas (Mumbai - 400089). Please choose or add an address in a serviceable area."}
                  </p>
                </div>
              )}
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
                    className="relative border border-gray-200 flex gap-4 hover:border-gray-300 hover:shadow-sm px-4 py-2 pr-10 rounded-xl shadow-sm transition-all">
                    {/* Remove item */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      aria-label={`Remove ${item.name} from order`}
                      className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-500 transition-all hover:bg-red-100 hover:text-red-600">
                      <DeleteOutlined className="text-sm" />
                    </button>

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
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <h2 className="text-base font-bold mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-teal-500 text-sm">
                  📅
                </span>
                Delivery Schedule
              </h2>

              {/* Date Selection */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Select Delivery Date
                </p>

                {/* Mobile: Horizontal Scroll | Desktop: Grid */}
                <div className="flex gap-2 overflow-x-auto pt-2 pb-1 snap-x snap-mandatory md:grid md:grid-cols-5 md:overflow-visible">
                  {dateOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setSelectedDeliveryDate(opt.id);
                        setSelectedDeliverySlot(null);
                        useDeliveryStore.getState().setDate(opt.id);
                        savePreference(opt.id);
                      }}
                      className={`relative shrink-0 snap-start min-w-24 md:min-w-0 rounded-xl border-2 py-2 px-3 transition-all text-center font-medium ${
                        selectedDeliveryDate === opt.id
                          ? "border-emerald-600 bg-linear-to-br from-emerald-50 to-teal-50 text-emerald-700 shadow-sm"
                          : "border-gray-200 hover:border-emerald-300 text-gray-700"
                      }`}>
                      {selectedDeliveryDate === opt.id && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[9px] text-white">
                          ✓
                        </span>
                      )}
                      <div className="text-sm font-bold">{opt.label}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {opt.sub}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slot Selection */}
              {selectedDeliveryDate && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Select Delivery Time
                  </p>
                  {availableSlots.length === 0 ? (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                      <p className="text-sm text-yellow-800">
                        All delivery slots for today have passed. Please select
                        another date.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Morning Slots */}
                      {availableSlots.some((s) => s.window === "morning") && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-2">
                            <span>🌅</span> Morning (8:00 AM - 10:00 AM)
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                            {availableSlots
                              .filter((s) => s.window === "morning")
                              .map((slot) => (
                                <button
                                  key={slot.id}
                                  onClick={() =>
                                    setSelectedDeliverySlot(slot.id)
                                  }
                                  className={`rounded-lg border-2 py-2 px-2 transition-all font-medium ${
                                    selectedDeliverySlot === slot.id
                                      ? "border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm"
                                      : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
                                  }`}>
                                  <p className="text-sm">{slot.label}</p>
                                </button>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Evening Slots */}
                      {availableSlots.some((s) => s.window === "evening") && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-2">
                            <span>🌙</span> Evening (7:00 PM - 10:00 PM)
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                            {availableSlots
                              .filter((s) => s.window === "evening")
                              .map((slot) => (
                                <button
                                  key={slot.id}
                                  onClick={() =>
                                    setSelectedDeliverySlot(slot.id)
                                  }
                                  className={`rounded-lg py-2 px-2 border-2 transition-all text-center font-medium ${
                                    selectedDeliverySlot === slot.id
                                      ? "border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm"
                                      : "border-gray-200 hover:border-emerald-300 text-gray-700 hover:bg-gray-50"
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

              {selectedDeliveryDate && selectedDeliverySlot && (
                <div className="mt-3">
                  <DeliveryScheduleNotice />
                </div>
              )}
            </div>

            {/* Order Notes Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span className="text-xl">📝</span>
                Delivery Instructions (Opt)
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
            <div className="sticky top-24 space-y-4">
              {/* Premium Payment Section */}
              {paymentMethod !== "COD" ? (
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
              ) : (
                <div className="bg-linear-to-br from-green-50 via-emerald-50 to-lime-50 rounded-2xl border border-green-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-gray-900">
                      Payment Method
                    </h3>

                    <Tag color="green" className="font-semibold">
                      Cash on Delivery
                    </Tag>
                  </div>

                  {/* COD Card */}
                  <div className="rounded-xl border border-green-200 bg-white p-4">
                    <div className="flex items-start gap-4">
                      {/* <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl">
                        💵
                      </div> */}

                      <div className="flex-1">
                        {/* <h4 className="font-semibold text-gray-900">
                          <span className="text-xl">💵</span>
                          Pay at Delivery
                        </h4> */}
                        <h4 className="text-base font-semibold mb-3 flex items-center gap-2">
                          <span className="text-xl">💵</span>
                          Pay at Delivery
                        </h4>

                        <p className="mt-1 text-sm text-gray-600">
                          No advance payment required. Pay by{" "}
                          <strong>Cash</strong> or
                          <strong> UPI</strong> when your order is delivered to
                          your doorstep.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Summary Section */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span>📊</span>
                  Order Summary
                </h3>

                <div className="space-y-2 mb-3">
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

                  <Divider className="my-0" />

                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">
                      Total Amount
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      ₹{total}
                    </span>
                  </div>
                </div>

                {deliveryFee === 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg py-1.5 text-center mb-3">
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
                    !selectedAddress ||
                    !isPincodeServiceable ||
                    !selectedDeliveryDate ||
                    !selectedDeliverySlot ||
                    (paymentMethod !== "COD" && !razorpayLoaded)
                  }
                  className="h-11 text-base font-semibold rounded-lg"
                  style={{
                    background: isProcessing ? "#ccc" : "#0F8A5F",
                    borderColor: "#0F8A5F",
                  }}>
                  {paymentMethod === "COD"
                    ? isProcessing
                      ? "⏳ Placing Order..."
                      : `🛒 Place Order • ₹${total}`
                    : !razorpayLoaded
                      ? "⏳ Loading Payment Gateway..."
                      : isProcessing
                        ? "⏳ Processing Payment..."
                        : `💳 Pay Now • ₹${total}`}
                </Button>

                {!selectedAddress && (
                  <p className="text-xs text-red-600 mt-1.5 text-center">
                    Please select an address
                  </p>
                )}
                {selectedAddress && !isPincodeServiceable && (
                  <p className="text-xs text-red-600 mt-1.5 text-center">
                    {pincodeCheck?.message ||
                      "We don't deliver to this address yet."}
                  </p>
                )}
                {selectedAddress &&
                  isPincodeServiceable &&
                  !selectedDeliveryDate && (
                    <p className="text-xs text-red-600 mt-1.5 text-center">
                      Please select a delivery date
                    </p>
                  )}
                {selectedDeliveryDate && !selectedDeliverySlot && (
                  <p className="text-xs text-red-600 mt-1.5 text-center">
                    Please select a time slot
                  </p>
                )}
              </div>

              {/* Security Badge */}
              {paymentMethod !== "COD" && (
                <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">
                    🔐 Your payment is protected by
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    Razorpay Security
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <PartialStockConfirmModal
        open={partialStockModalOpen}
        items={stockCheckItems}
        onConfirm={handlePartialStockConfirm}
        onCancel={() => setPartialStockModalOpen(false)}
        confirmLoading={isProcessing}
      />
    </div>
  );
}
