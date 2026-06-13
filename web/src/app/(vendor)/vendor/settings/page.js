'use client';

import { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Upload,
  Avatar,
  Row,
  Col,
  Divider,
  Switch,
  Select,
  message,
  Tabs,
  Space,
  InputNumber,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  CameraOutlined,
  BankOutlined,
  BellOutlined,
  ShopOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

const { TextArea } = Input;

export default function VendorSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [storeForm] = Form.useForm();
  const [bankForm] = Form.useForm();

  const handleProfileUpdate = async (values) => {
    setLoading(true);
    try {
      await apiClient.put('/api/users/profile', values);
      message.success('Profile updated successfully');
    } catch (error) {
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await apiClient.put('/api/users/password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success('Password updated successfully');
      passwordForm.resetFields();
    } catch (error) {
      message.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleStoreUpdate = async (values) => {
    setLoading(true);
    try {
      await apiClient.put('/api/vendor/store', values);
      message.success('Store settings updated successfully');
    } catch (error) {
      message.error('Failed to update store settings');
    } finally {
      setLoading(false);
    }
  };

  const handleBankUpdate = async (values) => {
    setLoading(true);
    try {
      await apiClient.put('/api/vendor/bank', values);
      message.success('Bank details updated successfully');
    } catch (error) {
      message.error('Failed to update bank details');
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: 'profile',
      label: (
        <span className="flex items-center gap-2">
          <UserOutlined />
          <span className="hidden sm:inline">Profile</span>
        </span>
      ),
      children: (
        <Card className="shadow-sm">
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <Avatar
                size={120}
                icon={<UserOutlined />}
                src={user?.avatar}
                className="border-4 border-gray-200"
              />
              <Button
                shape="circle"
                icon={<CameraOutlined />}
                className="absolute bottom-0 right-0 shadow-lg"
                size="large"
              />
            </div>
            <h3 className="mt-4 text-xl font-semibold">
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="text-gray-500">{user?.email}</p>
          </div>

          <Divider />

          <Form
            form={profileForm}
            layout="vertical"
            onFinish={handleProfileUpdate}
            initialValues={{
              firstName: user?.firstName,
              lastName: user?.lastName,
              email: user?.email,
              phone: user?.phone,
            }}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="firstName"
                  label="First Name"
                  rules={[{ required: true, message: 'Please enter first name' }]}
                >
                  <Input size="large" prefix={<UserOutlined />} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="lastName"
                  label="Last Name"
                  rules={[{ required: true, message: 'Please enter last name' }]}
                >
                  <Input size="large" prefix={<UserOutlined />} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Please enter email' },
                    { type: 'email', message: 'Please enter valid email' },
                  ]}
                >
                  <Input size="large" prefix={<MailOutlined />} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="phone" label="Phone Number">
                  <Input size="large" prefix={<PhoneOutlined />} />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading}
                    block
                  >
                    Update Profile
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      ),
    },
    {
      key: 'store',
      label: (
        <span className="flex items-center gap-2">
          <ShopOutlined />
          <span className="hidden sm:inline">Store</span>
        </span>
      ),
      children: (
        <Card className="shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Store Information</h3>
          <Form
            form={storeForm}
            layout="vertical"
            onFinish={handleStoreUpdate}
            initialValues={{
              storeName: 'My Fashion Store',
              storeDescription: '',
              storeEmail: user?.email,
              storePhone: user?.phone,
            }}
          >
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  name="storeName"
                  label="Store Name"
                  rules={[{ required: true, message: 'Please enter store name' }]}
                >
                  <Input size="large" prefix={<ShopOutlined />} />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="storeDescription" label="Store Description">
                  <TextArea rows={4} placeholder="Tell customers about your store" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="storeEmail"
                  label="Store Email"
                  rules={[{ type: 'email', message: 'Please enter valid email' }]}
                >
                  <Input size="large" prefix={<MailOutlined />} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="storePhone" label="Store Phone">
                  <Input size="large" prefix={<PhoneOutlined />} />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="storeAddress" label="Store Address">
                  <TextArea rows={3} placeholder="Enter store address" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="storeCity" label="City">
                  <Input size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="storeState" label="State">
                  <Input size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="storeZipCode" label="ZIP Code">
                  <Input size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="storeCountry" label="Country">
                  <Select size="large" placeholder="Select country">
                    <Select.Option value="India">India</Select.Option>
                    <Select.Option value="USA">USA</Select.Option>
                    <Select.Option value="UK">UK</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Divider />
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading}
                    block
                  >
                    Update Store Information
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      ),
    },
    {
      key: 'bank',
      label: (
        <span className="flex items-center gap-2">
          <BankOutlined />
          <span className="hidden sm:inline">Bank</span>
        </span>
      ),
      children: (
        <Card className="shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Bank Details</h3>
          <p className="text-gray-500 mb-6">
            Add your bank account details to receive payments
          </p>
          <Form form={bankForm} layout="vertical" onFinish={handleBankUpdate}>
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  name="accountHolderName"
                  label="Account Holder Name"
                  rules={[
                    { required: true, message: 'Please enter account holder name' },
                  ]}
                >
                  <Input size="large" placeholder="Enter account holder name" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="accountNumber"
                  label="Account Number"
                  rules={[
                    { required: true, message: 'Please enter account number' },
                  ]}
                >
                  <Input size="large" placeholder="Enter account number" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="confirmAccountNumber"
                  label="Confirm Account Number"
                  rules={[
                    { required: true, message: 'Please confirm account number' },
                  ]}
                >
                  <Input size="large" placeholder="Confirm account number" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="ifscCode"
                  label="IFSC Code"
                  rules={[{ required: true, message: 'Please enter IFSC code' }]}
                >
                  <Input size="large" placeholder="Enter IFSC code" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="bankName"
                  label="Bank Name"
                  rules={[{ required: true, message: 'Please enter bank name' }]}
                >
                  <Input size="large" placeholder="Enter bank name" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="branchName" label="Branch Name">
                  <Input size="large" placeholder="Enter branch name" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Divider />
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading}
                    block
                  >
                    Update Bank Details
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      ),
    },
    {
      key: 'password',
      label: (
        <span className="flex items-center gap-2">
          <LockOutlined />
          <span className="hidden sm:inline">Security</span>
        </span>
      ),
      children: (
        <Card className="shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Change Password</h3>
          <p className="text-gray-500 mb-6">
            Update your password to keep your account secure
          </p>
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordUpdate}
          >
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  name="currentPassword"
                  label="Current Password"
                  rules={[
                    { required: true, message: 'Please enter current password' },
                  ]}
                >
                  <Input.Password size="large" prefix={<LockOutlined />} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="newPassword"
                  label="New Password"
                  rules={[
                    { required: true, message: 'Please enter new password' },
                    { min: 6, message: 'Password must be at least 6 characters' },
                  ]}
                >
                  <Input.Password size="large" prefix={<LockOutlined />} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="confirmPassword"
                  label="Confirm New Password"
                  rules={[
                    { required: true, message: 'Please confirm new password' },
                  ]}
                >
                  <Input.Password size="large" prefix={<LockOutlined />} />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading}
                    block
                  >
                    Update Password
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      ),
    },
    {
      key: 'notifications',
      label: (
        <span className="flex items-center gap-2">
          <BellOutlined />
          <span className="hidden sm:inline">Notifications</span>
        </span>
      ),
      children: (
        <Card className="shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <h4 className="font-medium">New Orders</h4>
                <p className="text-sm text-gray-500">
                  Get notified when you receive new orders
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <h4 className="font-medium">Order Updates</h4>
                <p className="text-sm text-gray-500">
                  Get notified about order status changes
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <h4 className="font-medium">Low Stock Alerts</h4>
                <p className="text-sm text-gray-500">
                  Get notified when products are running low on stock
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <h4 className="font-medium">Payment Updates</h4>
                <p className="text-sm text-gray-500">
                  Get notified about payment transfers
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <h4 className="font-medium">Marketing Emails</h4>
                <p className="text-sm text-gray-500">
                  Receive promotional and marketing emails
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <h4 className="font-medium">Newsletter</h4>
                <p className="text-sm text-gray-500">
                  Receive weekly newsletter with tips and updates
                </p>
              </div>
              <Switch />
            </div>
          </div>
          <Divider />
          <Button type="primary" size="large" block>
            Save Notification Preferences
          </Button>
        </Card>
      ),
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your account and store settings
        </p>
      </div>

      <Tabs
        defaultActiveKey="profile"
        items={tabItems}
        className="vendor-settings-tabs"
        tabPosition="top"
        type="card"
      />
    </div>
  );
}
