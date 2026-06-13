'use client';

import { useState } from 'react';
import { Button, App } from 'antd';
import { CreditCardOutlined } from '@ant-design/icons';
import { paymentAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

/**
 * Razorpay Checkout Component
 * Handles payment via Razorpay
 */
export default function RazorpayCheckout({ orderId, amount, disabled = false }) {
  const router = useRouter();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  /**
   * Load Razorpay script dynamically
   */
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  /**
   * Handle Razorpay payment
   */
  const handlePayment = async () => {
    try {
      setLoading(true);

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        message.error('Failed to load Razorpay SDK. Please try again.');
        return;
      }

      // Create Razorpay order
      const response = await paymentAPI.createOrder(orderId);
      const { orderId: razorpayOrderId, amount, currency, keyId } = response.data.data;

      // Razorpay checkout options
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'Iqra Fashion',
        description: `Order Payment`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            // Store payment data for success page
            sessionStorage.setItem('razorpay_payment', JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }));

            // Verify payment on backend
            const verifyResponse = await paymentAPI.verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyResponse.data.success) {
              message.success('Payment successful!');
              router.push('/checkout/success');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            message.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        notes: {
          order_id: orderId,
        },
        theme: {
          color: '#000000',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            message.info('Payment cancelled');
          },
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        console.error('Payment failed:', response);
        message.error('Payment failed. Please try again.');
        setLoading(false);
      });
      
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      message.error(error.response?.data?.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  return (
    <Button
      type="primary"
      size="large"
      icon={<CreditCardOutlined />}
      onClick={handlePayment}
      loading={loading}
      disabled={disabled}
      block
    >
      {loading ? 'Processing...' : `Pay ₹${amount}`}
    </Button>
  );
}
