'use client';

import { authAPI } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { App, Button, Spin } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

/**
 * OTP Verification Component
 * Verify phone number with OTP
 */
function VerifyOTPContent() {
    const router = useRouter();
    const { message } = App.useApp();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';
    const { addPendingProduct, pendingProduct } = useCartStore();

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(30);
    
    // Redirect if no email provided
    useEffect(() => {
        if (!email) {
            message.error('Email is required for verification');
            router.push('/login');
        }
    }, [email, router]);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleOtpChange = (index, value) => {
        if (value.length > 1) {
            value = value[0];
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleVerify = async () => {
        const otpValue = otp.join('');

        if (otpValue.length !== 6) {
            message.error('Please enter complete OTP');
            return;
        }

        setLoading(true);

        try {
            const response = await authAPI.verifyOTP({ email, otp: otpValue });
            
            if (response.data.success) {
                message.success('Email verified successfully!');
                
                // Store token and user data
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                }
                if (response.data.user) {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
                
                // Check if there's a pending product to add to cart
                if (pendingProduct) {
                    const productAdded = addPendingProduct();
                    if (productAdded) {
                        message.success('Product added to cart!', 3);
                    }
                }
                
                // Redirect based on role
                const userRole = response.data.user?.role;
                if (userRole === 'admin') {
                    window.location.href = '/admin/dashboard';
                } else if (userRole === 'vendor') {
                    window.location.href = '/vendor/dashboard';
                } else {
                    window.location.href = '/';
                }
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            const errorMessage = error.response?.data?.message || 'Invalid or expired OTP';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;

        try {
            const response = await authAPI.resendOTP({ email });
            
            if (response.data.success) {
                setResendTimer(30);
                message.success('OTP resent successfully!');
                
                // Show OTP in development mode
                const otpCode = response.data.otp;
                if (otpCode) {
                    message.info(`Development OTP: ${otpCode}`, 10);
                }
            }
        } catch (error) {
            console.error('Resend OTP error:', error);
            message.error('Failed to resend OTP. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-[#0F8A5F] to-[#0A6B47] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeftOutlined />
                    <span>Back</span>
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-[#0F8A5F]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">�</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Account</h1>
                    <p className="text-gray-600">
                        To get your 6-digit verification code:
                    </p>
                    
                    {/* Instructions Box */}
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
                        <p className="text-sm text-gray-700 mb-2">
                            <span className="font-semibold text-[#0F8A5F]">📨 Contact Admin:</span>
                        </p>
                        <p className="text-sm text-gray-700 mb-2">
                            Send an email to: <a href="mailto:support@greenbasket.com" className="font-semibold text-blue-600 hover:underline">support@greenbasket.com</a>
                        </p>
                        <p className="text-xs text-gray-500 mt-3 italic">
                            Include your email address and mobile number in your message to receive the OTP code
                        </p>
                    </div>
                    
                    <p className="text-gray-900 font-semibold mt-4 break-all px-4">
                        Your Email: {email || 'your email address'}
                    </p>
                </div>

                {/* OTP Input */}
                <div className="mb-8">
                    <div className="flex gap-3 justify-center mb-4">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                id={`otp-${index}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-[#0F8A5F] focus:outline-none transition-colors"
                            />
                        ))}
                    </div>

                    {/* Resend OTP */}
                    <div className="text-center">
                        {resendTimer > 0 ? (
                            <p className="text-sm text-gray-600">
                                Resend OTP in{' '}
                                <span className="font-semibold text-[#0F8A5F]">{resendTimer}s</span>
                            </p>
                        ) : (
                            <button
                                onClick={handleResend}
                                className="text-sm font-semibold text-[#0F8A5F] hover:underline"
                            >
                                Resend OTP
                            </button>
                        )}
                    </div>
                </div>

                {/* Verify Button */}
                <Button
                    type="primary"
                    size="large"
                    block
                    loading={loading}
                    onClick={handleVerify}
                    className="bg-[#0F8A5F] hover:bg-[#0A6B47] h-12 text-base font-semibold mb-4"
                >
                    Verify & Continue
                </Button>

                {/* Info */}
                <div className="text-center">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <p className="text-xs text-yellow-800 font-semibold mb-1">⚠️ How to Get Your OTP Code</p>
                        <p className="text-xs text-yellow-700">
                            Email our admin team with your email address and mobile number to receive your verification code
                        </p>
                    </div>
                    <p className="text-xs text-gray-500">
                        By continuing, you agree to receive notifications from Green Basket
                    </p>
                </div>
            </div>
        </div>
    );
}

/**
 * OTP Verification Page with Suspense
 */
export default function VerifyOTPPage() {
    return (
        <Suspense 
            fallback={
                <div className="min-h-screen bg-linear-to-br from-[#0F8A5F] to-[#0A6B47] flex items-center justify-center">
                    <Spin size="large" />
                </div>
            }
        >
            <VerifyOTPContent />
        </Suspense>
    );
}
