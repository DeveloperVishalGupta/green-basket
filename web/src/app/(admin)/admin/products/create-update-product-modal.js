"use client";

import { useCreateProduct, useUpdateProduct } from "@/hooks/useProducts";
import { useProductById } from "@/services/admin/products";
import { useCategories } from "@/services/categories";
import { UploadOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Switch,
  Upload,
} from "antd";
import { useEffect, useState } from "react";

const { TextArea } = Input;

export default function CreateUpdateProductModal({
  open,
  onClose,
  onSuccess,
  product = null,
}) {
  const user = JSON.parse(localStorage.getItem("user"));

  const [form] = Form.useForm();
  const sellingType = Form.useWatch("sellingType", form);

  const [fileList, setFileList] = useState([]);
  const [categoriesOptions, setCategoriesOptions] = useState([]);
  const [productBenifits, setProductBenifits] = useState([]);
  const [isFormReady, setIsFormReady] = useState(false);

  const isEditMode = !!product;

  console.log(open && isEditMode);

  // Fetch product details by ID when in edit mode
  const {
    data: productDetails,
    isLoading: isProductLoading,
    error: productError,
  } = useProductById(product?._id, { enabled: open && isEditMode });
  // Fetch categories
  useEffect(() => {}, [productDetails]);
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useCategories({ enabled: open });

  // Create and update mutations with Joi validation
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const isLoading = createMutation.isPending || updateMutation.isPending;

  /**
   * Handle category data
   */
  useEffect(() => {
    if (categoriesData?.length > 0) {
      setCategoriesOptions(
        categoriesData.map((item) => ({
          label: item.name,
          value: item._id,
        })),
      );
    }
  }, [categoriesData]);

  /**
   * Initialize form with product details in edit mode
   */
  useEffect(() => {
    console.log({ open, isEditMode, productDetails });
    if (open && isEditMode && productDetails) {
      const initialValues = {
        ...productDetails,
        categories: productDetails.categories.map((item) => item._id),
      };
      form.setFieldsValue(initialValues);

      // Convert existing images to file list format
      if (productDetails.images && productDetails.images.length > 0) {
        const existingFiles = productDetails.images.map((img, index) => ({
          uid: `existing-${index}`,
          name: `Image ${index + 1}`,
          status: "done",
          url: img.url,
          publicId: img.publicId,
          isExisting: true,
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

  /**
   * Reset when modal closes
   */
  useEffect(() => {
    if (!open) {
      setIsFormReady(false);
      if (isFormReady) {
        form.resetFields();
        setFileList([]);
      }
    } else {
      setIsFormReady(true);
    }
  }, [open, form]);

  /**
   * Validate file before upload
   */
  const beforeUpload = (file) => {
    // Validate file type
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      Modal.error({
        title: "Invalid File",
        content: "Please select an image file (JPG, PNG, GIF, or WebP only).",
      });
      return Upload.LIST_IGNORE;
    }

    // Validate file size (3MB max)
    const maxSize = 3 * 1024 * 1024; // 3MB
    const isLtMaxSize = file.size <= maxSize;
    if (!isLtMaxSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      Modal.error({
        title: "File Too Large",
        content: `Image size is ${fileSizeMB}MB. Please choose an image under 3MB.`,
      });
      return Upload.LIST_IGNORE;
    }

    return false; // Prevent auto upload
  };

  /**
   * Handle file list changes
   */
  const handleUploadChange = ({ fileList: newFileList }) => {
    const uniqueFileList = newFileList.map((file, index) => ({
      ...file,
      uid: file.uid || `${Date.now()}-${index}`,
    }));
    setFileList(uniqueFileList);
  };

  /**
   * Handle form submission with Joi validation
   * Joi validation is handled in the mutation functions
   */
  const handleSubmit = async (values) => {
    try {
      // JSON data
      const payload = {
        ...values,
      };

      const formData = new FormData();

      Object.entries(values).forEach(([key, value]) => {
        if (value !== null && typeof value === "object") {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });

      // Images separately
      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append("images", file.originFileObj);
        }
      });

      if (user?._id) {
        formData.append("vendor", user?._id);
      }
      if (isEditMode) {
        await updateMutation.mutateAsync({
          id: productDetails?._id || product._id,
          formData,
        });

        message.success("Product updated successfully");
      } else {
        await createMutation.mutateAsync(formData);

        message.success("Product created successfully");
      }

      form.resetFields();
      setFileList([]);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    if (isFormReady) {
      form.resetFields();
    }
    setFileList([]);
    onClose();
  };

  return (
    <Modal
      title={isEditMode ? "Edit Product" : "Create New Product"}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width="100%"
      style={{ maxWidth: 800, top: 20 }}
      destroyOnHidden>
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
            labels: [],
            stockUnit: "g",
            sellingType: "weight",
            variants: isEditMode
              ? []
              : [
                  {
                    label: "250gm",
                    quantity: 250,
                    price: 0,
                  },
                  {
                    label: "500gm",
                    quantity: 500,
                    price: 0,
                  },
                  {
                    label: "1kg",
                    quantity: 1000,
                    price: 0,
                  },
                ],

            healthBenefits: [],

            trackInventory: true,
            isBestSeller: false,
            healthBenefits: [],
            storageInstructions: "",
            isOrganic: false,
            isSeasonal: false,
          }}>
          {/* Product Name */}
          <Form.Item
            label="Product Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please enter product name",
              },
            ]}>
            <Input
              size="large"
              placeholder="Enter product name (3-100 characters)"
            />
          </Form.Item>

          {/* Description */}
          <Form.Item
            label="Description"
            name="description"
            rules={[
              {
                required: true,
                message: "Please enter description",
              },
            ]}>
            <TextArea
              rows={4}
              placeholder="Enter product description (10-2000 characters)"
            />
          </Form.Item>

          {/* Product Images */}
          <Form.Item
            label="Product Images"
            extra={
              isEditMode
                ? "Upload new images to replace or add to existing ones (max 5 images, 3MB each)"
                : "Upload up to 5 images (max 3MB each). Images will be uploaded to cloud storage."
            }>
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
              multiple>
              {fileList.length >= 5 ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          {/* Category */}
          <Form.Item
            label="Category"
            name="categories"
            rules={[
              {
                required: true,
                message: "Please select category",
              },
            ]}>
            <Select
              mode="multiple"
              size="large"
              placeholder="Select category"
              loading={isCategoriesLoading}>
              {categoriesOptions.map((cat) => (
                <Select.Option key={cat.value} value={cat.value}>
                  {cat.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            {/* Unit and Quantity */}
            <Form.Item label="Stock" name="stock">
              <InputNumber
                size="large"
                className="w-full"
                style={{ width: "100%" }}
                min={0}
                placeholder="0"
              />
            </Form.Item>
            <Form.Item label="Stock Unit" name="stockUnit">
              <Select
                size="large"
                options={[
                  { label: "Gram", value: "g" },
                  { label: "ML", value: "ml" },
                  { label: "Piece", value: "piece" },
                  { label: "Bunch", value: "bunch" },
                  { label: "Packet", value: "packet" },
                  { label: "Box", value: "box" },
                ]}
              />
            </Form.Item>
          </div>

          {/* selling type  */}
          <Form.Item
            label="Selling Type"
            name="sellingType"
            rules={[
              {
                required: true,
                message: "Please select selling type",
              },
            ]}>
            <Select
              size="large"
              options={[
                { label: "Weight Based", value: "weight" },
                { label: "Range Product", value: "range" },
                { label: "Piece Based", value: "piece" },
              ]}
            />
          </Form.Item>

          {/* Product Variants */}
          {(sellingType === "weight" || sellingType === "piece") && (
            <div className="border rounded-lg mb-4 p-4">
              <h3 className="text-lg font-semibold mb-4">Product Variants</h3>

              {/* Header */}
              <div className="grid grid-cols-5 gap-3 mb-3 font-medium text-gray-700">
                <div>Variant Label</div>
                <div>Quantity</div>
                <div>Price (₹)</div>
                <div>compair at Price (₹)</div>
                <div>Action</div>
              </div>

              <Form.List name="variants">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name }) => (
                      <div
                        key={key}
                        className="grid grid-cols-5 gap-3 mb-3 items-start">
                        <Form.Item
                          name={[name, "label"]}
                          rules={[
                            {
                              required: true,
                              message: "Label required",
                            },
                          ]}>
                          <Input placeholder="500g" />
                        </Form.Item>

                        <Form.Item
                          name={[name, "quantity"]}
                          rules={[
                            {
                              required: true,
                              message: "Quantity required",
                            },
                          ]}>
                          <InputNumber
                            className="w-full"
                            placeholder="500"
                            min={1}
                          />
                        </Form.Item>

                        <Form.Item
                          name={[name, "price"]}
                          rules={[
                            {
                              required: true,
                              message: "Price required",
                            },
                          ]}>
                          <InputNumber
                            className="w-full"
                            placeholder="Price"
                            min={0}
                          />
                        </Form.Item>

                        <Form.Item name={[name, "compareAtPrice"]}>
                          <InputNumber
                            className="w-full"
                            placeholder="Compare at price"
                            min={0}
                          />
                        </Form.Item>

                        <Button danger block onClick={() => remove(name)}>
                          Delete
                        </Button>
                      </div>
                    ))}

                    <Button
                      type="dashed"
                      block
                      onClick={() =>
                        add({
                          label: "",
                          quantity: 0,
                          price: 0,
                        })
                      }>
                      + Add Variant
                    </Button>
                  </>
                )}
              </Form.List>
            </div>
          )}

          {/* Product weight range */}
          {sellingType === "range" && (
            <div className="grid grid-cols-2 gap-4">
              <Form.Item label="Minimum Weight" name={["approxWeight", "min"]}>
                <InputNumber className="w-full" min={0} />
              </Form.Item>

              <Form.Item label="Maximum Weight" name={["approxWeight", "max"]}>
                <InputNumber className="w-full" min={0} />
              </Form.Item>
            </div>
          )}

          {/* Nutritional Info - Calories and Protein */}
          {/* <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Calories (kcal)" name={["nutrition", "calories"]}>
              <Input size="large" placeholder="e.g., 95" type="number" />
            </Form.Item>

            <Form.Item label="Protein (g)" name={["nutrition", "protein"]}>
              <Input size="large" placeholder="e.g., 1.2" type="number" />
            </Form.Item>
          </div> */}

          {/* Nutritional Info - Carbs and Fiber */}
          {/* <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Carbohydrates (g)"
              name={["nutrition", "carbohydrates"]}>
              <Input size="large" placeholder="e.g., 25" type="number" />
            </Form.Item>

            <Form.Item label="Fiber (g)" name={["nutrition", "fiber"]}>
              <Input size="large" placeholder="e.g., 2.5" type="number" />
            </Form.Item>
          </div> */}

          {/* Fat */}
          {/* <Form.Item label="Fat (g)" name={["nutrition", "fat"]}>
            <Input size="large" placeholder="e.g., 0.3" type="number" />
          </Form.Item> */}

          {/* Product Benefits */}
          <Form.Item
            label="Product Benefits"
            name="healthBenefits"
            extra="Add one or more product healthBenefits">
            <Select
              mode="tags"
              size="large"
              placeholder="Add health Benefits (e.g., Rich in Vitamin C)"
              tokenSeparators={[","]}
              showSearch
              allowClear
              filterOption={(input, option) =>
                option?.children?.toLowerCase().includes(input.toLowerCase())
              }>
              {productBenifits.map((label) => (
                <Select.Option key={label} value={label}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* storageInstructions */}
          <Form.Item label="Storage Instructions" name="storageInstructions">
            <TextArea
              rows={4}
              placeholder="Enter product storage instructions "
            />
          </Form.Item>

          {/* Organic and Seasonal Flags */}
          <div className="grid grid-cols-2 gap-4">
            {/* organic  */}
            <Form.Item
              label="Organic Product"
              name="isOrganic"
              valuePropName="checked">
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>

            {/* Seasonal */}
            <Form.Item
              label="Seasonal Product"
              name="isSeasonal"
              valuePropName="checked">
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>

            {/* Best Seller */}
            <Form.Item
              label="Best Seller"
              name="isBestSeller"
              valuePropName="checked">
              <Switch />
            </Form.Item>

            {/* Active Status */}
            <Form.Item
              label="Active Status"
              name="isActive"
              valuePropName="checked">
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>

            {/* Featured Product */}
            <Form.Item
              label="Featured Product"
              name="isFeatured"
              valuePropName="checked">
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>
          </div>

          {/* Form Actions */}
          <Form.Item>
            <div className="flex gap-4 justify-end">
              <Button onClick={handleCancel} size="large">
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                size="large">
                {isEditMode ? "Update Product" : "Create Product"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}
