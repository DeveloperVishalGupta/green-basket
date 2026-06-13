'use client';

import { useAddAddress } from '@/hooks/useAddresses';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeftOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { App, Button, Checkbox, Form, Input, Select } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Add Address Page
 * Form to add a new delivery address
 */
export default function AddAddressPage() {
    const { message } = App.useApp();
    const router = useRouter();
    const { user } = useAuth();
    const [form] = Form.useForm();
    const addAddress = useAddAddress();

    // Pre-fill form fields when user data is available
    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
            });
        }
    }, [user, form]);

    const handleSubmit = async (values) => {
        try {
            // Combine firstName and lastName into fullName for backend compatibility
            const addressData = {
                ...values,
                fullName: `${values.firstName} ${values.lastName}`.trim(),
            };
            // Remove firstName and lastName from the payload
            delete addressData.firstName;
            delete addressData.lastName;
            
            const res = await addAddress.mutateAsync(addressData);
            const newAddress = res?.data;
            message.success('Address added successfully!');
            
            // Preserve coupon parameter when redirecting to checkout
            const urlSearchParams = new URLSearchParams(window.location.search);
            const couponParam = urlSearchParams.get('coupon');
            
            // Build checkout URL with address and coupon (if exists)
            let checkoutUrl = '/checkout';
            const addressId = newAddress?._id || newAddress?.id;
            
            if (addressId || couponParam) {
                const params = new URLSearchParams();
                if (addressId) params.set('addressId', addressId);
                if (couponParam) params.set('coupon', couponParam);
                checkoutUrl = `/checkout?${params.toString()}`;
            }
            
            router.push(checkoutUrl);
        } catch (error) {
            message.error(error?.message || 'Failed to add address');
        }
    };

    const indianStates = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
        'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
        'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
        'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
        'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4">
                <div className="mx-auto flex max-w-7xl items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
                    >
                        <ArrowLeftOutlined className="text-xl" />
                    </button>
                    <h1 className="text-xl font-bold">Add New Address</h1>
                </div>
            </header>

            <main className="mx-auto max-w-2xl px-4 py-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-[#0F8A5F]/10 rounded-full flex items-center justify-center">
                            <EnvironmentOutlined className="text-3xl text-[#0F8A5F]" />
                        </div>
                    </div>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        autoComplete="off"
                        initialValues={{
                            label: 'Home',
                            isDefault: false,
                        }}
                    >
                        {/* Address Label */}
                        <Form.Item
                            name="label"
                            label="Save Address As"
                            rules={[{ required: true, message: 'Please select address type' }]}
                        >
                            <Select size="large">
                                <Select.Option value="Home">Home</Select.Option>
                                <Select.Option value="Office">Office</Select.Option>
                                <Select.Option value="Other">Other</Select.Option>
                            </Select>
                        </Form.Item>

                        {/* First Name and Last Name */}
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item
                                name="firstName"
                                label="First Name"
                                rules={[
                                    { required: true, message: 'Please enter first name' },
                                    { min: 2, message: 'First name must be at least 2 characters' },
                                ]}
                            >
                                <Input size="large" placeholder="First name" />
                            </Form.Item>

                            <Form.Item
                                name="lastName"
                                label="Last Name"
                                rules={[
                                    { required: true, message: 'Please enter last name' },
                                    { min: 1, message: 'Last name is required' },
                                ]}
                            >
                                <Input size="large" placeholder="Last name" />
                            </Form.Item>
                        </div>

                        {/* Phone Number */}
                        <Form.Item
                            name="phone"
                            label="Phone Number"
                            rules={[
                                { required: true, message: 'Please enter phone number' },
                                { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number' },
                            ]}
                        >
                            <Input
                                size="large"
                                placeholder="Enter 10-digit phone number"
                                maxLength={10}
                            />
                        </Form.Item>

                        {/* Street Address */}
                        <Form.Item
                            name="street"
                            label="House No., Building Name"
                            rules={[{ required: true, message: 'Please enter street address' }]}
                        >
                            <Input size="large" placeholder="E.g., H.No-2834, Street 5" />
                        </Form.Item>

                        {/* Area/Locality */}
                        <Form.Item
                            name="area"
                            label="Area, Sector, Locality"
                            rules={[{ required: true, message: 'Please enter area' }]}
                        >
                            <Input size="large" placeholder="E.g., Sector 784, Downtown" />
                        </Form.Item>

                        {/* Landmark */}
                        <Form.Item
                            name="landmark"
                            label="Landmark (Optional)"
                        >
                            <Input size="large" placeholder="E.g., Near Clock Tower" />
                        </Form.Item>

                        {/* City and State */}
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item
                                name="city"
                                label="City"
                                rules={[{ required: true, message: 'Please enter city' }]}
                            >
                                <Input size="large" placeholder="City" />
                            </Form.Item>

                            <Form.Item
                                name="state"
                                label="State"
                                rules={[{ required: true, message: 'Please select state' }]}
                            >
                                <Select size="large" placeholder="Select State" showSearch>
                                    {indianStates.map(state => (
                                        <Select.Option key={state} value={state}>
                                            {state}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </div>

                        {/* Pincode */}
                        <Form.Item
                            name="zipCode"
                            label="Pincode"
                            rules={[
                                { required: true, message: 'Please enter pincode' },
                                { pattern: /^[0-9]{6}$/, message: 'Please enter a valid 6-digit pincode' },
                            ]}
                        >
                            <Input
                                size="large"
                                placeholder="Enter 6-digit pincode"
                                maxLength={6}
                            />
                        </Form.Item>

                        {/* Set as Default */}
                        <Form.Item name="isDefault" valuePropName="checked">
                            <Checkbox>Set as default address</Checkbox>
                        </Form.Item>

                        {/* Submit Button */}
                        <Form.Item className="mb-0">
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                block
                                loading={addAddress.isPending}
                                className="bg-[#0F8A5F] hover:bg-[#0A6B47] h-12 text-base font-semibold"
                            >
                                Save Address
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </main>
        </div>
    );
}
