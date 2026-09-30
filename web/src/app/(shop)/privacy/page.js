'use client';

import PageHeader from '@/components/layout/PageHeader';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';

/**
 * Privacy Policy Page
 * Privacy policy and data protection information for Green Basket
 */
export default function PrivacyPage() {
    const router = useRouter();

    return (
        <div className="min-h-below-header bg-gray-50">
            <PageHeader title="Privacy Policy" maxWidth="max-w-4xl" />

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
                    {/* Last Updated */}
                    <p className="text-sm text-gray-500 mb-8">
                        Last Updated: January 14, 2026
                    </p>

                    {/* Introduction */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment to Your Privacy</h2>
                        <p className="text-gray-700 leading-relaxed">
                            At Green Basket, we are committed to protecting your privacy and ensuring the security of your 
                            personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard 
                            your information when you visit our website or use our services. Please read this policy carefully.
                        </p>
                    </section>

                    {/* 1. Information We Collect */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">1.1 Personal Information</h4>
                                <p className="text-gray-700 leading-relaxed mb-2">
                                    When you register, make a purchase, or interact with our Platform, we may collect:
                                </p>
                                <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
                                    <li>Full name (first and last name)</li>
                                    <li>Email address</li>
                                    <li>Phone number</li>
                                    <li>Billing and shipping addresses</li>
                                    <li>Payment information (processed securely through payment gateways)</li>
                                    <li>Date of birth (if provided)</li>
                                    <li>Gender preferences (optional)</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">1.2 Automatically Collected Information</h4>
                                <p className="text-gray-700 leading-relaxed mb-2">
                                    When you visit our Platform, we automatically collect:
                                </p>
                                <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
                                    <li>IP address and device information</li>
                                    <li>Browser type and version</li>
                                    <li>Operating system</li>
                                    <li>Pages visited and time spent on pages</li>
                                    <li>Referring website addresses</li>
                                    <li>Search terms used to find our site</li>
                                    <li>Cookies and similar tracking technologies</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">1.3 Transaction Information</h4>
                                <p className="text-gray-700 leading-relaxed">
                                    We collect information about your purchases, order history, product preferences, 
                                    returns, and customer service interactions.
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">1.4 Communication Data</h4>
                                <p className="text-gray-700 leading-relaxed">
                                    Information from your communications with us via email, chat, phone calls, or social media, 
                                    including customer service inquiries and feedback.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 2. How We Use Your Information */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h3>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">We use the collected information for the following purposes:</p>
                            
                            <div className="space-y-2">
                                <p><strong>2.1 Order Processing:</strong> To process your orders, arrange shipping, and handle returns or exchanges.</p>
                                
                                <p><strong>2.2 Account Management:</strong> To create and manage your account, authenticate users, and provide customer support.</p>
                                
                                <p><strong>2.3 Communication:</strong> To send order confirmations, shipping updates, promotional emails, newsletters, and respond to your inquiries.</p>
                                
                                <p><strong>2.4 Personalization:</strong> To provide personalized product recommendations, customized content, and targeted advertising based on your preferences and browsing history.</p>
                                
                                <p><strong>2.5 Analytics:</strong> To analyze Platform usage, track performance, understand customer behavior, and improve our services.</p>
                                
                                <p><strong>2.6 Security:</strong> To detect and prevent fraud, unauthorized transactions, and protect against security threats.</p>
                                
                                <p><strong>2.7 Legal Compliance:</strong> To comply with legal obligations, enforce our terms, and protect our rights and property.</p>
                                
                                <p><strong>2.8 Marketing:</strong> To send promotional offers, new product announcements, and special discounts (you can opt-out anytime).</p>
                            </div>
                        </div>
                    </section>

                    {/* 3. Information Sharing */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">3. How We Share Your Information</h3>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                We do not sell your personal information. We may share your information with:
                            </p>
                            
                            <div className="space-y-2">
                                <p><strong>3.1 Service Providers:</strong> Third-party companies that help us operate our business, such as payment processors (Razorpay), shipping carriers (Shiprocket), email service providers, and cloud storage services.</p>
                                
                                <p><strong>3.2 Business Partners:</strong> Partners who help us provide specific services or features, always under strict confidentiality agreements.</p>
                                
                                <p><strong>3.3 Legal Authorities:</strong> Government agencies, law enforcement, or courts when required by law or to protect our rights.</p>
                                
                                <p><strong>3.4 Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new entity.</p>
                                
                                <p><strong>3.5 With Your Consent:</strong> Any other third parties with your explicit consent or at your direction.</p>
                            </div>
                        </div>
                    </section>

                    {/* 4. Cookies and Tracking */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">4. Cookies and Tracking Technologies</h3>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                <strong>4.1 What Are Cookies:</strong> Cookies are small data files stored on your device that 
                                help us improve your experience, remember your preferences, and analyze site usage.
                            </p>
                            
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="font-semibold mb-2">Types of Cookies We Use:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li><strong>Essential Cookies:</strong> Required for basic site functionality</li>
                                    <li><strong>Performance Cookies:</strong> Help us understand how visitors use our site</li>
                                    <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                                    <li><strong>Advertising Cookies:</strong> Deliver relevant ads based on your interests</li>
                                </ul>
                            </div>
                            
                            <p className="leading-relaxed">
                                <strong>4.2 Managing Cookies:</strong> You can control cookies through your browser settings. 
                                However, disabling cookies may limit your ability to use certain features of our Platform.
                            </p>
                        </div>
                    </section>

                    {/* 5. Data Security */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">5. Data Security</h3>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                <strong>5.1 Security Measures:</strong> We implement industry-standard security measures to 
                                protect your personal information, including:
                            </p>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                                <li>SSL/TLS encryption for data transmission</li>
                                <li>Secure payment processing through PCI-DSS compliant gateways</li>
                                <li>Regular security audits and vulnerability assessments</li>
                                <li>Access controls and authentication mechanisms</li>
                                <li>Employee training on data protection</li>
                            </ul>
                            
                            <p className="leading-relaxed">
                                <strong>5.2 Data Retention:</strong> We retain your personal information for as long as necessary 
                                to fulfill the purposes outlined in this policy, comply with legal obligations, resolve disputes, 
                                and enforce our agreements.
                            </p>
                            
                            <p className="leading-relaxed">
                                <strong>5.3 No Guarantee:</strong> While we strive to protect your information, no method of 
                                transmission over the internet is 100% secure. We cannot guarantee absolute security.
                            </p>
                        </div>
                    </section>

                    {/* 6. Your Rights */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">6. Your Privacy Rights</h3>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">You have the following rights regarding your personal information:</p>
                            
                            <div className="space-y-2">
                                <p><strong>6.1 Access:</strong> Request access to the personal information we hold about you.</p>
                                
                                <p><strong>6.2 Correction:</strong> Request correction of inaccurate or incomplete information.</p>
                                
                                <p><strong>6.3 Deletion:</strong> Request deletion of your personal information, subject to legal obligations.</p>
                                
                                <p><strong>6.4 Opt-Out:</strong> Unsubscribe from marketing emails by clicking the &quot;unsubscribe&quot; link in our emails.</p>
                                
                                <p><strong>6.5 Data Portability:</strong> Request a copy of your data in a structured, machine-readable format.</p>
                                
                                <p><strong>6.6 Restriction:</strong> Request restriction of processing your personal information in certain circumstances.</p>
                                
                                <p><strong>6.7 Object:</strong> Object to processing of your personal information for specific purposes.</p>
                            </div>
                            
                            <p className="leading-relaxed mt-4">
                                To exercise these rights, please contact us at <strong>privacy@greenbasket.com</strong>
                            </p>
                        </div>
                    </section>

                    {/* 7. Third-Party Links */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">7. Third-Party Links and Services</h3>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                Our Platform may contain links to third-party websites or services. We are not responsible for 
                                the privacy practices of these external sites. We encourage you to review their privacy policies 
                                before providing any personal information.
                            </p>
                        </div>
                    </section>

                    {/* 8. Children's Privacy */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">8. Children&apos;s Privacy</h3>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                Our Platform is not intended for children under 18 years of age. We do not knowingly collect 
                                personal information from children. If you believe we have collected information from a child, 
                                please contact us immediately, and we will take steps to delete such information.
                            </p>
                        </div>
                    </section>

                    {/* 9. International Users */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">9. International Data Transfers</h3>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                Your information may be transferred to and processed in countries other than your country of 
                                residence. These countries may have different data protection laws. By using our Platform, 
                                you consent to such transfers.
                            </p>
                        </div>
                    </section>

                    {/* 10. Updates to Privacy Policy */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">10. Changes to This Privacy Policy</h3>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                We may update this Privacy Policy from time to time to reflect changes in our practices or legal 
                                requirements. We will notify you of significant changes by posting a notice on our Platform or 
                                sending an email. The &quot;Last Updated&quot; date at the top indicates when the policy was last revised.
                            </p>
                        </div>
                    </section>

                    {/* 11. Contact Us */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">11. Contact Information</h3>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, 
                                please contact us:
                            </p>
                            <div className="bg-gray-50 p-4 rounded-lg mt-4">
                                <p className="font-semibold text-gray-900">Privacy Team - Green Basket</p>
                                <p className="text-gray-700 mt-2">Email: privacy@greenbasket.com</p>
                                <p className="text-gray-700">Phone: +91 XXXXX XXXXX</p>
                                <p className="text-gray-700">Address: [Your Business Address]</p>
                                <p className="text-gray-700 mt-2">Response Time: We aim to respond within 48 hours</p>
                            </div>
                        </div>
                    </section>

                    {/* Consent */}
                    <section className="border-t border-gray-200 pt-6">
                        <div className="bg-emerald-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-700">
                                <strong>Your Consent:</strong> By using Green Basket&apos;s Platform, you acknowledge that you have 
                                read, understood, and agree to the collection, use, and disclosure of your information as 
                                described in this Privacy Policy.
                            </p>
                        </div>
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
