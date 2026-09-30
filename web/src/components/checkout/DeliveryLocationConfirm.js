"use client";

import { reverseGeocode, searchAddress } from "@/lib/geocoding";
import {
  CheckCircleFilled,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { Button, Spin } from "antd";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const LeafletMap = dynamic(() => import("@/components/address/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[260px] w-full items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-500">
      Loading map...
    </div>
  ),
});

const DEFAULT_CENTER = [19.076, 72.8777]; // Mumbai

function addressToText(address) {
  if (!address) return "";
  return [
    address.street,
    address.area,
    address.city,
    address.state,
    address.zipCode,
  ]
    .filter(Boolean)
    .join(", ");
}

/**
 * Checkout-time delivery location confirmation. Starts the pin at the
 * selected address's saved coordinates (or a best-effort geocode of its
 * text), lets the customer drag the pin / tap the map / use their current
 * location to correct it, and requires an explicit "Confirm" click before
 * `onConfirm` is called — the caller (checkout page) gates order
 * placement on that confirmation.
 */
export default function DeliveryLocationConfirm({ address, onConfirm }) {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [label, setLabel] = useState("");
  const [isResolving, setIsResolving] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Establish a starting pin whenever the address changes: prefer its
  // saved coordinates, else geocode its text, else fall back to a
  // default — the customer can always drag it to the exact spot.
  useEffect(() => {
    let cancelled = false;
    setConfirmed(false);

    async function resolveInitial() {
      setIsResolving(true);

      if (address?.location?.lat != null && address?.location?.lng != null) {
        if (!cancelled) {
          setCenter([address.location.lat, address.location.lng]);
          setLabel(addressToText(address));
          setIsResolving(false);
        }
        return;
      }

      const query = addressToText(address);
      try {
        const results = query ? await searchAddress(query) : [];
        if (!cancelled) {
          if (results[0]) {
            setCenter([results[0].lat, results[0].lon]);
            setLabel(results[0].label);
          } else {
            setCenter(DEFAULT_CENTER);
            setLabel(query);
          }
        }
      } catch {
        if (!cancelled) {
          setCenter(DEFAULT_CENTER);
          setLabel(query);
        }
      } finally {
        if (!cancelled) setIsResolving(false);
      }
    }

    resolveInitial();
    return () => {
      cancelled = true;
    };
    // Runs once per mount — the caller remounts this component (via a
    // `key` on the address id) whenever the selected address changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePinMove = async (lat, lon) => {
    setCenter([lat, lon]);
    setConfirmed(false);
    setIsLocating(true);
    try {
      const { label: newLabel } = await reverseGeocode(lat, lon);
      if (newLabel) setLabel(newLabel);
    } catch {
      // Coordinates still update even if reverse geocoding fails —
      // the customer is confirming a pin, not free text.
    } finally {
      setIsLocating(false);
    }
  };

  const handleUseMyLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => handlePinMove(pos.coords.latitude, pos.coords.longitude),
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const handleConfirm = () => {
    setConfirmed(true);
    onConfirm({ lat: center[0], lng: center[1], label });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <span className="text-2xl">🧭</span>
          Confirm Delivery Location
        </h2>
        <button
          type="button"
          onClick={handleUseMyLocation}
          className="flex items-center gap-1 text-xs font-medium text-[#0F8A5F] hover:underline">
          {isLocating ? <Spin size="small" /> : <EnvironmentOutlined />}
          Use my current location
        </button>
      </div>

      <p className="mb-2 text-xs text-gray-500">
        Drag the pin or tap the map to point at the exact delivery spot.
      </p>

      <div className="relative">
        {isResolving ? (
          <div className="flex h-[260px] w-full items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-500">
            <Spin />
          </div>
        ) : (
          <LeafletMap center={center} onSelect={handlePinMove} />
        )}
        {isLocating && !isResolving && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center rounded-xl bg-white/60">
            <Spin />
          </div>
        )}
      </div>

      {label && (
        <p className="mt-2 text-xs text-gray-600">
          <EnvironmentOutlined className="mr-1" />
          {label}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-3">
        {confirmed ? (
          <span className="flex items-center gap-1 text-sm font-medium text-emerald-700">
            <CheckCircleFilled /> Location confirmed
          </span>
        ) : (
          <span className="text-xs text-amber-600">
            Please confirm your delivery location to continue.
          </span>
        )}
        <Button
          type={confirmed ? "default" : "primary"}
          onClick={handleConfirm}
          disabled={isResolving}
          style={
            confirmed ? {} : { background: "#0F8A5F", borderColor: "#0F8A5F" }
          }>
          {confirmed ? "Confirmed ✓" : "Confirm this location"}
        </Button>
      </div>

      <p className="mt-1 text-[11px] text-gray-400">
        Powered by OpenStreetMap contributors
      </p>
    </div>
  );
}
