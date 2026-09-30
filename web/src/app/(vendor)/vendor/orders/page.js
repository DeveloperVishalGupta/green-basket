'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Tag,
  Descriptions,
  Steps,
  Row,
  Col,
  Statistic,
  Drawer,
  App,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TruckOutlined,
  FilterOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';

/**
 * Vendor Orders Page
 * Responsive order management with status tracking
 * Mobile drawer for order details, desktop modal
 */
export default function VendorOrders() {
  const { message, modal } = App.useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      const mockOrders = [
        {
          key: '1',
          orderId: '#ORD-2024-1234',
          customer: 'John Doe',
          email: 'john@example.com',
          phone: '+91 9876543210',
          items: 3,
          amount: 7497,
          status: 'pending',
          date: '2024-12-31',
          address: '123 Main St, Mumbai, Maharashtra 400001',
        },
        {
          key: '2',
          orderId: '#ORD-2024-1235',
          customer: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+91 9876543211',
          items: 2,
          amount: 5998,
          status: 'processing',
          date: '2024-12-31',
          address: '456 Park Ave, Delhi, Delhi 110001',
        },
        {
          key: '3',
          orderId: '#ORD-2024-1236',
          customer: 'Mike Johnson',
          email: 'mike@example.com',
          phone: '+91 9876543212',
          items: 1,
          amount: 2499,
          status: 'shipped',
          date: '2024-12-30',
          address: '789 Beach Rd, Goa, Goa 403001',
        },
      ];
      setOrders(mockOrders);
    } catch (error) {
      message.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    if (isMobile) {
      setDetailDrawerOpen(true);
    } else {
      modal.info({
        title: `Order ${order.orderId}`,
        width: 700,
        content: <OrderDetails order={order} />,
        okText: 'Close',
      });
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      // await apiClient.put(`/api/orders/${orderId}/status`, { status: newStatus });
      message.success('Order status updated successfully');
      fetchOrders();
    } catch (error) {
      message.error('Failed to update order status');
    }
  };

  const OrderDetails = ({ order }) => (
    <div className="space-y-4">
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="Order ID">{order.orderId}</Descriptions.Item>
        <Descriptions.Item label="Customer">{order.customer}</Descriptions.Item>
        <Descriptions.Item label="Email">{order.email}</Descriptions.Item>
        <Descriptions.Item label="Phone">{order.phone}</Descriptions.Item>
        <Descriptions.Item label="Items">{order.items}</Descriptions.Item>
        <Descriptions.Item label="Total Amount">
          ₹{order.amount.toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={getStatusColor(order.status)}>
            {order.status.toUpperCase()}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Delivery Address">
          {order.address}
        </Descriptions.Item>
      </Descriptions>

      <div>
        <h4 className="font-semibold mb-2">Order Progress</h4>
        <Steps
          current={getStatusStep(order.status)}
          size="small"
          direction={isMobile ? 'vertical' : 'horizontal'}
          items={[
            {
              title: 'Pending',
              icon: <ClockCircleOutlined />,
            },
            {
              title: 'Processing',
              icon: <ShoppingCartOutlined />,
            },
            {
              title: 'Shipped',
              icon: <TruckOutlined />,
            },
            {
              title: 'Delivered',
              icon: <CheckCircleOutlined />,
            },
          ]}
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          size="small"
          onClick={() => handleUpdateStatus(order.orderId, 'processing')}
          disabled={order.status !== 'pending'}
        >
          Mark as Processing
        </Button>
        <Button
          size="small"
          onClick={() => handleUpdateStatus(order.orderId, 'shipped')}
          disabled={order.status !== 'processing'}
        >
          Mark as Shipped
        </Button>
        <Button
          size="small"
          onClick={() => handleUpdateStatus(order.orderId, 'delivered')}
          disabled={order.status !== 'shipped'}
        >
          Mark as Delivered
        </Button>
      </div>
    </div>
  );

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      processing: 'blue',
      shipped: 'purple',
      delivered: 'green',
      cancelled: 'red',
    };
    return colors[status] || 'default';
  };

  const getStatusStep = (status) => {
    const steps = {
      pending: 0,
      processing: 1,
      shipped: 2,
      delivered: 3,
    };
    return steps[status] || 0;
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
      fixed: isMobile ? false : 'left',
      render: (orderId) => (
        <span className="font-mono text-xs md:text-sm font-medium">{orderId}</span>
      ),
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      responsive: ['md'],
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      responsive: ['lg'],
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <span className="font-semibold">₹{amount.toLocaleString()}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      responsive: ['xl'],
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: isMobile ? false : 'right',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewOrder(record)}
        >
          {!isMobile && 'View'}
        </Button>
      ),
    },
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderId.toLowerCase().includes(searchText.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const orderStats = [
    {
      title: 'Total Orders',
      value: orders.length,
      icon: <ShoppingCartOutlined className="text-blue-600" />,
    },
    {
      title: 'Pending',
      value: orders.filter((o) => o.status === 'pending').length,
      icon: <ClockCircleOutlined className="text-orange-600" />,
    },
    {
      title: 'Processing',
      value: orders.filter((o) => o.status === 'processing').length,
      icon: <ShoppingCartOutlined className="text-blue-600" />,
    },
    {
      title: 'Delivered',
      value: orders.filter((o) => o.status === 'delivered').length,
      icon: <CheckCircleOutlined className="text-green-600" />,
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Orders</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">
          Track and manage customer orders
        </p>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        {orderStats.map((stat, index) => (
          <Col xs={12} sm={6} key={index}>
            <Card bordered={false}>
              <Statistic
                title={<span className="text-xs md:text-sm">{stat.title}</span>}
                value={stat.value}
                prefix={stat.icon}
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
            placeholder="Search by order ID or customer..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            size="large"
            className="flex-1"
          />

          {isMobile ? (
            <Button
              icon={<FilterOutlined />}
              size="large"
              onClick={() => setFilterDrawerOpen(true)}
            >
              Status
            </Button>
          ) : (
            <Select
              placeholder="Filter by status"
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: 180 }}
              size="large"
              options={[
                { label: 'All Orders', value: 'all' },
                { label: 'Pending', value: 'pending' },
                { label: 'Processing', value: 'processing' },
                { label: 'Shipped', value: 'shipped' },
                { label: 'Delivered', value: 'delivered' },
              ]}
            />
          )}
        </div>
      </Card>

      {/* Mobile Filter Drawer */}
      <Drawer
        title="Filter by Status"
        placement="right"
        onClose={() => setFilterDrawerOpen(false)}
        open={filterDrawerOpen}
        width={300}
      >
        <Select
          placeholder="Select status"
          value={filterStatus}
          onChange={(value) => {
            setFilterStatus(value);
            setFilterDrawerOpen(false);
          }}
          className="w-full"
          size="large"
          options={[
            { label: 'All Orders', value: 'all' },
            { label: 'Pending', value: 'pending' },
            { label: 'Processing', value: 'processing' },
            { label: 'Shipped', value: 'shipped' },
            { label: 'Delivered', value: 'delivered' },
          ]}
        />
      </Drawer>

      {/* Orders Table */}
      <Card bordered={false}>
        <Table
          columns={columns}
          dataSource={filteredOrders}
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} orders`,
            responsive: true,
          }}
        />
      </Card>

      {/* Mobile Order Details Drawer */}
      <Drawer
        title={`Order ${selectedOrder?.orderId}`}
        placement="right"
        onClose={() => setDetailDrawerOpen(false)}
        open={detailDrawerOpen}
        width="100%"
      >
        {selectedOrder && <OrderDetails order={selectedOrder} />}
      </Drawer>
    </div>
  );
}
