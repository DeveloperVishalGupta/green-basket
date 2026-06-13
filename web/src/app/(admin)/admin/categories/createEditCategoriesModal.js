import { AdminErrorState, AdminLoadingState } from '@/components/admin/AdminStates';
// import { useCategoryById } from '@/services/admin/categories';
import api from '@/services/api';
import { useCategoryById } from '@/services/categories';
import { CloseCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { App, Button, Form, Image, Input, Modal, Upload } from 'antd';
import { useEffect, useState } from 'react';

const { TextArea } = Input;

/**
 * Create/Edit Category Modal
 * Props:
 * - visible, setVisible
 * - form
 * - editingCategory, setEditingCategory
 * - refetch (function to refresh list)
 */
export default function CreateEditCategoriesModal({
  visible,
  setVisible,
  categoryId,
  // form,
  // editingCategory,
  // setEditingCategory,
  isEditMode,
  refetch,
}) {
  const [editingCategory, setEditingCategory] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { message, modal } = App.useApp();
  const [form] = Form.useForm();

  const getBackendMessage = (err) => {
    const data = err?.response?.data;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      return data.errors.map((item) => item.message).join(', ');
    }
    return err?.message;
  };

  // Fetch category details only in edit mode
  const {
    data: categoryDetails,
    isLoading: isCategoryLoading,
    error: categoryError,
  } = useCategoryById(categoryId, { enabled: !!categoryId && isEditMode });
  

  // Set editing category when categoryId changes
  useEffect(() => {
    if (categoryId && isEditMode) {
      setEditingCategory({ _id: categoryId });
    } else {
      setEditingCategory(null);
    }
  }, [categoryId, isEditMode]);

  // Populate form when category details are loaded in edit mode
  useEffect(() => {
    if (categoryDetails && isEditMode) {
      // Set form fields - remove spread operator, pass object directly
      form.setFieldsValue({
        name: categoryDetails.name,
        description: categoryDetails.description || ''
      });
      
      // Set image preview if exists
      if (categoryDetails.image?.url) {
        setImagePreview(categoryDetails.image.url);
      }
    }
  }, [categoryDetails, isEditMode, form]);

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setImagePreview(null);
      setImageFile(null);
      setEditingCategory(null);
    }
  }, [visible, form]);
    

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      if (values.description) formData.append('description', values.description);

      if (imageFile) formData.append('image', imageFile);

      if (editingCategory) {
        await api.put(`/api/categories/${editingCategory._id}`, formData);
        message.success('Category updated successfully');
      } else {
        await api.post('/api/categories', formData);
        message.success('Category created successfully');
      }

      setVisible(false);
      form.resetFields();
      setEditingCategory(null);
      setImageFile(null);
      setImagePreview(null);
      if (typeof refetch === 'function') refetch();
    } catch (err) {
      const backendMessage = getBackendMessage(err);
      if (backendMessage) {
        message.error(backendMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={editingCategory ? 'Edit Category' : 'Create Category'}
      open={visible}
      onCancel={() => {
        if (!isSubmitting) {
          setVisible(false);
          form.resetFields();
          setEditingCategory(null);
          setImageFile(null);
          setImagePreview(null);
        }
      }}
      footer={null}
      width={600}
      closable={!isSubmitting}
      maskClosable={!isSubmitting}
    >
      {isCategoryLoading ? (
        <AdminLoadingState height="h-64" />
      ) : categoryError ? (
        <AdminErrorState
          title="Failed to Load Category"
          description={categoryError?.message || "Unable to fetch category details. Please try again."}
          onRetry={() => window.location.reload()}
          retryText="Reload"
        />
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ isActive: true }}
        >
          <Form.Item
            label="Category Name"
            name="name"
            rules={[{ required: true, message: 'Please enter category name' }]}
          >
            <Input size="large" placeholder="Enter category name" disabled={isSubmitting} />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <TextArea rows={3} placeholder="Enter description (optional)" disabled={isSubmitting} />
          </Form.Item>

          <Form.Item label="Category Image">
            <div className="space-y-3">
              {imagePreview && (
                <div className="relative inline-block">
                  <Image src={imagePreview} alt="Preview" width={150} height={150} className="rounded-lg object-cover" />
                  <Button
                    type="text"
                    danger
                    icon={<CloseCircleOutlined />}
                    size="small"
                    className="absolute -top-2 -right-2"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    disabled={isSubmitting}
                  />
                </div>
              )}
              <Upload
                accept="image/*"
                showUploadList={false}
                disabled={isSubmitting}
                beforeUpload={(file) => {
                const isImage = file.type.startsWith('image/');
                if (!isImage) {
                  Modal.error({
                    title: 'Invalid File',
                    content: 'Please select an image file (JPG, PNG, GIF, or WebP only).',
                  });
                  return Upload.LIST_IGNORE;
                }

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

                setImageFile(file);
                const reader = new FileReader();
                reader.onload = (e) => setImagePreview(e.target.result);
                reader.readAsDataURL(file);

                return false;
                }}
              >
                <Button icon={<UploadOutlined />} className='ms-12' size="large" disabled={isSubmitting}>
                  {imagePreview ? 'Change Image' : 'Upload Image'}
                </Button>
              </Upload>
              <p className="text-xs text-gray-500">Recommended: Square image , max 3MB (JPG, PNG, GIF, WebP)</p>
            </div>
          </Form.Item>

          <Form.Item>
            <div className="flex gap-4">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="flex-1"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? (editingCategory ? 'Updating...' : 'Creating...') : (editingCategory ? 'Update' : 'Create')}
              </Button>
              <Button
                size="large"
                onClick={() => {
                  setVisible(false);
                  form.resetFields();
                  setEditingCategory(null);
                  setImageFile(null);
                  setImagePreview(null);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}
