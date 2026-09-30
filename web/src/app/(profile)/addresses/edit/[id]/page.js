"use client";

import AddressFormFields from "@/components/address/AddressFormFields";
import AddressMapPicker from "@/components/address/AddressMapPicker";
import { useAddresses, useUpdateAddress } from "@/hooks/useAddresses";
import { ArrowLeftOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { App, Button, Form, Spin } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useEffect } from "react";

/**
 * Edit Address Page
 * Prefills the same form used to add an address with the existing
 * address's data, and saves changes in place (same address id).
 */
export default function EditAddressPage({ params }) {
  const { id } = use(params);
  const { message } = App.useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form] = Form.useForm();

  const { data, isLoading } = useAddresses();
  const updateAddress = useUpdateAddress();

  const addresses = data?.data?.data || [];
  const address = addresses.find((a) => (a.id || a._id) === id);

  // Pre-fill the form once the address has loaded
  useEffect(() => {
    if (!address) return;

    const [firstName = "", ...rest] = (address.fullName || "").split(" ");
    form.setFieldsValue({
      label: address.label || "Home",
      firstName,
      lastName: rest.join(" "),
      phone: address.phone,
      street: address.street,
      area: address.area,
      landmark: address.landmark,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      isDefault: address.isDefault || false,
      lat: address.location?.lat,
      lng: address.location?.lng,
    });
  }, [address, form]);

  // Called when the user picks a suggestion or moves the map pin —
  // auto-fills whichever fields the map could resolve, leaving the rest
  // (and everything already typed) untouched for manual editing.
  const handleMapAddressSelect = (parsed) => {
    const fieldsToFill = {};
    ["street", "area", "city", "state", "zipCode"].forEach((key) => {
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
      const addressData = {
        ...values,
        fullName: `${values.firstName} ${values.lastName}`.trim(),
      };
      delete addressData.firstName;
      delete addressData.lastName;

      await updateAddress.mutateAsync({ id, data: addressData });
      message.success("Address updated successfully!");

      const couponParam = searchParams?.get("coupon");
      const from = searchParams?.get("from");
      const params = new URLSearchParams();
      params.set("addressId", id);
      if (couponParam) params.set("coupon", couponParam);
      router.push(`${from || "/checkout"}?${params.toString()}`);
    } catch (error) {
      message.error(error?.message || "Failed to update address");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100">
            <ArrowLeftOutlined className="text-xl" />
          </button>
          <h1 className="text-xl font-bold">Edit Address</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spin size="large" />
            </div>
          ) : !address ? (
            <div className="py-16 text-center">
              <p className="font-semibold text-gray-900">
                Address not found.
              </p>
              <Button className="mt-4" onClick={() => router.push("/addresses")}>
                Back to Addresses
              </Button>
            </div>
          ) : (
            <>
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
                autoComplete="off">
                <AddressMapPicker onAddressSelect={handleMapAddressSelect} />

                <AddressFormFields />

                {/* Submit Button */}
                <Form.Item className="mb-0">
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    loading={updateAddress.isPending}
                    className="bg-[#0F8A5F] hover:bg-[#0A6B47] h-12 text-base font-semibold">
                    Save Changes
                  </Button>
                </Form.Item>
              </Form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
