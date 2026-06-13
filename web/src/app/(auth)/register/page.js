'use client';

import { authAPI } from '@/lib/api';
import { GoogleOutlined, LockOutlined, MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { App, Button, Checkbox, Divider, Form, Input } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * Register Page
 * User registration with form validation
 */
export default function RegisterPage() {
    const router = useRouter();
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleRegister = async (values) => {
        setLoading(true);

        try {
            const response = await authAPI.register(values);
            
            if (response.data.success) {
                const otpCode = response.data.data?.otp;
                
                message.success('Registration successful! Please verify your email with OTP.');
                
                // Show OTP in development mode
                if (otpCode) {
                    // message.info(`Development OTP: ${otpCode}`, 10);
                }
                
                // Redirect to email OTP verification
                // router.push(`/verify-otp?email=${encodeURIComponent(values.email)}`);
                router.push(`/login`);
            }
        } catch (error) {
            console.error('Registration error:', error);
            const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = () => {
        message.info('Google OAuth integration coming soon!');
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-[#ED6C30] to-[#D45A20] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                    <p className="text-gray-600">Join us for amazing deals!</p>
                </div>

                {/* Registration Form */}
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleRegister}
                    autoComplete="off"
                >
                    <Form.Item
                        name="firstName"
                        label="First Name"
                        rules={[
                            { required: true, message: 'Please enter your first name' },
                            { min: 2, message: 'First name must be at least 2 characters' },
                        ]}
                    >
                        <Input
                            size="large"
                            prefix={<UserOutlined className="text-gray-400" />}
                            placeholder="Enter your first name"
                        />
                    </Form.Item>

                    <Form.Item
                        name="lastName"
                        label="Last Name"
                        rules={[
                            { required: true, message: 'Please enter your last name' },
                        ]}
                    >
                        <Input
                            size="large"
                            prefix={<UserOutlined className="text-gray-400" />}
                            placeholder="Enter your last name"
                        />
                    </Form.Item>

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
                        name="phone"
                        label="Phone Number"
                        rules={[
                            { required: true, message: 'Please enter your phone number' },
                            { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number' },
                        ]}
                    >
                        <Input
                            size="large"
                            prefix={<PhoneOutlined className="text-gray-400" />}
                            placeholder="Enter your phone number"
                            maxLength={10}
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
                            placeholder="Create a password"
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Confirm Password"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Please confirm your password' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Passwords do not match'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            size="large"
                            prefix={<LockOutlined className="text-gray-400" />}
                            placeholder="Confirm your password"
                        />
                    </Form.Item>

                    <Form.Item
                        name="agree"
                        valuePropName="checked"
                        rules={[
                            {
                                validator: (_, value) =>
                                    value ? Promise.resolve() : Promise.reject(new Error('Please accept the terms')),
                            },
                        ]}
                    >
                        <Checkbox>
                            I agree to the{' '}
                            <Link href="/terms" className="text-[#ED6C30] hover:underline">
                                Terms & Conditions
                            </Link>{' '}
                            and{' '}
                            <Link href="/privacy" className="text-[#ED6C30] hover:underline">
                                Privacy Policy
                            </Link>
                        </Checkbox>
                    </Form.Item>

                    {/* OTP Verification Info Box */}
                    {/* <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-semibold text-gray-800 mb-2">
                            � Account Verification Process
                        </p>
                        <p className="text-xs text-gray-700 mb-2">
                            After registration, you'll need to verify your account with an OTP code.
                        </p>
                        <p className="text-xs text-gray-700 mb-2">
                            <span className="font-semibold">To get your OTP code:</span>
                        </p>
                        <ul className="text-xs text-gray-700 list-disc list-inside space-y-1 ml-2">
                            <li>Send an email to <a href="mailto:iqra.bangles.stores@gmail.com" className="text-blue-600 font-semibold hover:underline">iqra.bangles.stores@gmail.com</a></li>
                            <li>Include your email address and mobile number in your message</li>
                            <li>You will receive the OTP code via email</li>
                        </ul>
                    </div> */}

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            block
                            loading={loading}
                            className="bg-[#ED6C30] hover:bg-[#D45A20] h-12 text-base font-semibold"
                        >
                            Create Account
                        </Button>
                    </Form.Item>
                </Form>

                {/* Divider */}
                <Divider plain>
                    <span className="text-gray-500 text-sm">or sign up with</span>
                </Divider>

                {/* Google Signup */}
                <Button
                    size="large"
                    block
                    icon={<GoogleOutlined />}
                    onClick={handleGoogleSignup}
                    className="h-12 border-2 font-semibold hover:bg-gray-50"
                >
                    Continue with Google
                </Button>

                {/* Login Link */}
                <div className="text-center mt-6">
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <Link href="/login" className="text-[#ED6C30] font-semibold hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
