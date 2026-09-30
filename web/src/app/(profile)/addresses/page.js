"use client";

import BottomNav from "@/components/layout/BottomNav";
import Header from "@/components/layout/Header";
import PageHeader from "@/components/layout/PageHeader";
import {
  useAddresses,
  useDeleteAddress,
  useSetDefaultAddress,
} from "@/hooks/useAddresses";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { App, Button, Modal, Spin } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

/**
 * Addresses Page - Enhanced with API Integration
 * Manage saved delivery addresses: add, edit, delete, and mark default.
 *
 * Doubles as an address *picker* when reached with `?from=<path>` (e.g.
 * from checkout's "Manage" button) — selecting an address then navigates
 * back to that page with `?addressId=<id>`, which re-runs its own
 * serviceability check for the newly-selected address.
 */
export default function AddressesPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  const from = searchParams?.get("from");
  const couponParam = searchParams?.get("coupon");
  const isPickerMode = Boolean(from);

  // Fetch addresses using React Query
  const { data, isLoading } = useAddresses();
  const deleteAddress = useDeleteAddress();
  const setDefaultAddress = useSetDefaultAddress();
  const addresses = data?.data?.data || [];

  const buildUrl = (path, extra = {}) => {
    const params = new URLSearchParams();
    Object.entries(extra).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    if (couponParam) params.set("coupon", couponParam);
    const query = params.toString();
    return query ? `${path}?${query}` : path;
  };

  const handleDelete = async () => {
    if (!addressToDelete) return;
    try {
      await deleteAddress.mutateAsync(
        addressToDelete.id || addressToDelete._id,
      );
      message.success("Address deleted successfully");
    } catch (error) {
      message.error(error?.message || "Failed to delete address");
    }
    setDeleteModalVisible(false);
    setAddressToDelete(null);
  };

  const handleSetDefault = async (addressId) => {
    try {
      await setDefaultAddress.mutateAsync(addressId);
      message.success("Default address updated");
    } catch (error) {
      message.error(error?.message || "Failed to set default address");
    }
  };

  // Selecting an address for a new order — hands control back to `from`
  // (e.g. checkout) with the chosen address id, so its own serviceability
  // check re-runs against this address's pincode.
  const handleSelectForOrder = (addressId) => {
    router.push(buildUrl(from, { addressId }));
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="flex min-h-below-header items-center justify-center bg-linear-to-br from-gray-50 via-emerald-50/20 to-teal-50/20">
          <div className="text-center">
            <Spin size="large" />
            <p className="mt-4 text-gray-600 font-medium">
              Loading addresses...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-below-header bg-white/95 pb-20">
      <Header />
      <PageHeader
        title={isPickerMode ? "Choose Delivery Address" : "Saved Addresses"}
        subtitle={`${addresses.length} address${addresses.length !== 1 ? "es" : ""}`}
        onBack={() => (from ? router.push(buildUrl(from)) : router.back())}
        rightContent={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push(buildUrl("/addresses/add", { from }))}
            className="bg-linear-to-r from-emerald-600 to-teal-600 border-0 rounded-xl h-9 font-semibold shadow-md hover:shadow-lg">
            Add New
          </Button>
        }
      />

      <main className="mx-auto max-w-7xl px-4 py-6">
        {addresses.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-linear-to-br from-emerald-100 to-teal-100 rounded-3xl p-12 inline-block mb-6">
              <EnvironmentOutlined className="text-6xl text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Saved Addresses
            </h2>
            <p className="text-gray-600 mb-8">
              Add a new address to get started
            </p>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => router.push(buildUrl("/addresses/add", { from }))}
              className="bg-linear-to-r from-emerald-600 to-teal-600 border-0 rounded-xl h-12 px-8 font-semibold shadow-md">
              Add Your First Address
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses?.map((address) => {
              const addressId = address.id || address._id;

              return (
                <div
                  key={addressId}
                  className="group rounded-2xl border border-gray-200 bg-gray-50 transition-all duration-200 hover:border-emerald-300">
                  <div className="flex items-center gap-3 p-3">
                    {/* Icon */}
                    <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                      <span className="text-xl">🏠</span>
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      {/* Name + Phone */}
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {address.fullName}
                        </h3>

                        <span className="text-gray-400 hidden sm:inline">•</span>

                        <span className="text-gray-600 text-sm">
                          {address.phone}
                        </span>
                      </div>

                      {/* Address */}
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {address.street},{" "}
                        {address.area ? `${address.area}, ` : ""}
                        {address.city}, {address.state} - {address.zipCode}
                      </p>

                      {/* Bottom */}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {address.isDefault && (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            <CheckCircleOutlined /> Default
                          </span>
                        )}

                        {address.landmark && (
                          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                            Landmark: {address.landmark}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-2">
                      <span className="hidden sm:inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                        🏠 {address.label || "Home"}
                      </span>

                      <button
                        onClick={() =>
                          router.push(
                            buildUrl(`/addresses/edit/${addressId}`, { from }),
                          )
                        }
                        aria-label="Edit address"
                        title="Edit address"
                        className="p-2 rounded-lg hover:bg-blue-50 transition-all">
                        <EditOutlined className="text-lg text-blue-600" />
                      </button>

                      <button
                        onClick={() => {
                          setAddressToDelete(address);
                          setDeleteModalVisible(true);
                        }}
                        aria-label="Delete address"
                        title="Delete address"
                        className="p-2 rounded-lg hover:bg-red-50 transition-all">
                        <DeleteOutlined className="text-lg text-red-600" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 px-3 pb-3">
                    {!address.isDefault && (
                      <Button
                        type="link"
                        size="small"
                        className="p-0 text-emerald-600"
                        onClick={() => handleSetDefault(addressId)}>
                        ⭐ Make Default
                      </Button>
                    )}

                    {isPickerMode && (
                      <Button
                        type="primary"
                        size="small"
                        className="ml-auto bg-emerald-600 hover:bg-emerald-700 border-0"
                        onClick={() => handleSelectForOrder(addressId)}>
                        Deliver Here
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Address"
        open={deleteModalVisible}
        onOk={handleDelete}
        confirmLoading={deleteAddress.isPending}
        onCancel={() => {
          setDeleteModalVisible(false);
          setAddressToDelete(null);
        }}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}>
        <p>Are you sure you want to delete this address?</p>
        {addressToDelete && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="font-semibold">{addressToDelete.label}</p>
            <p className="text-sm text-gray-600">
              {addressToDelete.street}, {addressToDelete.city}
            </p>
          </div>
        )}
      </Modal>

      <BottomNav />
    </div>
  );
}
