import Button from "@/components/ui/Button";
import { CopyOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import {
  Badge,
  Card,
  Col,
  Descriptions,
  Divider,
  Image,
  message,
  Modal,
  Row,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";

export default function ViewProductModal({
  viewModalVisible,
  setViewModalVisible,
  viewingProduct,
  setViewingProduct,
  handleEdit,
}) {
  return (
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
      className="product-view-modal">
      {viewingProduct && (
        <div>
          {/* Header Section */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              {/* Left */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900">
                  {viewingProduct.name}
                </h2>

                <p className="text-gray-500 mt-2">
                  {viewingProduct.description}
                </p>

                {/* Categories */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {viewingProduct.categories?.map((category) => (
                    <Tag key={category._id} color="blue">
                      {category.name}
                    </Tag>
                  ))}
                </div>
              </div>

              {/* Right */}
              <div className="min-w-[320px]">
                <Card
                  size="small"
                  title="Variant Pricing"
                  className="shadow-sm">
                  <div className="space-y-3">
                    {viewingProduct.variants?.map((variant) => {
                      const discount =
                        variant.compareAtPrice > variant.price
                          ? Math.round(
                              ((variant.compareAtPrice - variant.price) /
                                variant.compareAtPrice) *
                                100,
                            )
                          : 0;

                      return (
                        <div
                          key={variant._id}
                          className="flex items-center justify-between border-b last:border-0 pb-2">
                          <div>
                            <div className="font-semibold">{variant.label}</div>

                            <div className="text-xs text-gray-500">
                              {variant.quantity}
                              {viewingProduct.stockUnit}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              ₹{variant.price}
                            </div>

                            {variant.compareAtPrice > variant.price && (
                              <>
                                <div className="text-xs text-gray-400 line-through">
                                  ₹{variant.compareAtPrice}
                                </div>

                                <Tag color="red" className="mt-1">
                                  {discount}% OFF
                                </Tag>
                              </>
                            )}

                            {variant.isDefault && (
                              <Tag color="green" className="ml-2">
                                Default
                              </Tag>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            </div>
          </div>
          {/* Product Gallery */}
          {viewingProduct.images?.length > 0 && (
            <Card
              className="mb-6 shadow-sm"
              styles={{ body: { padding: 20 } }}
              title={
                <span className="flex items-center gap-2 text-lg font-semibold">
                  <EyeOutlined />
                  Product Gallery
                </span>
              }>
              <Image.PreviewGroup>
                <Row gutter={[16, 16]}>
                  {/* Main Image */}

                  {/* Thumbnail Images */}
                  <Col xs={24} md={10}>
                    <div className="grid grid-cols-2 gap-3">
                      {viewingProduct.images.map((img, index) => (
                        <div
                          key={img._id || index}
                          className="border rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer">
                          <Image
                            src={img.url}
                            alt={`${viewingProduct.name}-${index}`}
                            preview={{ mask: <EyeOutlined /> }}
                            style={{
                              width: "100%",
                              height: 170,
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </Col>
                </Row>
              </Image.PreviewGroup>

              {/* Image Details */}
              <Divider />

              <Descriptions column={2} size="small">
                <Descriptions.Item label="Total Images">
                  <Tag color="blue">{viewingProduct.images.length}</Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Alt Text">
                  {viewingProduct.images[0]?.alt || "-"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          <Row gutter={[20, 20]}>
            {/* Left Column */}
            <Col xs={24} lg={12}>
              {/* Product Details */}
              <Card
                title="Product Information"
                className="mb-5"
                variant="borderless">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Product Name">
                    <strong>{viewingProduct.name}</strong>
                  </Descriptions.Item>

                  <Descriptions.Item label="Selling Type">
                    <Tag color="purple">{viewingProduct.sellingType}</Tag>
                  </Descriptions.Item>

                  <Descriptions.Item label="Available Stock">
                    <Badge
                      status={
                        viewingProduct.stock > 20
                          ? "success"
                          : viewingProduct.stock > 0
                            ? "warning"
                            : "error"
                      }
                      text={`${viewingProduct.stock} ${viewingProduct.stockUnit}`}
                    />
                  </Descriptions.Item>

                  <Descriptions.Item label="Categories">
                    <Space wrap>
                      {viewingProduct.categories?.map((cat) => (
                        <Tag key={cat._id} color="processing">
                          {cat.name}
                        </Tag>
                      ))}
                    </Space>
                  </Descriptions.Item>

                  <Descriptions.Item label="Vendor">
                    {viewingProduct.vendor
                      ? `${viewingProduct.vendor.firstName} ${viewingProduct.vendor.lastName}`
                      : "-"}
                  </Descriptions.Item>

                  <Descriptions.Item label="Vendor Email">
                    {viewingProduct.vendor?.email || "-"}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Description */}
              <Card title="Description" className="mb-5" variant="borderless">
                <Typography.Paragraph>
                  {viewingProduct.description}
                </Typography.Paragraph>
              </Card>

              {/* Storage */}
              <Card
                title="Storage Instructions"
                className="mb-5"
                variant="borderless">
                <Typography.Text>
                  {viewingProduct.storageInstructions || "-"}
                </Typography.Text>
              </Card>

              {/* Health Benefits */}
              <Card title="Health Benefits" variant="borderless">
                <Space wrap>
                  {viewingProduct.healthBenefits?.length ? (
                    viewingProduct.healthBenefits.map((item, index) => (
                      <Tag key={index} color="green">
                        {item}
                      </Tag>
                    ))
                  ) : (
                    <Typography.Text type="secondary">
                      No health benefits added
                    </Typography.Text>
                  )}
                </Space>
              </Card>
            </Col>

            {/* Right Column */}
            <Col xs={24} lg={12}>
              {/* Variant Pricing */}
              <Card
                title="Variant Pricing"
                className="mb-5"
                variant="borderless">
                <Table
                  pagination={false}
                  size="small"
                  rowKey="_id"
                  dataSource={viewingProduct.variants}
                  columns={[
                    {
                      title: "Variant",
                      dataIndex: "label",
                    },
                    {
                      title: "Price",
                      render: (_, record) => (
                        <span className="font-semibold text-green-600">
                          ₹{record.price}
                        </span>
                      ),
                    },
                    {
                      title: "MRP",
                      render: (_, record) =>
                        record.compareAtPrice ? (
                          <span className="line-through text-gray-500">
                            ₹{record.compareAtPrice}
                          </span>
                        ) : (
                          "-"
                        ),
                    },
                    {
                      title: "Discount",
                      render: (_, record) => {
                        if (
                          !record.compareAtPrice ||
                          record.compareAtPrice <= record.price
                        )
                          return "-";

                        return (
                          <Tag color="red">
                            {Math.round(
                              ((record.compareAtPrice - record.price) /
                                record.compareAtPrice) *
                                100,
                            )}
                            % OFF
                          </Tag>
                        );
                      },
                    },
                    {
                      title: "Default",
                      render: (_, record) =>
                        record.isDefault ? <Tag color="green">Yes</Tag> : "-",
                    },
                  ]}
                />
              </Card>

              {/* Product Statistics */}
              <Card
                title="Product Statistics"
                className="mb-5"
                variant="borderless">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Average Rating">
                    ⭐ {viewingProduct.rating?.average || 0}
                  </Descriptions.Item>

                  <Descriptions.Item label="Total Reviews">
                    {viewingProduct.rating?.count || 0}
                  </Descriptions.Item>

                  <Descriptions.Item label="Sales Count">
                    {viewingProduct.salesCount}
                  </Descriptions.Item>

                  <Descriptions.Item label="Slug">
                    <Typography.Text copyable>
                      {viewingProduct.slug}
                    </Typography.Text>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Product Attributes */}
              <Card
                title="Product Attributes"
                className="mb-5"
                variant="borderless">
                <Space wrap>
                  <Tag color={viewingProduct.isOrganic ? "green" : "default"}>
                    Organic
                  </Tag>

                  <Tag color={viewingProduct.isSeasonal ? "gold" : "default"}>
                    Seasonal
                  </Tag>

                  <Tag color={viewingProduct.isFeatured ? "blue" : "default"}>
                    Featured
                  </Tag>

                  <Tag color={viewingProduct.isBestSeller ? "red" : "default"}>
                    Best Seller
                  </Tag>

                  <Tag
                    color={
                      viewingProduct.trackInventory ? "processing" : "default"
                    }>
                    Inventory Tracking
                  </Tag>
                </Space>
              </Card>

              {/* Timeline */}
              <Card title="Timeline" variant="borderless">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Created">
                    {new Date(viewingProduct.createdAt).toLocaleString("en-IN")}
                  </Descriptions.Item>

                  <Descriptions.Item label="Updated">
                    {new Date(viewingProduct.updatedAt).toLocaleString("en-IN")}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>

          {/* Footer Actions */}
          <Divider />

          {/* Footer */}
          <Divider />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Product Summary */}
            <div className="flex flex-wrap gap-2">
              <Tag color="blue">
                {viewingProduct.variants?.length || 0} Variants
              </Tag>

              <Tag
                color={
                  viewingProduct.stock > 20
                    ? "success"
                    : viewingProduct.stock > 0
                      ? "warning"
                      : "error"
                }>
                Stock: {viewingProduct.stock} {viewingProduct.stockUnit}
              </Tag>

              <Tag color="processing">
                {viewingProduct.sellingType?.toUpperCase()}
              </Tag>

              {viewingProduct.isActive ? (
                <Tag color="success">Active</Tag>
              ) : (
                <Tag color="error">Inactive</Tag>
              )}
            </div>

            {/* Action Buttons */}
            <Space size="middle">
              <Button
                size="large"
                className="px-3 py-2"
                onClick={() => {
                  setViewModalVisible(false);
                  setViewingProduct(null);
                }}>
                Close
              </Button>

              <Button
                type="default"
                className="px-3 py-2"
                size="large"
                icon={<CopyOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(viewingProduct.slug);
                  message.success("Slug copied");
                }}>
                Copy Slug
              </Button>

              <Button
                type="primary"
                size="large"
                className="px-3 py-2"
                icon={<EditOutlined />}
                onClick={() => {
                  setViewModalVisible(false);
                  handleEdit(viewingProduct);
                }}>
                Edit Product
              </Button>
            </Space>
          </div>
        </div>
      )}
    </Modal>
  );
}
