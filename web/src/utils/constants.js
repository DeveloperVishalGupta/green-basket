// Deprecated: constants moved to API-driven enums. Keep this file as a minimal placeholder
// to avoid breaking imports during migration. Do not add new constants here.

export const DEPRECATED_CONSTANTS_REMOVED = true;

export const DEFAULT_CACHE_TIME = 10; // 10 milliseconds

export const USER_ROLES = [
  { value: "Super", label: "Super Admin" },
  { value: "Admin", label: "Admin" },
  { value: "Employee", label: "Employee" },
  { value: "Finance", label: "Finance" },
  { value: "User", label: "User" },
  { value: "Guest", label: "Guest" },
];

export const termsOfService = {
  title: "Terms of Service",
  lastUpdated: "July 2026",
  sections: [
    {
      id: 1,
      title: "Acceptance of Terms",
      content: [
        "Welcome to Green Basket. By accessing or using our website, mobile application, or related services, you agree to be bound by these Terms of Service. If you do not agree with these terms, please do not use our platform.",
      ],
    },
    {
      id: 2,
      title: "Our Services",
      content: [
        "Green Basket is an online platform that enables customers to order fresh vegetables, fruits, and other grocery essentials for home delivery.",
      ],
      list: [
        "Provide accurate and complete information while placing orders.",
        "Use the platform only for lawful purposes.",
        "Do not misuse, disrupt, or attempt to interfere with the website or mobile application.",
        "Do not place fraudulent or fake orders.",
        "Do not use automated tools, bots, or scripts without permission.",
      ],
    },
    {
      id: 3,
      title: "Account Registration",
      content: ["Some features may require you to create an account."],
      list: [
        "Maintain the confidentiality of your login credentials.",
        "You are responsible for all activities under your account.",
        "Provide accurate contact and delivery information.",
        "Notify us immediately if you suspect unauthorized access.",
      ],
    },
    {
      id: 4,
      title: "Product Availability",
      content: [
        "Our products include fresh vegetables, fruits, and grocery items.",
      ],
      list: [
        "Availability depends on seasonal supply and stock.",
        "Some products may become unavailable after an order is placed.",
        "Unavailable products may be substituted with your approval or refunded.",
      ],
    },
    {
      id: 5,
      title: "Product Quality",
      content: ["We strive to deliver fresh and high-quality produce."],
      list: [
        "Product size, shape, color, and weight may naturally vary.",
        "Images are for illustration purposes only.",
        "Minor variations are not considered defects.",
        "Damaged or incorrect products should be reported within the allowed complaint period.",
      ],
    },
    {
      id: 6,
      title: "Pricing and Payments",
      list: [
        "All prices are displayed in Indian Rupees (₹).",
        "Prices may change without prior notice.",
        "Taxes and delivery charges are shown before checkout.",
        "Orders are confirmed only after successful payment or COD confirmation.",
      ],
    },
    {
      id: 7,
      title: "Delivery Policy",
      content: [
        "We aim to deliver your order within the estimated delivery time.",
      ],
      list: [
        "Weather conditions.",
        "Traffic or road closures.",
        "High order volumes.",
        "Unexpected operational issues.",
        "Customers must provide a complete delivery address.",
      ],
    },
    {
      id: 8,
      title: "Order Cancellation",
      content: ["Orders can be cancelled before packing or dispatch."],
      list: [
        "Packed or shipped orders may not be cancelled.",
        "Green Basket may cancel orders due to stock issues.",
        "Pricing errors.",
        "Fraud detection.",
        "Technical issues.",
        "Eligible refunds will be processed according to the Refund Policy.",
      ],
    },
    {
      id: 9,
      title: "Returns and Refunds",
      list: [
        "Returns are generally not accepted for perishable items.",
        "Refunds or replacements are available for damaged, spoiled, missing, or incorrect products.",
        "Claims must be submitted within the specified refund period.",
      ],
    },
    {
      id: 10,
      title: "Intellectual Property",
      content: [
        "All content including logos, images, graphics, text, software, and designs belongs to Green Basket and is protected under applicable intellectual property laws.",
      ],
    },
    {
      id: 11,
      title: "User Responsibilities",
      list: [
        "Do not provide false information.",
        "Do not misuse coupons or promotional offers.",
        "Do not attempt unauthorized system access.",
        "Do not upload malicious software.",
        "Follow all applicable laws.",
      ],
    },
    {
      id: 12,
      title: "Limitation of Liability",
      list: [
        "Green Basket is not responsible for delays beyond our control.",
        "Natural variations in fresh produce are expected.",
        "We are not liable for indirect or consequential damages.",
        "Our maximum liability is limited to the amount paid for the affected order.",
      ],
    },
    {
      id: 13,
      title: "Privacy",
      content: [
        "Your personal information is collected and processed according to our Privacy Policy for order processing, delivery, and customer support.",
      ],
    },
    {
      id: 14,
      title: "Changes to Terms",
      content: [
        "We may update these Terms of Service at any time. Continued use of Green Basket means you accept the revised terms.",
      ],
    },
    {
      id: 15,
      title: "Contact Us",
      content: [
        "If you have questions about these Terms of Service, please contact our customer support through the Green Basket website or mobile application.",
      ],
    },
  ],
};
