"use client";

import { App, Button, Checkbox, Divider, Form, Input } from "antd";
import Link from "next/link";

import { authAPI } from "@/lib/api";
import { getRoleHome } from "@/lib/roles";
import { useCartStore } from "@/store/cartStore";
import { GoogleOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { addPendingProduct, pendingProduct } = useCartStore();

  const handleLogin = async (values) => {
    setLoading(true);

    try {
      const response = await authAPI.login(values);

      if (response.data.success) {
        message.success("Login successful!");

        // Store token if available
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }

        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // Check if there's a pending product to add to cart
        if (pendingProduct) {
          const productAdded = addPendingProduct();
          if (productAdded) {
            message.success("Product added to cart!", 3);
          }
        }

        // Redirect based on role - use window.location for hard navigation
        window.location.href = getRoleHome(response.data.user.role);
      }
    } catch (error) {
      console.error("Login error:", error);

      // Handle unverified email (403 error)
      if (
        error.response?.status === 403 &&
        error.response?.data?.requiresVerification
      ) {
        const otpCode = error.response?.data?.otp;

        message.warning(
          "Email not verified. Redirecting to OTP verification...",
        );

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

      const errorMessage =
        error.response?.data?.message || "Invalid email or password";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    message.info("Google OAuth integration coming soon!");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-yellow-50 to-emerald-100 flex">
      {/* Right Section */}

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="rounded-4xl bg-white/90 backdrop-blur-xl border border-white shadow-2xl p-6 ">
            <div className="text-center mb-5">
              <Link
                href="/"
                className="mx-auto flex h-40 w-40 items-center justify-center rounded-2xl">
                <Image
                  src="/images/green-basket-11.png"
                  alt="green basket"
                  width={160}
                  height={160}
                />
              </Link>
              {/* <div className=""></div> */}

              <h1 className="text-4xl font-bold text-gray-900">Welcome Back</h1>

              <p className="mt-2 text-gray-500">Sign in to your account</p>
            </div>

            <Form form={form} layout="vertical" onFinish={handleLogin}>
              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  {
                    required: true,
                    message: "Please enter your email",
                  },
                  {
                    type: "email",
                    message: "Please enter valid email",
                  },
                ]}>
                <Input
                  size="large"
                  className="rounded-xl h-12"
                  prefix={<MailOutlined />}
                  placeholder="Enter your email"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  {
                    required: true,
                    message: "Please enter password",
                  },
                ]}>
                <Input.Password
                  size="large"
                  className="rounded-xl h-12"
                  prefix={<LockOutlined />}
                  placeholder="Enter your password"
                />
              </Form.Item>

              <div className="flex justify-between items-center mb-6">
                <Checkbox>Remember me</Checkbox>

                <Link
                  href="/forgot-password"
                  className="text-green-600 hover:text-green-700">
                  Forgot Password?
                </Link>
              </div>

              <Button
                htmlType="submit"
                type="primary"
                loading={loading}
                block
                size="large"
                className="h-14 rounded-xl bg-green-600 border-0 text-base font-semibold hover:bg-green-700">
                Continue
              </Button>
            </Form>

            <Divider>
              <span className="text-gray-400 text-sm">OR</span>
            </Divider>

            <Button
              block
              size="large"
              icon={<GoogleOutlined />}
              onClick={handleGoogleLogin}
              className="h-14 rounded-xl border text-base font-semibold hover:bg-gray-50">
              Continue with Google
            </Button>

            <p className="mt-8 text-center text-gray-600">
              Don&apos;t have an account?
              <Link
                href="/register"
                className="ml-2 font-semibold text-green-600 hover:text-green-700">
                Create Account
              </Link>
            </p>
            <p className="mt-2 text-center text-sm text-gray-500">
              Vendor, delivery partner or admin?
              <Link
                href="/register/partner"
                className="ml-2 font-semibold text-green-600 hover:text-green-700">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
