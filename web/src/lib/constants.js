/**
 * Application-wide constants for Apna Bazaar
 * Vegetable & Fruits E-Commerce Platform
 */

/**
 * API configuration
 */
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  TIMEOUT: 10000,
};

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  PRODUCTS_PER_PAGE: 12,
  ORDERS_PER_PAGE: 10,
};

/**
 * User roles
 */
export const USER_ROLES = {
  CUSTOMER: 'customer',
  VENDOR: 'vendor',
  ADMIN: 'admin',
};

/**
 * Order statuses
 */
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

/**
 * Order status labels and colors for UI
 */
export const ORDER_STATUS_CONFIG = {
  [ORDER_STATUS.PENDING]: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
  },
  [ORDER_STATUS.PROCESSING]: {
    label: 'Processing',
    color: 'bg-blue-100 text-blue-800',
  },
  [ORDER_STATUS.SHIPPED]: {
    label: 'Shipped',
    color: 'bg-purple-100 text-purple-800',
  },
  [ORDER_STATUS.DELIVERED]: {
    label: 'Delivered',
    color: 'bg-green-100 text-green-800',
  },
  [ORDER_STATUS.CANCELLED]: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
  },
};

/**
 * Product sorting options
 */
export const SORT_OPTIONS = [
  { value: 'fresh', label: 'Fresh Arrival' },
  { value: 'bestselling', label: 'Best Selling' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

/**
 * Product categories for vegetables and fruits
 */
export const PRODUCT_CATEGORIES = [
  { id: 'leafy', name: 'Leafy Vegetables', icon: '🥬' },
  { id: 'root', name: 'Root Vegetables', icon: '🥕' },
  { id: 'bulb', name: 'Bulb Vegetables', icon: '🧅' },
  { id: 'fruit-veg', name: 'Fruit Vegetables', icon: '🍅' },
  { id: 'gourd', name: 'Gourds & Squash', icon: '🎃' },
  { id: 'stem', name: 'Stem Vegetables', icon: '🌾' },
  { id: 'flower', name: 'Flower Vegetables', icon: '🥦' },
  { id: 'pod-seed', name: 'Pod & Seed Vegetables', icon: '🫘' },
  { id: 'tuber', name: 'Tuber Vegetables', icon: '🥔' },
  { id: 'chilli', name: 'Chillies & Peppers', icon: '🌶️' },
  { id: 'spices', name: 'Spices & Flavor', icon: '🫑' },
  { id: 'specialty', name: 'Specialty Vegetables', icon: '🥒' },
  { id: 'fresh-fruits', name: 'Fresh Fruits', icon: '🍎' },
  { id: 'seasonal', name: 'Seasonal Fruits', icon: '🍊' },
  { id: 'organic', name: 'Organic Products', icon: '🌱' },
];

/**
 * Product units for vegetables and fruits
 */
export const PRODUCT_UNITS = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Grams (g)' },
  { value: 'piece', label: 'Piece' },
  { value: 'bunch', label: 'Bunch' },
  { value: 'dozen', label: 'Dozen' },
  { value: 'box', label: 'Box' },
  { value: 'packet', label: 'Packet' },
];

/**
 * Price ranges for filtering (in INR)
 */
export const PRICE_RANGES = [
  { label: 'Under ₹50', min: 0, max: 50 },
  { label: '₹50 to ₹100', min: 50, max: 100 },
  { label: '₹100 to ₹200', min: 100, max: 200 },
  { label: '₹200 to ₹500', min: 200, max: 500 },
  { label: 'Over ₹500', min: 500, max: null },
];

/**
 * Delivery slot options
 */
export const DELIVERY_SLOTS = [
  { id: 'morning', label: '6:00 AM - 10:00 AM', icon: '🌅' },
  { id: 'afternoon', label: '10:00 AM - 2:00 PM', icon: '☀️' },
  { id: 'evening', label: '2:00 PM - 6:00 PM', icon: '🌤️' },
  { id: 'night', label: '6:00 PM - 10:00 PM', icon: '🌙' },
];

/**
 * Delivery type options
 */
export const DELIVERY_TYPES = [
  { value: 'same-day', label: 'Same Day Delivery', icon: '⚡' },
  { value: 'next-day', label: 'Next Day Delivery', icon: '📦' },
  { value: 'standard', label: 'Standard Delivery (3-5 days)', icon: '🚚' },
];

/**
 * Filter options for products
 */
export const FILTER_OPTIONS = {
  categories: PRODUCT_CATEGORIES,
  priceRanges: PRICE_RANGES,
  filters: [
    { id: 'organic', label: 'Organic Products', value: 'organic' },
    { id: 'fresh', label: 'Fresh Arrival', value: 'fresh' },
    { id: 'bestselling', label: 'Best Selling', value: 'bestselling' },
    { id: 'seasonal', label: 'Seasonal Products', value: 'seasonal' },
    { id: 'inStock', label: 'In Stock', value: 'inStock' },
  ],
};

/**
 * Image upload constraints
 */
export const IMAGE_UPLOAD = {
  MAX_SIZE: 3 * 1024 * 1024, // 3MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_FILES: 5,
};

/**
 * Form validation rules
 */
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[\d\s-()]+$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
};

/**
 * Toast notification duration (milliseconds)
 */
export const TOAST_DURATION = 3000;

/**
 * Debounce delay for search input (milliseconds)
 */
export const SEARCH_DEBOUNCE_DELAY = 300;

/**
 * App branding colors
 */
export const COLORS = {
  primary: '#16A34A',      // Fresh Green
  secondary: '#22C55E',    // Light Green
  accent: '#FACC15',       // Yellow
  background: '#F8FAFC',   // Light Gray
  text: '#1F2937',         // Dark Gray
  border: '#E5E7EB',       // Light Border
};

/**
 * Promo messages
 */
export const PROMO_MESSAGES = [
  'Free Delivery Above ₹499',
  'Same Day Delivery Available',
  '100% Fresh Produce Guarantee',
  'Organic Products Available',
  'Farm Fresh Direct to You',
];

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'iqra_auth_token',
  CART: 'iqra_cart',
  WISHLIST: 'iqra_wishlist',
  THEME: 'iqra_theme',
};

/**
 * Social media links
 */
export const SOCIAL_LINKS = {
  FACEBOOK: 'https://facebook.com/iqrafashion',
  INSTAGRAM: 'https://instagram.com/iqrafashion',
  TWITTER: 'https://twitter.com/iqrafashion',
  PINTEREST: 'https://pinterest.com/iqrafashion',
};

/**
 * Contact information
 */
export const CONTACT_INFO = {
  EMAIL: 'info@iqrafashion.com',
  PHONE: '+1 (234) 567-8900',
  ADDRESS: '123 Fashion Street, New York, NY 10001',
};

/**
 * Navigation menu items
 */
export const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Categories', href: '/categories' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

/**
 * Footer links
 */
export const FOOTER_LINKS = {
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
  ],
  support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Shipping Info', href: '/shipping' },
    { label: 'Returns', href: '/returns' },
    { label: 'Contact Us', href: '/contact' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
};
