'use client';

import { AdminErrorState, AdminLoadingState } from '@/components/admin/AdminStates';
import UsersService, { useAdminUsers } from '@/services/admin/users';
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { App, Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag } from 'antd';
import { useState } from 'react';

export default function AdminUsers() {
  const { message } = App.useApp();
  const [pagination, setPagination] = useState({ page: 1, limit: 20 });
  const [filters, setFilters] = useState({ search: '', role: '', isActive: '' });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();

  // Use React Query hook for users data
  const {
    data: usersData,
    isLoading,
    error,
    refetch
  } = useAdminUsers({
    enabled: true,
    filters,
    page: pagination.page,
    limit: pagination.limit
  });

  // Extract data from React Query response
  const users = usersData?.data || [];
  const paginationData = usersData?.pagination || { total: 0, page: 1, pages: 1 };

  // Show loading state
  if (isLoading && !users.length) {
    return <AdminLoadingState />;
  }

  // Show error state
  if (error) {
    return (
      <AdminErrorState
        title="Failed to Load Users"
        description={error?.message || "Unable to fetch users. Please try again."}
        onRetry={() => refetch()}
      />
    );
  }

  const handleEdit = (user) => {
    setSelectedUser(user);
    form.setFieldsValue({
      role: user.role,
      isActive: user.isActive,
    });
    setEditModalVisible(true);
  };

  const handleUpdate = async (values) => {
    try {
      // await apiClient.put(`/api/admin/users/${selectedUser._id}`, values);
      message.success('User updated successfully');
      UsersService.update(selectedUser._id, values);
      message.success('User updated successfully');
      setEditModalVisible(false);
      form.resetFields();
      setSelectedUser(null);
      refetch();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDelete = async (userId) => {
    try {
      await UsersService.delete(userId);
      message.success('User deleted successfully');
      refetch();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const columns = [
    {
      title: 'Name',
      key: 'name',
      // fixed: 'left',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="font-medium">
            {record.firstName} {record.lastName}
          </div>
          <div className="text-sm text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
      render: phone => phone || 'N/A',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: role => {
        const colors = {
          admin: 'red',
          vendor: 'blue',
          customer: 'green',
        };
        return (
          <Tag color={colors[role]}>
            {role.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: isActive => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Verified',
      dataIndex: 'isVerified',
      key: 'isVerified',
      width: 100,
      render: isVerified => (
        <Tag color={isVerified ? 'green' : 'orange'}>
          {isVerified ? 'Yes' : 'No'}
        </Tag>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: date => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete user?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record._id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-600 mt-1">Manage system users</p>
      </div>

      <Card>
        <div className="flex gap-4 mb-4">
          <Input
            placeholder="Search by name or email..."
            prefix={<SearchOutlined />}
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="max-w-sm"
            allowClear
          />
          <Select
            placeholder="Role"
            value={filters.role}
            onChange={value => setFilters(prev => ({ ...prev, role: value }))}
            className="w-32"
            allowClear
          >
            <Select.Option value="customer">Customer</Select.Option>
            <Select.Option value="vendor">Vendor</Select.Option>
            <Select.Option value="admin">Admin</Select.Option>
          </Select>
          <Select
            placeholder="Status"
            value={filters.isActive}
            onChange={value => setFilters(prev => ({ ...prev, isActive: value }))}
            className="w-32"
            allowClear
          >
            <Select.Option value="true">Active</Select.Option>
            <Select.Option value="false">Inactive</Select.Option>
          </Select>
        </div>

        <Table
          dataSource={users}
          columns={columns}
          rowKey="_id"
          loading={isLoading}
          scroll={{ x: 860 }}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: paginationData.total,
            onChange: page => setPagination(prev => ({ ...prev, page })),
            showSizeChanger: false,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
          }}
        />
      </Card>

      <Modal
        title="Edit User"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          form.resetFields();
          setSelectedUser(null);
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
        >
          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select size="large">
              <Select.Option value="customer">Customer</Select.Option>
              <Select.Option value="vendor">Vendor</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Status"
            name="isActive"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select size="large">
              <Select.Option value={true}>Active</Select.Option>
              <Select.Option value={false}>Inactive</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <div className="flex gap-4">
              <Button type="primary" htmlType="submit" size="large" className="flex-1">
                Update User
              </Button>
              <Button
                size="large"
                onClick={() => {
                  setEditModalVisible(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
