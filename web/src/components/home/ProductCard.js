"use client";

import CartNotification from "@/components/ui/CartNotification";
import { useAuth } from "@/hooks/useAuth";
import { useToggleWishlist, useWishlist } from "@/hooks/useWishlist";
import { useCartStore } from "@/store/cartStore";
import {
  HeartFilled,
  HeartOutlined,
  LoginOutlined,
  MinusOutlined,
  PlusOutlined,
  StarFilled,
} from "@ant-design/icons";
import { App, Modal } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProductCard({ product }) {
  const { message } = App.useApp();
  const router = useRouter();
  const { user } = useAuth();
  const { addItem, items, updateQuantity, setPendingProduct } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [addedProduct, setAddedProduct] = useState(null);

  // Variant selection
  const hasVariants =
    Array.isArray(product.variants) && product.variants.length > 0;
  const defaultVariant = hasVariants
    ? product.variants.find((v) => v.isDefault) || product.variants[0]
    : null;
  const [selectedVariant, setSelectedVariant] = useState(defaultVariant);

  // Wishlist
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

  // Cart key is unique per product + variant
  const variantId = selectedVariant?._id || selectedVariant?.id;
  const cartItemKey = variantId ? `${productId}_${variantId}` : productId;
  const cartItem = items.find((item) => item.id === cartItemKey);
  const inCart = !!cartItem;
  const quantity = cartItem?.quantity || 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Price derived from selected variant, falling back to product-level fields
  const currentPrice =
    selectedVariant?.price ?? product.price ?? product.startingPrice ?? 0;
  const compareAtPrice =
    selectedVariant?.compareAtPrice ??
    product.compareAtPrice ??
    product.originalPrice;
  const discount =
    compareAtPrice && compareAtPrice > currentPrice
      ? Math.round(((compareAtPrice - currentPrice) / compareAtPrice) * 100)
      : product.discount || 0;

  const inStock =
    product.stock !== undefined ? product.stock > 0 : product.inStock !== false;

  // Image
  const imageUrl = product.images?.[0]?.url || product.images?.[0] || null;

  // Category & rating
  const categoryName =
    product.categories?.[0]?.name || product.category || product.brand || "";
  const ratingAvg =
    product.rating?.average ??
    (typeof product.rating === "number" ? product.rating : 0);
  const ratingCount = product.rating?.count ?? product.ratingCount ?? 0;

  const handleAddToCart = (e) => {
    const renderCount = 0;
    console.log("Render count:", renderCount + 1);
    e.preventDefault();
    if (!user) {
      setPendingProduct(
        { ...product, id: cartItemKey, price: currentPrice, selectedVariant },
        1,
      );
      setLoginModalVisible(true);
      return;
    }
    addItem({
      ...product,
      id: cartItemKey,
      price: currentPrice,
      selectedVariant,
    });
    setAddedProduct(product);
    setShowCartNotification(true);
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    if (!user) {
      message.info("Please login to add items to wishlist");
      router.push("/login");
      return;
    }
    try {
      await toggleWishlist(productId, isInWishlist);
      message.success(
        isInWishlist ? "Removed from wishlist" : "Added to wishlist!",
      );
    } catch (error) {
      message.error("Failed to update wishlist");
    }
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    updateQuantity(cartItemKey, quantity + 1);
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    if (quantity > 1) {
      updateQuantity(cartItemKey, quantity - 1);
    } else {
      updateQuantity(cartItemKey, 0);
      message.info("Item removed from cart");
    }
  };

  const handleLoginRedirect = () => {
    setLoginModalVisible(false);
    router.push("/login");
  };

  return (
    <>
      {showCartNotification && (
        <CartNotification
          product={addedProduct}
          onClose={() => {
            setShowCartNotification(false);
            setAddedProduct(null);
          }}
        />
      )}

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
        className="flex flex-col rounded-2xl bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
        {/* ── Image area ── */}
        <div className="relative mb-3">
          {/* Discount badge only */}
          {discount > 0 && (
            <div className="absolute left-2 top-2 z-10">
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                {discount}% OFF
              </span>
            </div>
          )}

          {/* Wishlist button */}
          <button
            onClick={handleWishlistToggle}
            disabled={isTogglingWishlist}
            className="absolute right-0 top-0 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}>
            {isInWishlist ? (
              <HeartFilled className="text-red-500 text-base" />
            ) : (
              <HeartOutlined className="text-gray-400 text-base" />
            )}
          </button>

          {/* Product image */}
          <div className="relative flex h-36 items-center justify-center overflow-hidden rounded-xl bg-gray-50">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-contain p-2"
                sizes="(max-width: 768px) 50vw, 200px"
              />
            ) : (
              <div className="text-4xl text-gray-300">📦</div>
            )}
          </div>
        </div>

        {/* ── Info area ── */}
        <div className="flex flex-1 flex-col gap-1">
          {/* Name */}
          <h3 className="text-sm font-bold leading-tight text-gray-900 line-clamp-2 capitalize">
            {product.name}
          </h3>

          {/* Category */}
          {categoryName && (
            <p className="text-xs text-gray-500">{categoryName}</p>
          )}

          {/* Rating */}
          {ratingAvg > 0 && (
            <div className="flex items-center gap-1">
              <StarFilled className="text-yellow-400 text-xs" />
              <span className="text-xs font-semibold text-gray-700">
                {ratingAvg.toFixed(1)}
              </span>
              {ratingCount > 0 && (
                <span className="text-xs text-gray-400">({ratingCount})</span>
              )}
            </div>
          )}

          {/* Variant dropdown */}
          {hasVariants && (
            <div
              onClick={(e) => e.preventDefault()}
              onMouseDown={(e) => e.stopPropagation()}
              className="mt-1">
              <select
                value={variantId}
                onChange={(e) => {
                  const v = product.variants.find(
                    (v) => (v._id || v.id) === e.target.value,
                  );
                  setSelectedVariant(v);
                }}
                className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 focus:border-emerald-500 focus:outline-none cursor-pointer">
                {product.variants.map((v) => (
                  <option key={v._id || v.id} value={v._id || v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Price row */}
          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
            <span className="text-base font-bold text-gray-900">
              ₹{currentPrice}
            </span>
            {compareAtPrice > currentPrice && (
              <span className="text-xs text-gray-400 line-through">
                ₹{compareAtPrice}
              </span>
            )}
            {discount > 0 && (
              <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-600">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Stock info */}
          {product.stock !== undefined && (
            <div className="flex items-center gap-1 text-xs">
              <span
                className={`h-2 w-2 rounded-full shrink-0 ${product.stock > 0 ? "bg-green-500" : "bg-red-500"}`}
              />
              <span
                className={
                  product.stock > 0
                    ? "text-green-600 font-medium"
                    : "text-red-600 font-medium"
                }>
                {product.stock > 0
                  ? `In Stock (${product.stock} ${product.stockUnit || "g"})`
                  : "Out of Stock"}
              </span>
            </div>
          )}

          {/* Add to cart / quantity controls */}
          <div className="mt-auto pt-2">
            {inStock ? (
              mounted && inCart ? (
                <div className="flex items-center justify-between w-full rounded-lg border-2 border-emerald-600 bg-emerald-50 px-2 py-1.5">
                  <button
                    onClick={handleDecrement}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white hover:bg-emerald-100 text-emerald-600 font-bold transition-all active:scale-95">
                    <MinusOutlined className="text-sm" />
                  </button>
                  <span className="font-bold text-emerald-600 text-base">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrement}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white hover:bg-emerald-100 text-emerald-600 font-bold transition-all active:scale-95">
                    <PlusOutlined className="text-sm" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-bold text-white transition-all hover:bg-emerald-700 active:scale-95">
                  + ADD
                </button>
              )
            ) : (
              <button
                disabled
                className="w-full rounded-lg border-2 border-gray-300 bg-gray-100 py-2 text-sm font-semibold text-gray-400 cursor-not-allowed">
                OUT OF STOCK
              </button>
            )}
          </div>
        </div>
      </Link>
    </>
  );
}
