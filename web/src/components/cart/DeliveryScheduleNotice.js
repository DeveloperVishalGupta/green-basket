"use client";

import { CheckCircleFilled } from "@ant-design/icons";

/**
 * Compact confirmation once a delivery date + slot are picked. Purely
 * informational.
 */
export default function DeliveryScheduleNotice() {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-900 dark:bg-blue-950">
      <CheckCircleFilled
        className="text-sm text-blue-600 dark:text-blue-400"
        aria-hidden="true"
      />
      <p className="text-xs text-gray-700 dark:text-text-secondary">
        Your order will arrive during your selected delivery slot.
      </p>
    </div>
  );
}
