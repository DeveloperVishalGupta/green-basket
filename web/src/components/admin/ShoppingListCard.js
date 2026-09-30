"use client";

import { useAdminShoppingList } from "@/services/admin/dashboard";
import { ShoppingOutlined } from "@ant-design/icons";
import { Alert, Card, DatePicker, Empty, Spin, Table } from "antd";
import dayjs from "dayjs";
import { useState } from "react";

/**
 * Lets the admin pick a delivery date and see how much of each product to
 * buy for that day's orders — every variant (e.g. 500g/1kg) is converted to
 * a real amount and summed into one total weight/volume/count per product.
 */
export default function ShoppingListCard() {
  const [date, setDate] = useState(dayjs());
  const dateId = date ? date.format("YYYY-MM-DD") : null;

  const { data, isLoading, isFetching, isError, error } =
    useAdminShoppingList(dateId);
  const items = data?.items || [];

  const columns = [
    {
      title: "Product",
      dataIndex: "name",
      key: "name",
      render: (name) => (
        <span className="font-medium text-gray-900 capitalize">{name}</span>
      ),
    },
    {
      title: "Amount to Buy",
      dataIndex: "displayWeight",
      key: "displayWeight",
      align: "right",
      sorter: (a, b) => a.totalAmount - b.totalAmount,
      render: (weight) => (
        <span className="font-bold text-emerald-700">{weight}</span>
      ),
    },
    {
      title: "Units Ordered",
      dataIndex: "unitsOrdered",
      key: "unitsOrdered",
      align: "right",
      render: (units) => <span className="text-gray-600">{units}</span>,
    },
    {
      title: "Orders",
      dataIndex: "orderCount",
      key: "orderCount",
      align: "right",
    },
  ];

  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          <ShoppingOutlined />
          Shopping List — What to Buy
        </span>
      }
      extra={
        <DatePicker
          value={date}
          onChange={(value) => setDate(value || dayjs())}
          allowClear={false}
          format="DD MMM YYYY"
        />
      }>
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spin />
        </div>
      ) : isError ? (
        <Alert
          type="error"
          message="Failed to load shopping list"
          description={
            error?.response?.data?.message ||
            error?.message ||
            "Please try again."
          }
        />
      ) : items.length === 0 ? (
        <Empty
          description={`No orders scheduled for ${date?.format("DD MMM YYYY")}`}
        />
      ) : (
        <>
          <p className="mb-3 text-sm text-gray-500">
            {data.orderCount} order{data.orderCount !== 1 ? "s" : ""}{" "}
            scheduled for delivery on {date?.format("DD MMM YYYY")}
          </p>
          <Table
            columns={columns}
            dataSource={items}
            rowKey={(item) => item.name}
            pagination={false}
            loading={isFetching}
            size="small"
          />
        </>
      )}
    </Card>
  );
}
