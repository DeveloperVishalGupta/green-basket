"use client";

import ProductCard from "@/components/home/ProductCard";
import BottomNav from "@/components/layout/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import {
  useProduct,
  useProducts,
  useTrendingProducts,
} from "@/hooks/useProducts";
import { useCheckWishlist, useToggleWishlist } from "@/hooks/useWishlist";
import { useCartStore } from "@/store/cartStore";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  FacebookOutlined,
  HeartFilled,
  HeartOutlined,
  LinkOutlined,
  MinusOutlined,
  PlusOutlined,
  ShareAltOutlined,
  ShoppingCartOutlined,
  StarFilled,
  TwitterOutlined,
  WhatsAppOutlined,
} from "@ant-design/icons";
import { App, Modal, Spin } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useRef, useState } from "react";

/**
 * Product Detail Page
 * Schema fields used: variants[], categories[], isOrganic/isSeasonal/isBestSeller/isFeatured,
 * healthBenefits[], storageInstructions, rating{average,count}, stock, stockUnit, sellingType, sku
 */
export default function ProductDetailPage({ params }) {
  const { message } = App.useApp();
  const router = useRouter();
  const { user } = useAuth();
  const { addItem, items, updateQuantity, setPendingProduct } = useCartStore();
  const { slug } = use(params);

  // ── UI state ──
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [cartLoginModal, setCartLoginModal] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedVariant, setSelectedVariant] = useState(null);
  const rafRef = useRef(null);
  const pendingPosRef = useRef({ x: 0, y: 0 });

  // ── Data fetching ──
  const {
    data: productData,
    isLoading,
    error,
  } = useProduct(slug, { enabled: !!slug });
  const product = productData?.data;

  // Wishlist via real API hook
  const productId = product?._id || product?.id;
  const { data: wishlistCheck } = useCheckWishlist(productId, {
    enabled: !!productId && !!user,
  });
  const { toggle: toggleWishlist, isLoading: isTogglingWishlist } =
    useToggleWishlist();
  const isInWishlist = wishlistCheck?.data?.isInWishlist || false;

  const { data: trendingData } = useTrendingProducts({ enabled: !!product });
  const trendingProducts = trendingData?.data || [];

  // categories[] is a populated array of { _id, name, slug }
  const primaryCategory =
    typeof product?.categories?.[0] === "object" ? product.categories[0] : null;
  const primaryCategoryId = primaryCategory?._id;

  const { data: relatedData } = useProducts(
    { category: primaryCategoryId, limit: 8 },
    { enabled: !!primaryCategoryId },
  );
  const relatedProducts = (relatedData?.data || []).filter(
    (p) => p._id !== product?._id,
  );

  // ── Variants ──
  const hasVariants =
    Array.isArray(product?.variants) && product.variants.length > 0;

  useEffect(() => {
    if (product && hasVariants && !selectedVariant) {
      const def =
        product.variants.find((v) => v.isDefault) || product.variants[0];
      setSelectedVariant(def);
    }
  }, [product]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cart: key mirrors ProductCard format (productId_variantId) ──
  const variantId = selectedVariant?._id || selectedVariant?.id;
  const cartItemKey = variantId ? `${productId}_${variantId}` : productId;
  const cartItem = product
    ? items.find((item) => item.id === cartItemKey)
    : null;
  const inCart = !!cartItem;

  // ── Pricing from selected variant ──
  const currentPrice = selectedVariant?.price ?? product?.startingPrice ?? 0;
  const compareAtPrice = selectedVariant?.compareAtPrice ?? null;
  const discount =
    compareAtPrice && compareAtPrice > currentPrice
      ? Math.round(((compareAtPrice - currentPrice) / compareAtPrice) * 100)
      : 0;

  // ── Derived values ──
  const inStock =
    product?.stock !== undefined
      ? product.stock > 0
      : product?.inStock !== false;
  const ratingAvg = product?.rating?.average ?? 0;
  const ratingCount = product?.rating?.count ?? 0;

  // Tags derived from boolean schema fields (no separate tags[] in schema)
  const productTags = [];
  if (product?.isOrganic)
    productTags.push({
      label: "Organic",
      emoji: "🌱",
      cls: "bg-green-50 text-green-700 border-green-200",
    });
  if (product?.isSeasonal || product?.isSeasonalFresh)
    productTags.push({
      label: "Seasonal",
      emoji: "🌤️",
      cls: "bg-sky-50 text-sky-700 border-sky-200",
    });
  if (product?.isBestSeller || product?.isBestSelling)
    productTags.push({
      label: "Best Seller",
      emoji: "⭐",
      cls: "bg-amber-50 text-amber-700 border-amber-200",
    });
  if (product?.isFeatured)
    productTags.push({
      label: "Featured",
      emoji: "🏆",
      cls: "bg-purple-50 text-purple-700 border-purple-200",
    });

  const handleWishlistToggle = async () => {
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
    } catch {
      message.error("Failed to update wishlist");
    }
  };

  const requestAnim = useCallback((cb) => {
    if (typeof window !== "undefined" && window.requestAnimationFrame) {
      return window.requestAnimationFrame(cb);
    }
    return setTimeout(cb, 16);
  }, []);

  const cancelAnim = useCallback((id) => {
    if (typeof window !== "undefined" && window.cancelAnimationFrame) {
      window.cancelAnimationFrame(id);
      return;
    }
    clearTimeout(id);
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // Batch updates via requestAnimationFrame (or fallback) to avoid excessive state changes
      pendingPosRef.current = { x, y };
      if (rafRef.current) return;

      rafRef.current = requestAnim(() => {
        setMousePosition(pendingPosRef.current);
        rafRef.current = null;
      });
    },
    [requestAnim],
  );

  // Cleanup any pending animation frame / timeout on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnim(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [cancelAnim]);

  const handleMouseEnter = () => {
    setIsImageZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsImageZoomed(false);
  };

  const handleShare = () => {
    setShareModalVisible(true);
  };

  const shareProduct = (platform) => {
    const url = window.location.href;
    const text = `Check out ${product.name} at Apna Bazaar!`;

    let shareUrl;
    switch (platform) {
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        message.success("Link copied to clipboard!");
        setShareModalVisible(false);
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank");
      setShareModalVisible(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-500 font-medium">Loading product…</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm px-6">
          <div className="text-7xl mb-6">😞</div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">
            Product Not Found
          </h1>
          <p className="text-gray-500 mb-6 text-sm">
            This product doesn&apos;t exist or has been removed.
          </p>
          <button
            onClick={() => router.push("/products")}
            className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-all">
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!user) {
      setPendingProduct(
        { ...product, id: cartItemKey, price: currentPrice, selectedVariant },
        quantity,
      );
      setCartLoginModal(true);
      return;
    }
    if (inCart) {
      updateQuantity(cartItemKey, (cartItem?.quantity || 0) + quantity);
      message.success("Cart updated!");
    } else {
      addItem(
        { ...product, id: cartItemKey, price: currentPrice, selectedVariant },
        quantity,
      );
      message.success("Added to cart!");
    }
  };

  const handleIncrementCart = () => {
    updateQuantity(cartItemKey, (cartItem?.quantity || 0) + 1);
  };

  const handleDecrementCart = () => {
    if (cartItem && cartItem.quantity > 1) {
      updateQuantity(cartItemKey, cartItem.quantity - 1);
    } else {
      updateQuantity(cartItemKey, 0);
      message.info("Item removed from cart");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-28 lg:pb-8">
        {/* ── Sticky header ── */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
            <button
              onClick={() => router.back()}
              className="shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-all">
              <ArrowLeftOutlined className="text-base text-gray-700" />
            </button>
            <span className="flex-1 font-semibold text-gray-800 text-sm truncate capitalize">
              {product.name}
            </span>
            <div className="shrink-0 flex items-center gap-2">
              <button
                onClick={handleShare}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 hover:bg-blue-100 transition-all">
                <ShareAltOutlined className="text-blue-600 text-base" />
              </button>
              <button
                onClick={handleWishlistToggle}
                disabled={isTogglingWishlist}
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all disabled:opacity-50 ${
                  isInWishlist ? "bg-red-50" : "bg-gray-100 hover:bg-red-50"
                }`}>
                {isInWishlist ? (
                  <HeartFilled className="text-red-500 text-base" />
                ) : (
                  <HeartOutlined className="text-gray-500 text-base" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* ── Main content ── */}
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
            {/* ── Left column: images ── */}
            <div className="space-y-3 lg:sticky lg:top-20 lg:self-start">
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 aspect-square">
                {discount > 0 && (
                  <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm pointer-events-none">
                    {discount}% OFF
                  </div>
                )}
                <div
                  className="w-full h-full relative overflow-hidden cursor-zoom-in"
                  onMouseMove={handleMouseMove}
                  onMouseEnter={() => setIsImageZoomed(true)}
                  onMouseLeave={() => setIsImageZoomed(false)}>
                  {product.images?.length > 0 ? (
                    <Image
                      src={product.images[selectedImageIndex]?.url}
                      alt={product.name}
                      fill
                      priority
                      className="object-contain p-6 transition-transform duration-200 ease-out"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      style={{
                        transform: isImageZoomed
                          ? `scale(2) translate(${(50 - mousePosition.x) / 2}%, ${(50 - mousePosition.y) / 2}%)`
                          : "scale(1)",
                        transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-6xl">📦</span>
                    </div>
                  )}
                </div>
              </div>

              {product.images?.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImageIndex(i)}
                      className={`relative shrink-0 h-16 w-16 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImageIndex === i
                          ? "border-emerald-500 shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                      }`}>
                      <Image
                        src={img.url}
                        alt={`${product.name} ${i + 1}`}
                        fill
                        className="object-contain p-1"
                        sizes="64px"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* ── Delivery & trust info (desktop sidebar) ── */}
              <div className="hidden lg:flex flex-col gap-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {[
                  {
                    emoji: "🚚",
                    title: "Free Delivery",
                    sub: "On orders above ₹199",
                  },
                  {
                    emoji: "✅",
                    title: "Quality Assured",
                    sub: "Freshness guaranteed on every order",
                  },
                  {
                    emoji: "🔄",
                    title: "Easy Returns",
                    sub: "Hassle-free replacement or refund",
                  },
                  {
                    emoji: "🛡️",
                    title: "Secure Payments",
                    sub: "100% safe & encrypted checkout",
                  },
                ].map((item, i, arr) => (
                  <div
                    key={item.title}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      i < arr.length - 1 ? "border-b border-gray-100" : ""
                    }`}>
                    <span className="text-xl shrink-0">{item.emoji}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 leading-tight">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right column: details ── */}
            <div className="space-y-5">
              {/* Category chip */}
              {primaryCategory?.name && (
                <span className="inline-block text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  {primaryCategory.name}
                </span>
              )}

              {/* Name */}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 capitalize leading-snug">
                {product.name}
              </h1>

              {/* Rating */}
              {ratingAvg > 0 && (
                <div className="flex items-center gap-1.5">
                  <StarFilled className="text-yellow-400 text-sm" />
                  <span className="font-bold text-gray-800">
                    {ratingAvg.toFixed(1)}
                  </span>
                  {ratingCount > 0 && (
                    <span className="text-gray-400 text-sm">
                      ({ratingCount} ratings)
                    </span>
                  )}
                </div>
              )}

              {/* ── Product Tags ── */}
              {productTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {productTags.map((tag) => (
                    <span
                      key={tag.label}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${tag.cls}`}>
                      <span role="img" aria-label={tag.label}>
                        {tag.emoji}
                      </span>
                      {tag.label}
                    </span>
                  ))}
                </div>
              )}

              {/* ── Variant selector ── */}
              {hasVariants && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Select Pack Size
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => {
                      const isSelected =
                        (selectedVariant?._id || selectedVariant?.id) ===
                        (v._id || v.id);
                      const varDiscount =
                        v.compareAtPrice && v.compareAtPrice > v.price
                          ? Math.round(
                              ((v.compareAtPrice - v.price) /
                                v.compareAtPrice) *
                                100,
                            )
                          : 0;
                      return (
                        <button
                          key={v._id || v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={`flex flex-col items-center px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all active:scale-95 ${
                            isSelected
                              ? "border-emerald-600 bg-emerald-600 text-white shadow-md"
                              : "border-gray-200 bg-white text-gray-700 hover:border-emerald-400 hover:bg-emerald-50"
                          }`}>
                          <span>{v.label}</span>
                          <span
                            className={`text-xs font-bold mt-0.5 ${
                              isSelected
                                ? "text-emerald-100"
                                : "text-emerald-600"
                            }`}>
                            ₹{v.price}
                            {varDiscount > 0 && (
                              <span
                                className={`ml-1 ${
                                  isSelected
                                    ? "text-emerald-200"
                                    : "text-gray-400 line-through"
                                }`}>
                                ₹{v.compareAtPrice}
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Price card ── */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-4xl font-bold text-gray-900">
                    ₹{currentPrice}
                  </span>
                  {compareAtPrice > currentPrice && (
                    <>
                      <span className="text-xl text-gray-400 line-through">
                        ₹{compareAtPrice}
                      </span>
                      <span className="text-sm font-semibold text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
                        Save ₹{compareAtPrice - currentPrice}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-3 text-sm">
                  <span
                    className={`h-2 w-2 rounded-full shrink-0 ${
                      inStock ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <span
                    className={
                      inStock
                        ? "text-green-600 font-medium"
                        : "text-red-600 font-medium"
                    }>
                    {inStock
                      ? `In Stock (${product.stock} ${product.stockUnit || "g"})`
                      : "Out of Stock"}
                  </span>
                </div>
              </div>

              {/* ── Desktop: quantity + add to cart ── */}
              <div className="hidden lg:block space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-700 w-8">
                    Qty
                  </span>
                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="h-10 w-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-40">
                      <MinusOutlined className="text-xs" />
                    </button>
                    <span className="w-12 text-center font-bold text-gray-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={quantity >= product.stock}
                      className="h-10 w-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-40">
                      <PlusOutlined className="text-xs" />
                    </button>
                  </div>
                </div>

                {inCart ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-emerald-50 border-2 border-emerald-500 rounded-xl px-4 py-3">
                      <span className="font-semibold text-emerald-700">
                        In Cart:
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleDecrementCart}
                          className="h-8 w-8 flex items-center justify-center rounded-lg border-2 border-emerald-600 bg-white text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all">
                          <MinusOutlined className="text-xs" />
                        </button>
                        <span className="font-bold text-emerald-600 w-8 text-center text-lg">
                          {cartItem?.quantity || 0}
                        </span>
                        <button
                          onClick={handleIncrementCart}
                          className="h-8 w-8 flex items-center justify-center rounded-lg border-2 border-emerald-600 bg-white text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all">
                          <PlusOutlined className="text-xs" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push("/cart")}
                      className="w-full h-12 rounded-xl border-2 border-emerald-600 text-emerald-600 font-semibold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2">
                      <ShoppingCartOutlined /> View Cart
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    disabled={!inStock}
                    className="w-full h-12 rounded-xl bg-emerald-600 text-white font-bold text-base hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    <ShoppingCartOutlined />
                    {inStock ? "+ Add to Cart" : "Out of Stock"}
                  </button>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="pt-5 border-t border-gray-100">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Health Benefits (schema field: healthBenefits[]) */}
              {product.healthBenefits?.length > 0 && (
                <div className="pt-5 border-t border-gray-100">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">
                    ✨ Health Benefits
                  </h3>
                  <ul className="space-y-2">
                    {product.healthBenefits.map((benefit, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircleOutlined className="text-green-500 mt-0.5 shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Storage Instructions */}
              {product.storageInstructions && (
                <div className="pt-5 border-t border-gray-100">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    🧊 Storage
                  </h3>
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 text-sm text-gray-700 leading-relaxed">
                    {product.storageInstructions}
                  </div>
                </div>
              )}

              {/* Product meta grid */}
              <div className="pt-5 border-t border-gray-100">
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  Product Details
                </h3>
                <div className="grid grid-cols-2 gap-2.5 text-sm">
                  {product.sku && (
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-gray-400 text-xs mb-0.5">SKU</p>
                      <p className="font-semibold text-gray-700 truncate">
                        {product.sku}
                      </p>
                    </div>
                  )}
                  {product.stockUnit && (
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-gray-400 text-xs mb-0.5">Unit</p>
                      <p className="font-semibold text-gray-700 capitalize">
                        {product.stockUnit}
                      </p>
                    </div>
                  )}
                  {product.sellingType && (
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-gray-400 text-xs mb-0.5">Sold By</p>
                      <p className="font-semibold text-gray-700 capitalize">
                        {product.sellingType}
                      </p>
                    </div>
                  )}
                  {product.vendor?.firstName && (
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-gray-400 text-xs mb-0.5">Vendor</p>
                      <p className="font-semibold text-gray-700 truncate">
                        {product.vendor.firstName} {product.vendor.lastName}
                      </p>
                    </div>
                  )}
                  {product.salesCount !== undefined && (
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-gray-400 text-xs mb-0.5">Units Sold</p>
                      <p className="font-semibold text-gray-700">
                        {product.salesCount}
                      </p>
                    </div>
                  )}
                  {product.categories?.length > 1 && (
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 col-span-2">
                      <p className="text-gray-400 text-xs mb-1">
                        All Categories
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {product.categories.map((cat) => (
                          <span
                            key={cat._id || cat}
                            className="bg-white border border-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                            {typeof cat === "object" ? cat.name : cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Why shop with us — trust highlights ── */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  emoji: "🚚",
                  title: "Free Delivery",
                  sub: "On orders above ₹299",
                  bg: "bg-orange-50 border-orange-100",
                },
                {
                  emoji: "✅",
                  title: "Quality Assured",
                  sub: "Freshness on every order",
                  bg: "bg-emerald-50 border-emerald-100",
                },
                {
                  emoji: "🔄",
                  title: "Easy Returns",
                  sub: "Hassle-free replacements",
                  bg: "bg-blue-50 border-blue-100",
                },
                {
                  emoji: "🛡️",
                  title: "Secure Checkout",
                  sub: "100% safe payments",
                  bg: "bg-purple-50 border-purple-100",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className={`flex items-center gap-3 rounded-2xl p-4 border ${item.bg}`}>
                  <span className="text-2xl shrink-0">{item.emoji}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-800 leading-tight">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Trending products ── */}
          {trendingProducts.length > 0 && (
            <section className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-5">
                📈 Trending Products
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {trendingProducts.slice(0, 8).map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            </section>
          )}

          {/* ── Related products ── */}
          {relatedProducts.length > 0 && (
            <section className="mt-10 pt-8 border-t border-gray-200 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-5">
                🏷️ Similar Products
                {primaryCategory?.name ? ` in ${primaryCategory.name}` : ""}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {relatedProducts.slice(0, 8).map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Mobile fixed bottom bar ── */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl">
          <div className="px-4 py-3">
            {inCart ? (
              <div className="flex gap-2">
                <div className="flex flex-1 items-center justify-between bg-emerald-50 border-2 border-emerald-500 rounded-xl px-3 py-2">
                  <span className="font-semibold text-emerald-700 text-sm">
                    In Cart:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDecrementCart}
                      className="h-7 w-7 flex items-center justify-center rounded-lg border border-emerald-600 bg-white text-emerald-600">
                      <MinusOutlined className="text-xs" />
                    </button>
                    <span className="font-bold text-emerald-600 w-6 text-center">
                      {cartItem?.quantity || 0}
                    </span>
                    <button
                      onClick={handleIncrementCart}
                      className="h-7 w-7 flex items-center justify-center rounded-lg border border-emerald-600 bg-white text-emerald-600">
                      <PlusOutlined className="text-xs" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/cart")}
                  className="h-12 px-5 rounded-xl border-2 border-emerald-600 text-emerald-600 font-semibold text-sm hover:bg-emerald-50 transition-all flex items-center gap-1">
                  <ShoppingCartOutlined /> View
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="w-full h-12 rounded-xl bg-emerald-600 text-white font-bold text-base hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                <ShoppingCartOutlined />
                {inStock ? "+ Add to Cart" : "Out of Stock"}
              </button>
            )}
          </div>
        </div>

        <BottomNav />
      </div>

      {/* ── Share modal ── */}
      <Modal
        title={<span className="font-bold text-lg">Share Product</span>}
        open={shareModalVisible}
        onCancel={() => setShareModalVisible(false)}
        footer={null}
        centered
        width={380}>
        <div className="grid grid-cols-2 gap-3 mt-4">
          {[
            {
              id: "whatsapp",
              label: "WhatsApp",
              icon: <WhatsAppOutlined className="text-2xl" />,
              bg: "bg-green-50 hover:bg-green-100",
              iconBg: "bg-green-500",
            },
            {
              id: "facebook",
              label: "Facebook",
              icon: <FacebookOutlined className="text-2xl" />,
              bg: "bg-blue-50 hover:bg-blue-100",
              iconBg: "bg-blue-600",
            },
            {
              id: "twitter",
              label: "Twitter",
              icon: <TwitterOutlined className="text-2xl" />,
              bg: "bg-sky-50 hover:bg-sky-100",
              iconBg: "bg-sky-500",
            },
            {
              id: "copy",
              label: "Copy Link",
              icon: <LinkOutlined className="text-2xl" />,
              bg: "bg-gray-50 hover:bg-gray-100",
              iconBg: "bg-gray-600",
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => shareProduct(item.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-105 ${item.bg}`}>
              <div className={`${item.iconBg} text-white p-3 rounded-full`}>
                {item.icon}
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </Modal>

      {/* ── Cart login modal ── */}
      <Modal
        open={cartLoginModal}
        onCancel={() => setCartLoginModal(false)}
        footer={null}
        centered
        width={380}>
        <div className="text-center py-4">
          <div className="text-5xl mb-4">🛒</div>
          <h3 className="text-xl font-bold mb-2">Login Required</h3>
          <p className="text-gray-500 mb-6 text-sm">
            Login to add items to your cart. Your selection will be saved.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCartLoginModal(false)}
              className="flex-1 rounded-xl border border-gray-300 py-2.5 font-medium text-gray-700 hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button
              onClick={() => {
                setCartLoginModal(false);
                router.push("/login");
              }}
              className="flex-1 rounded-xl bg-emerald-600 py-2.5 font-medium text-white hover:bg-emerald-700 transition-all">
              Login Now
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
