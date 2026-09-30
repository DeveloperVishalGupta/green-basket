"use client";

import { productsAPI } from "@/lib/api";
import { SearchOutlined } from "@ant-design/icons";
import { Empty, Input, Modal, Radio, Spin } from "antd";
import { useEffect, useRef, useState } from "react";

/**
 * Lets the customer pick a replacement product + variant for an order
 * item that's become unavailable/partially out of stock. Only shows
 * active products, and only variants the picked product currently has
 * enough stock for.
 */
export default function ReplaceProductModal({
  open,
  onClose,
  quantityNeeded,
  onConfirm,
  confirmLoading,
}) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setProducts([]);
    setSelectedProduct(null);
    setSelectedVariant(null);
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.trim().length < 2) {
      setProducts([]);
      return undefined;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await productsAPI.getAll({
          search: query.trim(),
          isActive: "true",
          limit: 10,
        });
        setProducts(res?.data?.data || []);
      } catch {
        setProducts([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    const fittingVariant = product.variants?.find(
      (v) => !product.trackInventory || product.stock >= quantityNeeded,
    );
    setSelectedVariant(fittingVariant?.label || product.variants?.[0]?.label || null);
  };

  const canConfirm =
    selectedProduct &&
    selectedVariant &&
    (!selectedProduct.trackInventory || selectedProduct.stock >= quantityNeeded);

  return (
    <Modal
      title="Choose a replacement"
      open={open}
      onCancel={onClose}
      onOk={() =>
        onConfirm({
          replacementProductId: selectedProduct._id,
          replacementVariant: selectedVariant,
        })
      }
      okText="Confirm Replacement"
      okButtonProps={{ disabled: !canConfirm, loading: confirmLoading }}
      destroyOnHidden>
      <Input
        autoFocus
        prefix={<SearchOutlined className="text-gray-400" />}
        placeholder="Search for a replacement product"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        allowClear
      />

      <div className="mt-3 max-h-72 overflow-y-auto">
        {isSearching ? (
          <div className="flex justify-center py-6">
            <Spin />
          </div>
        ) : products.length === 0 ? (
          query.trim().length >= 2 && (
            <Empty
              description="No matching products found"
              className="py-6"
            />
          )
        ) : (
          <div className="space-y-2">
            {products.map((product) => {
              const isSelected = selectedProduct?._id === product._id;
              const hasEnoughStock =
                !product.trackInventory || product.stock >= quantityNeeded;

              return (
                <div
                  key={product._id}
                  onClick={() => hasEnoughStock && handleSelectProduct(product)}
                  className={`rounded-lg border p-3 transition-colors ${
                    !hasEnoughStock
                      ? "cursor-not-allowed opacity-50 border-gray-200"
                      : isSelected
                        ? "cursor-pointer border-emerald-500 bg-emerald-50"
                        : "cursor-pointer border-gray-200 hover:border-emerald-300"
                  }`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-gray-900">
                      {product.name}
                    </span>
                    {!hasEnoughStock && (
                      <span className="text-xs text-red-500">
                        Only {product.stock} in stock
                      </span>
                    )}
                  </div>

                  {isSelected && (
                    <Radio.Group
                      className="mt-2 flex flex-wrap gap-2"
                      value={selectedVariant}
                      onChange={(e) => setSelectedVariant(e.target.value)}
                      onClick={(e) => e.stopPropagation()}>
                      {product.variants?.map((variant) => (
                        <Radio.Button key={variant.label} value={variant.label}>
                          {variant.label} — ₹{variant.price}
                        </Radio.Button>
                      ))}
                    </Radio.Group>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
