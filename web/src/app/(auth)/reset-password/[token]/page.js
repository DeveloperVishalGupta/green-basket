"use client";

import { authAPI } from "@/lib/api";
import { LockOutlined } from "@ant-design/icons";
import { App, Button, Form, Input } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (values) => {
    setLoading(true);

    try {
      const response = await authAPI.resetPassword(token, {
        password: values.password,
      });

      if (response.data.success) {
        message.success(
          response.data.message || "Password updated successfully.",
        );

        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch (error) {
      console.error("Reset Password error:", error);

      const errorMessage =
        error.response?.data?.message || "Unable to reset password.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-yellow-50 to-emerald-100 flex">
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="rounded-[32px] bg-white/90 backdrop-blur-xl border border-white shadow-2xl p-6">
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
                Reset Password
              </h1>

              <p className="mt-2 text-gray-500">Enter your new password.</p>
            </div>

            <Form form={form} layout="vertical" onFinish={handleResetPassword}>
              <Form.Item
                name="password"
                label="New Password"
                rules={[
                  {
                    required: true,
                    message: "Please enter your new password",
                  },
                  {
                    min: 6,
                    message: "Password must be at least 6 characters",
                  },
                ]}>
                <Input.Password
                  size="large"
                  className="rounded-xl h-12"
                  prefix={<LockOutlined />}
                  placeholder="Enter new password"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                dependencies={["password"]}
                rules={[
                  {
                    required: true,
                    message: "Please confirm your password",
                  },
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
                  size="large"
                  className="rounded-xl h-12"
                  prefix={<LockOutlined />}
                  placeholder="Confirm new password"
                />
              </Form.Item>

              <Button
                htmlType="submit"
                type="primary"
                loading={loading}
                block
                size="large"
                className="h-14 rounded-xl bg-green-600 border-0 text-base font-semibold hover:bg-green-700">
                Reset Password
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
