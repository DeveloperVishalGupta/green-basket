"use client";

import {
  AdminErrorState,
  AdminLoadingState,
} from "@/components/admin/AdminStates";
// import { useCategories } from '@/services/admin/categories';
import ProductsService, { useAdminProducts } from "@/services/admin/products";
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  App,
  Badge,
  Button,
  Card,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import NextImage from "next/image";
import { useEffect, useState } from "react";
import CreateUpdateProductModal from "./create-update-product-modal";
import ViewProductModal from "./view-product-modal";

export default function AdminProducts() {
  const { message } = App.useApp();
  const [pagination, setPagination] = useState({ page: 1, limit: 20 });
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    featured: "",
    isActive: "true",
  });
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [cloneModalVisible, setCloneModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [search, setSearch] = useState(filters.search || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search,
      }));
    }, 800); // 800ms debounce

    return () => clearTimeout(timer);
  }, [search]);

  // Use React Query hooks
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useAdminProducts({
    enabled: true,
    filters,
    page: pagination.page,
    limit: pagination.limit,
  });

  // Extract data from React Query responses
  const products = productsData?.data || [];
  const paginationData = productsData?.pagination || {
    total: 0,
    page: 1,
    pages: 1,
  };

  // Show loading state
  if (productsLoading && !products.length) {
    return <AdminLoadingState />;
  }

  // Show error state
  if (productsError) {
    return (
      <AdminErrorState
        title="Failed to Load Products"
        description={
          productsError?.message ||
          "Unable to fetch products. Please try again."
        }
        onRetry={() => refetchProducts()}
      />
    );
  }

  const handleDelete = async (id) => {
    try {
      setIsDeleting(true);
      const response = await ProductsService.delete(id);

      // Show appropriate message based on delete type
      if (response.permanent) {
        message.success("Product permanently deleted from database");
      } else {
        message.success("Product moved to inactive status");
      }

      setDeleteModalVisible(false);
      setSelectedProduct(null);
      refetchProducts();
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to delete product",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const showDeleteModal = (product) => {
    setSelectedProduct(product);
    setDeleteModalVisible(true);
  };

  const showCloneModal = (product) => {
    setSelectedProduct(product);
    setCloneModalVisible(true);
  };

  const handleToggleFeatured = async (id, currentStatus) => {
    try {
      await ProductsService.toggleFeatured(id);
      message.success(
        `Product ${currentStatus ? "unfeatured" : "featured"} successfully`,
      );
      refetchProducts();
    } catch (error) {
      message.error("Failed to update product");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setEditModalVisible(true);
  };

  const handleView = (product) => {
    setViewingProduct(product);
    setViewModalVisible(true);
  };

  const handleClone = async (product) => {
    try {
      setIsCloning(true);
      // Create a copy of the product with modified name and removed ID
      const clonedProduct = {
        name: `${product.name} (Copy)`,
        description: product.description,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        category: product.category._id,
        stock: product.stock,
        images: product.images || [], // Include images in clone
        isActive: false, // Set to inactive by default
        isFeatured: false,
        metaTitle: product.metaTitle,
        metaDescription: product.metaDescription,
      };

      const response = await ProductsService.create(clonedProduct);

      if (response.success) {
        message.success(
          "Product cloned successfully with all images! The new product is inactive by default.",
        );
        setCloneModalVisible(false);
        setSelectedProduct(null);
        refetchProducts();
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to clone product");
    } finally {
      setIsCloning(false);
    }
  };

  // Handler for successful product creation/update
  const handleProductSuccess = () => {
    refetchProducts();
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "images",
      key: "image",
      width: 80,
      render: (images) => {
        const imageUrl =
          images?.[0]?.url ||
          "https://via.placeholder.com/600x600/E5E7EB/9CA3AF?text=No+Image";
        return (
          <NextImage
            src={imageUrl}
            alt="Product"
            fill
            className="object-cover rounded relative!"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        );
      },
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name, record) => {
        return <span>{name}</span>;
      },
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price, record) => {
        return (
          <div className="flex flex-wrap gap-2">
            {record?.variants &&
              record?.variants?.length > 0 &&
              record?.variants?.map((item, index) => {
                return (
                  <div
                    key={item._id}
                    className="flex items-center overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    {/* Weight */}
                    <span className="bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-600 border-r border-red-100">
                      {item.label}
                    </span>

                    {/* Selling Price */}

                    {/* Compare Price */}
                    <span className="bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-600 border-r border-green-100">
                      ₹{item.price}
                      <span className=" line-through text-xs px-3 py-1.5 font-semibold text-yellow-500 border-r border-yellow-100">
                        ₹{item.compareAtPrice}
                      </span>
                    </span>

                    {/* Default Badge */}
                  </div>
                );
              })}
          </div>
        );
      },
    },
    {
      title: "Categories",
      dataIndex: "categories",
      key: "categories",
      render: (categories, record) => {
        return (
          <span className="font-semibold">
            {categories?.map((cat) => cat.name).join(", ") || "-"}
          </span>
        );
      },
    },

    {
      title: "Available Quantity",
      dataIndex: "stock",
      key: "stock",
      render: (stock, record) => {
        return (
          <Tag
            className="text-base"
            color={stock > 10 ? "green" : stock > 0 ? "orange" : "red"}>
            {`${record?.stock} ${record?.stockUnit}`}
          </Tag>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Featured",
      dataIndex: "isFeatured",
      key: "isFeatured",
      render: (isFeatured, record) => (
        <Button
          size="small"
          type={isFeatured ? "primary" : "default"}
          onClick={() => handleToggleFeatured(record._id, isFeatured)}>
          {isFeatured ? "Featured" : "Feature"}
        </Button>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          />
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="link"
            icon={<CopyOutlined />}
            onClick={() => {
              showCloneModal(record);
            }}
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => showDeleteModal(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Products
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Manage your products
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setCreateModalVisible(true)}
          className="w-full sm:w-auto">
          Add Product
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-4">
          <Input
            placeholder="Search products..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:max-w-sm"
            allowClear
          />
          <Select
            placeholder="Status"
            value={filters.isActive || undefined}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, isActive: value }))
            }
            options={[
              { value: "", label: "All Status" },
              { value: "true", label: "Active" },
              { value: "false", label: "Inactive" },
            ]}
            className="w-full sm:w-32"
            allowClear
          />
          <Select
            placeholder="All Products"
            value={filters.featured || "All Products"}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, featured: value }))
            }
            className="w-full sm:w-32"
            allowClear
            options={[
              { value: "", label: "All Products" },
              { value: "true", label: "Featured" },
              { value: "false", label: "Not Featured" },
            ]}
          />
        </div>
        <Table
          dataSource={products}
          columns={columns}
          rowKey="_id"
          loading={productsLoading}
          scroll={{ x: 1200 }}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: paginationData.total,
            onChange: (page) => setPagination((prev) => ({ ...prev, page })),
            showSizeChanger: false,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} products`,
            responsive: true,
          }}
        />
      </Card>

      {/* Create/Update Product Modal */}
      <CreateUpdateProductModal
        open={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSuccess={handleProductSuccess}
      />

      <CreateUpdateProductModal
        open={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setEditingProduct(null);
        }}
        onSuccess={handleProductSuccess}
        product={editingProduct}
      />

      {/* View Product Modal - Modern Design */}
      <ViewProductModal
        viewModalVisible={viewModalVisible}
        setViewModalVisible={setViewModalVisible}
        viewingProduct={viewingProduct}
        setViewingProduct={setViewingProduct}
        handleEdit={handleEdit}
      />
      {/* Delete Confirmation Modal */}
      <Modal
        title={
          selectedProduct?.isActive
            ? "Move to Inactive"
            : "Permanently Delete Product"
        }
        open={deleteModalVisible}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedProduct(null);
        }}
        width="100%"
        style={{ maxWidth: 500, top: 20 }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setDeleteModalVisible(false);
              setSelectedProduct(null);
            }}
            className="w-full sm:w-auto">
            Cancel
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger={!selectedProduct?.isActive}
            loading={isDeleting}
            onClick={() => handleDelete(selectedProduct?._id)}
            icon={<DeleteOutlined />}
            className="w-full sm:w-auto">
            {selectedProduct?.isActive
              ? "Move to Inactive"
              : "Permanently Delete"}
          </Button>,
        ]}
        centered>
        {selectedProduct && (
          <div className="space-y-4">
            {selectedProduct.isActive ? (
              <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <DeleteOutlined className="text-2xl text-yellow-600" />
                <div>
                  <p className="font-semibold text-yellow-900">
                    Soft Delete (Reversible)
                  </p>
                  <p className="text-sm text-yellow-700">
                    Product will be marked as inactive. You can reactivate it
                    later.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <DeleteOutlined className="text-2xl text-red-500" />
                <div>
                  <p className="font-semibold text-red-900">
                    ⚠️ Permanent Delete (Cannot be undone!)
                  </p>
                  <p className="text-sm text-red-700">
                    This product is already inactive. It will be permanently
                    deleted from the database.
                  </p>
                </div>
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                {selectedProduct.images?.[0]?.url && (
                  <NextImage
                    src={selectedProduct.images[0].url}
                    alt={selectedProduct.name}
                    width={80}
                    height={80}
                    className="object-cover relative! rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {selectedProduct.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {selectedProduct.category?.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <Tag color="blue">₹{selectedProduct.price}</Tag>
                    <Tag color={selectedProduct.stock > 0 ? "green" : "red"}>
                      {selectedProduct.stock} units
                    </Tag>
                    <Badge
                      status={selectedProduct.isActive ? "success" : "error"}
                      text={selectedProduct.isActive ? "Active" : "Inactive"}
                    />
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              {selectedProduct.isActive ? (
                <>
                  Are you sure you want to move{" "}
                  <strong>{selectedProduct.name}</strong> to inactive status?
                </>
              ) : (
                <>
                  Are you sure you want to{" "}
                  <strong className="text-red-600">permanently delete</strong>{" "}
                  <strong>{selectedProduct.name}</strong>? This cannot be
                  undone!
                </>
              )}
            </p>
          </div>
        )}
      </Modal>

      {/* Clone Confirmation Modal */}
      <Modal
        title="Clone Product"
        open={cloneModalVisible}
        onCancel={() => {
          setCloneModalVisible(false);
          setSelectedProduct(null);
        }}
        width="100%"
        style={{ maxWidth: 500, top: 20 }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setCloneModalVisible(false);
              setSelectedProduct(null);
            }}
            className="w-full sm:w-auto">
            Cancel
          </Button>,
          <Button
            key="clone"
            type="primary"
            loading={isCloning}
            onClick={() => handleClone(selectedProduct)}
            icon={<CopyOutlined />}
            className="w-full sm:w-auto">
            Clone Product
          </Button>,
        ]}
        centered>
        {selectedProduct && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <CopyOutlined className="text-2xl text-blue-500" />
              <div>
                <p className="font-semibold text-blue-900">
                  Create a copy of this product
                </p>
                <p className="text-sm text-blue-700">
                  The cloned product will be created with inactive status.
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                {selectedProduct.images?.[0]?.url && (
                  <NextImage
                    src={selectedProduct.images[0].url}
                    alt={selectedProduct.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded-lg relative!"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {selectedProduct.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {selectedProduct.category?.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <Tag color="blue">₹{selectedProduct.price}</Tag>
                    <Tag color={selectedProduct.stock > 0 ? "green" : "red"}>
                      {selectedProduct.stock} units
                    </Tag>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">
                What will be cloned:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>✓ Product name (with &quot;(Copy)&quot; suffix)</li>
                <li>✓ Description and pricing details</li>
                <li>✓ Category, </li>
                <li>✓ Tags and SEO information</li>
                <li>✓ Product images (same URLs)</li>
                <li>✗ Featured status (will be set to No)</li>
              </ul>
            </div>

            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">
              <strong>Note:</strong> The cloned product will be inactive by
              default. You can edit and activate it later.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
