"use client";

import PageHeader from "@/components/layout/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { useDeliveryOrders } from "@/hooks/useDeliveryPartner";
import { usersAPI } from "@/lib/api";
import {
  FileTextOutlined,
  LogoutOutlined,
  MailOutlined,
  PhoneOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { App, Button, Form, Input, Tag } from "antd";
import Link from "next/link";
import { useState } from "react";

function Card({ title, children }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      {title && <h2 className="mb-3 text-sm font-bold text-gray-900">{title}</h2>}
      {children}
    </div>
  );
}

const inputClass = "h-11 rounded-xl";

/**
 * Delivery Partner Profile
 * Same look as the customer profile (white rounded cards on gray-50, emerald
 * accents). Personal and vehicle details are editable; approval status and
 * role are read-only (managed by admins).
 */
export default function DeliveryProfilePage() {
  const { user, refreshUser, logout } = useAuth();
  const { message } = App.useApp();
  const [personalForm] = Form.useForm();
  const [vehicleForm] = Form.useForm();
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingVehicle, setSavingVehicle] = useState(false);

  // Tab counts come back with any list request
  const { data: counts } = useDeliveryOrders("completed");
  const completed = counts?.counts?.completed ?? 0;
  const active = counts?.counts?.active ?? 0;

  if (!user) return null;
  const vehicle = user.deliveryProfile || {};

  const save = async (payload, setSaving, success) => {
    setSaving(true);
    try {
      await usersAPI.updateProfile(payload);
      await refreshUser();
      message.success(success);
    } catch (error) {
      message.error(error.message || "Couldn't save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="-mx-4 -mt-4">
      <PageHeader title="Profile" subtitle={user.email} maxWidth="max-w-5xl" />

      <div className="mx-auto max-w-4xl space-y-4 px-4 py-4">
        {/* Summary */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-700">
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="m-0 truncate text-lg font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h1>
                <Tag
                  color="purple"
                  className="m-0 text-[10px] font-semibold uppercase">
                  Delivery Partner
                </Tag>
                <Tag
                  color={
                    user.approvalStatus === "approved" || !user.approvalStatus
                      ? "green"
                      : "orange"
                  }
                  className="m-0 text-[10px] font-semibold uppercase">
                  {user.approvalStatus || "approved"}
                </Tag>
              </div>
              <p className="m-0 truncate text-sm text-gray-600">
                <MailOutlined /> {user.email}
              </p>
              {user.phone && (
                <p className="m-0 truncate text-sm text-gray-600">
                  <PhoneOutlined /> {user.phone}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
            <div className="rounded-lg bg-gray-50 p-3 text-center">
              <div className="text-xl font-bold text-gray-900">{completed}</div>
              <div className="text-xs text-gray-500">Delivered</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 text-center">
              <div className="text-xl font-bold text-gray-900">{active}</div>
              <div className="text-xs text-gray-500">In Progress</div>
            </div>
          </div>
        </div>

        {/* Personal details */}
        <Card title="Personal Details">
          <Form
            form={personalForm}
            layout="vertical"
            requiredMark={false}
            initialValues={{
              firstName: user.firstName,
              lastName: user.lastName,
              phone: user.phone,
            }}
            onFinish={(values) =>
              save(values, setSavingPersonal, "Personal details updated")
            }>
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true, message: "Enter first name" }]}>
                <Input className={inputClass} />
              </Form.Item>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true, message: "Enter last name" }]}>
                <Input className={inputClass} />
              </Form.Item>
            </div>
            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[
                { required: true, message: "Enter your phone number" },
                { pattern: /^[0-9]{10}$/, message: "Enter valid mobile number" },
              ]}>
              <Input className={inputClass} maxLength={10} />
            </Form.Item>
            <Button
              htmlType="submit"
              type="primary"
              loading={savingPersonal}
              className="h-11 rounded-xl border-0 bg-emerald-600 px-6 font-semibold">
              Save Changes
            </Button>
          </Form>
        </Card>

        {/* Vehicle details */}
        <Card title="Vehicle & Service Area">
          <Form
            form={vehicleForm}
            layout="vertical"
            requiredMark={false}
            initialValues={vehicle}
            onFinish={(values) =>
              save(
                { deliveryProfile: values },
                setSavingVehicle,
                "Vehicle details updated",
              )
            }>
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              <Form.Item
                name="vehicleType"
                label="Vehicle Type"
                rules={[{ required: true, message: "Enter vehicle type" }]}>
                <Input className={inputClass} placeholder="Bike / Scooter / Van" />
              </Form.Item>
              <Form.Item
                name="vehicleNumber"
                label="Vehicle Number"
                rules={[{ required: true, message: "Enter vehicle number" }]}>
                <Input className={inputClass} />
              </Form.Item>
              <Form.Item
                name="licenseNumber"
                label="Driving License Number"
                rules={[{ required: true, message: "Enter license number" }]}>
                <Input className={inputClass} />
              </Form.Item>
              <Form.Item name="serviceArea" label="Service Area">
                <Input className={inputClass} />
              </Form.Item>
            </div>
            <Button
              htmlType="submit"
              type="primary"
              loading={savingVehicle}
              className="h-11 rounded-xl border-0 bg-emerald-600 px-6 font-semibold">
              Save Changes
            </Button>
          </Form>
        </Card>

        {/* Links + logout */}
        <div className="rounded-xl bg-white px-4 shadow-sm">
          <Link
            href="/terms-and-policies"
            className="flex items-center gap-3 py-3 transition-colors hover:bg-gray-50">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
              <FileTextOutlined className="text-lg" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="m-0 text-sm font-semibold text-gray-900">
                Terms & Policies
              </p>
              <p className="m-0 text-xs text-gray-500">Legal information</p>
            </div>
            <RightOutlined className="text-xs text-gray-400" />
          </Link>
        </div>

        <Button
          danger
          block
          size="large"
          icon={<LogoutOutlined />}
          onClick={logout}
          className="h-12 rounded-xl font-semibold">
          Logout
        </Button>
      </div>
    </div>
  );
}
