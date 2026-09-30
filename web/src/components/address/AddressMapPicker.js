"use client";

import {
  parseNominatimAddress,
  reverseGeocode,
  searchAddress,
} from "@/lib/geocoding";
import {
  EnvironmentOutlined,
  LoadingOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Input, Spin } from "antd";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[260px] w-full items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-500">
      Loading map...
    </div>
  ),
});

const DEFAULT_CENTER = [19.076, 72.8777]; // Mumbai

/**
 * Map-based address picker: search-as-you-type suggestions (OpenStreetMap
 * Nominatim) plus an interactive map with a draggable pin. Picking a
 * suggestion or moving the pin reports parsed address fields + coordinates
 * via `onAddressSelect` — the caller's form still owns the actual fields
 * and the user can edit them afterwards, this just avoids relying on
 * free-typed text alone for the delivery location.
 */
export default function AddressMapPicker({ onAddressSelect }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [hasPicked, setHasPicked] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      return undefined;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchAddress(query);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const applySelection = (lat, lon, address, label) => {
    setCenter([lat, lon]);
    setHasPicked(true);
    setShowSuggestions(false);
    if (label) setQuery(label);
    onAddressSelect({ ...parseNominatimAddress(address), lat, lon });
  };

  const handleSuggestionClick = (suggestion) => {
    applySelection(
      suggestion.lat,
      suggestion.lon,
      suggestion.address,
      suggestion.label,
    );
  };

  const handleMapSelect = async (lat, lon) => {
    setCenter([lat, lon]);
    setHasPicked(true);
    setIsLocating(true);
    try {
      const { address, label } = await reverseGeocode(lat, lon);
      applySelection(lat, lon, address, label);
    } catch {
      // Pin still moves even if reverse geocoding fails — fields below
      // stay editable so the user can fill them in manually.
    } finally {
      setIsLocating(false);
    }
  };

  const handleUseMyLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => handleMapSelect(pos.coords.latitude, pos.coords.longitude),
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  return (
    <div className="mb-5">
      <label className="mb-2 block text-sm font-medium text-gray-900">
        Find your address on the map
      </label>

      <div className="relative">
        <Input
          size="large"
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder="Search for your street, locality or landmark"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length && setShowSuggestions(true)}
          suffix={isSearching ? <LoadingOutlined /> : null}
        />

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-1000 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
            {suggestions.map((s, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => handleSuggestionClick(s)}
                className="flex w-full items-start gap-2 border-b border-gray-100 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-gray-50">
                <EnvironmentOutlined className="mt-0.5 text-[#0F8A5F]" />
                <span className="text-gray-700">{s.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleUseMyLocation}
        disabled={isLocating}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
        {isLocating ? <Spin size="small" /> : <EnvironmentOutlined />}
        Use my current location
      </button>

      <p className="mt-3 text-xs text-gray-500">
        Or drag the pin / tap on the map below to set your exact location
      </p>

      <div className="relative mt-2">
        <LeafletMap center={center} onSelect={handleMapSelect} />
        {isLocating && (
          <div className="absolute inset-0 z-1000 flex items-center justify-center rounded-xl bg-white/60">
            <Spin />
          </div>
        )}
      </div>

      {hasPicked && (
        <p className="mt-2 text-xs text-emerald-700">
          Address details filled in below from the map — please review and
          edit if needed.
        </p>
      )}

      <p className="mt-1 text-[11px] text-gray-400">
        Powered by OpenStreetMap contributors
      </p>
    </div>
  );
}
