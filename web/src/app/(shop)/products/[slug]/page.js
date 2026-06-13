'use client';

import ProductCard from '@/components/home/ProductCard';
import BottomNav from '@/components/layout/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { useProduct, useProducts, useTrendingProducts } from '@/hooks/useProducts';
import { useCartStore } from '@/store/cartStore';
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
    TwitterOutlined,
    WhatsAppOutlined
} from '@ant-design/icons';
import { App, Badge, Button, Modal, Spin, Tag } from 'antd';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { use, useCallback, useEffect, useRef, useState } from 'react';

/**
 * Product Detail Page - Enhanced with Share & Save
 * Modern responsive design with API integration
 */
export default function ProductDetailPage({ params }) {
    const { message } = App.useApp();
    const router = useRouter();
    const { user } = useAuth();
    const { addItem, items, updateQuantity, setPendingProduct } = useCartStore();
    const { slug } = use(params);

    // State management
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isSaved, setIsSaved] = useState(false);
    const [shareModalVisible, setShareModalVisible] = useState(false);
    const [wishlistLoginModal, setWishlistLoginModal] = useState(false);
    const [cartLoginModal, setCartLoginModal] = useState(false);
    const [isImageZoomed, setIsImageZoomed] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const rafRef = useRef(null);
    const pendingPosRef = useRef({ x: 0, y: 0 });

    // Use React Query hook to fetch product
    const { data: productData, isLoading, error } = useProduct(slug, {
        enabled: !!slug,
    });
    const product = productData?.data;
    const cartItem = product ? items.find(item => item.id === product._id) : null;
    const inCart = !!cartItem;

    // Fetch trending products
    const { data: trendingData } = useTrendingProducts({ enabled: !!product });
    const trendingProducts = trendingData?.data || [];

    // Fetch same-category products
    const { data: relatedData } = useProducts(
        { 
            category: product?.category?._id,
            limit: 8,
        },
        { enabled: !!product?.category?._id }
    );
    const relatedProducts = (relatedData?.data || []).filter(p => p._id !== product?._id);

    // Set default selections when product loads
    useEffect(() => {
        if (product) {
            if (product.sizes && product.sizes.length > 0) {
                setSelectedSize(product.sizes[0]);
            }
            if (product.colors && product.colors.length > 0) {
                setSelectedColor(product.colors[0]);
            }
        }
    }, [product]);

    // Set default selections when product loads
    useEffect(() => {
        if (product) {
            if (product.sizes && product.sizes.length > 0) {
                setSelectedSize(product.sizes[0]);
            }
            if (product.colors && product.colors.length > 0) {
                setSelectedColor(product.colors[0]);
            }
        }
    }, [product]);

    const handleWishlistLogin = () => {
        setWishlistLoginModal(false);
        router.push('/login');
    };

    const handleCartLogin = () => {
        setCartLoginModal(false);
        router.push('/login');
    };

    const handleSaveProduct = () => {
        // Check if user is logged in
        if (!user) {
            setWishlistLoginModal(true);
            return;
        }

        setIsSaved(!isSaved);
        if (!isSaved) {
            message.success('Added to wishlist!');
            // TODO: Implement API call to save to wishlist
        } else {
            message.info('Removed from wishlist');
            // TODO: Implement API call to remove from wishlist
        }
    };

    const requestAnim = useCallback((cb) => {
        if (typeof window !== 'undefined' && window.requestAnimationFrame) {
            return window.requestAnimationFrame(cb);
        }
        return setTimeout(cb, 16);
    }, []);

    const cancelAnim = useCallback((id) => {
        if (typeof window !== 'undefined' && window.cancelAnimationFrame) {
            window.cancelAnimationFrame(id);
            return;
        }
        clearTimeout(id);
    }, []);

    const handleMouseMove = useCallback((e) => {
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
    }, [requestAnim]);

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
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(url);
                message.success('Link copied to clipboard!');
                setShareModalVisible(false);
                return;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank');
            setShareModalVisible(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 via-emerald-50/20 to-teal-50/20">
                <div className="text-center">
                    <Spin size="large" />
                    <p className="mt-4 text-gray-600 font-medium">Loading product details...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 via-emerald-50/20 to-teal-50/20">
                <div className="text-center max-w-md px-4">
                    <div className="bg-linear-to-br from-red-100 to-orange-100 rounded-3xl p-12 inline-block mb-6">
                        <div className="text-7xl">😞</div>
                    </div>
                    <h1 className="text-2xl font-bold mb-2 text-gray-900">Product Not Found</h1>
                    <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
                    <Button 
                        type="primary" 
                        size="large"
                        className="bg-linear-to-r from-emerald-600 to-teal-600 border-0 rounded-xl h-12 px-8 font-semibold"
                        onClick={() => router.push('/products')}
                    >
                        Browse Products
                    </Button>
                </div>
            </div>
        );
    }

    const currentPrice = product.price;
    const currentOriginalPrice = product.compareAtPrice;
    const discount = currentOriginalPrice && currentPrice < currentOriginalPrice
        ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
        : 0;

    const handleAddToCart = () => {
        // Check if user is logged in
        if (!user) {
            setPendingProduct({
                id: product._id,
                name: product.name,
                price: currentPrice,
                image: product.images[0]?.url,
                size: selectedSize,
                color: selectedColor,
            }, quantity);
            setCartLoginModal(true);
            return;
        }
        
        if (inCart) {
            // If already in cart, update quantity
            updateQuantity(product._id, (cartItem?.quantity || 0) + quantity);
            message.success('Cart updated!');
        } else {
            // Add new item to cart
            addItem({
                id: product._id,
                name: product.name,
                price: currentPrice,
                image: product.images[0]?.url,
                size: selectedSize,
                color: selectedColor,
            }, quantity);
            message.success('Added to cart!');
        }
    };

    const handleIncrementCart = () => {
        updateQuantity(product._id, (cartItem?.quantity || 0) + 1);
    };

    const handleDecrementCart = () => {
        if (cartItem && cartItem.quantity > 1) {
            updateQuantity(product._id, cartItem.quantity - 1);
        } else {
            updateQuantity(product._id, 0);
            message.info('Item removed from cart');
        }
    };

    // Generate structured data (JSON-LD) for SEO
    useEffect(() => {
        if (product) {
            const structuredData = {
                "@context": "https://schema.org/",
                "@type": "Product",
                "name": product.name,
                "description": product.description,
                "image": product.images?.[0]?.url || '/placeholder-product.jpg',
                "brand": {
                    "@type": "Brand",
                    "name": "Apna Bazaar"
                },
                "offers": {
                    "@type": "Offer",
                    "url": typeof window !== 'undefined' ? window.location.href : '',
                    "priceCurrency": "INR",
                    "price": product.price,
                    "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                    "seller": {
                        "@type": "Organization",
                        "name": "Apna Bazaar"
                    }
                },
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": product.rating?.average || "4.5",
                    "ratingCount": product.rating?.count || "100",
                    "bestRating": "5",
                    "worstRating": "1"
                }
            };

            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.innerHTML = JSON.stringify(structuredData);
            document.head.appendChild(script);

            return () => {
                document.head.removeChild(script);
            };
        }
    }, [product]);

    return (
        <>
            <div className="min-h-screen bg-white/95 pb-20 lg:pb-0">
                {/* Enhanced Header with Share & Save */}
                <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-md">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <button
                                onClick={() => router.back()}
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-all hover:scale-105"
                            >
                                <ArrowLeftOutlined className="text-xl" />
                            </button>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={handleShare}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 hover:bg-blue-100 transition-all hover:scale-105"
                                >
                                    <ShareAltOutlined className="text-xl text-blue-600" />
                                </button>
                                <button 
                                    onClick={handleSaveProduct}
                                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:scale-105 ${
                                        isSaved ? 'bg-red-500 text-white' : 'bg-red-50 hover:bg-red-100'
                                    }`}
                                >
                                    {isSaved ? (
                                        <HeartFilled className="text-xl" />
                                    ) : (
                                        <HeartOutlined className="text-xl text-red-500" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 lg:pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-6">
                    
                    {/* Left Column - Product Images */}
                    <div className="space-y-4">
                        {/* Main Image with Zoom */}
                        <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                            <div 
                                className="aspect-square relative overflow-hidden cursor-zoom-in"
                                onMouseMove={handleMouseMove}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                            >
                                {product.images?.length > 0 ? (
                                                <Image 
                                                src={product.images[selectedImageIndex]?.url}
                                                 alt={product.name}
                                                  fill
                                                   className="object-cover transition-transform duration-200 ease-out"
                                                    sizes="(max-width: 768px) 100vw, 33vw"
                                                     style={{
                                            transform: isImageZoomed 
                                                ? `scale(2) translate(${(50 - mousePosition.x) / 2}%, ${(50 - mousePosition.y) / 2}%)` 
                                                : 'scale(1)',
                                            transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`
                                        }}
                                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-gray-100">
                                        <span className="text-6xl">📦</span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Image Badges */}
                            <div className="absolute top-4 px-6 flex flex-col w-full gap-2">
                                {product.isFeatured && (
                                    <Badge.Ribbon text="Featured"  color="gold" />
                                )}
                                {discount > 0 && (
                                    <div className="bg-red-500 text-white w-24 px-3 py-1 rounded-full text-sm font-bold">
                                        {discount}% OFF
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thumbnail Images */}
                        {product.images?.length > 1 && (
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                                {product.images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                            selectedImageIndex === index
                                                ? 'border-[#0F8A5F] shadow-md scale-105'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                                    <Image 
                                                    fill
                                                    src={img.url}
                                                     alt={product.name}
                                                      className="object-cover relative!"
                                                       sizes="(max-width: 768px) 100vw, 33vw"
                                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column - Product Details */}
                    <div className="space-y-6">
                        {/* Category & Status */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            {product.category?.name && (
                                <Tag color="blue" className="text-sm px-3 py-1">
                                    {product.category.name}
                                </Tag>
                            )}
                            {product.stock > 0 ? (
                                <Tag icon={<CheckCircleOutlined />} color="success" className="text-sm px-3 py-1">
                                    In Stock ({product.stock} units)
                                </Tag>
                            ) : (
                                <Tag color="error" className="text-sm px-3 py-1">
                                    Out of Stock
                                </Tag>
                            )}
                        </div>

                        {/* Product Name */}
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                                {product.name}
                            </h1>
                        </div>

                        {/* Price Section */}
                        <div className="bg-linear-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-200">
                            <div className="flex items-baseline gap-3 flex-wrap">
                                <span className="text-4xl font-bold text-gray-900">
                                    ₹{currentPrice.toLocaleString()}
                                </span>
                                {currentOriginalPrice > currentPrice && (
                                    <>
                                        <span className="text-2xl text-gray-400 line-through">
                                            ₹{currentOriginalPrice.toLocaleString()}
                                        </span>
                                        <span className="text-lg text-green-600 font-semibold">
                                            Save ₹{(currentOriginalPrice - currentPrice).toLocaleString()}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Sizes */}
                        {product.sizes && product.sizes.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-3 text-gray-900">
                                    Select Size {selectedSize && <span className="text-[#0F8A5F]">({selectedSize})</span>}
                                </h3>
                                <div className="flex gap-2 flex-wrap">
                                    {product.sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`px-6 py-3 rounded-xl border-2 font-medium transition-all ${
                                                selectedSize === size
                                                    ? 'border-[#0F8A5F] bg-[#0F8A5F] text-white shadow-md scale-105'
                                                    : 'border-gray-300 bg-white hover:border-[#0F8A5F] hover:bg-[#0F8A5F]/5'
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Colors */}
                        {product.colors && product.colors.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-3 text-gray-900">
                                    Select Color {selectedColor && <span className="text-[#0F8A5F]">({selectedColor})</span>}
                                </h3>
                                <div className="flex gap-2 flex-wrap">
                                    {product.colors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`px-6 py-3 rounded-xl border-2 font-medium transition-all ${
                                                selectedColor === color
                                                    ? 'border-[#0F8A5F] bg-[#0F8A5F] text-white shadow-md scale-105'
                                                    : 'border-gray-300 bg-white hover:border-[#0F8A5F] hover:bg-[#0F8A5F]/5'
                                            }`}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 text-gray-900">Quantity</h3>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                    className="h-12 w-12 rounded-xl border-2 border-[#0F8A5F] text-[#0F8A5F] hover:bg-[#0F8A5F] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    <MinusOutlined />
                                </button>
                                <span className="text-2xl font-bold w-16 text-center">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    disabled={quantity >= product.stock}
                                    className="h-12 w-12 rounded-xl border-2 border-[#0F8A5F] text-[#0F8A5F] hover:bg-[#0F8A5F] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    <PlusOutlined />
                                </button>
                            </div>
                        </div>

                        {/* Desktop Add to Cart */}
                        <div className="hidden lg:block space-y-3">
                            {inCart ? (
                                <>
                                    <div className="flex items-center justify-between bg-emerald-50 border-2 border-emerald-500 rounded-xl p-4">
                                        <span className="font-semibold text-emerald-700">In Cart:</span>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={handleDecrementCart}
                                                className="h-10 w-10 rounded-lg border-2 border-emerald-600 bg-white text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center"
                                            >
                                                <MinusOutlined />
                                            </button>
                                            <span className="text-xl font-bold text-emerald-600 w-12 text-center">{cartItem?.quantity || 0}</span>
                                            <button
                                                onClick={handleIncrementCart}
                                                className="h-10 w-10 rounded-lg border-2 border-emerald-600 bg-white text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center"
                                            >
                                                <PlusOutlined />
                                            </button>
                                        </div>
                                    </div>
                                    <Button
                                        size="large"
                                        icon={<ShoppingCartOutlined />}
                                        onClick={() => router.push('/cart')}
                                        className="w-full h-14 text-lg font-semibold rounded-xl border-2 border-[#0F8A5F] text-[#0F8A5F] hover:bg-[#0F8A5F] hover:text-white"
                                    >
                                        View Cart
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<ShoppingCartOutlined />}
                                    onClick={handleAddToCart}
                                    disabled={product.stock === 0}
                                    className="w-full h-14 text-lg font-semibold rounded-xl bg-[#0F8A5F] hover:bg-[#0A6B47]"
                                >
                                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                </Button>
                            )}
                        </div>

                        {/* Description */}
                        <div className="pt-6 border-t border-gray-200">
                            <h3 className="text-xl font-semibold mb-3 text-gray-900">Description</h3>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {product.description}
                            </p>
                        </div>

                        {/* Nutritional Information - Grocery Items */}
                        {product.nutritionalInfo && (
                            <div className="pt-6 border-t border-gray-200">
                                <h3 className="text-xl font-semibold mb-4 text-gray-900">📊 Nutritional Information</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {product.nutritionalInfo.calories && (
                                        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                                            <div className="text-xs text-gray-600">Calories</div>
                                            <div className="text-lg font-bold text-green-700">{product.nutritionalInfo.calories}</div>
                                        </div>
                                    )}
                                    {product.nutritionalInfo.protein && (
                                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                            <div className="text-xs text-gray-600">Protein</div>
                                            <div className="text-lg font-bold text-blue-700">{product.nutritionalInfo.protein}</div>
                                        </div>
                                    )}
                                    {product.nutritionalInfo.carbohydrates && (
                                        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                                            <div className="text-xs text-gray-600">Carbs</div>
                                            <div className="text-lg font-bold text-yellow-700">{product.nutritionalInfo.carbohydrates}</div>
                                        </div>
                                    )}
                                    {product.nutritionalInfo.fat && (
                                        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                                            <div className="text-xs text-gray-600">Fat</div>
                                            <div className="text-lg font-bold text-orange-700">{product.nutritionalInfo.fat}</div>
                                        </div>
                                    )}
                                    {product.nutritionalInfo.fiber && (
                                        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                                            <div className="text-xs text-gray-600">Fiber</div>
                                            <div className="text-lg font-bold text-purple-700">{product.nutritionalInfo.fiber}</div>
                                        </div>
                                    )}
                                </div>
                                {product.nutritionalInfo.vitamins && product.nutritionalInfo.vitamins.length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-sm text-gray-600 mb-2">Rich in: {product.nutritionalInfo.vitamins.join(', ')}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Benefits */}
                        {product.benefits && product.benefits.length > 0 && (
                            <div className="pt-6 border-t border-gray-200">
                                <h3 className="text-xl font-semibold mb-3 text-gray-900">✨ Health Benefits</h3>
                                <ul className="space-y-2">
                                    {product.benefits.map((benefit, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <CheckCircleOutlined className="text-green-600 mt-1 flex-shrink-0" />
                                            <span className="text-gray-700">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Storage Instructions */}
                        {product.storageInstructions && (
                            <div className="pt-6 border-t border-gray-200">
                                <h3 className="text-xl font-semibold mb-3 text-gray-900">🧊 Storage Instructions</h3>
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                    <p className="text-gray-700">{product.storageInstructions}</p>
                                </div>
                            </div>
                        )}

                        {/* Unit Info */}
                        {product.unit && (
                            <div className="pt-6 border-t border-gray-200">
                                <h3 className="text-xl font-semibold mb-3 text-gray-900">📦 Product Unit</h3>
                                <Tag color="blue" className="px-4 py-2 text-base">
                                    Sold per {product.unit}
                                </Tag>
                            </div>
                        )}

                        {/* Product Badges */}
                        <div className="pt-6 border-t border-gray-200 flex gap-2 flex-wrap">
                            {product.isOrganic && (
                                <Tag icon="🌱" color="green" className="px-3 py-1">
                                    Certified Organic
                                </Tag>
                            )}
                            {product.isSeasonalFresh && (
                                <Tag icon="✨" color="orange" className="px-3 py-1">
                                    Fresh Arrival
                                </Tag>
                            )}
                            {product.isBestSelling && (
                                <Tag icon="⭐" color="purple" className="px-3 py-1">
                                    Best Seller
                                </Tag>
                            )}
                        </div>

                        {/* Tags */}
                        {product.tags && product.tags.length > 0 && (
                            <div className="pt-6 border-t border-gray-200">
                                <h3 className="text-xl font-semibold mb-3 text-gray-900">Tags</h3>
                                <div className="flex gap-2 flex-wrap">
                                    {product.tags.map((tag, index) => (
                                        <Tag key={index} color="blue" className="px-3 py-1 text-sm">
                                            {tag}
                                        </Tag>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Trending Products Section */}
                {trendingProducts.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span>📈</span> Trending Products
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {trendingProducts.slice(0, 8).map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Same Category Products Section */}
                {relatedProducts.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-gray-200 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span>🏷️</span> Similar Products in {product.category?.name}
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {relatedProducts.slice(0, 8).map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Fixed Bottom Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl">
                <div className="px-4 py-3 space-y-2">
                    <div className="flex gap-2">
                        {inCart ? (
                            <>
                                <div className="flex-1 flex items-center justify-between bg-emerald-50 border-2 border-emerald-500 rounded-xl px-4 py-2">
                                    <span className="font-semibold text-emerald-700 text-sm">In Cart:</span>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={handleDecrementCart}
                                            className="h-8 w-8 rounded-lg border-2 border-emerald-600 bg-white text-emerald-600 flex items-center justify-center"
                                        >
                                            <MinusOutlined className="text-xs" />
                                        </button>
                                        <span className="text-lg font-bold text-emerald-600 w-8 text-center">{cartItem?.quantity || 0}</span>
                                        <button
                                            onClick={handleIncrementCart}
                                            className="h-8 w-8 rounded-lg border-2 border-emerald-600 bg-white text-emerald-600 flex items-center justify-center"
                                        >
                                            <PlusOutlined className="text-xs" />
                                        </button>
                                    </div>
                                </div>
                                <Button
                                    size="large"
                                    icon={<ShoppingCartOutlined />}
                                    onClick={() => router.push('/cart')}
                                    className="h-12 px-6 rounded-xl border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white font-semibold"
                                >
                                    View
                                </Button>
                            </>
                        ) : (
                            <Button
                                type="primary"
                                size="large"
                                icon={<ShoppingCartOutlined />}
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                className="flex-1 h-12 text-base font-semibold rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 border-0"
                            >
                                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>

        {/* Share Modal */}
        <Modal
            title={
                <div className="text-center">
                    <div className="text-xl font-bold">Share Product</div>
                    <div className="text-sm text-gray-500 font-normal mt-1">Share this product with your friends</div>
                </div>
            }
            open={shareModalVisible}
            onCancel={() => setShareModalVisible(false)}
            footer={null}
            centered
            width={400}
        >
            <div className="grid grid-cols-2 gap-4 mt-6">
                <button
                    onClick={() => shareProduct('whatsapp')}
                    className="flex flex-col items-center gap-3 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-all hover:scale-105"
                >
                    <div className="bg-green-500 text-white p-3 rounded-full">
                        <WhatsAppOutlined className="text-2xl" />
                    </div>
                    <span className="font-semibold text-gray-700">WhatsApp</span>
                </button>
                <button
                    onClick={() => shareProduct('facebook')}
                    className="flex flex-col items-center gap-3 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-all hover:scale-105"
                >
                    <div className="bg-blue-600 text-white p-3 rounded-full">
                        <FacebookOutlined className="text-2xl" />
                    </div>
                    <span className="font-semibold text-gray-700">Facebook</span>
                </button>
                <button
                    onClick={() => shareProduct('twitter')}
                    className="flex flex-col items-center gap-3 p-4 rounded-xl bg-sky-50 hover:bg-sky-100 transition-all hover:scale-105"
                >
                    <div className="bg-sky-500 text-white p-3 rounded-full">
                        <TwitterOutlined className="text-2xl" />
                    </div>
                    <span className="font-semibold text-gray-700">Twitter</span>
                </button>
                <button
                    onClick={() => shareProduct('copy')}
                    className="flex flex-col items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all hover:scale-105"
                >
                    <div className="bg-gray-600 text-white p-3 rounded-full">
                        <LinkOutlined className="text-2xl" />
                    </div>
                    <span className="font-semibold text-gray-700">Copy Link</span>
                </button>
            </div>
        </Modal>

        {/* Wishlist Login Modal */}
        <Modal
            title="Login Required"
            open={wishlistLoginModal}
            onCancel={() => setWishlistLoginModal(false)}
            footer={[
                <Button key="cancel" onClick={() => setWishlistLoginModal(false)}>
                    Cancel
                </Button>,
                <Button 
                    key="login" 
                    type="primary" 
                    onClick={handleWishlistLogin}
                    className="bg-[#0F8A5F] hover:bg-[#0A6B47]"
                >
                    Go to Login
                </Button>
            ]}
            centered
        >
            <div className="py-4">
                <p className="text-gray-700 mb-2">You need to be logged in to add items to your wishlist.</p>
                <p className="text-sm text-gray-600">After logging in, you'll be redirected back to this page.</p>
            </div>
        </Modal>

        {/* Cart Login Modal */}
        <Modal
            title="Login Required"
            open={cartLoginModal}
            onCancel={() => setCartLoginModal(false)}
            footer={[
                <Button key="cancel" onClick={() => setCartLoginModal(false)}>
                    Cancel
                </Button>,
                <Button 
                    key="login" 
                    type="primary" 
                    onClick={handleCartLogin}
                    className="bg-[#0F8A5F] hover:bg-[#0A6B47]"
                >
                    Go to Login
                </Button>
            ]}
            centered
        >
            <div className="py-4">
                <p className="text-gray-700 mb-2">You need to be logged in to add items to your cart.</p>
                <p className="text-sm text-gray-600">After logging in, your selected product will be automatically added to your cart.</p>
            </div>
        </Modal>
    </>
    );
}
