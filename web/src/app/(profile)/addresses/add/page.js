'use client';

import AddressFormFields from '@/components/address/AddressFormFields';
import AddressMapPicker from '@/components/address/AddressMapPicker';
import Header from '@/components/layout/Header';
import PageHeader from '@/components/layout/PageHeader';
import { useAddAddress } from '@/hooks/useAddresses';
import { useAuth } from '@/hooks/useAuth';
import { App, Button, Form } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Add Address Page
 * Form to add a new delivery address
 */
export default function AddAddressPage() {
    const { message } = App.useApp();
    const router = useRouter();
    const searchParams = useSearchParams();
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

    // Called when the user picks a suggestion or moves the map pin —
    // auto-fills whichever fields the map could resolve, leaving the rest
    // (and everything already typed) untouched for manual editing.
    const handleMapAddressSelect = (parsed) => {
        const fieldsToFill = {};
        ['street', 'area', 'city', 'state', 'zipCode'].forEach((key) => {
            if (parsed[key]) fieldsToFill[key] = parsed[key];
        });
        if (parsed.lat != null && parsed.lon != null) {
            fieldsToFill.lat = parsed.lat;
            fieldsToFill.lng = parsed.lon;
        }
        form.setFieldsValue(fieldsToFill);
        form.validateFields(Object.keys(fieldsToFill)).catch(() => {});
    };

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
            const newAddress = res?.data?.data;
            message.success('Address added successfully!');

            // Return to wherever the user came from (defaults to checkout),
            // preserving the coupon param, with the new address selected —
            // that page's own serviceability check re-runs for it.
            const couponParam = searchParams?.get('coupon');
            const from = searchParams?.get('from') || '/checkout';
            const addressId = newAddress?._id || newAddress?.id;

            const params = new URLSearchParams();
            if (addressId) params.set('addressId', addressId);
            if (couponParam) params.set('coupon', couponParam);
            const query = params.toString();

            router.push(query ? `${from}?${query}` : from);
        } catch (error) {
            message.error(error?.message || 'Failed to add address');
        }
    };

    return (
        <div className="min-h-below-header bg-gray-50">
            <Header />
            <PageHeader title="Add New Address" />

            <main className="mx-auto max-w-2xl px-4 py-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
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
                        <AddressMapPicker onAddressSelect={handleMapAddressSelect} />

                        <AddressFormFields />

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
