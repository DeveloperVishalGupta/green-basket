/**
 * Terms and Policies Page
 * Displays terms of service, privacy policy, and other policies
 */

"use client";

import Header from "@/components/layout/Header";
import PageHeader from "@/components/layout/PageHeader";
import {
  FileTextOutlined,
  MailOutlined,
  SafetyOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { Tabs } from "antd";

export default function TermsAndPoliciesPage() {
  const tabItems = [
    {
      key: "terms",
      label: (
        <span className="flex items-center gap-2">
          <FileTextOutlined />
          Terms of Service
        </span>
      ),
      children: (
        <div className="prose max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Terms of Service
          </h2>
          <p className="text-gray-500 mb-8">Last Updated: July 2026</p>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              1. Acceptance of Terms
            </h3>
            <p className="text-gray-700">
              Welcome to <strong>Green Basket</strong>. By accessing or using
              our website, mobile application, or related services, you agree to
              be bound by these Terms of Service. If you do not agree with these
              terms, please do not use our platform.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              2. Our Services
            </h3>

            <p className="text-gray-700 mb-3">
              Green Basket is an online platform that enables customers to order
              <b>fresh vegetables, fruits, and grocery essentials</b> for home
              delivery.
            </p>

            <p className="text-gray-700 mb-2">
              By using our services, you agree to:
            </p>

            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>
                Provide accurate and complete information while placing orders.
              </li>
              <li>Use the platform only for lawful purposes.</li>
              <li>
                Not misuse or interfere with the website or mobile application.
              </li>
              <li>Not place fraudulent or fake orders.</li>
              <li>
                Not use bots, scripts, or automated tools without permission.
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              3. Account Registration
            </h3>

            <p className="text-gray-700 mb-2">
              Some features may require you to create an account.
            </p>

            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Maintain the confidentiality of your login credentials.</li>
              <li>
                You are responsible for all activities under your account.
              </li>
              <li>Provide accurate contact and delivery information.</li>
              <li>
                Notify us immediately if your account is accessed without
                authorization.
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              4. Product Availability
            </h3>

            <p className="text-gray-700 mb-2">
              Our products include fresh vegetables, fruits, and grocery items.
            </p>

            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Availability depends on seasonal supply and stock.</li>
              <li>
                Some products may become unavailable after an order is placed.
              </li>
              <li>
                Unavailable products may be substituted with your approval or
                refunded.
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              5. Product Quality
            </h3>

            <p className="text-gray-700 mb-2">
              We strive to deliver fresh and high-quality produce.
            </p>

            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>
                Product size, color, shape, and weight may naturally vary.
              </li>
              <li>Images shown are for illustration purposes only.</li>
              <li>Minor natural variations are not considered defects.</li>
              <li>
                Damaged, spoiled, or incorrect items should be reported within
                the specified complaint period.
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              6. Pricing and Payments
            </h3>

            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>All prices are displayed in Indian Rupees (₹).</li>
              <li>Prices may change without prior notice.</li>
              <li>Taxes and delivery charges are shown before checkout.</li>
              <li>
                Currently, Green Basket accepts Cash on Delivery (COD) as the
                only payment method.
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              7. Delivery Policy
            </h3>

            <p className="text-gray-700 mb-2">
              We aim to deliver orders within the estimated delivery time.
              However, delays may occur due to:
            </p>

            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Weather conditions.</li>
              <li>Traffic or road closures.</li>
              <li>High order volumes.</li>
              <li>Unexpected operational issues.</li>
            </ul>

            <p className="text-gray-700 mt-3">
              Customers must provide a complete and accurate delivery address
              and be available to receive the order.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              8. Order Cancellation
            </h3>

            <p className="text-gray-700 mb-2">
              Orders may be cancelled before they are packed or dispatched.
            </p>

            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Packed or dispatched orders may not be cancelled.</li>
              <li>
                Green Basket may cancel orders due to product unavailability.
              </li>
              <li>Pricing errors.</li>
              <li>Suspected fraudulent activity.</li>
              <li>Technical or operational issues.</li>
            </ul>

            <p className="text-gray-700 mt-3">
              Eligible refunds will be processed according to our Refund Policy.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              9. Returns and Refunds
            </h3>

            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>
                Returns are generally not accepted for perishable products.
              </li>
              <li>
                Refunds or replacements are available for damaged, spoiled,
                missing, or incorrect items after verification.
              </li>
              <li>
                Claims must be submitted within the specified refund period.
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              10. Intellectual Property
            </h3>

            <p className="text-gray-700">
              All content on the Green Basket platform, including logos, text,
              graphics, product images, software, and designs, is the property
              of Green Basket and is protected by applicable intellectual
              property laws. You may not copy, reproduce, or distribute any
              content without prior written permission.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              11. User Responsibilities
            </h3>

            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Do not provide false or misleading information.</li>
              <li>Do not misuse promotional offers or discount coupons.</li>
              <li>Do not attempt unauthorized access to our systems.</li>
              <li>Do not upload malicious software or harmful content.</li>
              <li>Comply with all applicable laws while using the platform.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              12. Limitation of Liability
            </h3>

            <p className="text-gray-700">
              Green Basket shall not be liable for delivery delays caused by
              events beyond our control, natural variations in fresh produce,
              indirect or consequential damages, or losses resulting from
              incorrect delivery information provided by customers. Our maximum
              liability shall not exceed the amount paid for the affected order.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              13. Privacy
            </h3>

            <p className="text-gray-700">
              Your personal information is collected and processed in accordance
              with our Privacy Policy and is used only for order processing,
              delivery, and customer support.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              14. Changes to Terms
            </h3>

            <p className="text-gray-700">
              Green Basket reserves the right to update these Terms of Service
              at any time. Continued use of our platform after changes become
              effective constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              15. Contact Us
            </h3>

            <p className="text-gray-700">
              If you have any questions regarding these Terms of Service, please
              contact our customer support through the Green Basket website or
              mobile application.
            </p>
          </section>
        </div>
      ),
    },
    {
      key: "privacy",
      label: (
        <span className="flex items-center gap-2">
          <SafetyOutlined />
          Privacy Policy
        </span>
      ),
      // children: (
      //   <div className="prose max-w-none">
      //     <h2 className="text-2xl font-bold text-gray-900 mb-4">
      //       Privacy Policy
      //     </h2>

      //     <section className="mb-6">
      //       <h3 className="text-xl font-semibold text-gray-900 mb-2">
      //         1. Information We Collect
      //       </h3>
      //       <p className="text-gray-700 mb-2">
      //         We collect information that you provide directly to us, including:
      //       </p>
      //       <ul className="list-disc pl-6 space-y-1 text-gray-700">
      //         <li>Name, email address, phone number, and delivery address</li>
      //         <li>
      //           Payment information (processed securely through payment
      //           gateways)
      //         </li>
      //         <li>Order history and preferences</li>
      //         <li>Communication records with our customer service</li>
      //       </ul>
      //     </section>

      //     <section className="mb-6">
      //       <h3 className="text-xl font-semibold text-gray-900 mb-2">
      //         2. How We Use Your Information
      //       </h3>
      //       <p className="text-gray-700 mb-2">
      //         We use the information we collect to:
      //       </p>
      //       <ul className="list-disc pl-6 space-y-1 text-gray-700">
      //         <li>Process and fulfill your orders</li>
      //         <li>Communicate with you about orders, products, and services</li>
      //         <li>Improve our website and services</li>
      //         <li>Send marketing communications (with your consent)</li>
      //         <li>Detect and prevent fraud</li>
      //       </ul>
      //     </section>

      //     <section className="mb-6">
      //       <h3 className="text-xl font-semibold text-gray-900 mb-2">
      //         3. Information Sharing
      //       </h3>
      //       <p className="text-gray-700">
      //         We do not sell or rent your personal information to third parties.
      //         We may share information with service providers who help us
      //         operate our business, such as payment processors and shipping
      //         companies.
      //       </p>
      //     </section>

      //     <section className="mb-6">
      //       <h3 className="text-xl font-semibold text-gray-900 mb-2">
      //         4. Data Security
      //       </h3>
      //       <p className="text-gray-700">
      //         We implement appropriate security measures to protect your
      //         personal information. However, no method of transmission over the
      //         internet is 100% secure.
      //       </p>
      //     </section>

      //     <section className="mb-6">
      //       <h3 className="text-xl font-semibold text-gray-900 mb-2">
      //         5. Your Rights
      //       </h3>
      //       <p className="text-gray-700 mb-2">You have the right to:</p>
      //       <ul className="list-disc pl-6 space-y-1 text-gray-700">
      //         <li>Access and update your personal information</li>
      //         <li>Request deletion of your account and data</li>
      //         <li>Opt-out of marketing communications</li>
      //         <li>Request a copy of your data</li>
      //       </ul>
      //     </section>

      //     <section className="mb-6">
      //       <h3 className="text-xl font-semibold text-gray-900 mb-2">
      //         6. Cookies
      //       </h3>
      //       <p className="text-gray-700">
      //         We use cookies and similar tracking technologies to enhance your
      //         browsing experience, analyze site traffic, and understand user
      //         preferences.
      //       </p>
      //     </section>

      //     <section className="mb-6">
      //       <h3 className="text-xl font-semibold text-gray-900 mb-2">
      //         7. Contact Us
      //       </h3>
      //       <p className="text-gray-700">
      //         If you have any questions about this Privacy Policy, please
      //         contact us at:
      //         <br />
      //         <strong>Email:</strong> support@greenbasket.com
      //       </p>
      //     </section>
      //   </div>
      // ),
      children: (
        <div className="prose max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Privacy Policy
          </h2>

          <p className="text-gray-500 mb-8">Last Updated: July 2026</p>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              1. Information We Collect
            </h3>

            <p className="text-gray-700 mb-2">
              Green Basket collects information you provide when you create an
              account, place an order, or contact our support team.
            </p>

            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Full name, email address, and mobile number.</li>
              <li>Delivery and billing addresses.</li>
              <li>
                Your selected payment method (currently Cash on Delivery).
              </li>
              <li>Order history and shopping preferences.</li>
              <li>Communications with our customer support.</li>
              <li>
                Device information, browser type, IP address, and usage
                analytics.
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              2. How We Use Your Information
            </h3>

            <p className="text-gray-700 mb-2">
              We use your information to provide a better shopping experience
              and operate our services efficiently.
            </p>

            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Process and deliver your orders.</li>
              <li>Manage your account and purchase history.</li>
              <li>Provide customer support.</li>
              <li>Send order confirmations and delivery updates.</li>
              <li>Improve our website, mobile app, and services.</li>
              <li>Recommend products based on your preferences.</li>
              <li>Send promotional offers with your consent.</li>
              <li>Detect and prevent fraud or unauthorized activities.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              3. Information Sharing
            </h3>

            <p className="text-gray-700 mb-2">
              We value your privacy and do not sell or rent your personal
              information.
            </p>
            <p className="text-gray-700">
              We do not sell or rent your personal information. We only share
              your information when necessary to provide our services.
            </p>

            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Delivery partners for delivering your orders.</li>
              <li>Cloud hosting and technical service providers.</li>
              <li>Government authorities when required by applicable law.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              4. Data Security
            </h3>

            <p className="text-gray-700">
              We use appropriate technical and organizational security measures
              to protect your personal information from unauthorized access,
              alteration, disclosure, or destruction. While we strive to protect
              your data, no method of internet transmission or electronic
              storage is completely secure.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              5. Your Privacy Rights
            </h3>

            <p className="text-gray-700 mb-2">You have the right to:</p>

            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Access and update your personal information.</li>
              <li>Correct inaccurate or outdated information.</li>
              <li>Request deletion of your account and personal data.</li>
              <li>Opt out of promotional emails and marketing messages.</li>
              <li>Request a copy of your personal information.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              6. Cookies & Tracking Technologies
            </h3>

            <p className="text-gray-700">
              Green Basket uses cookies and similar technologies to remember
              your preferences, improve website performance, personalize your
              shopping experience, and analyze website traffic. You can manage
              or disable cookies through your browser settings, although some
              features may not function properly.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              7. Third-Party Services
            </h3>

            <p className="text-gray-700">
              Our platform may use trusted third-party services for payments,
              analytics, maps, and notifications. These providers have their own
              privacy policies governing the use of your information.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              8. Children&apos;s Privacy
            </h3>

            <p className="text-gray-700">
              Green Basket does not knowingly collect personal information from
              children under the age of 18. If we become aware that such
              information has been collected, we will take appropriate steps to
              remove it.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              9. Changes to this Privacy Policy
            </h3>

            <p className="text-gray-700">
              We may update this Privacy Policy from time to time to reflect
              changes in our services, legal requirements, or business
              practices. The latest version will always be available on our
              website and mobile application.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              10. Contact Us
            </h3>

            <p className="text-gray-700">
              If you have any questions regarding this Privacy Policy or how
              your information is handled, please contact our customer support
              through the Green Basket website or mobile application.
            </p>

            <div className="mt-4 rounded-lg border bg-gray-50 p-4">
              <p className="mb-1">
                <strong>Green Basket Support</strong>
              </p>
              <p>Email: support@greenbasket.com</p>
              <p>Phone: +91 XXXXXXXXXX</p>
            </div>
          </section>
        </div>
      ),
    },
    {
      key: "return",
      label: (
        <span className="flex items-center gap-2">
          <SwapOutlined />
          Return & Refund Policy
        </span>
      ),
      children: (
        <div className="prose max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Return & Refund Policy
          </h2>

          <p className="text-gray-500 mb-8">Last Updated: July 2026</p>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              1. Return Eligibility
            </h3>

            <p className="text-gray-700">
              Green Basket deals in fresh vegetables, fruits, and grocery
              products, which are perishable in nature. Therefore, returns are
              generally not accepted after an order has been delivered.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              2. Eligible Refund & Replacement Cases
            </h3>

            <p className="text-gray-700 mb-2">
              You may be eligible for a refund or replacement if:
            </p>

            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>You receive damaged or spoiled products.</li>
              <li>You receive the wrong product.</li>
              <li>You receive missing items from your order.</li>
              <li>The delivered product is not fit for consumption.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              3. Non-Refundable Cases
            </h3>

            <p className="text-gray-700 mb-2">
              Refunds or replacements will not be provided if:
            </p>

            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>You change your mind after delivery.</li>
              <li>The product has been partially or fully consumed.</li>
              <li>
                The complaint is raised after the allowed reporting period.
              </li>
              <li>
                Natural variations in size, shape, color, or weight of fresh
                produce.
              </li>
              <li>
                Incorrect delivery information was provided by the customer.
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              4. How to Report an Issue
            </h3>

            <p className="text-gray-700 mb-2">
              If you receive a damaged, spoiled, incorrect, or missing product:
            </p>

            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Contact our customer support within 6 hours of delivery.</li>
              <li>Provide your Order ID.</li>
              <li>Share clear photos of the affected product.</li>
              <li>Our team will review your request as soon as possible.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              5. Refund Process
            </h3>

            <p className="text-gray-700">
              After verifying your request, Green Basket may approve a
              replacement, store credit, or refund depending on the situation.
              Approved refunds will be processed within 5–7 business days using
              the appropriate refund method.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              6. Order Cancellation
            </h3>

            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>
                Orders may be cancelled before they are packed or dispatched.
              </li>
              <li>
                Once an order has been packed or is out for delivery,
                cancellation may not be possible.
              </li>
              <li>
                Green Basket reserves the right to cancel any order due to
                product unavailability or operational reasons.
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              7. Cash on Delivery (COD)
            </h3>

            <p className="text-gray-700">
              Green Basket currently accepts{" "}
              <strong>Cash on Delivery (COD) </strong>
              as the only payment method. If a refund is approved for a COD
              order, our customer support team will contact you to arrange the
              refund through an appropriate method.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              8. Contact Us
            </h3>

            <p className="text-gray-700">
              If you have any questions regarding returns or refunds, please
              contact our customer support.
            </p>

            <div className="mt-4 rounded-lg border bg-gray-50 p-4">
              <p className="mb-1">
                <strong>Green Basket Support</strong>
              </p>
              <p>Email: support@greenbasket.com</p>
              <p>Phone: +91 XXXXXXXXXX</p>
            </div>
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
    //           <strong>Email:</strong> support@greenbasket.com
    //         </p>
    //       </section>
    //     </div>
    //   ),
    // },
  ];

  return (
    <div className="min-h-below-header bg-white/95">
      <Header />
      <PageHeader
        title="Terms & Policies"
        subtitle="Privacy, returns, and terms of service"
        maxWidth="max-w-5xl"
      />

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
        <div className="bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200 shadow-sm">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <MailOutlined className="text-emerald-600 text-lg" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                Have Questions?
              </h3>
              <p className="text-sm sm:text-base text-gray-700 mb-4">
                If you have any questions about our policies, please don&apos;t
                hesitate to contact us.
              </p>
            </div>
          </div>
          <a
            href="mailto:support@greenbasket.com"
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm sm:text-base font-medium transition-all hover:shadow-lg">
            <MailOutlined />
            <span>Contact Support</span>
          </a>
        </div>
      </div>
    </div>
  );
}
