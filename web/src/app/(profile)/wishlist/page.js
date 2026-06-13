/**
 * Wishlist Page
 * Display user's saved products with consistent UI
 */

'use client';

import BottomNav from '@/components/layout/BottomNav';
import CartNotification from '@/components/ui/CartNotification';
import { useAuth } from '@/hooks/useAuth';
import { useRemoveFromWishlist, useWishlist } from '@/hooks/useWishlist';
import { calculateDiscount, formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { ArrowLeftOutlined, DeleteOutlined, HeartOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { App, Modal, Spin } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function WishlistPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const { user } = useAuth();
  const { data, isLoading, error } = useWishlist();
  const { mutate: removeFromWishlist } = useRemoveFromWishlist();
  const { addItem } = useCartStore();
  const [removingId, setRemovingId] = useState(null);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [addedProduct, setAddedProduct] = useState(null);

  const wishlistItems = data?.data || [];

  /**
   * Handle remove from wishlist
   */
  const handleRemove = (productId) => {
    Modal.confirm({
      title: 'Remove from Wishlist',
      content: 'Are you sure you want to remove this item from your wishlist?',
      okText: 'Remove',
      okType: 'danger',
      cancelText: 'Cancel',
      centered: true,
      onOk: () => {
        setRemovingId(productId);
        removeFromWishlist(productId, {
          onSuccess: () => {
            message.success('Removed from wishlist');
            setRemovingId(null);
          },
          onError: () => {
            message.error('Failed to remove from wishlist');
            setRemovingId(null);
          },
        });
      },
    });
  };

  /**
   * Handle add to cart
   */
  const handleAddToCart = (product, e) => {
    e.preventDefault();
    addItem(product);
    
    // Show cart notification
    setAddedProduct(product);
    setShowCartNotification(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white/95 pb-20 md:pb-4">
        <div className="flex justify-center items-center min-h-screen">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white/95 pb-20 md:pb-4">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-medium">Failed to load wishlist</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white/95 pb-20 md:pb-4">
      {/* Header */}
      <header className="relative bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-600 px-4 sm:px-6 py-6 sm:py-8 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        <div className="relative container mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeftOutlined className="text-xl" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">My Wishlist</h1>
              <p className="text-emerald-100 text-sm sm:text-base">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Empty State */}
        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-red-100 rounded-full flex items-center justify-center">
                <HeartOutlined className="text-4xl sm:text-5xl text-red-400" />
              </div>
              <div>
                <p className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</p>
                <p className="text-gray-600 text-sm sm:text-base">Start adding products you love!</p>
              </div>
              <button
                onClick={() => router.push('/products')}
                className="mt-4 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors"
              >
                Browse Products
              </button>
            </div>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {wishlistItems.map((item) => {
              const product = item.product;
              if (!product) return null;

              const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
              const discountPercent = hasDiscount
                ? calculateDiscount(product.compareAtPrice, product.price)
                : 0;

              return (
                <div
                  key={item._id}
                  className="group bg-white rounded-lg sm:rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-emerald-300 transition-all duration-300"
                >
                  <Link href={`/products/${product.slug}`}>
                    {/* Product Image */}
                    <div className="relative aspect-square bg-gray-100">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.name}
                          fill
                          className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                          <span className="text-xs sm:text-sm">No Image</span>
                        </div>
                      )}

                      {/* Discount Badge */}
                      {hasDiscount && (
                        <div className="absolute left-2 top-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-lg">
                          -{discountPercent}%
                        </div>
                      )}

                      {/* Out of Stock Overlay */}
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                          <span className="bg-white text-gray-900 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm shadow-lg">
                            Out of Stock
                          </span>
                        </div>
                      )}

                      {/* Remove Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemove(product._id);
                        }}
                        disabled={removingId === product._id}
                        className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 sm:p-2 shadow-md hover:bg-red-50 hover:text-red-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 z-10"
                      >
                        <DeleteOutlined className="text-sm sm:text-base" />
                      </button>
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-3 sm:p-4">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-semibold text-gray-900 hover:text-emerald-600 line-clamp-2 mb-1 sm:mb-2 text-xs sm:text-sm transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    {product.category && (
                      <p className="text-[10px] sm:text-xs text-gray-500 mb-2">{product.category.name}</p>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                      <span className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      {hasDiscount && (
                        <span className="text-[10px] sm:text-xs text-gray-500 line-through">
                          {formatPrice(product.compareAtPrice)}
                        </span>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      disabled={!product.inStock}
                      onClick={(e) => handleAddToCart(product, e)}
                      className={`w-full py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all ${
                        product.inStock
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-lg hover:scale-105'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCartOutlined className="mr-1 sm:mr-2" />
                      {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart Notification */}
      {showCartNotification && addedProduct && (
        <CartNotification
          product={addedProduct}
          onClose={() => setShowCartNotification(false)}
        />
      )}

      <BottomNav />
    </div>
  );
}
