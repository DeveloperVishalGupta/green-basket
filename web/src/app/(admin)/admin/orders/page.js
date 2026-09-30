"use client";

import {
  AdminErrorState,
  AdminLoadingState,
} from "@/components/admin/AdminStates";
import OrdersService, { useAdminOrders } from "@/services/admin/orders";
import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Modal,
  Select,
  Table,
  Tag,
} from "antd";
import Image from "next/image";
import { useState } from "react";

export default function AdminOrders() {
  const { message } = App.useApp();
  const [pagination, setPagination] = useState({ page: 1, limit: 20 });
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelForm] = Form.useForm();
  const [verifyingAvailability, setVerifyingAvailability] = useState(false);

  // Use React Query hook for orders data
  const {
    data: ordersData,
    isLoading,
    error,
    refetch,
  } = useAdminOrders({
    enabled: true,
    filters,
    page: pagination.page,
    limit: pagination.limit,
  });

  // Extract data from React Query response
  const orders = ordersData?.data || [];
  const paginationData = ordersData?.pagination || {
    total: 0,
    page: 1,
    pages: 1,
  };

  // Show loading state
  if (isLoading && !orders.length) {
    return <AdminLoadingState />;
  }

  // Show error state
  if (error) {
    return (
      <AdminErrorState
        title="Failed to Load Orders"
        description={
          error?.message || "Unable to fetch orders. Please try again."
        }
        onRetry={() => refetch()}
        retryText="Retry"
      />
    );
  }

  const handleViewDetails = async (orderId) => {
    try {
      const response = await OrdersService.getById(orderId);
      setSelectedOrder(response.data);
      setModalVisible(true);
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to fetch order details",
      );
    }
  };

  const handleVerifyAvailability = async (orderId) => {
    try {
      setVerifyingAvailability(true);
      const response = await OrdersService.verifyAvailability(orderId);
      setSelectedOrder(response.data.order);
      const issueCount = response.data.issues?.length || 0;
      if (issueCount > 0) {
        message.warning(
          `${issueCount} item(s) need customer attention — they've been notified`,
        );
      } else {
        message.success("All items verified — stock and prices are unchanged");
      }
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to verify availability",
      );
    } finally {
      setVerifyingAvailability(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    // If cancelling, show cancellation modal instead of direct update
    if (newStatus === "cancelled") {
      setCancellingOrder(orderId);
      setCancelModalVisible(true);
      return;
    }

    // For non-cancellation status updates, proceed normally
    await updateOrderStatus(orderId, newStatus);
  };

  const updateOrderStatus = async (
    orderId,
    newStatus,
    cancellationReason = null,
  ) => {
    try {
      setUpdatingStatus(true);

      // 1️⃣ Update order status
      const orderStatusResponse = await OrdersService.updateStatus(orderId, {
        status: newStatus,
        note: `Status updated to ${newStatus} by admin`,
        cancellationReason: cancellationReason,
        cancelledBy: newStatus === "cancelled" ? "admin" : undefined,
      });

      if (orderStatusResponse.success) {
        message.success(orderStatusResponse.message);
      }

      // 2️⃣ Refresh orders list
      refetch();

      // 3️⃣ Refresh selected order if open
      if (selectedOrder && selectedOrder._id === orderId) {
        const response = await OrdersService.getById(orderId);
        setSelectedOrder(response.data);
      }

      // 4️⃣ 🚀 Call Shiprocket ONLY if status is CONFIRMED
      if (newStatus === "confirmed") {
        try {
          // Find the order details from orders state
          const order = orders.find((o) => o._id === orderId) || selectedOrder;
          if (!order) {
            message.warning("Order data not found for shipment");
            return;
          }

          // Prepare shipment payload
          const shipmentPayload = {
            orderId: order._id,
            firstName: order.user?.firstName || "",
            lastName: order.user?.lastName || "",
            payment_method: order.payment?.method === "cod" ? "COD" : "Prepaid", // Map payment method correctly
            shipping_charges: `${order.pricing?.shippingFee || 0}`,
            discount: order.pricing?.discount || 0, // ✅ Pass order discount
            address: order.shippingAddress?.street || "",
            city: order.shippingAddress?.city || "",
            state: order.shippingAddress?.state || "",
            pincode:
              order.shippingAddress?.pincode ||
              order.shippingAddress?.zipCode ||
              "",
            email: order.user?.email || "",
            phone: order.shippingAddress?.phone || order.user?.phone || "",
            items:
              order.items?.map((item) => ({
                name: item.name,
                sku: item.sku || item.product || "",
                units: item.quantity,
                selling_price: item.price,
                discount: 0,
                tax: 0,
                hsn: item.hsn || "",
              })) || [],
            amount: order.pricing?.total || 0,
            weight: order.items?.reduce(
              (sum, item) => sum + (item.weight || 0.2),
              0,
            ),
          };
          const shipmentRes =
            await OrdersService.createShipment(shipmentPayload);
          if (shipmentRes.success) {
            // Store shipment data in order
            const shipmentData = {
              shipmentOrderId: shipmentRes.orderId,
              shipmentId: shipmentRes.shipmentId,
              awb: shipmentRes.awb,
              courier: shipmentRes.courier,
            };
            await OrdersService.updateShipment(orderId, shipmentData);
            message.success("Shipment created and order updated successfully");
            refetch(); // Refresh to show updated data
          } else {
            message.warning("Order confirmed, but shipment creation failed");
          }
        } catch (err) {
          message.error("Order confirmed, but shipment API failed");
        }
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to update order status";

      if (error.response?.data?.cancelledBy === "customer") {
        message.error({
          content: (
            <div>
              <div className="font-medium">{errorMsg}</div>
              {error.response?.data?.cancellationReason && (
                <div className="text-sm mt-1">
                  Reason: {error.response.data.cancellationReason}
                </div>
              )}
            </div>
          ),
          duration: 5,
        });
      } else {
        message.error(errorMsg);
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCancelOrder = async () => {
    try {
      const values = await cancelForm.validateFields();
      const { reason } = values;

      if (!cancellingOrder) return;

      setUpdatingStatus(true);

      // Find the order to check if it has a Shiprocket order ID
      const order =
        orders.find((o) => o._id === cancellingOrder) || selectedOrder;

      // 1️⃣ Cancel shipment in Shiprocket if it exists
      if (order?.shiprocketOrderId || order?.shiprocketShipmentId) {
        try {
          await OrdersService.cancelShipment({
            shiprocketOrderId: order.shiprocketOrderId,
            shiprocketShipmentId: order.shiprocketShipmentId,
            orderId: order._id,
          });
          message.success("Shipment cancelled in Shiprocket");
        } catch (shipErr) {
          // Check if it's the "Order Id does not exist" error
          if (
            shipErr.response?.data?.error?.message === "Order Id does not exist"
          ) {
            message.warning(
              "Order was not found in Shiprocket (may have been cancelled already or never created)",
            );
          } else {
            message.warning(
              "Order cancelled locally, but Shiprocket cancellation failed",
            );
          }
        }
      }

      // 2️⃣ Update order status to cancelled with reason
      await updateOrderStatus(cancellingOrder, "cancelled", reason);

      // 3️⃣ Close modal and reset form
      setCancelModalVisible(false);
      setCancellingOrder(null);
      cancelForm.resetFields();
    } catch (error) {
      message.error("Failed to cancel order");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const statusColors = {
    pending: "orange",
    confirmed: "blue",
    processing: "cyan",
    shipped: "purple",
    delivered: "green",
    cancelled: "red",
  };

  const columns = [
    {
      title: "Order #",
      dataIndex: "orderNumber",
      key: "orderNumber",
      fixed: "left",
      width: 150,
    },
    {
      title: "Order Id",
      dataIndex: "shiprocketOrderId",
      key: "shiprocketOrderId",
      width: 150,
      render: (shiprocketOrderId) => shiprocketOrderId || "-",
    },
    {
      title: "Customer",
      dataIndex: ["user", "firstName"],
      key: "customer",
      render: (_, record) => (
        <div>
          <div className="font-medium">
            {record.user?.firstName} {record.user?.lastName}
          </div>
          <div className="text-sm text-gray-500">{record.user?.email}</div>
        </div>
      ),
    },
    {
      title: "Items",
      dataIndex: "items",
      key: "items",
      render: (items) => (
        <div className="flex items-center gap-2">
          {items?.slice(0, 3).map(
            (item, index) =>
              item.image && (
                <Image
                  title={item.name}
                  key={index}
                  src={item.image}
                  alt={item.name}
                  width={40}
                  height={40}
                  //  fill
                  className="w-10 relative! h-10 object-cover rounded border border-gray-200"
                />
              ),
          )}
          {items?.length > 3 && (
            <span className="text-xs text-gray-500">+{items.length - 3}</span>
          )}
          <span className="ml-2 text-sm text-gray-600">
            ({items?.length || 0})
          </span>
        </div>
      ),
      width: 200,
    },
    {
      title: "Total",
      dataIndex: ["pricing", "total"],
      key: "total",
      render: (total) => `₹${total?.toFixed(2)}`,
    },
    {
      title: "Payment",
      dataIndex: ["payment", "method"],
      key: "payment",
      render: (method, record) => (
        <div>
          <div className="capitalize">{method}</div>
          <Tag
            color={record.payment?.status === "completed" ? "green" : "orange"}
            className="mt-1">
            {record.payment?.status}
          </Tag>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Select
          value={status}
          onChange={(newStatus) => handleUpdateStatus(record._id, newStatus)}
          loading={updatingStatus}
          className="w-32"
          disabled={
            status === "cancelled" && record.cancelledBy === "customer"
          }>
          <Select.Option value="pending">
            <Tag color="orange">Pending</Tag>
          </Select.Option>
          <Select.Option value="confirmed">
            <Tag color="blue">Confirmed</Tag>
          </Select.Option>
          <Select.Option value="processing">
            <Tag color="cyan">Processing</Tag>
          </Select.Option>
          <Select.Option value="shipped">
            <Tag color="purple">Shipped</Tag>
          </Select.Option>
          <Select.Option value="delivered">
            <Tag color="green">Delivered</Tag>
          </Select.Option>
          <Select.Option value="cancelled">
            <Tag color="red">Cancelled</Tag>
          </Select.Option>
        </Select>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record._id)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-1">Manage all customer orders</p>
      </div>

      <Card>
        <div className="flex gap-4 mb-4">
          <Input
            placeholder="Search by order number, customer..."
            prefix={<SearchOutlined />}
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            className="max-w-sm"
            allowClear
          />
          <Select
            options={[
              { value: "pending", label: "Pending" },
              { value: "confirmed", label: "Confirmed" },
              { value: "processing", label: "Processing" },
              { value: "shipped", label: "Shipped" },
              { value: "delivered", label: "Delivered" },
              { value: "cancelled", label: "Cancelled" },
            ]}
            placeholder="Filter by status"
            value={filters.status}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, status: value }))
            }
            className="w-40"
            allowClear
          />
        </div>

        <Table
          dataSource={orders}
          columns={columns}
          rowKey="_id"
          loading={isLoading}
          scroll={{ x: 1200 }}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: paginationData.total,
            onChange: (page) => setPagination((prev) => ({ ...prev, page })),
            showSizeChanger: false,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} orders`,
          }}
        />
      </Card>

      <Modal
        title={`Order Details - ${selectedOrder?.orderNumber}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}>
        {selectedOrder && (
          <div className="space-y-6">
            {/* Customer Info */}
            <Card title="Customer Information" size="small">
              <Descriptions column={1}>
                <Descriptions.Item label="Name">
                  {selectedOrder.user?.firstName} {selectedOrder.user?.lastName}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {selectedOrder.user?.email}
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                  {selectedOrder.user?.phone || "N/A"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Shipping Address */}
            <Card title="Shipping Address" size="small">
              <p>{selectedOrder.shippingAddress?.street}</p>
              <p>
                {selectedOrder.shippingAddress?.city},{" "}
                {selectedOrder.shippingAddress?.state}{" "}
                {selectedOrder.shippingAddress?.zipCode}
              </p>
              <p>{selectedOrder.shippingAddress?.country}</p>
            </Card>

            {/* Order Items */}
            <Card title="Order Items" size="small">
              <div className="space-y-3">
                {selectedOrder.items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded">
                    {/* Product Image */}
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    )}
                    {/* Product Details */}
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      {item.variant && (
                        <p className="text-sm text-gray-600">
                          Variant: {item.variant}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    {/* Price */}
                    <div className="text-right">
                      <p className="font-semibold">
                        ₹{item.subtotal?.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        ₹{item.price} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Payment & Pricing */}
            <Card title="Payment Details" size="small">
              <Descriptions column={2}>
                <Descriptions.Item label="Subtotal">
                  ₹{selectedOrder.pricing?.subtotal?.toFixed(2)}
                </Descriptions.Item>
                {selectedOrder.coupon?.code && (
                  <Descriptions.Item label="Coupon Applied">
                    <Tag color="green">{selectedOrder.coupon.code}</Tag>
                    {selectedOrder.coupon.freeDelivery && (
                      <Tag color="blue" className="ml-1">
                        Free Delivery
                      </Tag>
                    )}
                  </Descriptions.Item>
                )}
                {selectedOrder.pricing?.discount > 0 && (
                  <Descriptions.Item
                    label="Discount"
                    className="text-green-600">
                    <span className="text-green-600 font-semibold">
                      -₹{selectedOrder.pricing?.discount?.toFixed(2)}
                    </span>
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Shipping">
                  {selectedOrder.pricing?.shippingFee === 0 ? (
                    <Tag color="green">FREE</Tag>
                  ) : (
                    `₹${selectedOrder.pricing?.shippingFee?.toFixed(2)}`
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Total" span={2}>
                  <span className="text-xl font-bold text-green-600">
                    ₹{selectedOrder.pricing?.total?.toFixed(2)}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Payment Method">
                  <span className="capitalize">
                    {selectedOrder.payment?.method}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Payment Status">
                  <Tag
                    color={
                      selectedOrder.payment?.status === "completed"
                        ? "green"
                        : "orange"
                    }>
                    {selectedOrder.payment?.status}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Status */}
            <Card title="Order Status" size="small">
              <div className="flex items-center justify-between gap-3">
                <Tag
                  color={statusColors[selectedOrder.status]}
                  className="text-lg px-4 py-2">
                  {selectedOrder.status?.toUpperCase()}
                </Tag>
                {!["delivered", "cancelled", "refunded"].includes(
                  selectedOrder.status,
                ) && (
                  <Button
                    onClick={() => handleVerifyAvailability(selectedOrder._id)}
                    loading={verifyingAvailability}>
                    Verify Stock &amp; Price
                  </Button>
                )}
                <Select
                  value={selectedOrder.status}
                  onChange={(newStatus) =>
                    handleUpdateStatus(selectedOrder._id, newStatus)
                  }
                  loading={updatingStatus}
                  className="w-48"
                  size="large"
                  disabled={
                    selectedOrder.status === "cancelled" &&
                    selectedOrder.cancelledBy === "customer"
                  }>
                  <Select.Option value="pending">Pending</Select.Option>
                  <Select.Option value="confirmed">Confirmed</Select.Option>
                  <Select.Option value="processing">Processing</Select.Option>
                  <Select.Option value="shipped">Shipped</Select.Option>
                  <Select.Option value="delivered">Delivered</Select.Option>
                  <Select.Option value="cancelled">Cancelled</Select.Option>
                </Select>
              </div>
              {selectedOrder.fulfillment?.needsCustomerAction && (
                <div className="mt-4 p-3 bg-amber-50 rounded">
                  <p className="font-medium text-amber-800 mb-1">
                    Waiting on the customer:
                  </p>
                  <ul className="list-disc list-inside text-sm text-amber-700">
                    {selectedOrder.items
                      .filter(
                        (item) =>
                          item.availabilityIssue?.issueType &&
                          !item.resolution?.action,
                      )
                      .map((item) => (
                        <li key={item._id}>
                          {item.name} — {item.availabilityIssue.issueType.replace("_", " ")}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
              {selectedOrder.status === "cancelled" && (
                <div className="mt-4 p-3 bg-red-50 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700">
                      Cancelled By:
                    </span>
                    <Tag
                      color={
                        selectedOrder.cancelledBy === "customer"
                          ? "orange"
                          : "red"
                      }>
                      {selectedOrder.cancelledBy === "customer"
                        ? "Customer"
                        : "Admin"}
                    </Tag>
                  </div>
                  {selectedOrder.cancellationReason && (
                    <div>
                      <span className="font-medium text-gray-700">Reason:</span>
                      <p className="text-gray-600 mt-1">
                        {selectedOrder.cancellationReason}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Customer Edit History */}
            {selectedOrder.editHistory?.length > 0 && (
              <Card title="Customer Edit History" size="small">
                <div className="space-y-4">
                  {[...selectedOrder.editHistory]
                    .reverse()
                    .map((edit, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 mb-2">
                          {new Date(edit.editedAt).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          — edited by{" "}
                          <span className="capitalize">{edit.editedBy}</span>
                        </p>
                        <div className="space-y-1.5">
                          {edit.changes.map((change, i) => (
                            <div key={i} className="text-sm">
                              <span className="font-semibold text-gray-700">
                                {change.field}:
                              </span>{" "}
                              <span className="text-red-500 line-through">
                                {String(change.previous)}
                              </span>{" "}
                              <span className="text-gray-400">→</span>{" "}
                              <span className="text-green-600 font-medium">
                                {String(change.updated)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* Cancellation Reason Modal */}
      <Modal
        title="Cancel Order"
        open={cancelModalVisible}
        onOk={handleCancelOrder}
        onCancel={() => {
          setCancelModalVisible(false);
          setCancellingOrder(null);
          cancelForm.resetFields();
        }}
        confirmLoading={updatingStatus}
        okText="Cancel Order"
        okButtonProps={{ danger: true }}>
        <Form form={cancelForm} layout="vertical">
          <Form.Item
            label="Cancellation Reason"
            name="reason"
            rules={[
              {
                required: true,
                message: "Please provide a cancellation reason",
              },
            ]}>
            <Input.TextArea
              rows={4}
              placeholder="Enter the reason for cancelling this order..."
              maxLength={500}
              showCount
            />
          </Form.Item>
          <div className="text-sm text-gray-600 mt-2">
            <p>• This will cancel the order and notify the customer</p>
            <p>
              • If a shipment was created, it will also be cancelled in
              Shiprocket
            </p>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
