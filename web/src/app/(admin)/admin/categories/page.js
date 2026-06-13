'use client';

import { AdminErrorState, AdminLoadingState } from '@/components/admin/AdminStates';
// import CategoriesService, { useCategories } from '@/services/admin/categories';
import CategoriesService, { useCategories } from '@/services/categories';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { App, Button, Card, Image, Popconfirm, Space, Table, Tag } from 'antd';
import { useState } from 'react';
import CreateEditCategoriesModal from './createEditCategoriesModal';

export default function AdminCategories() {
  const { message } = App.useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryId, setCategoryId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Use React Query hook for categories data
  const {
    data: categories,
    isLoading,
    error,
    refetch
  } = useCategories({enabled:true});

  // Handle edit category
  const handleEdit = (category) => {
    
    setCategoryId(category?.id || category?._id  );
    setIsEditMode(true);
    // form.setFieldsValue(category);
    setModalVisible(true);
  };

  // Handle delete category
  const handleDelete = async (id) => {
    try {
      const deleteResponse = await CategoriesService.delete(id);
      if (deleteResponse.success) {
        message.success(deleteResponse.message || 'Category deleted successfully');
      }
      refetch(); // Refetch categories after deletion
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  // Show loading state
  if (isLoading) {
    return <AdminLoadingState />;
  }

  // Show error state
  if (error) {
    return (
      <AdminErrorState
        title="Failed to Load Categories"
        description={error?.message || "Unable to fetch categories. Please try again."}
        onRetry={() => refetch()}
      />
    );
  }

  const columns = [
    {
      title: 'Category',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div className="flex items-center gap-3">
          {record.image?.url ? (
            <Image
              src={record.image.url}
              alt={name}
              width={50}
              height={50}
              className="rounded-lg object-cover"
              preview={false}
            />
          ) : (
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
              📁
            </div>
          )}
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-sm text-gray-500">{record.slug}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: isActive => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: date => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete category?"
            description="This will also affect products in this category."
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">Manage product categories</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => {
            setCategoryId(null);
            setIsEditMode(false);
            // form.resetFields();
            setModalVisible(true);
          }}
        >
          Add Category
        </Button>
      </div>

      <Card>
        <Table
          dataSource={categories}
          columns={columns}
          rowKey="_id"
          pagination={false}
        />
      </Card>

      <CreateEditCategoriesModal
        visible={modalVisible}
        setVisible={setModalVisible}
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        isEditMode={isEditMode}
        refetch={refetch}
      />
    </div>
  );
}
