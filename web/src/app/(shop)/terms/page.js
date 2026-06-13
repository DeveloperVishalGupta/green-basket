'use client';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';

/**
 * Terms & Conditions Page
 * Legal terms and conditions for Apna Bazaar
 */
export default function TermsPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <button
                            onClick={() => router.back()}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-all"
                        >
                            <ArrowLeftOutlined className="text-xl" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">Terms & Conditions</h1>
                        <div className="w-10"></div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
                    {/* Last Updated */}
                    <p className="text-sm text-gray-500 mb-8">
                        Last Updated: January 14, 2026
                    </p>

                    {/* Introduction */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Apna Bazaar</h2>
                        <p className="text-gray-700 leading-relaxed">
                            These Terms and Conditions ("Terms") govern your access to and use of the Apna Bazaar website, 
                            mobile applications, and related services (collectively, the "Platform"). By accessing or using 
                            the Platform, you agree to be bound by these Terms. If you do not agree to these Terms, please 
                            do not use the Platform.
                        </p>
                    </section>

                    {/* 1. Account Registration */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">1. Account Registration</h3>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                <strong>1.1 Eligibility:</strong> You must be at least 18 years old to create an account 
                                and make purchases on our Platform. By registering, you represent that you meet this age requirement.
                            </p>
                            <p className="leading-relaxed">
                                <strong>1.2 Account Information:</strong> You agree to provide accurate, current, and complete 
                                information during registration and to update such information to keep it accurate and complete.
                            </p>
                            <p className="leading-relaxed">
                                <strong>1.3 Account Security:</strong> You are responsible for maintaining the confidentiality 
                                of your account credentials and for all activities that occur under your account. Notify us 
                                immediately of any unauthorized use.
                            </p>
                            <p className="leading-relaxed">
                                <strong>1.4 Account Termination:</strong> We reserve the right to suspend or terminate your 
                                account if you violate these Terms or engage in fraudulent or illegal activities.
                            </p>
                        </div>
                    </section>

                    {/* 2. Product Information & Pricing */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">2. Product Information & Pricing</h3>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                <strong>2.1 Product Descriptions:</strong> We strive to display product information accurately. 
                                However, we do not warrant that product descriptions, colors, or other content are error-free, 
                                complete, or current.
                            </p>
                            <p className="leading-relaxed">
                                <strong>2.2 Pricing:</strong> All prices are listed in Indian Rupees (INR) and are subject to 
                                change without notice. We reserve the right to modify prices at any time before purchase confirmation.
                            </p>
                            <p className="leading-relaxed">
                                <strong>2.3 Pricing Errors:</strong> If a product is listed at an incorrect price due to an error, 
                                we reserve the right to cancel orders placed for that product, even if the order has been confirmed.
                            </p>
                            <p className="leading-relaxed">
                                <strong>2.4 Availability:</strong> All orders are subject to product availability. We reserve 
                                the right to discontinue any product at any time.
                            </p>
                        </div>
                    </section>

                    {/* 3. Orders & Payment */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">3. Orders & Payment</h3>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                <strong>3.1 Order Acceptance:</strong> Your receipt of an order confirmation does not signify 
                                our acceptance of your order. We reserve the right to accept or decline your order for any reason.
                            </p>
                            <p className="leading-relaxed">
                                <strong>3.2 Payment Methods:</strong> We accept various payment methods including credit/debit 
                                cards, net banking, UPI, and other digital payment options through Razorpay or similar payment gateways.
                            </p>
                            <p className="leading-relaxed">
                                <strong>3.3 Payment Security:</strong> All payment information is processed securely through 
                                our payment partners. We do not store your complete credit card information on our servers.
                            </p>
                            <p className="leading-relaxed">
                                <strong>3.4 Order Cancellation:</strong> You may cancel your order within 1 hour of placing it, 
                                provided it has not been shipped. After this period, our standard return policy applies.
                            </p>
                        </div>
                    </section>

                    {/* 4. Shipping & Delivery */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">4. Shipping & Delivery</h3>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                <strong>4.1 Shipping Charges:</strong> Shipping charges vary based on your location, order value, 
                                and selected delivery option. Free shipping may be available for orders above a certain value.
                            </p>
                            <p className="leading-relaxed">
                                <strong>4.2 Delivery Time:</strong> We aim to deliver orders within 5-7 business days for standard 
                                shipping. Actual delivery times may vary depending on your location and product availability.
                            </p>
                            <p className="leading-relaxed">
                                <strong>4.3 Delivery Address:</strong> You are responsible for providing accurate delivery information. 
                                We are not liable for delays or non-delivery due to incorrect address details.
                            </p>
                            <p className="leading-relaxed">
                                <strong>4.4 Risk of Loss:</strong> All items purchased from Apna Bazaar are shipped pursuant to 
                                a shipment contract. Risk of loss and title for items pass to you upon delivery to the carrier.
                            </p>
                        </div>
                    </section>

                    {/* 5. Returns & Refunds */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">5. Returns & Refunds</h3>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                <strong>5.1 Return Period:</strong> You may return most items within 7 days of delivery for a 
                                refund or exchange, provided the items are unused, unworn, and in original packaging with tags attached.
                            </p>
                            <p className="leading-relaxed">
                                <strong>5.2 Non-Returnable Items:</strong> Certain items including intimate wear, cosmetics, 
                                personalized items, and sale items marked as "Final Sale" cannot be returned.
                            </p>
                            <p className="leading-relaxed">
                                <strong>5.3 Refund Processing:</strong> Refunds will be processed within 5-7 business days after 
                                we receive and inspect the returned item. Refunds will be issued to the original payment method.
                            </p>
                            <p className="leading-relaxed">
                                <strong>5.4 Return Shipping:</strong> Return shipping costs are the customer's responsibility 
                                unless the return is due to our error or a defective product.
                            </p>
                        </div>
                    </section>

                    {/* 6. Intellectual Property */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">6. Intellectual Property</h3>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                <strong>6.1 Ownership:</strong> All content on the Platform, including text, graphics, logos, 
                                images, and software, is the property of Apna Bazaar and protected by intellectual property laws.
                            </p>
                            <p className="leading-relaxed">
                                <strong>6.2 Restrictions:</strong> You may not reproduce, distribute, modify, or create derivative 
                                works of any content from the Platform without our express written permission.
                            </p>
                            <p className="leading-relaxed">
                                <strong>6.3 Trademarks:</strong> Apna Bazaar and our logos are trademarks. You may not use 
                                these marks without our prior written consent.
                            </p>
                        </div>
                    </section>

                    {/* 7. User Conduct */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">7. User Conduct</h3>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">You agree not to:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Use the Platform for any illegal or unauthorized purpose</li>
                                <li>Attempt to gain unauthorized access to our systems or networks</li>
                                <li>Interfere with or disrupt the Platform's operation</li>
                                <li>Upload or transmit viruses or malicious code</li>
                                <li>Collect or harvest user information without consent</li>
                                <li>Impersonate another person or entity</li>
                                <li>Engage in fraudulent activities or misrepresent products</li>
                            </ul>
                        </div>
                    </section>

                    {/* 8. Limitation of Liability */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">8. Limitation of Liability</h3>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                <strong>8.1 Disclaimer:</strong> The Platform is provided "as is" without warranties of any kind. 
                                We do not guarantee that the Platform will be error-free or uninterrupted.
                            </p>
                            <p className="leading-relaxed">
                                <strong>8.2 Liability Cap:</strong> To the maximum extent permitted by law, our total liability 
                                for any claims arising from your use of the Platform shall not exceed the amount you paid for the 
                                products or services in question.
                            </p>
                            <p className="leading-relaxed">
                                <strong>8.3 Indirect Damages:</strong> We shall not be liable for any indirect, incidental, 
                                special, consequential, or punitive damages arising from your use of the Platform.
                            </p>
                        </div>
                    </section>

                    {/* 9. Dispute Resolution */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">9. Dispute Resolution</h3>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                <strong>9.1 Governing Law:</strong> These Terms shall be governed by and construed in accordance 
                                with the laws of India, without regard to its conflict of law provisions.
                            </p>
                            <p className="leading-relaxed">
                                <strong>9.2 Jurisdiction:</strong> Any disputes arising from these Terms or your use of the 
                                Platform shall be subject to the exclusive jurisdiction of the courts in [Your City], India.
                            </p>
                            <p className="leading-relaxed">
                                <strong>9.3 Arbitration:</strong> We encourage resolving disputes amicably. You agree to first 
                                contact us to attempt to resolve any dispute informally before seeking legal action.
                            </p>
                        </div>
                    </section>

                    {/* 10. Modifications */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">10. Modifications to Terms</h3>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                We reserve the right to modify these Terms at any time. Changes will be effective immediately 
                                upon posting to the Platform. Your continued use of the Platform after changes are posted 
                                constitutes your acceptance of the modified Terms.
                            </p>
                        </div>
                    </section>

                    {/* 11. Contact Information */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">11. Contact Information</h3>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                If you have any questions about these Terms, please contact us at:
                            </p>
                            <div className="bg-gray-50 p-4 rounded-lg mt-4">
                                <p className="font-semibold text-gray-900">Apna Bazaar</p>
                                <p className="text-gray-700 mt-2">Email: support@iqrafashion.com</p>
                                <p className="text-gray-700">Phone: +91 XXXXX XXXXX</p>
                                <p className="text-gray-700">Address: [Your Business Address]</p>
                            </div>
                        </div>
                    </section>

                    {/* Agreement */}
                    <section className="border-t border-gray-200 pt-6">
                        <p className="text-sm text-gray-600 italic">
                            By using Apna Bazaar's Platform, you acknowledge that you have read, understood, and agree 
                            to be bound by these Terms and Conditions.
                        </p>
                    </section>
                </div>

                {/* Back Button */}
                <div className="mt-8 text-center">
                    <Button
                        type="primary"
                        size="large"
                        onClick={() => router.back()}
                        className="bg-[#0F8A5F] hover:bg-[#0A6B47]"
                    >
                        Go Back
                    </Button>
                </div>
            </div>
        </div>
    );
}
