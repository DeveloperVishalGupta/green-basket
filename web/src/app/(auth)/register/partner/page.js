"use client";

import { authAPI } from "@/lib/api";
import {
  ROLE_LABELS,
  ROLES,
  STAFF_REGISTRATION_ROLES,
  getRoleHome,
} from "@/lib/roles";
import {
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { App, Button, Form, Input, Select } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const inputClass = "h-11 rounded-xl";

/** Role-specific fields. Add a role's extra fields here to extend the form. */
const ROLE_FIELDS = {
  [ROLES.VENDOR]: [
    { name: "businessName", label: "Business Name", required: true },
    { name: "gstNumber", label: "GST Number (optional)" },
    { name: "businessAddress", label: "Business Address (optional)" },
  ],
  [ROLES.DELIVERY_PARTNER]: [
    {
      name: "vehicleType",
      label: "Vehicle Type",
      required: true,
      placeholder: "Bike / Scooter / Van",
    },
    { name: "vehicleNumber", label: "Vehicle Number", required: true },
    { name: "licenseNumber", label: "Driving License Number", required: true },
    { name: "serviceArea", label: "Service Area (optional)" },
  ],
  [ROLES.ADMIN]: [
    {
      name: "adminInviteCode",
      label: "Admin Invite Code",
      required: true,
      password: true,
    },
  ],
};

/**
 * Registration for admin / vendor / delivery partner.
 * Customers use /register. Vendors and delivery partners need admin approval
 * before they can log in; admins need the invite code.
 */
export default function PartnerRegisterPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(ROLES.VENDOR);

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      // eslint-disable-next-line no-unused-vars
      const { confirmPassword, agree, ...payload } = values;
      const response = await authAPI.registerStaff({ ...payload, role });
      const data = response.data;

      if (data.pendingApproval) {
        message.success(data.message, 6);
        router.push("/login");
        return;
      }

      // Auto-approved (admin): token returned, same session handling as login
      if (data.token) localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = getRoleHome(data.user.role);
    } catch (error) {
      message.error(
        error.response?.data?.message || "Registration failed. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (value) => {
    setRole(value);
    // Drop values typed for the previous role's fields
    const keep = ["firstName", "lastName", "email", "phone", "password", "confirmPassword"];
    const current = form.getFieldsValue(true);
    const reset = {};
    Object.keys(current).forEach((k) => {
      if (!keep.includes(k)) reset[k] = undefined;
    });
    form.setFieldsValue(reset);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-yellow-50 to-emerald-100 flex">
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full md:max-w-2xl">
          <div className="rounded-4xl bg-white/90 backdrop-blur-xl border border-white shadow-2xl p-6">
            <div className="text-center">
              <Link
                href="/"
                className="mx-auto flex h-32 w-32 items-center justify-center rounded-2xl">
                <Image
                  src="/images/green-basket-11.png"
                  alt="green basket"
                  width={128}
                  height={128}
                />
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                Partner Registration
              </h1>
              <p className="mt-2 mb-4 text-gray-500">
                For vendors, delivery partners and admins.
              </p>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleRegister}
              autoComplete="off"
              requiredMark={false}>
              <Form.Item label="I want to register as" className="mb-3">
                <Select
                  size="large"
                  value={role}
                  onChange={handleRoleChange}
                  options={STAFF_REGISTRATION_ROLES.map((r) => ({
                    value: r,
                    label: ROLE_LABELS[r],
                  }))}
                />
              </Form.Item>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-1">
                <Form.Item
                  className="mb-3"
                  name="firstName"
                  label="First Name"
                  rules={[{ required: true, message: "Enter first name" }]}>
                  <Input
                    className={inputClass}
                    prefix={<UserOutlined className="text-gray-400" />}
                  />
                </Form.Item>
                <Form.Item
                  className="mb-3"
                  name="lastName"
                  label="Last Name"
                  rules={[{ required: true, message: "Enter last name" }]}>
                  <Input
                    className={inputClass}
                    prefix={<UserOutlined className="text-gray-400" />}
                  />
                </Form.Item>
                <Form.Item
                  className="mb-3"
                  name="email"
                  label="Email Address"
                  rules={[
                    { required: true, message: "Enter your email" },
                    { type: "email", message: "Invalid email" },
                  ]}>
                  <Input
                    className={inputClass}
                    prefix={<MailOutlined className="text-gray-400" />}
                  />
                </Form.Item>
                <Form.Item
                  className="mb-3"
                  name="phone"
                  label="Phone Number"
                  rules={[
                    { required: true, message: "Enter your phone number" },
                    { pattern: /^[0-9]{10}$/, message: "Enter valid mobile number" },
                  ]}>
                  <Input
                    className={inputClass}
                    prefix={<PhoneOutlined className="text-gray-400" />}
                    maxLength={10}
                  />
                </Form.Item>
                <Form.Item
                  className="mb-3"
                  name="password"
                  label="Password"
                  rules={[
                    { required: true, message: "Enter password" },
                    { min: 6, message: "Minimum 6 characters" },
                  ]}>
                  <Input.Password
                    className={inputClass}
                    prefix={<LockOutlined className="text-gray-400" />}
                  />
                </Form.Item>
                <Form.Item
                  className="mb-3"
                  name="confirmPassword"
                  label="Confirm Password"
                  dependencies={["password"]}
                  rules={[
                    { required: true, message: "Confirm password" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        return !value || getFieldValue("password") === value
                          ? Promise.resolve()
                          : Promise.reject(new Error("Passwords do not match"));
                      },
                    }),
                  ]}>
                  <Input.Password
                    className={inputClass}
                    prefix={<LockOutlined className="text-gray-400" />}
                  />
                </Form.Item>

                {/* Role-specific fields */}
                {(ROLE_FIELDS[role] || []).map((f) => (
                  <Form.Item
                    key={f.name}
                    className="mb-3"
                    name={f.name}
                    label={f.label}
                    rules={
                      f.required
                        ? [{ required: true, message: `${f.label} is required` }]
                        : []
                    }>
                    {f.password ? (
                      <Input.Password className={inputClass} />
                    ) : (
                      <Input
                        className={inputClass}
                        placeholder={f.placeholder}
                      />
                    )}
                  </Form.Item>
                ))}
              </div>

              {role !== ROLES.ADMIN && (
                <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  Your account will be reviewed by an admin. You can log in once
                  it is approved.
                </p>
              )}

              <Button
                htmlType="submit"
                loading={loading}
                type="primary"
                block
                className="h-12 rounded-xl border-0 bg-linear-to-r from-green-600 to-emerald-600 text-base font-semibold shadow-lg">
                Register as {ROLE_LABELS[role]}
              </Button>
            </Form>

            <div className="mt-6 space-y-1 text-center text-gray-600">
              <p>
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-emerald-600 hover:underline">
                  Sign In
                </Link>
              </p>
              <p>
                Shopping for groceries?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-emerald-600 hover:underline">
                  Customer sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
