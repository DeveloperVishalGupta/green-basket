/**
 * Terms and Policies Page
 * Displays terms of service, privacy policy, and other policies
 */

'use client';

import {
  ArrowLeftOutlined,
  FileTextOutlined,
  MailOutlined,
  SafetyOutlined,
  SwapOutlined
} from '@ant-design/icons';
import { Tabs } from 'antd';
import { useRouter } from 'next/navigation';

export default function TermsAndPoliciesPage() {
  const router = useRouter();
  
  const tabItems = [
    {
      key: 'terms',
      label: (
        <span className="flex items-center gap-2">
          <FileTextOutlined />
          Terms of Service
        </span>
      ),
      children: (
        <div className="prose max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Terms of Service</h2>
          
          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h3>
            <p className="text-gray-700">
              By accessing and using Apna Bazaar website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">2. Use of Services</h3>
            <p className="text-gray-700 mb-2">
              You agree to use our services only for lawful purposes and in accordance with these terms. You must not:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Use the website in any way that violates any applicable laws or regulations</li>
              <li>Engage in any conduct that restricts or inhibits anyone's use of the website</li>
              <li>Use the website to transmit any false or misleading information</li>
              <li>Attempt to interfere with the proper working of the website</li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">3. Account Registration</h3>
            <p className="text-gray-700">
              To access certain features, you may be required to register an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">4. Product Information</h3>
            <p className="text-gray-700">
              We strive to provide accurate product descriptions and pricing. However, we do not warrant that product descriptions, pricing, or other content is accurate, complete, reliable, current, or error-free.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">5. Intellectual Property</h3>
            <p className="text-gray-700">
              All content on this website, including text, graphics, logos, images, and software, is the property of Apna Bazaar and protected by intellectual property laws.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">6. Limitation of Liability</h3>
            <p className="text-gray-700">
              Apna Bazaar shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">7. Changes to Terms</h3>
            <p className="text-gray-700">
              We reserve the right to modify these terms at any time. Your continued use of the service after changes constitutes acceptance of the modified terms.
            </p>
          </section>
        </div>
      ),
    },
    {
      key: 'privacy',
      label: (
        <span className="flex items-center gap-2">
          <SafetyOutlined />
          Privacy Policy
        </span>
      ),
      children: (
        <div className="prose max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy Policy</h2>
          
          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">1. Information We Collect</h3>
            <p className="text-gray-700 mb-2">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Name, email address, phone number, and delivery address</li>
              <li>Payment information (processed securely through payment gateways)</li>
              <li>Order history and preferences</li>
              <li>Communication records with our customer service</li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">2. How We Use Your Information</h3>
            <p className="text-gray-700 mb-2">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about orders, products, and services</li>
              <li>Improve our website and services</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Detect and prevent fraud</li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">3. Information Sharing</h3>
            <p className="text-gray-700">
              We do not sell or rent your personal information to third parties. We may share information with service providers who help us operate our business, such as payment processors and shipping companies.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">4. Data Security</h3>
            <p className="text-gray-700">
              We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">5. Your Rights</h3>
            <p className="text-gray-700 mb-2">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Access and update your personal information</li>
              <li>Request deletion of your account and data</li>
              <li>Opt-out of marketing communications</li>
              <li>Request a copy of your data</li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">6. Cookies</h3>
            <p className="text-gray-700">
              We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and understand user preferences.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">7. Contact Us</h3>
            <p className="text-gray-700">
              If you have any questions about this Privacy Policy, please contact us at:
              <br />
              <strong>Email:</strong> iqra.bangles.stores@gmail.com
            </p>
          </section>
        </div>
      ),
    },
    {
      key: 'return',
      label: (
        <span className="flex items-center gap-2">
          <SwapOutlined />
          Return & Refund Policy
        </span>
      ),
      children: (
        <div className="prose max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Return & Refund Policy</h2>
          
          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">1. Return Eligibility</h3>
            <p className="text-gray-700 mb-2">
              You may return most items within 7 days of delivery for a full refund. To be eligible for a return:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Items must be unused and in original packaging</li>
              <li>Tags and labels must be intact</li>
              <li>Items must be in resaleable condition</li>
              <li>Return request must be initiated within the return period</li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">2. Non-Returnable Items</h3>
            <p className="text-gray-700 mb-2">
              The following items cannot be returned:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Customized or personalized items</li>
              <li>Items purchased on final sale or clearance</li>
              <li>Gift cards</li>
              <li>Intimate apparel and accessories</li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">3. Return Process</h3>
            <p className="text-gray-700 mb-2">
              To initiate a return:
            </p>
            <ol className="list-decimal pl-6 space-y-1 text-gray-700">
              <li>Go to your order history and select the item you wish to return</li>
              <li>Choose the reason for return and submit the request</li>
              <li>Pack the item securely in its original packaging</li>
              <li>Our team will arrange pickup or provide return shipping label</li>
            </ol>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">4. Refund Processing</h3>
            <p className="text-gray-700">
              Once we receive and inspect your return, we will process your refund within 5-7 business days. The refund will be credited to your original payment method or store credit, as per your preference.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">5. Exchange Policy</h3>
            <p className="text-gray-700">
              We currently do not offer direct exchanges. If you need a different size or color, please return the item for a refund and place a new order.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">6. Damaged or Defective Items</h3>
            <p className="text-gray-700">
              If you receive a damaged or defective item, please contact us immediately with photos. We will arrange for a replacement or full refund, including return shipping costs.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">7. Contact for Returns</h3>
            <p className="text-gray-700">
              For return-related queries, please contact:
              <br />
              <strong>Email:</strong> iqra.bangles.stores@gmail.com
            </p>
          </section>
        </div>
      ),
    },
    // {
    //   key: 'shipping',
    //   label: (
    //     <span className="flex items-center gap-2">
    //       <ShoppingOutlined />
    //       Shipping Policy
    //     </span>
    //   ),
    //   children: (
    //     <div className="prose max-w-none">
    //       <h2 className="text-2xl font-bold text-gray-900 mb-4">Shipping Policy</h2>
          
    //       <section className="mb-6">
    //         <h3 className="text-xl font-semibold text-gray-900 mb-2">1. Shipping Areas</h3>
    //         <p className="text-gray-700">
    //           We currently ship to all major cities and towns across India. Remote areas may have extended delivery times.
    //         </p>
    //       </section>

    //       <section className="mb-6">
    //         <h3 className="text-xl font-semibold text-gray-900 mb-2">2. Shipping Charges</h3>
    //         <p className="text-gray-700 mb-2">
    //           Shipping charges are calculated based on the delivery location and order value:
    //         </p>
    //         <ul className="list-disc pl-6 space-y-1 text-gray-700">
    //           <li>Free shipping on orders above ₹999</li>
    //           <li>Standard shipping: ₹49 for metros, ₹79 for other areas</li>
    //           <li>Express shipping: Available at additional cost</li>
    //         </ul>
    //       </section>

    //       <section className="mb-6">
    //         <h3 className="text-xl font-semibold text-gray-900 mb-2">3. Delivery Time</h3>
    //         <p className="text-gray-700 mb-2">
    //           Estimated delivery times:
    //         </p>
    //         <ul className="list-disc pl-6 space-y-1 text-gray-700">
    //           <li>Metro cities: 3-5 business days</li>
    //           <li>Other cities: 5-7 business days</li>
    //           <li>Remote areas: 7-10 business days</li>
    //         </ul>
    //         <p className="text-gray-700 mt-2">
    //           Note: Delivery times are estimates and may vary due to external factors beyond our control.
    //         </p>
    //       </section>

    //       <section className="mb-6">
    //         <h3 className="text-xl font-semibold text-gray-900 mb-2">4. Order Tracking</h3>
    //         <p className="text-gray-700">
    //           Once your order is shipped, you will receive a tracking number via email and SMS. You can track your order status in the "My Orders" section of your account.
    //         </p>
    //       </section>

    //       <section className="mb-6">
    //         <h3 className="text-xl font-semibold text-gray-900 mb-2">5. Order Confirmation</h3>
    //         <p className="text-gray-700">
    //           After placing an order, you will receive a confirmation email with order details. Please review the information and contact us immediately if there are any errors.
    //         </p>
    //       </section>

    //       <section className="mb-6">
    //         <h3 className="text-xl font-semibold text-gray-900 mb-2">6. Shipping Partners</h3>
    //         <p className="text-gray-700">
    //           We partner with reliable courier services to ensure safe and timely delivery of your orders. Our shipping partners include established logistics companies across India.
    //         </p>
    //       </section>

    //       <section className="mb-6">
    //         <h3 className="text-xl font-semibold text-gray-900 mb-2">7. Failed Delivery Attempts</h3>
    //         <p className="text-gray-700">
    //           If delivery fails due to incorrect address or unavailability, the courier will make additional attempts. After 3 failed attempts, the order will be returned to us, and you may be charged for re-shipment.
    //         </p>
    //       </section>

    //       <section className="mb-6">
    //         <h3 className="text-xl font-semibold text-gray-900 mb-2">8. Contact for Shipping</h3>
    //         <p className="text-gray-700">
    //           For shipping-related queries, please contact:
    //           <br />
    //           <strong>Email:</strong> iqra.bangles.stores@gmail.com
    //         </p>
    //       </section>
    //     </div>
    //   ),
    // },
  ];

  return (
    <div className="min-h-screen bg-white/95">
      {/* Gradient Header */}
      <div className="bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-600 px-4 sm:px-6 py-6 sm:py-8 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeftOutlined className="text-lg" />
            <span className="text-sm">Back</span>
          </button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
            Terms & Policies
          </h1>
          <p className="text-white/90 text-sm sm:text-base">
            Learn about our policies and terms of service
          </p>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-6">
          <Tabs
            defaultActiveKey="terms"
            items={tabItems}
            tabPlacement="top"
            size="large"
          />
        </div>

        {/* Contact Box */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200 shadow-sm">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <MailOutlined className="text-emerald-600 text-lg" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">Have Questions?</h3>
              <p className="text-sm sm:text-base text-gray-700 mb-4">
                If you have any questions about our policies, please don't hesitate to contact us.
              </p>
            </div>
          </div>
          <a
            href="mailto:iqra.bangles.stores@gmail.com"
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm sm:text-base font-medium transition-all hover:shadow-lg"
          >
            <MailOutlined />
            <span>Contact Support</span>
          </a>
        </div>
      </div>
    </div>
  );
}
