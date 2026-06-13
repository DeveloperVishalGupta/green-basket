'use client';

import BottomNav from '@/components/layout/BottomNav';
import { useAddresses, useDeleteAddress, useSetDefaultAddress } from '@/hooks/useAddresses';
import {
    ArrowLeftOutlined,
    CheckCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    EnvironmentOutlined,
    PlusOutlined
} from '@ant-design/icons';
import { App, Button, Modal, Spin } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
    
/**
 * Addresses Page - Enhanced with API Integration
 * Manage saved delivery addresses
 */
export default function AddressesPage() {
    const { message } = App.useApp();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);

    // Fetch addresses using React Query
    const { data, isLoading } = useAddresses();
    const deleteAddress = useDeleteAddress();
    const setDefaultAddress = useSetDefaultAddress();
    const addresses = data?.data?.data || [];

    const handleDelete = async () => {
        if (!selectedAddress) return;
        try {
            await deleteAddress.mutateAsync(selectedAddress.id || selectedAddress._id);
            message.success('Address deleted successfully');
        } catch (error) {
            message.error(error?.message || 'Failed to delete address');
        }
        setDeleteModalVisible(false);
        setSelectedAddress(null);
    };

    const handleSetDefault = async (addressId) => {
        try {
            await setDefaultAddress.mutateAsync(addressId);
            message.success('Default address updated');
        } catch (error) {
            message.error(error?.message || 'Failed to set default address');
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 via-emerald-50/20 to-teal-50/20">
                <div className="text-center">
                    <Spin size="large" />
                    <p className="mt-4 text-gray-600 font-medium">Loading addresses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white/95 pb-20">
            {/* Enhanced Header */}
            <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg px-4 py-4">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                const from = searchParams?.get('from');
                                // Preserve coupon when navigating back
                                const couponParam = searchParams?.get('coupon');
                                
                                if (from) {
                                    const url = couponParam && from === '/checkout'
                                        ? `${from}?coupon=${encodeURIComponent(couponParam)}`
                                        : from;
                                    router.push(url);
                                } else {
                                    router.back();
                                }
                            }}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-all hover:scale-105"
                        >
                            <ArrowLeftOutlined className="text-xl" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Saved Addresses</h1>
                            <p className="text-sm text-gray-600">{addresses.length} address{addresses.length !== 1 ? 'es' : ''}</p>
                        </div>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            // Preserve coupon when navigating to add address
                            const couponParam = searchParams?.get('coupon');
                            const url = couponParam 
                                ? `/addresses/add?coupon=${encodeURIComponent(couponParam)}`
                                : '/addresses/add';
                            router.push(url);
                        }}
                        className="bg-linear-to-r from-emerald-600 to-teal-600 border-0 rounded-xl h-10 font-semibold shadow-md hover:shadow-lg"
                    >
                        Add New
                    </Button>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-6">
                {addresses.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="bg-linear-to-br from-emerald-100 to-teal-100 rounded-3xl p-12 inline-block mb-6">
                            <EnvironmentOutlined className="text-6xl text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Saved Addresses</h2>
                        <p className="text-gray-600 mb-8">Add a new address to get started</p>
                        <Button
                            type="primary"
                            size="large"
                            icon={<PlusOutlined />}
                            onClick={() => router.push('/addresses/add')}
                            className="bg-linear-to-r from-emerald-600 to-teal-600 border-0 rounded-xl h-12 px-8 font-semibold shadow-md"
                        >
                            Add Your First Address
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {addresses?.map((address) => (
                            <div
                                key={address._id || address.id}
                                className="bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-emerald-200"
                            >
                                {/* Address Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-linear-to-br from-emerald-100 to-teal-100 p-2 rounded-lg">
                                            <EnvironmentOutlined className="text-xl text-emerald-600" />
                                        </div>
                                        <div>
                                            <span className="font-bold text-gray-900 text-lg">{address.label}</span>
                                            {address.isDefault && (
                                                <span className="ml-2 inline-flex items-center gap-1 text-xs bg-linear-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-1 rounded-full font-semibold shadow-sm">
                                                    <CheckCircleOutlined />
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                // Preserve coupon when navigating to edit
                                                const couponParam = searchParams?.get('coupon');
                                                const url = couponParam 
                                                    ? `/addresses/edit/${address.id}?coupon=${encodeURIComponent(couponParam)}`
                                                    : `/addresses/edit/${address.id}`;
                                                router.push(url);
                                            }}
                                            className="p-2 hover:bg-blue-50 rounded-lg transition-all"
                                        >
                                            <EditOutlined className="text-lg text-blue-600" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedAddress(address);
                                                setDeleteModalVisible(true);
                                            }}
                                            className="p-2 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <DeleteOutlined className="text-lg text-red-600" />
                                        </button>
                                    </div>
                                </div>

                                {/* Address Details */}
                                <div className="text-gray-700 space-y-1 ml-12">
                                    <p className="font-semibold text-gray-900">{address.fullName}</p>
                                    <p className="text-sm">
                                        {address.street}, {address.area}
                                    </p>
                                    <p className="text-sm">
                                        {address.city}, {address.state} - {address.pincode}
                                    </p>
                                    {address.landmark && (
                                        <p className="text-sm text-gray-600">Landmark: {address.landmark}</p>
                                    )}
                                    <p className="text-sm font-semibold mt-2 flex items-center gap-1">
                                        📞 {address.phone}
                                    </p>
                                </div>

                                {/* Set Default Button */}
                                {!address.isDefault && (
                                    <button
                                        onClick={() => handleSetDefault(address.id)}
                                        className="mt-4 text-sm font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg transition-all ml-12"
                                    >
                                        ⭐ Set as Default
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Delete Confirmation Modal */}
            <Modal
                title="Delete Address"
                open={deleteModalVisible}
                onOk={handleDelete}
                onCancel={() => {
                    setDeleteModalVisible(false);
                    setSelectedAddress(null);
                }}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
            >
                <p>Are you sure you want to delete this address?</p>
                {selectedAddress && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="font-semibold">{selectedAddress.label}</p>
                        <p className="text-sm text-gray-600">
                            {selectedAddress.street}, {selectedAddress.city}
                        </p>
                    </div>
                )}
            </Modal>

            <BottomNav />
        </div>
    );
}
