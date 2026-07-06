'use client';

import { AdminErrorState, AdminLoadingState } from '@/components/admin/AdminStates';
import { useAdminDashboard } from '@/services/admin/dashboard';
import {
  ArrowUpOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Card, Col, Row, Select, Statistic, Table, Tag } from 'antd';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { useState } from 'react';
import { Line, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const [period, setPeriod] = useState('30');

  // Use React Query hook for dashboard data
  const {
    data: dashboard,
    isLoading,
    error,
    refetch
  } = useAdminDashboard(period);


  // Handle period change
  const handlePeriodChange = (value) => {
    setPeriod(value);
  };

  if (isLoading) {
    return <AdminLoadingState />;
  }

  if (error) {
    return (
      <AdminErrorState
        title="Failed to Load Dashboard"
        description={error?.message || "Unable to fetch dashboard data. Please try again."}
        onRetry={() => refetch()}
        retryText="Retry"
      />
    );
  }

  console.log('Dashboard Data:', dashboard);
  const { overview, revenue, topProducts, recentOrders, lowStockProducts, categoryStats } = dashboard || {};

  // Revenue chart data
  const revenueChartData = {
    labels: revenue?.byDay?.map(d => d._id) || [],
    datasets: [
      {
        label: 'Revenue',
        data: revenue?.byDay?.map(d => d.revenue) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Orders',
        data: revenue?.byDay?.map(d => d.orders) || [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // Category chart data
  const categoryChartData = {
    labels: categoryStats?.map(c => c.name) || [],
    datasets: [
      {
        label: 'Revenue by Category',
        data: categoryStats?.map(c => c.revenue) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
      },
    ],
  };

  const orderColumns = [
    {
      title: 'Order #',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
    },
    {
      title: 'Customer',
      dataIndex: ['user', 'firstName'],
      key: 'customer',
      render: (_, record) => `${record.user?.firstName} ${record.user?.lastName}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        const colors = {
          pending: 'orange',
          confirmed: 'blue',
          processing: 'cyan',
          shipped: 'purple',
          delivered: 'green',
          cancelled: 'red',
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Total',
      dataIndex: ['pricing', 'total'],
      key: 'total',
      render: total => `₹${total?.toFixed(2)}`,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: date => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back to Apna Bazaar Admin</p>
        </div>
        <Select
          value={period}
          onChange={handlePeriodChange}
          className="w-32"
          options={[
            { label: 'Last 7 days', value: '7' },
            { label: 'Last 30 days', value: '30' },
            { label: 'Last 90 days', value: '90' },
          ]}
        />
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={revenue?.total || 0}
              precision={2}
              prefix="₹"
              styles={{ value: { color: '#3f8600' } }}
              suffix={
                <span className="text-sm">
                  <ArrowUpOutlined /> {revenue?.growth}%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={overview?.totalOrders || 0}
              prefix={<ShoppingCartOutlined />}
              styles={{ value: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={overview?.totalUsers || 0}
              prefix={<UserOutlined />}
              styles={{ value: { color: '#722ed1' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Products"
              value={overview?.totalProducts || 0}
              prefix={<ShoppingOutlined />}
              styles={{ value: { color: '#fa8c16' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Order Status Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Pending Orders"
              value={overview?.pendingOrders || 0}
              styles={{ value: { color: '#faad14' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Completed Orders"
              value={overview?.completedOrders || 0}
              styles={{ value: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Cancelled Orders"
              value={overview?.cancelledOrders || 0}
              styles={{ value: { color: '#f5222d' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Revenue & Orders Trend" className="h-full">
            <Line data={revenueChartData} options={{ maintainAspectRatio: false }} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Revenue by Category" className="h-full">
            <Pie data={categoryChartData} options={{ maintainAspectRatio: false }} height={300} />
          </Card>
        </Col>
      </Row>

      {/* Recent Orders & Low Stock */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Recent Orders">
            <Table
              dataSource={recentOrders}
              columns={orderColumns}
              rowKey="_id"
              pagination={false}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Low Stock Alert" className="h-full">
            <div className="space-y-3">
              {lowStockProducts?.map(product => (
                <div key={product._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">Stock: {product.stock} units</p>
                  </div>
                  <Tag color="red">Low</Tag>
                </div>
              ))}
              {(!lowStockProducts || lowStockProducts.length === 0) && (
                <div className="text-center text-gray-500 py-8">
                  All products have sufficient stock
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Top Products */}
      <Card title="Top Selling Products">
        <Row gutter={[16, 16]}>
          {topProducts?.map((product, index) => {            
           return (
            <Col xs={24} sm={12} lg={8} key={product._id}>
              <Card className="bg-linear-to-br from-blue-50 to-indigo-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">#{index + 1}</p>
                    <p className="font-medium text-gray-900 mt-1">{product.name}</p>
                    <p className="text-sm text-gray-600 mt-1">Sold: {product.totalSold} units</p>
                    <p className="text-lg font-semibold text-green-600 mt-2">
                      ₹{product.revenue?.toFixed(2)}
                    </p>
                  </div>
                  <ShoppingOutlined className="text-3xl text-blue-500" />
                </div>
              </Card>
            </Col>
          )
          })}
        </Row>
      </Card>
    </div>
  );
}
