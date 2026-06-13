'use client';

/**
 * Coupon Card Component
 * Displays discount coupon with code and offer details
 */
export default function CouponCard({ coupon }) {
  const handleCopyCoupon = () => {
    navigator.clipboard.writeText(coupon.code);
    // You can add a toast notification here
  };

  return (
    <div
      onClick={handleCopyCoupon}
      className="flex flex-shrink-0 cursor-pointer items-center gap-4 rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md active:scale-98"
      style={{ minWidth: '300px' }}
    >
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#0F8A5F]">
        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-bold text-gray-900">{coupon.title}</h3>
        <p className="text-xs text-gray-600">
          USE <span className="font-semibold text-[#ED6C30]">{coupon.code}</span> | {coupon.description}
        </p>
      </div>
      <div className="text-xs text-gray-400">TAP TO COPY</div>
    </div>
  );
}
