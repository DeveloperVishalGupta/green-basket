"use client";

import { deliveryAPI } from "@/lib/api";
import { INDIAN_STATES } from "@/lib/constants";
import { Checkbox, Form, Input, Select } from "antd";

/**
 * The shared set of fields for an address form — used by both the Add
 * Address and Edit Address pages so they stay in sync. Must be rendered
 * as a descendant of an antd <Form>; it renders no <Form> of its own.
 */
export default function AddressFormFields() {
  return (
    <>
      {/* Address Label */}
      <Form.Item
        name="label"
        label="Save Address As"
        rules={[{ required: true, message: "Please select address type" }]}>
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
            { required: true, message: "Please enter first name" },
            { min: 2, message: "First name must be at least 2 characters" },
          ]}>
          <Input size="large" placeholder="First name" />
        </Form.Item>

        <Form.Item
          name="lastName"
          label="Last Name"
          rules={[
            { required: true, message: "Please enter last name" },
            { min: 1, message: "Last name is required" },
          ]}>
          <Input size="large" placeholder="Last name" />
        </Form.Item>
      </div>

      {/* Phone Number */}
      <Form.Item
        name="phone"
        label="Phone Number"
        rules={[
          { required: true, message: "Please enter phone number" },
          {
            pattern: /^[0-9]{10}$/,
            message: "Please enter a valid 10-digit phone number",
          },
        ]}>
        <Input size="large" placeholder="Enter 10-digit phone number" maxLength={10} />
      </Form.Item>

      {/* Street Address */}
      <Form.Item
        name="street"
        label="House No., Building Name"
        rules={[{ required: true, message: "Please enter street address" }]}>
        <Input size="large" placeholder="E.g., H.No-2834, Street 5" />
      </Form.Item>

      {/* Area/Locality */}
      <Form.Item
        name="area"
        label="Area, Sector, Locality"
        rules={[{ required: true, message: "Please enter area" }]}>
        <Input size="large" placeholder="E.g., Sector 784, Downtown" />
      </Form.Item>

      {/* Landmark */}
      <Form.Item name="landmark" label="Landmark (Optional)">
        <Input size="large" placeholder="E.g., Near Clock Tower" />
      </Form.Item>

      {/* City and State */}
      <div className="grid grid-cols-2 gap-4">
        <Form.Item
          name="city"
          label="City"
          rules={[{ required: true, message: "Please enter city" }]}>
          <Input size="large" placeholder="City" />
        </Form.Item>

        <Form.Item
          name="state"
          label="State"
          rules={[{ required: true, message: "Please select state" }]}>
          <Select size="large" placeholder="Select State" showSearch>
            {INDIAN_STATES.map((state) => (
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
        validateFirst
        rules={[
          { required: true, message: "Please enter pincode" },
          {
            pattern: /^[0-9]{6}$/,
            message: "Please enter a valid 6-digit pincode",
          },
          {
            validator: async (_, value) => {
              if (!value || !/^[0-9]{6}$/.test(value)) return Promise.resolve();
              try {
                const res = await deliveryAPI.checkPincode(value);
                if (!res?.data?.data?.serviceable) {
                  return Promise.reject(
                    new Error(
                      res?.data?.data?.message ||
                        "We currently deliver only within select areas (Mumbai - 400089).",
                    ),
                  );
                }
                return Promise.resolve();
              } catch {
                // Don't block address saving on a network hiccup — the
                // order-placement check is still authoritative.
                return Promise.resolve();
              }
            },
          },
        ]}>
        <Input size="large" placeholder="Enter 6-digit pincode" maxLength={6} />
      </Form.Item>

      {/* Map-confirmed coordinates, set silently by AddressMapPicker */}
      <Form.Item name="lat" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="lng" hidden>
        <Input />
      </Form.Item>

      {/* Set as Default */}
      <Form.Item name="isDefault" valuePropName="checked">
        <Checkbox>Set as default address</Checkbox>
      </Form.Item>
    </>
  );
}
