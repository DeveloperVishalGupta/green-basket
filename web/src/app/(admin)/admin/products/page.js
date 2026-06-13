'use client';

import { AdminErrorState, AdminLoadingState } from '@/components/admin/AdminStates';
// import { useCategories } from '@/services/admin/categories';
import ProductsService, { useAdminProducts, useProductsOptions } from '@/services/admin/products';
import { useCategories } from '@/services/categories';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  DollarOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  ShoppingOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import { App, Badge, Button, Card, Col, Descriptions, Divider, Image, Input, Modal, Row, Select, Space, Table, Tag } from 'antd';
import NextImage from "next/image";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import CreateUpdateProductModal from './create-update-product-modal';

export default function AdminProducts() {
  const { message } = App.useApp();
  const [pagination, setPagination] = useState({ page: 1, limit: 20 });
  const [filters, setFilters] = useState({ search: '', category: '', featured: '', isActive: 'true' });
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
  
  const router = useRouter();

  // Use React Query hooks
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts
  } = useAdminProducts({
    enabled: true,
    filters,
    page: pagination.page,
    limit: pagination.limit
  });

  const {
    data: categoriesData,
    isLoading: categoriesLoading
  } = useCategories({ enabled: true });

  const {
    data: productOptions,
    isLoading: optionsLoading
  } = useProductsOptions({ enabled: true });

  // Extract data from React Query responses
  const products = productsData?.data || [];
  const paginationData = productsData?.pagination || { total: 0, page: 1, pages: 1 };
  const categories = categoriesData || [];
  const availableSizes = productOptions?.sizes || [];
  const availableColors = productOptions?.colors || [];
  const availableTags = productOptions?.tags || [];
  
  // Show loading state
  if (productsLoading && !products.length) {
    return <AdminLoadingState />;
  }

  // Show error state
  if (productsError) {
    return (
      <AdminErrorState
        title="Failed to Load Products"
        description={productsError?.message || "Unable to fetch products. Please try again."}
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
        message.success('Product permanently deleted from database');
      } else {
        message.success('Product moved to inactive status');
      }
      
      setDeleteModalVisible(false);
      setSelectedProduct(null);
      refetchProducts();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to delete product');
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
      message.success(`Product ${currentStatus ? 'unfeatured' : 'featured'} successfully`);
      refetchProducts();
    } catch (error) {
      message.error('Failed to update product');
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
        sizes: product.sizes || [],
        colors: product.colors || [],
        tags: product.tags || [],
        images: product.images || [], // Include images in clone
        isActive: false, // Set to inactive by default
        isFeatured: false,
        metaTitle: product.metaTitle,
        metaDescription: product.metaDescription,
      };

      const response = await ProductsService.create(clonedProduct);
      
      if (response.success) {
        message.success('Product cloned successfully with all images! The new product is inactive by default.');
        setCloneModalVisible(false);
        setSelectedProduct(null);
        refetchProducts();
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to clone product');
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
      title: 'Image',
      dataIndex: 'images',
      key: 'image',
      width: 80,
      render: images => {
        const imageUrl = images?.[0]?.url || 'https://via.placeholder.com/600x600/E5E7EB/9CA3AF?text=No+Image';
        return  <NextImage src={imageUrl} alt="Product" fill className="object-cover rounded relative!" sizes="(max-width: 768px) 100vw, 33vw" />
      }
      
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Link href={`/products/${record.slug}`} className="text-blue-600 hover:underline">
          {name}
        </Link>
      ),
    },
    {
      title: 'Category',
      dataIndex: ['category', 'name'],
      key: 'category',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price, record) => (
        <div>
          <div className="font-semibold">₹{price}</div>
          {record.compareAtPrice && (
            <div className="text-sm text-gray-500 line-through">
              ₹{record.compareAtPrice}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: stock => (
        <Tag color={stock > 10 ? 'green' : stock > 0 ? 'orange' : 'red'}>
          {stock} units
        </Tag>
      ),
    },
    {
      title: 'Sales',
      dataIndex: 'salesCount',
      key: 'salesCount',
      sorter: (a, b) => (a.salesCount || 0) - (b.salesCount || 0),
      render: (salesCount) => (
        <div className="flex items-center gap-1">
          <ShoppingOutlined className="text-blue-500" />
          <span className="font-medium">{salesCount || 0} sold</span>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: isActive => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Featured',
      dataIndex: 'isFeatured',
      key: 'isFeatured',
      render: (isFeatured, record) => (
        <Button
          size="small"
          type={isFeatured ? 'primary' : 'default'}
          onClick={() => handleToggleFeatured(record._id, isFeatured)}
        >
          {isFeatured ? 'Featured' : 'Feature'}
        </Button>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
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
            onClick={() => showCloneModal(record)}
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Manage your product catalog</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setCreateModalVisible(true)}
          className="w-full sm:w-auto"
        >
          Add Product
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-4">
          <Input
            placeholder="Search products..."
            prefix={<SearchOutlined />}
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full sm:max-w-sm"
            allowClear
          />
          <Select
            placeholder="Status"
            value={filters.isActive || undefined}
            onChange={value => setFilters(prev => ({ ...prev, isActive: value }))}
            className="w-full sm:w-32"
            allowClear
          >
            <Select.Option value="">All Status</Select.Option>
            <Select.Option value="true">Active</Select.Option>
            <Select.Option value="false">Inactive</Select.Option>
          </Select>
          <Select
            placeholder="Featured"
            value={filters.featured || undefined}
            onChange={value => setFilters(prev => ({ ...prev, featured: value }))}
            className="w-full sm:w-32"
            allowClear
          >
            <Select.Option value="">All Products</Select.Option>
            <Select.Option value="true">Featured</Select.Option>
            <Select.Option value="false">Not Featured</Select.Option>
          </Select>
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
            onChange: page => setPagination(prev => ({ ...prev, page })),
            showSizeChanger: false,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} products`,
            responsive: true,
          }}
        />
      </Card>

      {/* Create/Update Product Modal */}
      <CreateUpdateProductModal
        open={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSuccess={handleProductSuccess}
        categories={categories}
      />

      <CreateUpdateProductModal
        open={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setEditingProduct(null);
        }}
        onSuccess={handleProductSuccess}
        product={editingProduct}
        categories={categories}
      />

      {/* View Product Modal - Modern Design */}
      <Modal
        title={null}
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setViewingProduct(null);
        }}
        footer={null}
        width="100%"
        style={{ maxWidth: 1000, top: 20 }}
        className="product-view-modal"
      >
        {viewingProduct && (
          <div>
            {/* Header Section */}
            <div className="mb-4 md:mb-6 pb-4 md:pb-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{viewingProduct.name}</h2>
                  <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                    <Tag color={viewingProduct.isActive ? 'success' : 'error'} icon={viewingProduct.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
                      {viewingProduct.isActive ? 'Active' : 'Inactive'}
                    </Tag>
                    {viewingProduct.isFeatured && (
                      <Tag color="blue" icon={<TagsOutlined />}>Featured Product</Tag>
                    )}
                    <Tag icon={<ShoppingOutlined />}>{viewingProduct.category?.name || 'Uncategorized'}</Tag>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">₹{viewingProduct.price?.toLocaleString()}</div>
                  {viewingProduct.compareAtPrice && (
                    <div className="text-sm text-gray-500 line-through">₹{viewingProduct.compareAtPrice?.toLocaleString()}</div>
                  )}
                  {viewingProduct.compareAtPrice && viewingProduct.price && (
                    <Tag color="red" className="mt-1">
                      {Math.round(((viewingProduct.compareAtPrice - viewingProduct.price) / viewingProduct.compareAtPrice) * 100)}% OFF
                    </Tag>
                  )}
                </div>
              </div>
            </div>

            {/* Product Images Gallery */}
            {viewingProduct.images && viewingProduct.images.length > 0 && (
              <Card className="mb-6" styles={{ body: { padding: '16px' } }}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <EyeOutlined /> Product Gallery
                </h3>
                <Image.PreviewGroup>
                  <div className="grid grid-cols-5 gap-3">
                    {viewingProduct.images.map((img, index) => (
                      <div key={index} className="relative group">
                        <Image
                          src={img.url}
                          alt={`${viewingProduct.name} - Image ${index + 1}`}
                          className="rounded-lg object-cover aspect-square"
                          style={{ width: '100%', height: '100%' }}
                        />
                        <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                          <EyeOutlined className="text-white opacity-0 group-hover:opacity-100 text-2xl" />
                        </div>
                      </div>
                    ))}
                  </div>
                </Image.PreviewGroup>
              </Card>
            )}

            <Row gutter={16}>
              {/* Left Column */}
              <Col span={12}>
                {/* Product Information */}
                <Card title="Product Information" className="mb-4" variant='borderless'>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Product Name">
                      <span className="font-medium">{viewingProduct.name}</span>
                    </Descriptions.Item>
                    <Descriptions.Item label="SKU">
                      {viewingProduct.sku || <span className="text-gray-400">Not set</span>}
                    </Descriptions.Item>
                    <Descriptions.Item label="Category">
                      <Tag color="blue">{viewingProduct.category?.name || 'N/A'}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Stock Status">
                      <Badge 
                        status={viewingProduct.stock > 10 ? 'success' : viewingProduct.stock > 0 ? 'warning' : 'error'}
                        text={`${viewingProduct.stock} units available`}
                      />
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                {/* Description */}
                <Card title="Description" className="mb-4" variant='borderless'>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {viewingProduct.description}
                  </p>
                </Card>

                {/* Product Variations */}
                {(viewingProduct.sizes?.length > 0 || viewingProduct.colors?.length > 0) && (
                  <Card title="Product Variations" className="mb-4" variant='borderless'>
                    <div className="space-y-4">
                      {viewingProduct.sizes && viewingProduct.sizes.length > 0 && (
                        <div>
                          <div className="text-sm text-gray-600 mb-2">Available Sizes</div>
                          <Space wrap>
                            {viewingProduct.sizes.map((size, index) => (
                              <Tag key={index} color="default" className="px-3 py-1">
                                {size}
                              </Tag>
                            ))}
                          </Space>
                        </div>
                      )}
                      {viewingProduct.colors && viewingProduct.colors.length > 0 && (
                        <div>
                          <div className="text-sm text-gray-600 mb-2">Available Colors</div>
                          <Space wrap>
                            {viewingProduct.colors.map((color, index) => (
                              <Tag key={index} color="default" className="px-3 py-1">
                                {color}
                              </Tag>
                            ))}
                          </Space>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </Col>

              {/* Right Column */}
              <Col span={12}>
                {/* Pricing Details */}
                <Card title={<span><DollarOutlined /> Pricing Details</span>} className="mb-4" variant='borderless'>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Selling Price">
                      <span className="text-xl font-bold text-green-600">₹{viewingProduct.price?.toLocaleString()}</span>
                    </Descriptions.Item>
                    {viewingProduct.compareAtPrice && (
                      <>
                        <Descriptions.Item label="Original Price">
                          <span className="text-gray-500 line-through">₹{viewingProduct.compareAtPrice?.toLocaleString()}</span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Discount">
                          <Tag color="red" className="text-base px-3 py-1">
                            {Math.round(((viewingProduct.compareAtPrice - viewingProduct.price) / viewingProduct.compareAtPrice) * 100)}% OFF
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="You Save">
                          <span className="text-green-600 font-semibold">
                            ₹{(viewingProduct.compareAtPrice - viewingProduct.price)?.toLocaleString()}
                          </span>
                        </Descriptions.Item>
                      </>
                    )}
                  </Descriptions>
                </Card>

                {/* Tags */}
                {viewingProduct.tags && viewingProduct.tags.length > 0 && (
                  <Card title={<span><TagsOutlined /> Tags</span>} className="mb-4" variant='borderless'>
                    <Space wrap>
                      {viewingProduct.tags.map((tag, index) => (
                        <Tag key={index} color="processing" className="px-3 py-1">
                          {tag}
                        </Tag>
                      ))}
                    </Space>
                  </Card>
                )}

                {/* SEO Information */}
                {(viewingProduct.metaTitle || viewingProduct.metaDescription) && (
                  <Card title="SEO Information" className="mb-4" variant='borderless'>
                    <Descriptions column={1} size="small">
                      {viewingProduct.metaTitle && (
                        <Descriptions.Item label="Meta Title">
                          {viewingProduct.metaTitle}
                        </Descriptions.Item>
                      )}
                      {viewingProduct.metaDescription && (
                        <Descriptions.Item label="Meta Description">
                          {viewingProduct.metaDescription}
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                  </Card>
                )}

                {/* Timestamps */}
                <Card title={<span><CalendarOutlined /> Timeline</span>} variant='borderless'>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Created">
                      {new Date(viewingProduct.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </Descriptions.Item>
                    <Descriptions.Item label="Last Updated">
                      {new Date(viewingProduct.updatedAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>

            {/* Footer Actions */}
            <Divider />
            <div className="flex justify-end gap-3">
              <Button 
                size="large"
                onClick={() => {
                  setViewModalVisible(false);
                  setViewingProduct(null);
                }}
              >
                Close
              </Button>
              <Button 
                type="primary"
                size="large"
                icon={<EditOutlined />}
                onClick={() => {
                  setViewModalVisible(false);
                  handleEdit(viewingProduct);
                }}
              >
                Edit Product
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title={selectedProduct?.isActive ? "Move to Inactive" : "Permanently Delete Product"}
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
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger={!selectedProduct?.isActive}
            loading={isDeleting}
            onClick={() => handleDelete(selectedProduct?._id)}
            icon={<DeleteOutlined />}
            className="w-full sm:w-auto"
          >
            {selectedProduct?.isActive ? 'Move to Inactive' : 'Permanently Delete'}
          </Button>
        ]}
        centered
      >
        {selectedProduct && (
          <div className="space-y-4">
            {selectedProduct.isActive ? (
              <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <DeleteOutlined className="text-2xl text-yellow-600" />
                <div>
                  <p className="font-semibold text-yellow-900">Soft Delete (Reversible)</p>
                  <p className="text-sm text-yellow-700">Product will be marked as inactive. You can reactivate it later.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <DeleteOutlined className="text-2xl text-red-500" />
                <div>
                  <p className="font-semibold text-red-900">⚠️ Permanent Delete (Cannot be undone!)</p>
                  <p className="text-sm text-red-700">This product is already inactive. It will be permanently deleted from the database.</p>
                </div>
              </div>
            )}
            
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                {selectedProduct.images?.[0]?.url && (
                              <NextImage src={selectedProduct.images[0].url} alt={selectedProduct.name} width={80} height={80} className="object-cover relative! rounded-lg"/>
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{selectedProduct.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{selectedProduct.category?.name}</p>
                  <div className="flex items-center gap-2">
                    <Tag color="blue">₹{selectedProduct.price}</Tag>
                    <Tag color={selectedProduct.stock > 0 ? 'green' : 'red'}>
                      {selectedProduct.stock} units
                    </Tag>
                    <Badge 
                      status={selectedProduct.isActive ? 'success' : 'error'} 
                      text={selectedProduct.isActive ? 'Active' : 'Inactive'} 
                    />
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              {selectedProduct.isActive ? (
                <>Are you sure you want to move <strong>{selectedProduct.name}</strong> to inactive status?</>
              ) : (
                <>Are you sure you want to <strong className="text-red-600">permanently delete</strong> <strong>{selectedProduct.name}</strong>? This cannot be undone!</>
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
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>,
          <Button
            key="clone"
            type="primary"
            loading={isCloning}
            onClick={() => handleClone(selectedProduct)}
            icon={<CopyOutlined />}
            className="w-full sm:w-auto"
          >
            Clone Product
          </Button>
        ]}
        centered
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <CopyOutlined className="text-2xl text-blue-500" />
              <div>
                <p className="font-semibold text-blue-900">Create a copy of this product</p>
                <p className="text-sm text-blue-700">The cloned product will be created with inactive status.</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                {selectedProduct.images?.[0]?.url && (
                              <NextImage src={selectedProduct.images[0].url} alt={selectedProduct.name} width={80} height={80} className="w-20 h-20 object-cover rounded-lg relative!"  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{selectedProduct.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{selectedProduct.category?.name}</p>
                  <div className="flex items-center gap-2">
                    <Tag color="blue">₹{selectedProduct.price}</Tag>
                    <Tag color={selectedProduct.stock > 0 ? 'green' : 'red'}>
                      {selectedProduct.stock} units
                    </Tag>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">What will be cloned:</p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>✓ Product name (with "(Copy)" suffix)</li>
                <li>✓ Description and pricing details</li>
                <li>✓ Category, stock, sizes, and colors</li>
                <li>✓ Tags and SEO information</li>
                <li>✓ Product images (same URLs)</li>
                <li>✗ Featured status (will be set to No)</li>
              </ul>
            </div>

            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">
              <strong>Note:</strong> The cloned product will be inactive by default. You can edit and activate it later.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
