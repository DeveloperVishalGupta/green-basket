"use client";

/**
 * Shown at checkout when "Today" delivery is selected and one or more cart
 * items exceed current stock. Lets the customer confirm proceeding with
 * only the available quantity — the rest stays in their cart.
 */

import { ExclamationCircleFilled } from "@ant-design/icons";
import { Modal } from "antd";

export default function PartialStockConfirmModal({
  open,
  items = [],
  onConfirm,
  onCancel,
  confirmLoading,
}) {
  const partialItems = items.filter((item) => item.isPartial);

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <ExclamationCircleFilled className="text-amber-500" />
          <span>Limited stock for today</span>
        </div>
      }
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      okText="Proceed with available quantity"
      cancelText="Cancel"
      okButtonProps={{ className: "rounded-lg h-10" }}
      cancelButtonProps={{ className: "rounded-lg h-10" }}
      centered
      width={480}>
      <p className="text-sm text-gray-600 mb-4">
        Some items in your cart don&apos;t have enough stock for today&apos;s
        delivery. You can place your order with the quantity available now —
        the rest will stay in your cart so you can order it once it&apos;s
        back in stock.
      </p>

      <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
        {partialItems.map((item) => (
          <div
            key={item.product}
            className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-medium text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-500">
                Requested: {item.requestedQty}
              </p>
            </div>
            <div className="text-right">
              {item.availableQty > 0 ? (
                <span className="text-sm font-semibold text-emerald-600">
                  {item.availableQty} available
                </span>
              ) : (
                <span className="text-sm font-semibold text-red-500">
                  Currently unavailable
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
