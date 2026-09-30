"use client";

/**
 * Mandatory delivery date preference modal.
 * Shown to every logged-in customer right after login, and again whenever
 * their previously-chosen date is no longer available. Cannot be dismissed
 * without picking Today or Tomorrow.
 */

import { useAuth } from "@/hooks/useAuth";
import {
  useDeliveryAvailability,
  useSetDeliveryPreference,
} from "@/hooks/useDelivery";
import { getTodayId, getTomorrowId } from "@/lib/delivery";
import { useDeliveryStore } from "@/store/deliveryStore";
import { CheckCircleFilled, ClockCircleOutlined } from "@ant-design/icons";
import { Alert, App, Modal, Spin } from "antd";
import { useEffect } from "react";

export default function DeliveryPreferenceModal() {
  const { message } = App.useApp();
  const { user, isAuthenticated } = useAuth();
  const { date, promptedForUserId, setDate, setPromptedForUserId } =
    useDeliveryStore();

  const todayId = getTodayId();
  const tomorrowId = getTomorrowId();
  const dateIds = [todayId, tomorrowId];

  const isCustomer = isAuthenticated && user?.role === "customer";
  const needsFirstPrompt = isCustomer && promptedForUserId !== user?._id;

  const { data: availability, isLoading } = useDeliveryAvailability(dateIds, {
    enabled: isCustomer,
  });

  // The chosen date is only ever "today" or "tomorrow" — once it's neither
  // (a day has passed), the old choice no longer means anything.
  const expiredSelection =
    isCustomer &&
    !needsFirstPrompt &&
    !!date &&
    date !== todayId &&
    date !== tomorrowId;

  const staleSelection =
    isCustomer &&
    !needsFirstPrompt &&
    !!date &&
    availability &&
    availability[date] === false;

  const open = needsFirstPrompt || staleSelection || expiredSelection;

  const { mutate: savePreference, isPending } = useSetDeliveryPreference();

  // Clear the stale choice so the header badge hides while the modal is open.
  useEffect(() => {
    if (expiredSelection) {
      setDate(null);
    }
  }, [expiredSelection, setDate]);

  const handleSelect = (dateId) => {
    savePreference(dateId, {
      onSuccess: () => {
        setDate(dateId);
        setPromptedForUserId(user._id);
      },
      onError: (err) => {
        message.error(
          err.response?.data?.message ||
            "Could not save delivery date. Please try again.",
        );
      },
    });
  };

  if (!isCustomer) return null;

  const options = [
    { id: todayId, label: "Today" },
    { id: tomorrowId, label: "Tomorrow" },
  ];

  return (
    <Modal
      open={open}
      closable={false}
      mask={{ closable: false }}
      // maskClosable={false}
      keyboard={false}
      footer={null}
      centered
      width={420}
      title={
        <div className="flex items-center gap-2">
          <ClockCircleOutlined className="text-emerald-600 text-xl" />
          <span className="text-lg font-bold text-gray-900">
            When should we deliver?
          </span>
        </div>
      }>
      <div className="pt-2 pb-1">
        {staleSelection && (
          <Alert
            type="warning"
            showIcon
            className="mb-4"
            message="Your selected delivery date is no longer available"
            description="Please choose another date to continue shopping."
          />
        )}

        {expiredSelection && !staleSelection && (
          <Alert
            type="info"
            showIcon
            className="mb-4"
            message="It's a new day!"
            description="Please pick a delivery date to continue shopping."
          />
        )}

        <p className="text-sm text-gray-600 mb-4">
          Pick a delivery date to continue. You can change this anytime from the
          header.
        </p>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spin />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {options.map((opt) => {
              const isAvailable = availability?.[opt.id] !== false;
              const isSelected = date === opt.id && isAvailable;

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={!isAvailable || isPending}
                  onClick={() => handleSelect(opt.id)}
                  className={`relative flex flex-col items-center justify-center gap-1 rounded-xl border-2 px-4 py-5 text-center transition-all ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50"
                      : isAvailable
                        ? "border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/50"
                        : "border-gray-100 bg-gray-50 cursor-not-allowed opacity-60"
                  }`}>
                  {isSelected && (
                    <CheckCircleFilled className="absolute top-2 right-2 text-emerald-600" />
                  )}
                  <span className="text-base font-semibold text-gray-900">
                    {opt.label}
                  </span>
                  {!isAvailable && (
                    <span className="text-xs font-medium text-red-500 mt-1">
                      Fully booked
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
