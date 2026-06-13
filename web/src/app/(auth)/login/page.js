'use client';

import { authAPI } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { GoogleOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { App, Button, Divider, Form, Input } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * Login Page
 * Email/password login with Google OAuth option
 */
export default function LoginPage() {
    const router = useRouter();
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const { addPendingProduct, pendingProduct } = useCartStore();

    const handleLogin = async (values) => {
        setLoading(true);

        try {
            const response = await authAPI.login(values);
                        
            if (response.data.success) {
                message.success('Login successful!');
                
                // Store token if available
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                }
                
                // Store user data in localStorage
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                // Check if there's a pending product to add to cart
                if (pendingProduct) {
                    const productAdded = addPendingProduct();
                    if (productAdded) {
                        message.success('Product added to cart!', 3);
                    }
                }
                
                // Redirect based on role - use window.location for hard navigation
                if (response.data.user.role === 'admin') {
                    window.location.href = '/admin/dashboard';
                } else if (response.data.user.role === 'vendor') {
                    window.location.href = '/vendor/dashboard';
                } else {
                    window.location.href = '/';
                }
            }
        } catch (error) {
            console.log('Login error:', error);
            
            // Handle unverified email (403 error)
            if (error.response?.status === 403 && error.response?.data?.requiresVerification) {
                const otpCode = error.response?.data?.otp;
                
                message.warning('Email not verified. Redirecting to OTP verification...');
                
                // Show OTP in development mode
                if (otpCode) {
                    message.info(`Development OTP: ${otpCode}`, 10);
                }
                
                // Redirect to OTP verification page
                setTimeout(() => {
                    router.push(`/verify-otp?email=${encodeURIComponent(values.email)}`);
                }, 1500);
                
                return;
            }
            
            const errorMessage = error.response?.data?.message || 'Invalid email or password';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        message.info('Google OAuth integration coming soon!');
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-[#0F8A5F] to-[#0A6B47] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                    <p className="text-gray-600">Sign in to continue shopping</p>
                </div>

                {/* Login Form */}
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleLogin}
                    autoComplete="off"
                >
                    <Form.Item
                        name="email"
                        label="Email Address"
                        rules={[
                            { required: true, message: 'Please enter your email' },
                            { type: 'email', message: 'Please enter a valid email' },
                        ]}
                    >
                        <Input
                            size="large"
                            prefix={<MailOutlined className="text-gray-400" />}
                            placeholder="Enter your email"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[
                            { required: true, message: 'Please enter your password' },
                            { min: 6, message: 'Password must be at least 6 characters' },
                        ]}
                    >
                        <Input.Password
                            size="large"
                            prefix={<LockOutlined className="text-gray-400" />}
                            placeholder="Enter your password"
                        />
                    </Form.Item>

                    {/* <div className="flex justify-between items-center mb-6">
                        <Link href="/forgot-password" className="text-sm text-[#0F8A5F] hover:underline">
                            Forgot Password?
                        </Link>
                    </div> */}

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            block
                            loading={loading}
                            className="bg-[#0F8A5F] hover:bg-[#0A6B47] h-12 text-base font-semibold"
                        >
                            Sign In
                        </Button>
                    </Form.Item>
                </Form>

                {/* Divider */}
                <Divider plain>
                    <span className="text-gray-500 text-sm">or continue with</span>
                </Divider>

                {/* Google Login */}
                <Button
                    size="large"
                    block
                    icon={<GoogleOutlined />}
                    onClick={handleGoogleLogin}
                    className="h-12 border-2 font-semibold hover:bg-gray-50"
                >
                    Continue with Google
                </Button>

                {/* Sign Up Link */}
                <div className="text-center mt-6">
                    <p className="text-gray-600">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-[#0F8A5F] font-semibold hover:underline">
                            Sign Up
                        </Link>
                    </p>
                </div>

                {/* Demo Credentials */}
                {/* <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-semibold text-blue-900 mb-2 text-center">Demo Accounts:</p>
                    <div className="space-y-1 text-xs text-blue-800">
                        <p><strong>Customer:</strong> john@example.com / password123</p>
                        <p><strong>Admin:</strong> admin@example.com / admin123</p>
                        <p><strong>Vendor:</strong> vendor@example.com / vendor123</p>
                    </div>
                </div> */}
            </div>
        </div>
    );
}
