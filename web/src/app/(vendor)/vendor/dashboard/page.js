'use client';

import { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Tag,
  Button,
  Space,
  Avatar,
  Select,
  DatePicker,
} from 'antd';
import {
  DollarOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  EyeOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';

const { RangePicker } = DatePicker;

/**
 * Vendor Dashboard
 * Responsive dashboard with stats, charts, and recent activity
 * Optimized for mobile, tablet, laptop, and desktop
 */
export default function VendorDashboard() {
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(false);

  // Mock data - replace with API calls
  const stats = [
    {
      title: 'Total Revenue',
      value: 45231,
      prefix: '₹',
      trend: 12.5,
      icon: <DollarOutlined className="text-2xl text-emerald-600" />,
      color: 'emerald',
    },
    {
      title: 'Products',
      value: 128,
      trend: 5.2,
      icon: <ShoppingOutlined className="text-2xl text-blue-600" />,
      color: 'blue',
    },
    {
      title: 'Orders',
      value: 892,
      trend: 8.1,
      icon: <ShoppingCartOutlined className="text-2xl text-purple-600" />,
      color: 'purple',
    },
    {
      title: 'Total Views',
      value: 12453,
      trend: -2.4,
      icon: <EyeOutlined className="text-2xl text-orange-600" />,
      color: 'orange',
    },
  ];

  const salesData = [
    { month: 'Jan', sales: 32000 },
    { month: 'Feb', sales: 45000 },
    { month: 'Mar', sales: 38000 },
    { month: 'Apr', sales: 52000 },
    { month: 'May', sales: 48000 },
    { month: 'Jun', sales: 61000 },
  ];

  const topProducts = [
    {
      key: '1',
      name: 'Summer Dress Collection',
      image: 'https://via.placeholder.com/40',
      sales: 234,
      revenue: 23400,
      stock: 45,
    },
    {
      key: '2',
      name: 'Winter Jacket',
      image: 'https://via.placeholder.com/40',
      sales: 189,
      revenue: 18900,
      stock: 12,
    },
    {
      key: '3',
      name: 'Casual Shirts',
      image: 'https://via.placeholder.com/40',
      sales: 156,
      revenue: 15600,
      stock: 67,
    },
  ];

  const recentOrders = [
    {
      key: '1',
      orderId: '#ORD-2024-1234',
      customer: 'John Doe',
      amount: 2499,
      status: 'pending',
      date: '2024-12-31',
    },
    {
      key: '2',
      orderId: '#ORD-2024-1235',
      customer: 'Jane Smith',
      amount: 3299,
      status: 'processing',
      date: '2024-12-31',
    },
    {
      key: '3',
      orderId: '#ORD-2024-1236',
      customer: 'Mike Johnson',
      amount: 1899,
      status: 'shipped',
      date: '2024-12-30',
    },
    {
      key: '4',
      orderId: '#ORD-2024-1237',
      customer: 'Sarah Wilson',
      amount: 4599,
      status: 'delivered',
      date: '2024-12-30',
    },
  ];

  const orderColumns = [
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
      responsive: ['md'],
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `₹${amount.toLocaleString()}`,
      responsive: ['sm'],
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          pending: 'orange',
          processing: 'blue',
          shipped: 'purple',
          delivered: 'green',
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      responsive: ['lg'],
    },
  ];

  const productColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div className="flex items-center gap-2">
          <Avatar src={record.image} size={40} shape="square" />
          <span className="font-medium text-sm">{name}</span>
        </div>
      ),
    },
    {
      title: 'Sales',
      dataIndex: 'sales',
      key: 'sales',
      responsive: ['md'],
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue) => `₹${revenue.toLocaleString()}`,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      responsive: ['lg'],
      render: (stock) => (
        <Tag color={stock < 20 ? 'red' : 'green'}>
          {stock} {stock < 20 ? '(Low)' : ''}
        </Tag>
      ),
    },
  ];

  const salesConfig = {
    data: salesData,
    xField: 'month',
    yField: 'sales',
    smooth: true,
    color: '#10b981',
    point: {
      size: 5,
      shape: 'circle',
    },
    label: {
      style: {
        fill: '#666',
      },
    },
    yAxis: {
      label: {
        formatter: (v) => `₹${(v / 1000).toFixed(0)}K`,
      },
    },
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Welcome back! Here's your store overview
          </p>
        </div>
        <Space className="w-full sm:w-auto" direction="vertical" size="small">
          <Select
            value={timeRange}
            onChange={setTimeRange}
            className="w-full sm:w-40"
            options={[
              { label: 'Last 7 Days', value: 'week' },
              { label: 'Last 30 Days', value: 'month' },
              { label: 'Last 90 Days', value: 'quarter' },
              { label: 'Last Year', value: 'year' },
            ]}
          />
        </Space>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <Row gutter={[16, 16]}>
        {stats.map((stat, index) => (
          <Col xs={12} sm={12} lg={6} key={index}>
            <Card
              className="hover:shadow-lg transition-shadow"
              bordered={false}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs md:text-sm text-gray-600 mb-1">
                    {stat.title}
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-gray-800">
                    {stat.prefix}
                    {stat.value.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend > 0 ? (
                      <ArrowUpOutlined className="text-green-600 text-xs" />
                    ) : (
                      <ArrowDownOutlined className="text-red-600 text-xs" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        stat.trend > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {Math.abs(stat.trend)}%
                    </span>
                    <span className="text-xs text-gray-500 hidden sm:inline">vs last period</span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]}>
        {/* Sales Chart */}
        <Col xs={24} lg={16}>
          <Card
            title={<span className="text-base md:text-lg font-semibold">Sales Overview</span>}
            variant='borderless'
            className="h-full"
          >
            {/* <div className="h-64 md:h-80">
              <Line {...salesConfig} />
            </div> */}
          </Card>
        </Col>

        {/* Quick Actions */}
        <Col xs={24} lg={8}>
          <Card
            title={<span className="text-base md:text-lg font-semibold">Quick Actions</span>}
            bordered={false}
            className="h-full"
          >
            <Space direction="vertical" className="w-full" size="middle">
              <Button
                type="primary"
                icon={<ShoppingOutlined />}
                block
                size="large"
                className="bg-emerald-600! hover:bg-emerald-700!"
              >
                Add New Product
              </Button>
              <Button
                icon={<ShoppingCartOutlined />}
                block
                size="large"
              >
                View All Orders
              </Button>
              <Button
                icon={<EyeOutlined />}
                block
                size="large"
              >
                View Analytics
              </Button>

              {/* Order Status Summary */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold mb-3">Order Status</h4>
                <Space direction="vertical" className="w-full" size="small">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending</span>
                    <Tag color="orange">12</Tag>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Processing</span>
                    <Tag color="blue">8</Tag>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Shipped</span>
                    <Tag color="purple">15</Tag>
                  </div>
                </Space>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Tables Row */}
      <Row gutter={[16, 16]}>
        {/* Top Products */}
        <Col xs={24} xl={12}>
          <Card
            title={<span className="text-base md:text-lg font-semibold">Top Products</span>}
            bordered={false}
            extra={<Button type="link" size="small">View All</Button>}
          >
            <Table
              columns={productColumns}
              dataSource={topProducts}
              pagination={false}
              size="small"
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </Col>

        {/* Recent Orders */}
        <Col xs={24} xl={12}>
          <Card
            title={<span className="text-base md:text-lg font-semibold">Recent Orders</span>}
            bordered={false}
            extra={<Button type="link" size="small">View All</Button>}
          >
            <Table
              columns={orderColumns}
              dataSource={recentOrders}
              pagination={false}
              size="small"
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
