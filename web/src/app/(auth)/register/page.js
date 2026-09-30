"use client";

import { authAPI } from "@/lib/api";
import {
  GoogleOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { App, Button, Checkbox, Divider, Form, Input } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

        message.success(
          "Registration successful! Please verify your email with OTP.",
        );

        // Show OTP in development mode
        if (otpCode) {
          // message.info(`Development OTP: ${otpCode}`, 10);
        }

        // Redirect to email OTP verification
        // router.push(`/verify-otp?email=${encodeURIComponent(values.email)}`);
        router.push(`/login`);
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    message.info("Google OAuth integration coming soon!");
  };

  return (
    <div>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-emerald-100 flex">
        {/* <div className="absolute -top-20 -left-20 h-64 w-64 sm:h-72 sm:w-72 rounded-full bg-green-200/40 blur-3xl" />

      <div className="absolute top-1/2 -right-20 h-52 w-52 sm:h-80 sm:w-80 rounded-full bg-emerald-200/40 blur-3xl" />

      <div className="absolute bottom-0 left-1/3 h-40 w-40 sm:h-56 sm:w-56 rounded-full bg-lime-200/30 blur-3xl" /> */}

        {/* Right Section */}

        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full md:max-w-2xl">
            <div className="rounded-[32px] bg-white/90 backdrop-blur-xl border border-white shadow-2xl p-6 ">
              <div className="text-center mb-0">
                <Link
                  href="/"
                  className="mx-auto mb-0 flex h-40 w-40 items-center justify-center rounded-2xl">
                  <Image
                    src="/images/green-basket-11.png"
                    alt="green basket"
                    width={160}
                    height={160}
                  />
                </Link>
                {/* <div className=""></div> */}

                <h1 className="text-4xl font-bold text-gray-900">
                  Create Your Account
                </h1>

                <p className="mt-2 mb-4 text-gray-500">
                  Join Green Basket and start shopping fresh groceries.
                </p>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={handleRegister}
                autoComplete="off"
                requiredMark={false}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-1">
                  {/* First Name */}
                  <Form.Item
                    className="mb-3"
                    name="firstName"
                    label="First Name"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your first name",
                      },
                      { min: 2, message: "Minimum 2 characters" },
                    ]}>
                    <Input
                      className="h-11 rounded-xl"
                      prefix={<UserOutlined className="text-gray-400" />}
                      placeholder="John"
                    />
                  </Form.Item>

                  {/* Last Name */}
                  <Form.Item
                    className="mb-3"
                    name="lastName"
                    label="Last Name"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your last name",
                      },
                    ]}>
                    <Input
                      className="h-11 rounded-xl"
                      prefix={<UserOutlined className="text-gray-400" />}
                      placeholder="Doe"
                    />
                  </Form.Item>

                  {/* Email */}
                  <Form.Item
                    className="mb-3"
                    name="email"
                    label="Email Address"
                    rules={[
                      { required: true, message: "Please enter your email" },
                      { type: "email", message: "Invalid email" },
                    ]}>
                    <Input
                      className="h-11 rounded-xl"
                      prefix={<MailOutlined className="text-gray-400" />}
                      placeholder="john@example.com"
                    />
                  </Form.Item>

                  {/* Phone */}
                  <Form.Item
                    className="mb-3"
                    name="phone"
                    label="Phone Number"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your phone number",
                      },
                      {
                        pattern: /^[0-9]{10}$/,
                        message: "Enter valid mobile number",
                      },
                    ]}>
                    <Input
                      className="h-11 rounded-xl"
                      prefix={<PhoneOutlined className="text-gray-400" />}
                      placeholder="9876543210"
                      maxLength={10}
                    />
                  </Form.Item>

                  {/* Password */}
                  <Form.Item
                    className="mb-3"
                    name="password"
                    label="Password"
                    rules={[
                      { required: true, message: "Please enter password" },
                      { min: 6, message: "Minimum 6 characters" },
                    ]}>
                    <Input.Password
                      className="h-11 rounded-xl"
                      prefix={<LockOutlined className="text-gray-400" />}
                      placeholder="Create password"
                    />
                  </Form.Item>

                  {/* Confirm Password */}
                  <Form.Item
                    className="mb-3"
                    name="confirmPassword"
                    label="Confirm Password"
                    dependencies={["password"]}
                    rules={[
                      { required: true, message: "Confirm password" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("password") === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Passwords do not match"),
                          );
                        },
                      }),
                    ]}>
                    <Input.Password
                      className="h-11 rounded-xl"
                      prefix={<LockOutlined className="text-gray-400" />}
                      placeholder="Confirm password"
                    />
                  </Form.Item>
                </div>

                {/* Terms */}
                <Form.Item
                  className="mb-4 mt-2"
                  name="agree"
                  valuePropName="checked"
                  rules={[
                    {
                      validator: (_, value) =>
                        value
                          ? Promise.resolve()
                          : Promise.reject(
                              new Error("Please accept the terms"),
                            ),
                    },
                  ]}>
                  <Checkbox className="text-sm">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="font-medium text-green-600 hover:underline">
                      Terms
                    </Link>{" "}
                    &{" "}
                    <Link
                      href="/privacy"
                      className="font-medium text-green-600 hover:underline">
                      Privacy Policy
                    </Link>
                  </Checkbox>
                </Form.Item>

                {/* Submit */}
                <Button
                  htmlType="submit"
                  loading={loading}
                  type="primary"
                  block
                  className="h-12 rounded-xl border-0 bg-gradient-to-r from-green-600 to-emerald-600 text-base font-semibold shadow-lg hover:from-green-700 hover:to-emerald-700">
                  Create Account
                </Button>
              </Form>
              <Divider>
                <span className="text-gray-400 text-sm">OR</span>
              </Divider>

              <Button
                block
                size="large"
                icon={<GoogleOutlined />}
                onClick={handleGoogleSignup}
                className="h-14 rounded-xl border text-base font-semibold hover:bg-gray-50">
                Continue with Google
              </Button>

              <div className="text-center mt-6">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-emerald-600 font-semibold hover:underline">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
