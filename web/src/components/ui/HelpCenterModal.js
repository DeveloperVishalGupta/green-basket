/**
 * Help Center Modal
 * Displays customer support information
 */

"use client";

import {
  ClockCircleOutlined,
  CustomerServiceOutlined,
  MailOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { App, Modal } from "antd";

export default function HelpCenterModal({ open, onClose }) {
  const { message } = App.useApp();

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("support@greenbasket.com");
    message.success("Email copied to clipboard!");
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      title={
        <div className="flex items-center gap-2">
          <CustomerServiceOutlined className="text-2xl text-emerald-600" />
          <span className="text-xl font-bold">Help Center</span>
        </div>
      }>
      <div className="py-4 space-y-6">
        {/* Welcome Message */}
        <div className="bg-linear-to-r from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-200">
          <h3 className="text-lg font-semibold text-emerald-800">
            Welcome to Green Basket Help Center 👋
          </h3>

          <p className="mt-2 text-gray-700 leading-6">
            We're here to make your fresh fruit and vegetable shopping
            experience smooth and hassle-free. You can place orders{" "}
            <strong>24/7</strong>, and your order will be delivered during your{" "}
            <strong>selected delivery slot</strong>.
          </p>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <MailOutlined className="text-emerald-600" />
            Contact Us
          </h3>

          {/* Email */}
          {/* <div className="bg-gray-50 rounded-lg p-4"> */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Customer Support</p>

                <p className="font-semibold text-gray-900">
                  support@greenbasket.com
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  We usually respond within 24 hours.
                </p>
              </div>
              <button
                onClick={handleCopyEmail}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
                Copy
              </button>
            </div>
          </div>

          {/* Business Hours */}

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex gap-3">
              <ClockCircleOutlined className="text-emerald-600 text-xl mt-1" />

              <div>
                <p className="text-sm text-gray-600">Ordering & Delivery</p>

                <p className="font-semibold text-gray-900">
                  Orders Accepted 24×7
                </p>

                <p className="text-sm text-gray-700">
                  Place your order anytime.
                </p>

                <p className="text-sm text-gray-700">
                  Deliveries are made during your selected delivery slot.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <QuestionCircleOutlined className="text-emerald-600" />
            What can we help you with?
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 mt-0.5">✓</span>
              <span>Order status and tracking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 mt-0.5">✓</span>
              <span>Product information and availability</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 mt-0.5">✓</span>
              <span>Returns and refunds</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 mt-0.5">✓</span>
              <span>Payment and billing issues</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 mt-0.5">✓</span>
              <span>Account and profile management</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 mt-0.5">✓</span>
              <span>General inquiries and feedback</span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h4 className="font-semibold text-amber-800">Delivery Information</h4>

          <p className="mt-2 text-sm text-amber-700 leading-6">
            Green Basket accepts orders{" "}
            <strong>24 hours a day, 7 days a week</strong>. Your order will be
            delivered during the delivery slot selected at checkout. Please
            ensure someone is available to receive the order during that time.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="border-t pt-4">
          <p className="text-sm text-gray-600 mb-3">Quick Actions</p>
          <div className="flex gap-2">
            <button
              onClick={() => (window.location.href = "/orders")}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
              My Orders
            </button>
            <button
              onClick={() => (window.location.href = "/profile")}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
              Manage Profile
            </button>
          </div>
        </div>

        {/* Email Link Button */}
        <div className="pt-2">
          <a
            href="mailto:support@greenbasket.com"
            className="block w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-center rounded-lg font-semibold transition-colors">
            Send Email
          </a>
        </div>
      </div>
    </Modal>
  );
}
