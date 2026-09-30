'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Result, Spin } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
// import { paymentAPI } from '@/lib/api';

/**
 * Payment Success Page
 * Handles successful Razorpay payments
 */
export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const razorpay_payment_id = searchParams.get('razorpay_payment_id');
  const razorpay_order_id = searchParams.get('razorpay_order_id');
  const razorpay_signature = searchParams.get('razorpay_signature');
  
  const [loading, setLoading] = useState(true);
  const [order] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      // Payment info might be in session storage (from client-side verification)
      const paymentData = sessionStorage.getItem('razorpay_payment');
      if (paymentData) {
        const parsed = JSON.parse(paymentData);
        verifyPayment(parsed);
        sessionStorage.removeItem('razorpay_payment');
      } else {
        router.push('/cart');
      }
      return;
    }

    verifyPayment({ razorpay_payment_id, razorpay_order_id, razorpay_signature });
  }, [razorpay_payment_id, razorpay_order_id, razorpay_signature, router]);

  const verifyPayment = async (paymentData) => {
    try {
      setLoading(true);
      // const response = await paymentAPI.verifyPayment(paymentData);
      
      // if (response.data.success) {
      //   setOrder(response.data.data.order);
      // }
    } catch (err) {
      console.error('Payment verification error:', err);
      setError(err.response?.data?.message || 'Failed to verify payment');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-below-header items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Result
          status="error"
          title="Payment Verification Failed"
          subTitle={error}
          extra={[
            <button
              key="home"
              onClick={() => router.push('/')}
              className="rounded bg-black px-6 py-2 text-white hover:bg-gray-800"
            >
              Go Home
            </button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Result
        icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
        status="success"
        title="Payment Successful!"
        subTitle={
          <div className="space-y-2">
            <p>Your order has been confirmed and is being processed.</p>
            {order && (
              <p className="text-sm text-gray-600">
                Order Number: <span className="font-semibold">{order.orderNumber}</span>
              </p>
            )}
            <p className="text-sm text-gray-600">
              A confirmation email has been sent to your email address.
            </p>
          </div>
        }
        extra={[
          <button
            key="orders"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['orders'] });
              router.push('/orders');
            }}
            className="rounded bg-black px-6 py-2 text-white hover:bg-gray-800"
          >
            View My Orders
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
