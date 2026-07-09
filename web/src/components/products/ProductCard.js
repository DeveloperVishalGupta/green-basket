/**
 * Product Card Component
 * Displays product information with image, name, price, and add to cart button
 */

"use client";

import Button from "@/components/ui/Button";
import CartNotification from "@/components/ui/CartNotification";
import { useAuth } from "@/hooks/useAuth";
import { useToggleWishlist, useWishlist } from "@/hooks/useWishlist";
import { calculateDiscount, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { LoginOutlined } from "@ant-design/icons";
import { App, Modal } from "antd";
import { Heart, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * ProductCard component
 * @param {Object} props
 * @param {Object} props.product - Product data
 * @param {string} props.product.id - Product ID
 * @param {string} props.product.name - Product name
 * @param {string} props.product.slug - Product slug for URL
 * @param {number} props.product.price - Current price
 * @param {number} props.product.compareAtPrice - Original price (for discount)
 * @param {Array} props.product.images - Array of product images
 * @param {boolean} props.product.inStock - Stock availability
 */
export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [addedProduct, setAddedProduct] = useState(null);
  const { message } = App.useApp();
  const router = useRouter();
  const { user } = useAuth();
  const { addItem, isInCart, setPendingProduct } = useCartStore();

  // Wishlist functionality — use shared full-wishlist query (one request, not one-per-card)
  const productId = product._id || product.id;
  const { data: wishlistData } = useWishlist({ enabled: !!user });
  const { toggle: toggleWishlist, isLoading: isTogglingWishlist } =
    useToggleWishlist();
  const wishlistItems = wishlistData?.data?.items || wishlistData?.data || [];
  const isInWishlist = Array.isArray(wishlistItems)
    ? wishlistItems.some((w) => {
        const wId = w.product?._id || w.product || w._id;
        return wId?.toString() === productId?.toString();
      })
    : false;

  const inCart = isInCart(product.id);
  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? calculateDiscount(product.compareAtPrice, product.price)
    : 0;

  /**
   * Handle add to cart
   */
  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent Link navigation

    // Check if user is logged in
    if (!user) {
      setPendingProduct(product, 1);
      setLoginModalVisible(true);
      return;
    }

    addItem(product);

    // Show cart notification
    setAddedProduct(product);
    setShowCartNotification(true);
  };

  /**
   * Handle wishlist toggle
   */
  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setLoginModalVisible(true);
      return;
    }

    try {
      await toggleWishlist(productId);
      message.success(
        isInWishlist ? "Removed from wishlist" : "Added to wishlist",
      );
    } catch (error) {
      message.error("Failed to update wishlist");
    }
  };

  const handleLoginRedirect = () => {
    setLoginModalVisible(false);
    router.push("/login");
  };

  return (
    <>
      {/* Login Required Modal */}
      <Modal
        open={loginModalVisible}
        onCancel={() => setLoginModalVisible(false)}
        footer={null}
        centered
        width={400}>
        <div className="text-center py-4">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-emerald-100 p-4">
              <LoginOutlined className="text-4xl text-emerald-600" />
            </div>
          </div>
          <h3 className="mb-2 text-xl font-bold">Login Required</h3>
          <p className="mb-6 text-gray-600">
            Please login to add items to your cart. Your selected product will
            be added automatically after login.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setLoginModalVisible(false)}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleLoginRedirect}
              className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700">
              Login Now
            </button>
          </div>
        </div>
      </Modal>

      <Link
        href={`/products/${product.slug}`}
        className="group block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}>
        <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:border-gray-300 hover:shadow-lg">
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0].url || "/placeholder-product.jpg"}
                alt={product.name}
                fill
                className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-200 text-gray-400">
                No Image
              </div>
            )}

            {/* Discount Badge */}
            {hasDiscount && (
              <div className="absolute left-2 top-2 rounded-md bg-red-500 px-2 py-1 text-xs font-bold text-white">
                -{discountPercent}%
              </div>
            )}

            {/* Organic Badge */}
            {product.isOrganic && (
              <div className="absolute left-2 top-12 rounded-md bg-green-500 px-2 py-1 text-xs font-bold text-white">
                🌱 Organic
              </div>
            )}

            {/* Fresh/Seasonal Badge */}
            {product.isSeasonalFresh && (
              <div className="absolute left-2 top-24 rounded-md bg-yellow-500 px-2 py-1 text-xs font-bold text-white">
                ✨ Fresh
              </div>
            )}

            {/* Best Selling Badge */}
            {product.isBestSelling && (
              <div className="absolute left-2 bottom-2 rounded-md bg-purple-500 px-2 py-1 text-xs font-bold text-white">
                ⭐ Best Seller
              </div>
            )}

            {/* Out of Stock Badge */}
            {!product.inStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="rounded-md bg-white px-4 py-2 font-semibold text-gray-900">
                  Out of Stock
                </span>
              </div>
            )}

            {/* Wishlist Button */}
            <button
              onClick={handleWishlistToggle}
              disabled={isTogglingWishlist}
              className={`absolute right-2 top-2 rounded-full p-2 shadow-md transition-all hover:scale-110 ${
                isInWishlist
                  ? "bg-red-500 text-white opacity-100"
                  : "bg-white text-gray-700 opacity-0 group-hover:opacity-100"
              }`}>
              <Heart
                className={`h-5 w-5 ${isInWishlist ? "fill-current" : ""}`}
              />
            </button>
          </div>

          {/* Product Info */}
          <div className="p-4">
            {/* Product Name */}
            <h3 className="mb-1 text-base font-semibold text-gray-900 line-clamp-1 group-hover:text-black">
              {product.name}
            </h3>

            {/* Category */}
            {product.category && (
              <p className="mb-2 text-sm text-gray-500">
                {product.category.name}
              </p>
            )}

            {/* Unit and Stock Info */}
            <div className="mb-2 flex items-center justify-between text-sm">
              {product.unit && (
                <span className="text-gray-600">Per {product.unit}</span>
              )}
              {product.stock && (
                <span
                  className={`font-semibold ${product.stock > 10 ? "text-green-600" : product.stock > 0 ? "text-yellow-600" : "text-red-600"}`}>
                  {product.stock > 0
                    ? `${product.stock} in stock`
                    : "Out of stock"}
                </span>
              )}
            </div>

            {/* Price */}
            <div className="mb-3 flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Add to Cart Button */}
            <Button
              variant={inCart ? "secondary" : "primary"}
              size="sm"
              fullWidth
              disabled={!product.inStock}
              onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              {inCart ? "In Cart" : "Add to Cart"}
            </Button>
          </div>
        </div>
      </Link>

      {/* Cart Notification */}
      {showCartNotification && addedProduct && (
        <CartNotification
          product={addedProduct}
          onClose={() => setShowCartNotification(false)}
        />
      )}
    </>
  );
}
