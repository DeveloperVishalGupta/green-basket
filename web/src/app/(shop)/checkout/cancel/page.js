'use client';

import { useRouter } from 'next/navigation';
import { Result } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';

/**
 * Payment Cancel Page
 * Handles cancelled Stripe payments
 */
export default function CheckoutCancelPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-12">
      <Result
        icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
        status="error"
        title="Payment Cancelled"
        subTitle="Your payment was cancelled. No charges were made to your account."
        extra={[
          <button
            key="cart"
            onClick={() => router.push('/cart')}
            className="rounded bg-black px-6 py-2 text-white hover:bg-gray-800"
          >
            Return to Cart
          </button>,
          <button
            key="home"
            onClick={() => router.push('/')}
            className="ml-4 rounded border border-gray-300 px-6 py-2 hover:border-gray-400"
          >
            Continue Shopping
          </button>,
        ]}
      />
    </div>
  );
}
