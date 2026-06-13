'use client';

import CartNotification from '@/components/ui/CartNotification';
import { useAuth } from '@/hooks/useAuth';
import { useCheckWishlist, useToggleWishlist } from '@/hooks/useWishlist';
import { useCartStore } from '@/store/cartStore';
import { HeartFilled, HeartOutlined, LoginOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Modal } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Product Card Component
 * Displays product with image, price, discount badge, wishlist button, and add to cart button
 * Shows quantity controls if product is in cart
 */
export default function ProductCard({ product, variant = 'default' }) {
  const { message } = App.useApp();
  const router = useRouter();
  const { user } = useAuth();
  const { addItem, items, updateQuantity, setPendingProduct } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [addedProduct, setAddedProduct] = useState(null);

  // Wishlist functionality
  const productId = product._id || product.id;
  const { data: wishlistCheck } = useCheckWishlist(productId, { enabled: !!user });
  const { toggle: toggleWishlist, isLoading: isTogglingWishlist } = useToggleWishlist();
  const isInWishlist = wishlistCheck?.data?.isInWishlist || false;

  // Check if product is in cart
  const cartItem = items.find(item => item.id === (product._id || product.id));
  const inCart = !!cartItem;
  const quantity = cartItem?.quantity || 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate discount percentage if compareAtPrice exists
  const discount = product.compareAtPrice && product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : product.discount || 0;

  // Determine if product is in stock
  const inStock = product.stock !== undefined ? product.stock > 0 : product.inStock !== false;

  // Get first image URL - handle both string and object formats
  const imageUrl = product.images?.[0]?.url || product.images?.[0] || null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!user) {
      setPendingProduct({
        ...product,
        id: product._id || product.id,
      }, 1);
      setLoginModalVisible(true);
      return;
    }
    
    addItem({
      ...product,
      id: product._id || product.id,
    });
    
    // Show cart notification instead of toast message
    setAddedProduct(product);
    setShowCartNotification(true);
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!user) {
      message.info('Please login to add items to wishlist');
      router.push('/login');
      return;
    }
    
    try {
      await toggleWishlist(productId, isInWishlist);
      message.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist!');
    } catch (error) {
      message.error('Failed to update wishlist');
    }
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    updateQuantity(product._id || product.id, quantity + 1);
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    if (quantity > 1) {
      updateQuantity(product._id || product.id, quantity - 1);
    } else {
      updateQuantity(product._id || product.id, 0); // Remove from cart
      message.info('Item removed from cart');
    }
  };

  const handleLoginRedirect = () => {
    setLoginModalVisible(false);
    router.push('/login');
  };

  return (
    <>
      {/* Cart Notification */}
      {showCartNotification && (
        <CartNotification 
          product={addedProduct} 
          onClose={() => {
            setShowCartNotification(false);
            setAddedProduct(null);
          }}
        />
      )}

      {/* Login Required Modal */}
      <Modal
        open={loginModalVisible}
        onCancel={() => setLoginModalVisible(false)}
        footer={null}
        centered
        width={400}
      >
        <div className="text-center py-4">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-emerald-100 p-4">
              <LoginOutlined className="text-4xl text-emerald-600" />
            </div>
          </div>
          <h3 className="mb-2 text-xl font-bold">Login Required</h3>
          <p className="mb-6 text-gray-600">
            Please login to add items to your cart. Your selected product will be added automatically after login.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setLoginModalVisible(false)}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleLoginRedirect}
              className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
            >
              Login Now
            </button>
          </div>
        </div>
      </Modal>

      <Link
        href={`/products/${product.slug}`}
        className="shrink-0 rounded-xl bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
        style={{ width: variant === 'wide' ? '220px' : '' }}
      >
      <div className="relative mb-3">
        {discount > 0 && (
          <div className="absolute left-0 top-0 z-10 rounded-br-lg rounded-tl-lg bg-red-500 px-2 py-1">
            <span className="text-xs font-bold text-white">{discount}%</span>
            <div className="text-xs text-white">OFF</div>
          </div>
        )}
        
        {/* Organic Badge */}
        {product.isOrganic && (
          <div className="absolute left-0 top-8 z-10 rounded-br-lg bg-green-500 px-2 py-1">
            <span className="text-xs font-bold text-white">🌱 Organic</span>
          </div>
        )}
        
        {/* Fresh Badge */}
        {product.isSeasonalFresh && (
          <div className="absolute left-0 top-16 z-10 rounded-br-lg bg-yellow-500 px-2 py-1">
            <span className="text-xs font-bold text-white">✨ Fresh</span>
          </div>
        )}
        
        {/* Best Seller Badge */}
        {product.isBestSelling && (
          <div className="absolute left-0 bottom-0 z-10 rounded-tr-lg bg-purple-500 px-2 py-1">
            <span className="text-xs font-bold text-white">⭐ Best</span>
          </div>
        )}
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          disabled={isTogglingWishlist}
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white transition-all active:scale-95 disabled:opacity-50"
          title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isInWishlist ? (
            <HeartFilled className="text-red-500 text-lg" />
          ) : (
            <HeartOutlined className="text-gray-600 text-lg" />
          )}
        </button>
        <div className="flex h-32 items-center justify-center overflow-hidden rounded-lg bg-linear-to-br from-gray-100 to-gray-200">
          {imageUrl ? (
            <Image src={imageUrl} alt={product.name} fill className="object-cover rounded" sizes="(max-width: 768px) 100vw, 33vw" />
          ) : (
            <div className="text-4xl text-gray-300">📦</div>
          )}
        </div>
      </div>
      
      <div>
        {product.brand && <p className="mb-1 text-xs text-gray-500">{product.brand}</p>}
        <h3 className="text-sm min-h-10 clamp-2 font-medium leading-tight text-gray-900 line-clamp-2">
          {product.name}
        </h3>
        
        {/* Unit and Stock Info */}
        <div className="mb-1 flex items-center justify-between text-xs">
          {product.unit && (
            <span className="text-gray-600">Per {product.unit}</span>
          )}
          {product.stock !== undefined && (
            <span className={`font-semibold ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
              {product.stock > 0 ? `${product.stock}` : 'Out'}
            </span>
          )}
        </div>
        
        <div className="mb-2 flex items-center gap-2">
          {(product.originalPrice > product.price || product.compareAtPrice) && (
            <span className="text-xs text-gray-400 line-through">
              ₹{product.originalPrice || product.compareAtPrice}
            </span>
          )}
          <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
        </div>
        
        {inStock ? (
          mounted && inCart ? (
            <div className="flex items-center justify-between w-full rounded-lg border-2 border-emerald-600 bg-emerald-50 px-2 py-1.5">
              <button
                onClick={handleDecrement}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white hover:bg-emerald-100 text-emerald-600 font-bold transition-all active:scale-95"
              >
                <MinusOutlined className="text-sm" />
              </button>
              <span className="font-bold text-emerald-600 text-base">{quantity}</span>
              <button
                onClick={handleIncrement}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white hover:bg-emerald-100 text-emerald-600 font-bold transition-all active:scale-95"
              >
                <PlusOutlined className="text-sm" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="w-full rounded-lg border-2 border-[#0F8A5F] bg-white py-2 text-sm font-semibold text-[#0F8A5F] transition-all hover:bg-[#0F8A5F] hover:text-white active:scale-95"
            >
              ADD
            </button>
          )
        ) : (
          <button
            disabled
            className="w-full rounded-lg border-2 border-gray-300 bg-gray-100 py-2 text-sm font-semibold text-gray-400 cursor-not-allowed"
          >
            OUT OF STOCK
          </button>
        )}
      </div>
    </Link>
    </>
  );
}
