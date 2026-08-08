"use client";

import { authAPI } from "@/lib/api";
import { MailOutlined } from "@ant-design/icons";
import { App, Button, Form, Input } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (values) => {
    setLoading(true);

    try {
      const response = await authAPI.forgotPassword(values);

      if (response.data.success) {
        message.success(
          response.data.message || "Password reset link sent successfully.",
        );

        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (error) {
      console.error("Forgot Password error:", error);

      const errorMessage =
        error.response?.data?.message || "Unable to send password reset link.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-yellow-50 to-emerald-100 flex">
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="rounded-4xl bg-white/90 backdrop-blur-xl border border-white shadow-2xl p-6">
            <div className="text-center mb-5">
              <Link
                href="/"
                className="mx-auto mb-5 flex h-40 w-40 items-center justify-center rounded-2xl">
                <Image
                  src="/images/green-basket-11.png"
                  alt="green basket"
                  width={160}
                  height={160}
                />
              </Link>

              <h1 className="text-4xl font-bold text-gray-900">
                Forgot Password
              </h1>

              <p className="mt-2 text-gray-500">
                Enter your registered email address.
              </p>
            </div>

            <Form form={form} layout="vertical" onFinish={handleForgotPassword}>
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

              <Button
                htmlType="submit"
                type="primary"
                loading={loading}
                block
                size="large"
                className="h-14 rounded-xl bg-green-600 border-0 text-base font-semibold hover:bg-green-700">
                Send Reset Link
              </Button>
            </Form>

            <p className="mt-8 text-center text-gray-600">
              Remember your password?
              <Link
                href="/login"
                className="ml-2 font-semibold text-green-600 hover:text-green-700">
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
