'use client';

import { useSetDefaultAddress } from '@/hooks/useAddresses';
import { useAuth } from '@/hooks/useAuth';
import { ordersAPI, paymentAPI } from '@/lib/api';
import { DELIVERY_SLOTS } from '@/lib/constants';
import { useCartStore } from '@/store/cartStore';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { App, Button, Divider, Input, Tag } from 'antd';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Checkout Page
 * Address selection, payment method, and order placement
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
    const addressIdFromQuery = searchParams?.get('addressId');
    const defaultAddress = user?.addresses.find(add => add.isDefault);
    const firstAddress = user?.addresses?.[0];
    const defaultAddressId = addressIdFromQuery || defaultAddress?._id || firstAddress?._id || null;
    const [selectedAddress, setSelectedAddress] = useState(defaultAddressId);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedDeliverySlot, setSelectedDeliverySlot] = useState(null);
    const [orderNotes, setOrderNotes] = useState('');

    // Update selected address when user data loads
    useEffect(() => {
        if (user?.addresses && !selectedAddress) {
            const addressIdFromQuery = searchParams?.get('addressId');
            const defaultAddress = user.addresses.find(add => add.isDefault);
            const firstAddress = user.addresses[0];
            const newDefaultAddressId = addressIdFromQuery || defaultAddress?._id || firstAddress?._id || null;
            if (newDefaultAddressId) {
                setSelectedAddress(newDefaultAddressId);
            }
        }
    }, [user?.addresses, selectedAddress, searchParams]);

    // Load Razorpay script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
            console.log('✅ Razorpay script loaded');
            setRazorpayLoaded(true);
        };
        script.onerror = () => {
            console.error('❌ Failed to load Razorpay script');
            message.error('Failed to load payment gateway');
        };
        document.body.appendChild(script);

        return () => {
            // Cleanup: remove script when component unmounts
            document.body.removeChild(script);
        };
    }, [message]);

    // Get coupon from URL params
    const couponParam = searchParams?.get('coupon');
    const appliedCoupon = couponParam ? JSON.parse(couponParam) : null;

    // Check if user has already used this coupon
    useEffect(() => {
        const checkCouponUsage = async () => {
            if (appliedCoupon && appliedCoupon.name && user) {
                try {
                    // Fetch user's orders to check if coupon was already used
                    const response = await ordersAPI.getAll();
                    const userOrders = response?.data?.data || [];

                    const couponUsed = userOrders.some(order =>
                        order.coupon?.code === appliedCoupon.name
                    );

                    if (couponUsed) {
                        message.warning({
                            content: `You have already used the coupon "${appliedCoupon.name}". Each coupon can only be used once per user.`,
                            duration: 5,
                        });
                        // Remove coupon from URL by navigating to checkout without coupon param
                        const urlSearchParams = new URLSearchParams(window.location.search);
                        urlSearchParams.delete('coupon');
                        const newSearch = urlSearchParams.toString();
                        const newPath = window.location.pathname + (newSearch ? '?' + newSearch : '');
                        router.replace(newPath);
                    }
                } catch (error) {
                    console.error('Failed to check coupon usage:', error);
                }
            }
        };

        checkCouponUsage();
    }, [appliedCoupon, user, router, message]);

    // Calculate pricing for display (must match backend logic exactly)
    const subtotal = getTotalPrice();

    // --- DELIVERY FEE LOGIC: Apply ₹90 fee only if subtotal < 1000 (must match backend) ---
    let discount = 0;
    let deliveryFee = subtotal < 1000 ? 90 : 0;
    // Coupon logic disabled
    /*
    if (appliedCoupon && appliedCoupon.name) {
        if (appliedCoupon.name === 'NEW10026') {
            discount = 26;
            deliveryFee = 0; // Free delivery for this coupon
        } else if (appliedCoupon.discount && appliedCoupon.discount > 0) {
            discount = appliedCoupon.discount;
            if (appliedCoupon.freeDelivery) {
                deliveryFee = 0;
            }
        }
    }

    // Free delivery for orders above ₹500
    if (subtotal > 500) {
        deliveryFee = 0;
    }
    */

    const total = Math.max(0, subtotal - discount + deliveryFee);

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            message.error('Please select a delivery address');
            return;
        }

        if (!selectedDeliverySlot) {
            message.error('Please select a delivery slot');
            return;
        }

        if (!razorpayLoaded) {
            message.error('Payment gateway is loading. Please wait...');
            return;
        }

        setIsProcessing(true);

        try {
            // Build order payload with pricing information
            const addressObj = user?.addresses.find(a => a._id === selectedAddress);

            const payload = {
                items: items.map(i => ({
                    product: i.id,
                    quantity: i.quantity,
                    size: i.size,
                    color: i.color,
                    name: i.name,
                })),
                shippingAddress: addressObj || { _id: selectedAddress },
                paymentMethod: 'card', // Only online payment via Razorpay
                // Send pricing information (backend will validate)
                pricing: {
                    subtotal: subtotal,
                    discount: discount,
                    shippingFee: deliveryFee,
                    total: total,
                },
                coupon: appliedCoupon ? {
                    code: appliedCoupon.name,
                    discount: appliedCoupon.discount,
                    freeDelivery: appliedCoupon.freeDelivery || appliedCoupon.name === 'NEW10026'
                } : null,
            };

            console.log('📦 Creating order with payload:', payload);

            const res = await ordersAPI.create(payload);

            if (!res?.data?.success) {
                throw new Error(res?.data?.message || 'Failed to create order');
            }

            const createdOrder = res.data.data;
            console.log('✅ Order created:', createdOrder);

            // --- COD logic disabled (only online payment allowed) ---
            /*
            // Handle COD orders
            if (paymentMethod === 'cod') {
                clearCart();
                message.success('Order placed successfully! Pay on delivery.');

                // Invalidate orders query to refresh
                queryClient.invalidateQueries({ queryKey: ['orders'] });

                router.push(`/orders/${createdOrder._id}`);
                return;
            }
            */

            // Handle online payment via Razorpay (always online now)
            await handleRazorpayPayment(createdOrder._id);

        } catch (err) {
            // console.error('Place order error:', err);
            const errorMessage = err?.message || err?.response?.data?.message || 'Failed to place order';

            if (err?.status === 401 || err?.response?.status === 401) {
                message.error('Please login to place an order');
                router.push('/login');
            } else {
                message.error(errorMessage);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRazorpayPayment = async (orderId) => {
        try {
            console.log('💳 Initiating Razorpay payment for order:', orderId);
            console.log('💰 Payment details:', {
                subtotal,
                discount,
                deliveryFee,
                total,
            });

            // Validate amount before sending
            if (!total || total <= 0) {
                console.error('❌ Invalid total amount:', total);
                message.error('Invalid order total. Please refresh and try again.');
                setIsProcessing(false);
                return;
            }

            // Create Razorpay order with pricing information
            const razorpayRes = await paymentAPI.createRazorpayOrder(orderId, {
                subtotal,
                discount,
                shippingFee: deliveryFee,
                total,
            });

            console.log('📥 Razorpay response:', razorpayRes?.data);

            if (!razorpayRes?.data?.success) {
                const backendMsg = razorpayRes?.data?.message || 'Failed to create payment order';
                console.error('❌ Razorpay init failed:', {
                    success: razorpayRes?.data?.success,
                    message: razorpayRes?.data?.message,
                    error: razorpayRes?.data?.error,
                });
                message.error(backendMsg);
                setIsProcessing(false);
                return;
            }

            const { orderId: razorpayOrderId, amount, currency, keyId } = razorpayRes.data.data;

            if (!razorpayOrderId || !amount || !keyId) {
                console.error('❌ Invalid Razorpay response:', razorpayRes.data.data);
                message.error('Payment initialization failed. Please try again.');
                setIsProcessing(false);
                return;
            }

            console.log('✅ Razorpay order created:', {
                razorpayOrderId,
                amount: amount / 100, // Convert paise to rupees for logging
                currency,
                keyId: keyId.substring(0, 8) + '...',
            });

            // Razorpay checkout options
            const options = {
                key: keyId,
                amount: amount, // Amount in paise
                currency: currency,
                name: 'Iqra Fashion',
                description: `Order Payment - ₹${(amount / 100).toFixed(2)}`,
                order_id: razorpayOrderId,
                handler: async function (response) {
                    // Payment successful - verify on backend
                    console.log('✅ Payment successful from Razorpay, verifying...', {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        signature: response.razorpay_signature?.substring(0, 10) + '...',
                    });

                    try {
                        setIsProcessing(true);

                        const verifyRes = await paymentAPI.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        console.log('📥 Verification response:', verifyRes?.data);

                        if (verifyRes?.data?.success) {
                            clearCart();
                            message.success('Payment successful! Order confirmed.');

                            // Invalidate orders query
                            queryClient.invalidateQueries({ queryKey: ['orders'] });

                            // Navigate to order details page
                            router.push(`/orders/${orderId}`);
                        } else {
                            const errMsg = verifyRes?.data?.message || 'Payment verification failed';
                            console.error('❌ Verification failed:', {
                                success: verifyRes?.data?.success,
                                message: verifyRes?.data?.message,
                            });
                            throw new Error(errMsg);
                        }
                    } catch (verifyError) {
                        console.error('❌ Payment verification error:', {
                            message: verifyError.message,
                            response: verifyError.response?.data,
                        });
                        message.error('Payment verification failed. Please contact support with your Order ID.');
                        setIsProcessing(false);
                        // Still navigate to orders page so user can see pending order
                        router.push('/orders');
                    }
                },
                prefill: {
                    name: `${user?.firstName} ${user?.lastName}`,
                    email: user?.email,
                    contact: user?.phone || '',
                },
                theme: {
                    color: '#0F8A5F',
                },
                modal: {
                    ondismiss: async function () {
                        console.log('⚠️ Payment cancelled by user');

                        try {
                            // Cancel the order when payment is cancelled
                            console.log('🚫 Cancelling order due to payment cancellation:', orderId);
                            await ordersAPI.cancel(orderId, {
                                reason: 'Payment cancelled by user'
                            });

                            message.warning('Payment cancelled. Order has been cancelled.');
                            setIsProcessing(false);
                            router.push('/cart');
                        } catch (cancelError) {
                            console.error('❌ Error cancelling order:', cancelError);
                            message.warning('Payment cancelled. Please check your orders.');
                            setIsProcessing(false);
                            router.push('/orders');
                        }
                    }
                },
            };

            // Open Razorpay checkout
            const razorpay = new window.Razorpay(options);

            razorpay.on('payment.failed', async function (response) {
                console.error('❌ Payment failed:', {
                    code: response.error?.code,
                    description: response.error?.description,
                    source: response.error?.source,
                    step: response.error?.step,
                    reason: response.error?.reason,
                });

                const errorMsg = response.error?.description || response.error?.reason || 'Payment failed. Please try again';

                try {
                    // Cancel the order when payment fails
                    console.log('🚫 Cancelling order due to payment failure:', orderId);
                    await ordersAPI.cancel(orderId, {
                        reason: `Payment failed: ${response.error?.reason || 'Unknown error'}`
                    });

                    message.error(`${errorMsg}. Order has been cancelled.`);
                    setIsProcessing(false);
                    router.push('/cart');
                } catch (cancelError) {
                    console.error('❌ Error cancelling order:', cancelError);
                    message.error(errorMsg);
                    setIsProcessing(false);
                    router.push('/orders');
                }
            });

            console.log('🚀 Opening Razorpay checkout modal...');
            razorpay.open();

        } catch (error) {
            console.error('❌ Razorpay payment error:', {
                message: error?.message,
                response: error?.response?.data,
                stack: error?.stack,
            });

            const errMsg = error?.response?.data?.message || error?.message || 'Failed to initialize payment. Please try again.';
            message.error(errMsg);
            setIsProcessing(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                    <Button type="primary" size="large" onClick={() => router.push('/products')}>
                        Continue Shopping
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 lg:pb-0 ">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4">
                <div className="mx-auto flex max-w-7xl items-center gap-3">
                    <button
                        onClick={() => router.push('/cart')}
                        className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
                    >
                        <ArrowLeftOutlined className="text-xl" />
                    </button>
                    <h1 className="text-xl font-bold">Checkout</h1>
                </div>
            </header>

            {/* Coupon Applied Banner */}
            {appliedCoupon && (
                <div className="mx-auto max-w-7xl px-4 my-4">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="text-green-600 text-xl">🎉</div>
                            <div className=''>
                                <p className="font-semibold text-green-800">Coupon Applied!</p>
                                <p className="text-sm text-green-700">
                                    {appliedCoupon.name} - ₹{appliedCoupon.discount} off
                                    {appliedCoupon.freeDelivery && ' + Free Delivery'}
                                </p>
                            </div>
                        </div>
                        <Tag color="green" className="font-semibold">
                            -₹{discount}
                        </Tag>
                    </div>
                </div>
            )}

            <main className="mx-auto max-w-7xl px-4 py-4">
                {/* Delivery Address Section */}
                <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                        <h2 className="text-lg font-bold">Delivery Address</h2>
                        <div className="flex gap-2">
                            <Button
                                type="link"
                                icon={<PlusOutlined />}
                                onClick={() => {
                                    // Preserve coupon when navigating to add address page
                                    const couponParam = searchParams?.get('coupon');
                                    const url = couponParam
                                        ? `/addresses/add?coupon=${encodeURIComponent(couponParam)}`
                                        : '/addresses/add';
                                    router.push(url);
                                }}
                            >
                                Add New
                            </Button>
                            <Button
                                type="link"
                                onClick={() => {
                                    // Preserve coupon when navigating to manage addresses
                                    const couponParam = searchParams?.get('coupon');
                                    const url = couponParam
                                        ? `/addresses?coupon=${encodeURIComponent(couponParam)}`
                                        : '/addresses';
                                    router.push(url);
                                }}
                                className="text-blue-600"
                            >
                                Manage Addresses
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-3 grid md:grid-cols-2 gap-3">
                        {user?.addresses.map((address) => {
                            const isSelected = selectedAddress === (address.id || address._id);
                            return (
                                <div
                                    key={address.id || address._id}
                                    onClick={() => setSelectedAddress(address.id || address._id)}
                                    className={`cursor-pointer border-2 rounded-lg shadow-sm p-4 transition-all duration-200 hover:shadow-md ${
                                        isSelected
                                            ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-semibold">{address.label}</span>
                                        {address.isDefault && (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                                Default
                                            </span>
                                        )}
                                        {isSelected && (
                                            <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded ml-auto">
                                                Selected
                                            </span>
                                        )}
                                    </div>
                                    <div className="mb-2 flex">
                                        <p className="font-medium text-gray-900 capitalize">{address.fullName} </p>
                                        <p className="text-sm text-gray-600 ms-2"> ({address.phone})</p>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <p className="font-medium">{address.street}</p>
                                        {address.area && <p>{address.area}</p>}
                                        <p>{address.city}, {address.state} - {address.zipCode}</p>
                                        {address.landmark && (
                                            <p className='mt-1'>
                                                <Tag color={'gold'} className="text-xs  text-gray-500">Landmark: {address.landmark}</Tag>
                                            </p>
                                        )}
                                    </div>
                                    {/* Make Default Option */}
                                    {!address.isDefault && (
                                        <Button
                                            size="small"
                                            type="link"
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                try {
                                                    await setDefaultAddress.mutateAsync(address.id || address._id);
                                                    message.success('Set as default address');
                                                } catch (err) {
                                                    message.error(err?.message || 'Failed to set default');
                                                }
                                            }}
                                            className="pl-0 text-emerald-600 mt-2"
                                        >
                                            Make Default
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Order Items Summary */}
                <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                    <h2 className="text-lg font-bold mb-4">Order Items ({items.length})</h2>
                    <div className="space-y-3">
                        {console.log(items)}

                        {items?.map((item) => {
                            console.log(item);
                            return (
                                <div key={item.id} className="flex gap-3">
                                    <div className="h-16 w-16 overflow-hidden rounded-lg bg-gray-100">
                                        {item.images?.[0] ? (
                                                        <Image src={item.images[0]?.url} alt={item.name} fill className="object-cover relative!" sizes="(max-width: 768px) 100vw, 33vw" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-2xl">
                                                📦
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium line-clamp-1">{item.name}</p>
                                         {item.size &&
                                         <button
                                className={`px-2 mr-2 py-0 rounded-lg font-semibold transition-all bg-white text-gray-700 border-2 border-gray-300 hover:border-emerald-400`}
                              >
                                {item.size}
                              </button>}
                              {item.color &&<button
                                className={`px-2 py-0 rounded-lg font-semibold transition-all bg-white text-gray-700 border-2 border-gray-300 hover:border-emerald-400`}
                              >
                                {item.color}
                              </button>}
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-sm text-gray-600">Qty: <span className='font-bold'>{item.quantity}</span> </span>
                                            <span className="font-semibold">₹{item.price * item.quantity}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Delivery Slot Selection */}
                <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                    <h2 className="text-lg font-bold mb-4">📅 Select Delivery Slot</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {DELIVERY_SLOTS.map((slot) => (
                            <button
                                key={slot.id}
                                onClick={() => setSelectedDeliverySlot(slot.id)}
                                className={`rounded-lg p-3 border-2 transition-all text-center font-medium ${
                                    selectedDeliverySlot === slot.id
                                        ? 'border-green-600 bg-green-50 text-green-700'
                                        : 'border-gray-200 hover:border-green-300 text-gray-700'
                                }`}
                            >
                                <div className="text-2xl mb-1">{slot.icon}</div>
                                <div className="text-xs">{slot.label}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Order Notes */}
                <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                    <h2 className="text-lg font-bold mb-3">📝 Order Notes (Optional)</h2>
                    <Input.TextArea
                        placeholder="Add any special instructions for the delivery (e.g., 'Leave at gate', 'Call before delivery')"
                        rows={3}
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        className="rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        💡 Tip: Add delivery instructions or special requests here
                    </p>
                </div>

                {/* Payment Method - Online Only */}
                <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-green-100">
                    <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                        💳 Payment Method
                        <Tag color="green" className="text-xs">Online Only</Tag>
                    </h2>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                        <div className="flex items-start gap-3">
                            <div className="text-3xl">🔒</div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900 mb-1">Secure Online Payment</p>
                                <p className="text-sm text-gray-600 mb-2">
                                    Pay safely using Card, UPI, Wallet, or Net Banking
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <Tag color="blue">💳 Cards</Tag>
                                    <Tag color="purple">📱 UPI</Tag>
                                    <Tag color="orange">💰 Wallets</Tag>
                                    <Tag color="cyan">🏦 Net Banking</Tag>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3 text-center">
                        🛡️ 100% secure payment powered by Razorpay
                    </p>
                </div>
            </main>

            {/* Fixed Bottom Price Summary */}
            <div className=" z-20 border-t border-gray-200 bg-white px-4 py-4 shadow-lg">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-3 space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">₹{subtotal}</span>
                        </div>
                        {appliedCoupon && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Coupon ({appliedCoupon.name})</span>
                                <span className="font-medium text-green-600">-₹{discount}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-gray-600">Delivery Fee</span>
                            <span className="font-medium">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                        </div>
                        <Divider className="my-2" />
                        <div className="flex justify-between text-base font-bold">
                            <span>Total Amount</span>
                            <span className="text-[#0F8A5F]">₹{total}</span>
                        </div>
                    </div>
                    <button
                        onClick={handlePlaceOrder}
                        disabled={isProcessing || !razorpayLoaded}
                        className="w-full rounded-xl bg-[#0F8A5F] py-3 font-semibold text-white transition-all hover:bg-[#0A6B47] active:scale-98 disabled:opacity-50"
                    >
                        {!razorpayLoaded
                            ? 'Loading Payment Gateway...'
                            : isProcessing
                                ? 'Processing Payment...'
                                : `Pay Now • ₹${total}`
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}