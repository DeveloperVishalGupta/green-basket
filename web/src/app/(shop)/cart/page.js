'use client';

import BottomNav from '@/components/layout/BottomNav';
import { useCartStore } from '@/store/cartStore';
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  MinusOutlined,
  PlusOutlined,
  ShoppingOutlined,
  TagOutlined
} from '@ant-design/icons';
import { App, Button, Modal, Tag } from 'antd';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * Shopping Cart Page - Enhanced
 * Modern design with proper cart management and API integration
 */
export default function CartPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [clearModalVisible, setClearModalVisible] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = getTotalPrice();
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  // Set delivery fee: ₹90 if subtotal < 1000, else free
  const deliveryFee = subtotal < 1000 ? 90 : 0;
  const total = subtotal - discount + deliveryFee;

  // Check if all items with sizes have size selected
  const canProceedToCheckout = items.every(item => {
    // If product has sizes available, size selection is mandatory
    if (item.sizes && item.sizes.length > 0) {
      return item.size && item.size.trim() !== '';
    }
    return true; // If no sizes available, no validation needed
  });

  const handleSizeChange = (itemId, size) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      updateQuantity(itemId, item.quantity, size, item.color);
    }
  };

  const handleColorChange = (itemId, color) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      updateQuantity(itemId, item.quantity, item.size, color);
    }
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      message.warning('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Mock coupon validation
      const validCoupons = {
        'NEW10026': { discount: 26, name: 'NEW10026', freeDelivery: true },
        // 'WELCOME10': { discount: subtotal * 0.1, name: 'WELCOME10' },
        // 'SAVE50': { discount: 50, name: 'SAVE50' },
        // 'FLAT100': { discount: 100, name: 'FLAT100' },
      };

      const upperCode = couponCode.toUpperCase();
      if (validCoupons[upperCode]) {
        setAppliedCoupon(validCoupons[upperCode]);
        if (upperCode === 'NEW10026') {
          message.success('Coupon applied! ₹26 off + Free delivery! 🎉');
        } else {
          message.success('Coupon applied successfully!');
        }
      } else {
        message.error('Invalid coupon code');
      }
      setCouponLoading(false);
    }, 800);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    message.info('Coupon removed');
  };

  const handleClearCart = () => {
    clearCart();
    message.success('Cart cleared successfully');
    setClearModalVisible(false);
  };

  const handleRemoveItem = (itemId) => {
    removeItem(itemId);
    message.info('Item removed from cart');
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
              onClick={() => router.push('/')}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-all hover:scale-105"
            >
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
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h3>
            <p className="text-gray-600 mb-8">Add some amazing products to get started!</p>
            <Button 
              type="primary" 
              size="large"
              className="bg-linear-to-r from-emerald-600 to-teal-600 border-0 rounded-xl h-12 px-8 font-semibold shadow-md hover:shadow-lg"
              onClick={() => router.push('/products')}
            >
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
              onClick={() => router.push('/')}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-all hover:scale-105"
            >
              <ArrowLeftOutlined className="text-xl" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-sm text-gray-600">
                {/* <Badge count={items.length} showZero color="#10b981" className="mr-2" /> */}
                {items.length} item{items.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => setClearModalVisible(true)}
            className="text-sm font-semibold text-red-500 hover:text-red-600 flex items-center gap-1 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-all"
          >
            <DeleteOutlined />
            Clear All
          </button>
        </div>
      </header>

      {/* Cart Items */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="space-y-4">
          {items.map((item) => {            
            return (
              <div key={item.id} className="rounded-2xl bg-white p-4 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-emerald-200">
                {/* Mobile-First Layout: Stack vertically on mobile, horizontal on larger screens */}
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Product Image & Basic Info Container */}
                  <div className="flex gap-3 md:gap-4">
                    {/* Product Image */}
                    <div className="h-28 w-28 md:h-32 md:w-32 shrink-0 overflow-hidden rounded-xl bg-linear-to-br from-gray-100 to-gray-200 relative">
                      
                      {item.images && item.images.length > 0 ? (
                        <Image
                          src={item.images[0].url}
                          alt={item.images[0].alt || item.name}
                          width={128}
                          height={128}
                          className="h-full w-full object-cover"
                        />
                      ) : item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={128}
                          height={128}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-4xl">
                          📦
                        </div>
                      )}
                      {/* Stock Badge */}
                      {item.stock !== undefined && (
                        <div className="absolute top-1 left-1 md:top-2 md:left-2">
                          <Tag color={item.stock > 10 ? 'green' : item.stock > 0 ? 'orange' : 'red'} className="text-xs font-semibold">
                            {item.stock > 10 ? 'In Stock' : item.stock > 0 ? `Only ${item.stock} left` : 'Out of Stock'}
                          </Tag>
                        </div>
                      )}
                    </div>

                    {/* Mobile: Basic Info Next to Image */}
                    <div className="flex-1 md:hidden">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-sm line-clamp-2">{item.name}</h3>
                          {/* Price */}
                          <div className="mt-1">
                            <span className="text-lg font-bold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                              ₹{item.price.toLocaleString()}
                            </span>
                            {item.compareAtPrice && item.compareAtPrice > item.price && (
                              <span className="ml-1 text-xs text-gray-400 line-through">
                                ₹{item.compareAtPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="h-7 w-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-all hover:scale-110"
                        >
                          <DeleteOutlined className="text-sm" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Desktop: Product Info */}
                  <div className="hidden md:flex flex-1 flex-col gap-2">
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-base line-clamp-2">{item.name}</h3>
                        {/* Price */}
                        <div className="mt-1">
                          <span className="text-xl font-bold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            ₹{item.price.toLocaleString()}
                          </span>
                          {item.compareAtPrice && item.compareAtPrice > item.price && (
                            <span className="ml-2 text-sm text-gray-400 line-through">
                              ₹{item.compareAtPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {/* Description */}
                        {item.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-all hover:scale-110"
                      >
                        <DeleteOutlined />
                      </button>
                    </div>

                    {/* Size and Color Selection - Desktop */}
                    <div className="space-y-3 flex gap-8">
                      {/* Size Selection */}
                      {item.sizes && item.sizes.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            Select Size {item.size && <span className="text-emerald-600">({item.size})</span>}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {item.sizes.map(size => (
                              <button
                                key={size}
                                onClick={() => handleSizeChange(item.id, size)}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                  item.size === size
                                    ? 'bg-emerald-600 text-white shadow-md'
                                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-emerald-400'
                                }`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                          {!item.size && (
                            <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1">
                              <span className="text-base">⚠️</span> Size required
                            </p>
                          )}
                        </div>
                      )}

                      {/* Color Selection */}
                      {item.colors && item.colors.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            Select Color {item.color && <span className="text-emerald-600">({item.color})</span>}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {item.colors.map(color => (
                              <button
                                key={color}
                                onClick={() => handleColorChange(item.id, color)}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                  item.color === color
                                    ? 'bg-emerald-600 text-white shadow-md'
                                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-emerald-400'
                                }`}
                              >
                                {color}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Display selected size/color if no buttons */}
                      {item.size && (!item.sizes || item.sizes.length === 0) && (
                        <Tag color="blue" className="font-medium">
                          Size: {item.size}
                        </Tag>
                      )}
                      {item.color && (!item.colors || item.colors.length === 0) && (
                        <Tag color="purple" className="font-medium">
                          Color: {item.color}
                        </Tag>
                      )}
                    </div>

                    {/* Quantity and Total - Desktop */}
                    <div className="mt-auto flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 rounded-xl border-2 border-emerald-500 bg-emerald-50 px-3 py-1.5">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="flex h-6 w-6 items-center justify-center text-lg font-bold text-emerald-600 hover:scale-110 transition-transform"
                        >
                          <MinusOutlined className="text-sm" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="flex h-6 w-6 items-center justify-center text-lg font-bold text-emerald-600 hover:scale-110 transition-transform"
                        >
                          <PlusOutlined className="text-sm" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Item Total</p>
                        <p className="text-lg font-bold text-gray-900">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile: Size, Color, and Quantity - Below Image */}
                <div className="md:hidden mt-4 space-y-4">
                  {/* Description */}
                  {item.description && (
                    <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                  )}

                  {/* Size Selection - Mobile */}
                  {item.sizes && item.sizes.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Select Size {item.size && <span className="text-emerald-600">({item.size})</span>}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.sizes.map(size => (
                          <button
                            key={size}
                            onClick={() => handleSizeChange(item.id, size)}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                              item.size === size
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-emerald-400'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                      {!item.size && (
                        <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1">
                          <span className="text-base">⚠️</span> Size required
                        </p>
                      )}
                    </div>
                  )}

                  {/* Color Selection - Mobile */}
                  {item.colors && item.colors.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Select Color {item.color && <span className="text-emerald-600">({item.color})</span>}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.colors.map(color => (
                          <button
                            key={color}
                            onClick={() => handleColorChange(item.id, color)}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                              item.color === color
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-emerald-400'
                            }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Display selected size/color if no buttons - Mobile */}
                  <div className="flex gap-2">
                    {item.size && (!item.sizes || item.sizes.length === 0) && (
                      <Tag color="blue" className="font-medium">
                        Size: {item.size}
                      </Tag>
                    )}
                    {item.color && (!item.colors || item.colors.length === 0) && (
                      <Tag color="purple" className="font-medium">
                        Color: {item.color}
                      </Tag>
                    )}
                  </div>

                  {/* Quantity and Total - Mobile */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 rounded-xl border-2 border-emerald-500 bg-emerald-50 px-3 py-1.5">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="flex h-6 w-6 items-center justify-center text-lg font-bold text-emerald-600 hover:scale-110 transition-transform"
                      >
                        <MinusOutlined className="text-sm" />
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="flex h-6 w-6 items-center justify-center text-lg font-bold text-emerald-600 hover:scale-110 transition-transform"
                      >
                        <PlusOutlined className="text-sm" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Item Total</p>
                      <p className="text-xl font-bold text-gray-900">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 text-center shadow-md hover:shadow-lg transition-all">
            <div className="text-2xl mb-1">🚚</div>
            <p className="text-xs font-semibold text-gray-700">Free Delivery</p>
            <p className="text-xs text-gray-500">on ₹500+</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-md hover:shadow-lg transition-all">
            <div className="text-2xl mb-1">↩️</div>
            <p className="text-xs font-semibold text-gray-700">Easy Returns</p>
            <p className="text-xs text-gray-500">7 days</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-md hover:shadow-lg transition-all">
            <div className="text-2xl mb-1">✅</div>
            <p className="text-xs font-semibold text-gray-700">Secure</p>
            <p className="text-xs text-gray-500">Payment</p>
          </div>
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

        {/* Estimated Delivery */}
        <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 flex items-start gap-3">
          <ClockCircleOutlined className="text-blue-600 text-xl mt-0.5" />
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Estimated Delivery</h4>
            <p className="text-sm text-gray-600">
              Your order will be delivered within <strong className="text-blue-600">7-10 business days</strong>
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
              <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
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
                <p className="text-sm font-semibold text-red-700">Action Required</p>
                <p className="text-xs text-red-600">Please select size for all items that require it</p>
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
                params.set('coupon', JSON.stringify(appliedCoupon));
              }
              // console.log('Proceeding to checkout with params:', params.toString());
              // console.log('Cart items:', `/checkout?${params?.toString()}`);
              router.push(`/checkout?${params?.toString()}`);
            }}
            disabled={!canProceedToCheckout}
            className="w-full bg-linear-to-r from-emerald-600 to-teal-600 border-0 rounded-xl h-12 text-base font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
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
          className: "rounded-lg h-10"
        }}
        cancelButtonProps={{ 
          className: "rounded-lg h-10"
        }}
      >
        <p>Are you sure you want to remove all items from your cart?</p>
      </Modal>
    </div>
  );
}
