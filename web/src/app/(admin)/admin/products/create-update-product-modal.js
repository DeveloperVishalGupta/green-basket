'use client';

import { apiClient } from '@/lib/api';
// import { useCategories } from '@/services/admin/categories';
import { useProductById, useProductsOptions } from '@/services/admin/products';
import { useCategories } from '@/services/categories';
import { UploadOutlined } from '@ant-design/icons';
import { App, Button, Form, Input, InputNumber, Modal, Select, Switch, Upload } from 'antd';
import { useEffect, useState } from 'react';

const { TextArea } = Input;

/**
 * Reusable modal component for creating and updating products
 * @param {Object} props
 * @param {boolean} props.open - Modal visibility state
 * @param {Function} props.onClose - Callback to close modal
 * @param {Function} props.onSuccess - Callback after successful operation
 * @param {Object} props.product - Product data for editing (null for create mode)
 */
export default function CreateUpdateProductModal({
  open,
  onClose,
  onSuccess,
  product = null,
}) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [categoriesOptions, setCategoriesOptions] = useState([]);
    // Store for reusable options
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [isFormReady, setIsFormReady] = useState(false);

  const isEditMode = !!product;

  // Fetch product details by ID when in edit mode
  const {
    data: productDetails,
    isLoading: isProductLoading,
    error: productError,
  } = useProductById(product?._id, { enabled: open && isEditMode });
  const getBackendMessage = (err) => {
    const data = err?.response?.data || err?.data;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      return data.errors.map((item) => item.message).join(', ');
    }
    return err?.message;
  };
  

  // Use React Query hook for categories data
  const {
    data: productsOptions,
    isLoading,
    error,
    refetch
  } = useProductsOptions({ enabled: open });

      const {
        data: categoriesData,
        isLoading:CategoriesLoading,
        error:CategoriesError,
        refetch:refetchCategories
      } = useCategories({ enabled: open }  );

      
      useEffect(()=>{
        if (categoriesData?.length > 0) {

          setCategoriesOptions(categoriesData?.map(item=>{
  return {
    label: item.name,
    value: item._id
  }
}));
        }
      },[categoriesData])

    useEffect(()=>{
       if(productsOptions){
        setAvailableSizes(productsOptions.sizes || []);
        setAvailableColors(productsOptions.colors || []);
        setAvailableTags(productsOptions.tags || []);
      }
    },[productsOptions])

  // Initialize form when modal opens or product details are fetched
  useEffect(() => {
    if (open && isEditMode && productDetails) {
      // Edit mode - populate form with fetched product data
      const formValues = {
        name: productDetails.name,
        description: productDetails.description,
        price: productDetails.price,
        compareAtPrice: productDetails.compareAtPrice,
        category: productDetails.category?._id || productDetails.category,
        stock: productDetails.stock,
        sizes: Array.isArray(productDetails.sizes) ? productDetails.sizes : [],
        colors: Array.isArray(productDetails.colors) ? productDetails.colors : [],
        tags: Array.isArray(productDetails.tags) ? productDetails.tags : [],
        isActive: productDetails.isActive ?? true,
        isFeatured: productDetails.isFeatured ?? false,
      };
            
      // Only set form values if form is ready
      if (isFormReady) {
        form.setFieldsValue(formValues);
      }

      // Convert existing images to file list format
      if (productDetails.images && productDetails.images.length > 0) {
        const existingFiles = productDetails.images.map((img, index) => ({
          uid: `existing-${index}`,
          name: `Image ${index + 1}`,
          status: 'done',
          url: img.url,
          publicId: img.publicId,
          isExisting: true, // Mark as existing image
        }));
        setFileList(existingFiles);
      } else {
        setFileList([]);
      }
    } else if (open && !isEditMode && isFormReady) {
      // Create mode - reset form
      form.resetFields();
      setFileList([]);
    }
  }, [open, isEditMode, productDetails, form, isFormReady]);

  // Reset when modal closes
  useEffect(() => {
    if (!open && isFormReady) {
      form.resetFields();
      setFileList([]);
    }
  }, [open, form, isFormReady]);

  // Set form ready when modal opens
  useEffect(() => {
    if (open) {
      setIsFormReady(true);
    } else {
      setIsFormReady(false);
    }
  }, [open]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Validate that at least one image is present
      if (fileList.length === 0) {
        message.error('Please upload at least one product image');
        setLoading(false);
        return;
      }

      // Check if there are new image files to upload
      const newFiles = fileList.filter(file => file.originFileObj);
      const hasNewImages = newFiles.length > 0;

      let requestData;
      let requestHeaders;

      if (hasNewImages) {
        // Use FormData ONLY if new images are present
        const formData = new FormData();

        // Append all form fields as primitives
        formData.append('name', values.name);
        formData.append('description', values.description);
        formData.append('price', values.price);
        formData.append('category', values.category);
        formData.append('stock', values.stock);

        if (values.compareAtPrice) {
          formData.append('compareAtPrice', values.compareAtPrice);
        }
        
        // Serialize arrays using JSON.stringify for FormData
        formData.append('sizes', JSON.stringify(values.sizes || []));
        formData.append('colors', JSON.stringify(values.colors || []));
        formData.append('tags', JSON.stringify(values.tags || []));
        
        formData.append('isActive', values.isActive ?? true);
        formData.append('isFeatured', values.isFeatured ?? false);

        // Handle existing images for edit mode
        if (isEditMode) {
          const existingImages = fileList
            .filter(file => file.isExisting && file.publicId)
            .map(file => ({
              url: file.url,
              publicId: file.publicId,
            }));
          
          if (existingImages.length > 0) {
            // Serialize existingImages as JSON string - backend will parse with JSON.parse
            formData.append('existingImages', JSON.stringify(existingImages));
          }
        }

        // Append new image files
        newFiles.forEach((file) => {
          formData.append('images', file.originFileObj);
        });

        requestData = formData;
        requestHeaders = undefined;
      } else {
        // No new images - send as regular JSON payload
        requestData = {
          name: values.name,
          description: values.description,
          price: values.price,
          category: values.category,
          stock: values.stock,
          compareAtPrice: values.compareAtPrice,
          sizes: values.sizes || [],
          colors: values.colors || [],
          tags: values.tags || [],
          isActive: values.isActive ?? true,
          isFeatured: values.isFeatured ?? false,
        };

        // Include existing images for edit mode
        if (isEditMode) {
          const existingImages = fileList
            .filter(file => file.isExisting && file.publicId)
            .map(file => ({
              url: file.url,
              publicId: file.publicId,
            }));
          
          if (existingImages.length > 0) {
            requestData.existingImages = existingImages;
          }
        }

        requestHeaders = undefined;
      }

      // Make API call
      if (isEditMode) {
        await apiClient.put(
          `/api/products/${productDetails?._id || product._id}`,
          requestData,
          requestHeaders ? { headers: requestHeaders } : undefined
        );
        message.success('Product updated successfully');
      } else {
        await apiClient.post(
          '/api/products',
          requestData,
          requestHeaders ? { headers: requestHeaders } : undefined
        );
        message.success('Product created successfully');
      }

      // Reset and close
      form.resetFields();
      setFileList([]);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Product save error:', error);
      const backendMessage = getBackendMessage(error);
      if (backendMessage) {
        message.error(backendMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    // Ensure unique keys for each file
    const uniqueFileList = newFileList.map((file, index) => ({
      ...file,
      uid: file.uid || `${Date.now()}-${index}`,
    }));
    setFileList(uniqueFileList);
  };

  const beforeUpload = (file) => {
    // Validate file type
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      Modal.error({
        title: 'Invalid File',
        content: 'Please select an image file (JPG, PNG, GIF, or WebP only).',
      });
      return Upload.LIST_IGNORE;
    }

    // Validate file size (3MB max)
    const maxSize = 3 * 1024 * 1024; // 3MB
    const isLtMaxSize = file.size <= maxSize;
    if (!isLtMaxSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      Modal.error({
        title: 'File Too Large',
        content: `Image size is ${fileSizeMB}MB. Please choose an image under 3MB.`,
      });
      return Upload.LIST_IGNORE;
    }

    // Return false to prevent auto upload - we'll handle it manually
    return false;
  };

  const handleCancel = () => {
    if (isFormReady) {
      form.resetFields();
    }
    setFileList([]);
    onClose();
  };

  return (
    <Modal
      title={isEditMode ? 'Edit Product' : 'Create New Product'}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width="100%"
      style={{ maxWidth: 800, top: 20 }}
      destroyOnHidden
    >
      {isEditMode && isProductLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product details...</p>
          </div>
        </div>
      ) : isEditMode && productError ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load product details</p>
            <Button onClick={() => onClose()}>Close</Button>
          </div>
        </div>
      ) : (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          isActive: true,
          isFeatured: false,
          stock: 0,
          sizes: [],
          colors: [],
          tags: [],
        }}
      >
        <Form.Item
          label="Product Name"
          name="name"
          rules={[{ required: true, message: 'Please enter product name' }]}
        >
          <Input size="large" placeholder="Enter product name" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please enter description' }]}
        >
          <TextArea rows={4} placeholder="Enter product description" />
        </Form.Item>

        <Form.Item
          label="Product Images"
          extra={
            isEditMode
              ? 'Upload new images to replace or add to existing ones (max 5 images, 3MB each)'
              : 'Upload up to 5 images (max 3MB each). Images will be uploaded to cloud storage.'
          }
        >
          <Upload
            accept="image/*"
            listType="picture-card"
            fileList={fileList}
            onChange={handleUploadChange}
            beforeUpload={beforeUpload}
            onRemove={(file) => {
              setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
            }}
            maxCount={5}
            multiple
          >
            {fileList.length >= 5 ? null : (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Price (₹)"
            name="price"
            rules={[{ required: true, message: 'Please enter price' }]}
          >
            <InputNumber
              size="large"
              className="w-full"
              min={0}
              placeholder="0.00"
            />
          </Form.Item>

          <Form.Item label="Compare At Price (₹)" name="compareAtPrice">
            <InputNumber
              size="large"
              className="w-full"
              min={0}
              placeholder="0.00"
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select size="large" placeholder="Select category">
              {categoriesOptions.map((cat) => (
                <Select.Option key={cat.value} value={cat.value}>
                  {cat.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Stock"
            name="stock"
            rules={[{ required: true, message: 'Please enter stock' }]}
          >
            <InputNumber
              size="large"
              className="w-full"
              min={0}
              placeholder="0"
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Sizes"
          name="sizes"
          extra="Select from existing sizes or type new ones separated by comma"
        >
          <Select
            mode="tags"
            size="large"
            placeholder="Add sizes (e.g., S, M, L, 2/2, 2/4, 2/6)"
            tokenSeparators={[',']}
            showSearch
            allowClear
            filterOption={(input, option) =>
              option?.children?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {availableSizes.map((size) => (
              <Select.Option key={size} value={size}>
                {size}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Colors"
          name="colors"
          extra="Select from existing colors or type new ones separated by comma"
        >
          <Select
            mode="tags"
            size="large"
            placeholder="Add colors (e.g., Red, Blue, Black)"
            tokenSeparators={[',']}
            showSearch
            allowClear
            filterOption={(input, option) =>
              option?.children?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {availableColors.map((color) => (
              <Select.Option key={color} value={color}>
                {color}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Tags"
          name="tags"
          extra="Select from existing tags or type new ones separated by comma"
        >
          <Select
            mode="tags"
            size="large"
            placeholder="Add tags (e.g., trending, sale, new arrival)"
            tokenSeparators={[',']}
            showSearch
            allowClear
            filterOption={(input, option) =>
              option?.children?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {availableTags.map((tag) => (
              <Select.Option key={tag} value={tag}>
                {tag}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Active Status"
            name="isActive"
            valuePropName="checked"
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <Form.Item
            label="Featured Product"
            name="isFeatured"
            valuePropName="checked"
          >
            <Switch checkedChildren="Yes" unCheckedChildren="No" />
          </Form.Item>
        </div>

        <Form.Item>
          <div className="flex gap-4 justify-end">
            <Button onClick={handleCancel} size="large">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
            >
              {isEditMode ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </Form.Item>
      </Form>
      )}
    </Modal>
  );
}
