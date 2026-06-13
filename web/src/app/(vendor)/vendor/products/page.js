'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Tag,
  Space,
  Modal,
  Form,
  InputNumber,
  Upload,
  message,
  Image,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Switch,
  Drawer,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { apiClient } from '@/lib/api';

const { TextArea } = Input;

/**
 * Vendor Products Page
 * Responsive product management with CRUD operations
 * Mobile drawer for filters, desktop inline filters
 */
export default function VendorProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isMobile, setIsMobile] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      const mockProducts = [
        {
          key: '1',
          id: 1,
          name: 'Summer Floral Dress',
          category: 'Dresses',
          price: 2499,
          stock: 45,
          status: 'active',
          image: 'https://via.placeholder.com/60',
          sales: 234,
          featured: true,
        },
        {
          key: '2',
          id: 2,
          name: 'Winter Leather Jacket',
          category: 'Jackets',
          price: 5999,
          stock: 12,
          status: 'active',
          image: 'https://via.placeholder.com/60',
          sales: 189,
          featured: false,
        },
        {
          key: '3',
          id: 3,
          name: 'Casual Cotton Shirt',
          category: 'Shirts',
          price: 1299,
          stock: 0,
          status: 'out_of_stock',
          image: 'https://via.placeholder.com/60',
          sales: 156,
          featured: false,
        },
      ];
      setProducts(mockProducts);
    } catch (error) {
      message.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    form.setFieldsValue(product);
    setModalOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    try {
      // await apiClient.delete(`/api/products/${id}`);
      message.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      message.error('Failed to delete product');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();
      Object.keys(values).forEach((key) => {
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      if (editingProduct) {
        // await apiClient.put(`/api/products/${editingProduct.id}`, formData);
        message.success('Product updated successfully');
      } else {
        // await apiClient.post('/api/products', formData);
        message.success('Product created successfully');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (error) {
      message.error('Failed to save product');
    }
  };

  const columns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      fixed: isMobile ? false : 'left',
      width: isMobile ? 200 : 300,
      render: (name, record) => (
        <div className="flex items-center gap-3">
          <Image
            src={record.image}
            alt={name}
            width={isMobile ? 40 : 60}
            height={isMobile ? 40 : 60}
            className="rounded-lg object-cover"
            preview={false}
          />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm md:text-base truncate">{name}</div>
            <div className="text-xs text-gray-500">{record.category}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      responsive: ['md'],
      render: (price) => <span className="font-semibold">₹{price.toLocaleString()}</span>,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      responsive: ['lg'],
      render: (stock) => (
        <Tag color={stock === 0 ? 'red' : stock < 20 ? 'orange' : 'green'}>
          {stock === 0 ? 'Out of Stock' : `${stock} units`}
        </Tag>
      ),
    },
    {
      title: 'Sales',
      dataIndex: 'sales',
      key: 'sales',
      responsive: ['xl'],
      sorter: (a, b) => a.sales - b.sales,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Active' : 'Out of Stock'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: isMobile ? false : 'right',
      width: isMobile ? 100 : 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditProduct(record)}
            className="!text-blue-600"
          />
          <Popconfirm
            title="Delete product?"
            description="This action cannot be undone."
            onConfirm={() => handleDeleteProduct(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              danger
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const productStats = [
    {
      title: 'Total Products',
      value: products.length,
      suffix: 'items',
    },
    {
      title: 'Active',
      value: products.filter((p) => p.status === 'active').length,
    },
    {
      title: 'Out of Stock',
      value: products.filter((p) => p.stock === 0).length,
    },
    {
      title: 'Featured',
      value: products.filter((p) => p.featured).length,
    },
  ];

  const FilterContent = () => (
    <Space direction="vertical" className="w-full" size="middle">
      <Select
        placeholder="Category"
        value={filterCategory}
        onChange={setFilterCategory}
        className="w-full"
        options={[
          { label: 'All Categories', value: 'all' },
          { label: 'Dresses', value: 'Dresses' },
          { label: 'Jackets', value: 'Jackets' },
          { label: 'Shirts', value: 'Shirts' },
        ]}
      />
      <Select
        placeholder="Status"
        value={filterStatus}
        onChange={setFilterStatus}
        className="w-full"
        options={[
          { label: 'All Status', value: 'all' },
          { label: 'Active', value: 'active' },
          { label: 'Out of Stock', value: 'out_of_stock' },
        ]}
      />
    </Space>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Products</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Manage your product inventory
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleAddProduct}
          className="!bg-emerald-600 hover:!bg-emerald-700 w-full sm:w-auto"
        >
          Add Product
        </Button>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        {productStats.map((stat, index) => (
          <Col xs={12} sm={6} key={index}>
            <Card bordered={false} className="text-center">
              <Statistic
                title={<span className="text-xs md:text-sm">{stat.title}</span>}
                value={stat.value}
                suffix={stat.suffix}
                valueStyle={{ fontSize: isMobile ? '20px' : '24px' }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters and Search */}
      <Card bordered={false}>
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <Input
            placeholder="Search products..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            size="large"
            className="flex-1"
          />
          
          {/* Mobile Filter Button */}
          {isMobile ? (
            <Button
              icon={<FilterOutlined />}
              size="large"
              onClick={() => setFilterDrawerOpen(true)}
            >
              Filters
            </Button>
          ) : (
            /* Desktop Filters */
            <Space size="middle">
              <Select
                placeholder="Category"
                value={filterCategory}
                onChange={setFilterCategory}
                style={{ width: 150 }}
                size="large"
                options={[
                  { label: 'All Categories', value: 'all' },
                  { label: 'Dresses', value: 'Dresses' },
                  { label: 'Jackets', value: 'Jackets' },
                  { label: 'Shirts', value: 'Shirts' },
                ]}
              />
              <Select
                placeholder="Status"
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: 150 }}
                size="large"
                options={[
                  { label: 'All Status', value: 'all' },
                  { label: 'Active', value: 'active' },
                  { label: 'Out of Stock', value: 'out_of_stock' },
                ]}
              />
            </Space>
          )}
        </div>
      </Card>

      {/* Mobile Filter Drawer */}
      <Drawer
        title="Filters"
        placement="right"
        onClose={() => setFilterDrawerOpen(false)}
        open={filterDrawerOpen}
        width={300}
      >
        <FilterContent />
      </Drawer>

      {/* Products Table */}
      <Card bordered={false}>
        <Table
          columns={columns}
          dataSource={filteredProducts}
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} products`,
            responsive: true,
          }}
        />
      </Card>

      {/* Add/Edit Product Modal */}
      <Modal
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={isMobile ? '100%' : 700}
        style={isMobile ? { top: 0, paddingBottom: 0 } : {}}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Product Name"
                name="name"
                rules={[{ required: true, message: 'Please enter product name' }]}
              >
                <Input size="large" placeholder="e.g., Summer Dress" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Category"
                name="category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select
                  size="large"
                  placeholder="Select category"
                  options={[
                    { label: 'Dresses', value: 'Dresses' },
                    { label: 'Jackets', value: 'Jackets' },
                    { label: 'Shirts', value: 'Shirts' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea rows={3} placeholder="Product description" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Price (₹)"
                name="price"
                rules={[{ required: true, message: 'Please enter price' }]}
              >
                <InputNumber
                  size="large"
                  className="w-full"
                  min={0}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Stock"
                name="stock"
                rules={[{ required: true, message: 'Please enter stock' }]}
              >
                <InputNumber
                  size="large"
                  className="w-full"
                  min={0}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Featured"
                name="featured"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Product Images" name="images">
            <Upload
              listType="picture-card"
              maxCount={5}
              accept="image/*"
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item className="mb-0 mt-6">
            <Space className="w-full justify-end">
              <Button onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                className="!bg-emerald-600 hover:!bg-emerald-700"
              >
                {editingProduct ? 'Update' : 'Create'} Product
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
