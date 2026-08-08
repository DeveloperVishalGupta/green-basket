import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Category from '../src/models/Category.js';
import Product from '../src/models/Product.js';
import User from '../src/models/User.js';

dotenv.config();

/**
 * Seed Grocery Data Script
 * Creates sample vegetable and fruit categories with products
 * Run: node scripts/seedGroceryData.js
 */

const groceryCategories = [
  { name: 'Leafy Vegetables', description: 'Fresh leafy vegetables like spinach, lettuce, kale' },
  { name: 'Root Vegetables', description: 'Root vegetables like carrots, beets, turnips' },
  { name: 'Bulb Vegetables', description: 'Bulb vegetables like onions, garlic' },
  { name: 'Fruit Vegetables', description: 'Vegetables that are botanically fruits like tomatoes, peppers' },
  { name: 'Gourds & Squash', description: 'Gourds and squash varieties' },
  { name: 'Stem Vegetables', description: 'Stem vegetables like asparagus, broccoli' },
  { name: 'Flower Vegetables', description: 'Flower vegetables like cauliflower, broccoli' },
  { name: 'Pod & Seed Vegetables', description: 'Pod and seed vegetables like peas, beans' },
  { name: 'Tuber Vegetables', description: 'Tuber vegetables like potatoes, yam' },
  { name: 'Chillies & Peppers', description: 'Various chillies and peppers' },
  { name: 'Spices & Flavor Vegetables', description: 'Herbs and flavor vegetables' },
  { name: 'Specialty Vegetables', description: 'Specialty and exotic vegetables' },
  { name: 'Fresh Fruits', description: 'Fresh tropical and seasonal fruits' },
  { name: 'Seasonal Fruits', description: 'Fruits available in current season' },
  { name: 'Organic Products', description: 'Certified organic vegetables and fruits' },
];

const groceryProducts = [
  // Leafy Vegetables
  {
    categoryName: 'Leafy Vegetables',
    products: [
      {
        name: 'Fresh Spinach',
        description: 'Tender green spinach leaves, packed with iron and nutrients',
        price: 45,
        compareAtPrice: 60,
        stock: 150,
        unit: 'bunch',
        isOrganic: true,
        isSeasonalFresh: true,
        isBestSelling: true,
        nutritionalInfo: {
          calories: '23',
          protein: '2.7g',
          carbohydrates: '3.6g',
          fat: '0.4g',
          fiber: '2.2g',
          vitamins: ['A', 'K', 'C'],
          minerals: ['Iron', 'Calcium'],
        },
        storageInstructions: 'Store in refrigerator in airtight container for up to 5 days',
        benefits: ['High in iron', 'Rich in antioxidants', 'Supports bone health', 'Aids digestion'],
      },
      {
        name: 'Fresh Kale',
        description: 'Curly kale rich in vitamins and minerals',
        price: 65,
        compareAtPrice: 85,
        stock: 100,
        unit: 'bunch',
        isOrganic: true,
        nutritionalInfo: {
          calories: '49',
          protein: '4.3g',
          carbohydrates: '9g',
          fat: '0.9g',
          fiber: '3.6g',
          vitamins: ['A', 'C', 'K'],
          minerals: ['Calcium', 'Iron'],
        },
        storageInstructions: 'Store in vegetable drawer of refrigerator for 3-5 days',
        benefits: ['Super nutritious', 'Anti-inflammatory', 'Heart healthy', 'Supports digestion'],
      },
    ],
  },
  // Root Vegetables
  {
    categoryName: 'Root Vegetables',
    products: [
      {
        name: 'Fresh Carrots',
        description: 'Crisp and sweet orange carrots, perfect for cooking and raw consumption',
        price: 35,
        compareAtPrice: 50,
        stock: 200,
        unit: 'kg',
        isSeasonalFresh: true,
        isBestSelling: true,
        nutritionalInfo: {
          calories: '41',
          protein: '0.9g',
          carbohydrates: '10g',
          fat: '0.2g',
          fiber: '2.8g',
          vitamins: ['A', 'C', 'K'],
          minerals: ['Potassium'],
        },
        storageInstructions: 'Store in cool, dark place or refrigerator for 2-3 weeks',
        benefits: ['Rich in beta-carotene', 'Improves eye health', 'Good for skin', 'Aids digestion'],
      },
      {
        name: 'Fresh Beets',
        description: 'Sweet and earthy beetroots, great for salads and juices',
        price: 55,
        compareAtPrice: 75,
        stock: 120,
        unit: 'kg',
        isOrganic: false,
        nutritionalInfo: {
          calories: '43',
          protein: '1.7g',
          carbohydrates: '10g',
          fat: '0.2g',
          fiber: '2.8g',
          vitamins: ['C', 'B9'],
          minerals: ['Manganese', 'Folate'],
        },
        storageInstructions: 'Store in refrigerator for up to 3 weeks',
        benefits: ['Improves blood flow', 'Rich in antioxidants', 'Supports liver health'],
      },
    ],
  },
  // Bulb Vegetables
  {
    categoryName: 'Bulb Vegetables',
    products: [
      {
        name: 'Fresh Onions',
        description: 'Sweet and pungent onions, essential for Indian cooking',
        price: 30,
        compareAtPrice: 45,
        stock: 300,
        unit: 'kg',
        isBestSelling: true,
        nutritionalInfo: {
          calories: '40',
          protein: '1.1g',
          carbohydrates: '9g',
          fat: '0.1g',
          fiber: '1.7g',
          vitamins: ['C'],
          minerals: ['Manganese'],
        },
        storageInstructions: 'Store in cool, dark, well-ventilated area for up to 1 month',
        benefits: ['Boosts immunity', 'Anti-inflammatory', 'Good for digestive health'],
      },
      {
        name: 'Fresh Garlic',
        description: 'Pungent and aromatic garlic cloves, perfect for flavoring',
        price: 80,
        compareAtPrice: 120,
        stock: 150,
        unit: 'kg',
        isBestSelling: true,
        nutritionalInfo: {
          calories: '149',
          protein: '6.4g',
          carbohydrates: '33g',
          fat: '0.5g',
          fiber: '2.1g',
          vitamins: ['C', 'B6'],
          minerals: ['Manganese', 'Selenium'],
        },
        storageInstructions: 'Store in cool, dark place for up to 2 months',
        benefits: ['Boosts immunity', 'Antibacterial properties', 'Heart healthy', 'Rich in antioxidants'],
      },
    ],
  },
  // Fruit Vegetables
  {
    categoryName: 'Fruit Vegetables',
    products: [
      {
        name: 'Fresh Tomatoes',
        description: 'Ripe and juicy tomatoes, perfect for cooking and salads',
        price: 40,
        compareAtPrice: 60,
        stock: 200,
        unit: 'kg',
        isBestSelling: true,
        nutritionalInfo: {
          calories: '18',
          protein: '0.9g',
          carbohydrates: '3.9g',
          fat: '0.2g',
          fiber: '1.2g',
          vitamins: ['C', 'K'],
          minerals: ['Potassium'],
        },
        storageInstructions: 'Store at room temperature, away from direct sunlight, for 1-2 weeks',
        benefits: ['Rich in lycopene', 'Heart healthy', 'Supports bone health', 'Aids digestion'],
      },
      {
        name: 'Fresh Bell Peppers',
        description: 'Colorful and sweet bell peppers available in red, yellow, and green',
        price: 90,
        compareAtPrice: 130,
        stock: 100,
        unit: 'kg',
        nutritionalInfo: {
          calories: '31',
          protein: '1g',
          carbohydrates: '6g',
          fat: '0.3g',
          fiber: '2.2g',
          vitamins: ['C', 'A', 'B6'],
          minerals: ['Potassium'],
        },
        storageInstructions: 'Store in refrigerator for up to 2 weeks',
        benefits: ['High in vitamin C', 'Supports eye health', 'Boosts immunity', 'Anti-inflammatory'],
      },
    ],
  },
  // Fresh Fruits
  {
    categoryName: 'Fresh Fruits',
    products: [
      {
        name: 'Fresh Apples',
        description: 'Crisp and sweet apples, delicious as snack or dessert',
        price: 120,
        compareAtPrice: 160,
        stock: 150,
        unit: 'kg',
        isBestSelling: true,
        nutritionalInfo: {
          calories: '52',
          protein: '0.3g',
          carbohydrates: '14g',
          fat: '0.2g',
          fiber: '2.4g',
          vitamins: ['C'],
          minerals: ['Potassium'],
        },
        storageInstructions: 'Store in refrigerator for up to 1 month',
        benefits: ['Good for heart health', 'Aids weight loss', 'Improves digestion', 'Rich in fiber'],
      },
      {
        name: 'Fresh Bananas',
        description: 'Ripe and creamy bananas, rich in potassium',
        price: 50,
        compareAtPrice: 70,
        stock: 200,
        unit: 'kg',
        isBestSelling: true,
        nutritionalInfo: {
          calories: '89',
          protein: '1.1g',
          carbohydrates: '23g',
          fat: '0.3g',
          fiber: '2.6g',
          vitamins: ['C', 'B6'],
          minerals: ['Potassium'],
        },
        storageInstructions: 'Store at room temperature until ripe, then refrigerate',
        benefits: ['Rich in potassium', 'Aids digestion', 'Boosts energy', 'Good for mood'],
      },
      {
        name: 'Fresh Oranges',
        description: 'Juicy and sweet oranges, perfect for fresh juice',
        price: 70,
        compareAtPrice: 100,
        stock: 120,
        unit: 'kg',
        nutritionalInfo: {
          calories: '47',
          protein: '0.9g',
          carbohydrates: '12g',
          fat: '0.3g',
          fiber: '2.4g',
          vitamins: ['C'],
          minerals: ['Folate'],
        },
        storageInstructions: 'Store at room temperature or refrigerator for 2-3 weeks',
        benefits: ['High in vitamin C', 'Boosts immunity', 'Supports heart health', 'Aids iron absorption'],
      },
    ],
  },
  // Organic Products
  {
    categoryName: 'Organic Products',
    products: [
      {
        name: 'Organic Tomatoes',
        description: 'Certified organic tomatoes, pesticide-free and naturally grown',
        price: 80,
        compareAtPrice: 120,
        stock: 100,
        unit: 'kg',
        isOrganic: true,
        isBestSelling: true,
        nutritionalInfo: {
          calories: '18',
          protein: '0.9g',
          carbohydrates: '3.9g',
          fat: '0.2g',
          fiber: '1.2g',
          vitamins: ['C', 'K'],
          minerals: ['Potassium'],
        },
        storageInstructions: 'Store at room temperature for 1-2 weeks',
        benefits: ['100% pesticide-free', 'Rich in antioxidants', 'Heart healthy', 'Better nutritional value'],
      },
      {
        name: 'Organic Spinach',
        description: 'Certified organic spinach, grown without harmful pesticides',
        price: 90,
        compareAtPrice: 140,
        stock: 80,
        unit: 'bunch',
        isOrganic: true,
        nutritionalInfo: {
          calories: '23',
          protein: '2.7g',
          carbohydrates: '3.6g',
          fat: '0.4g',
          fiber: '2.2g',
          vitamins: ['A', 'K', 'C'],
          minerals: ['Iron', 'Calcium'],
        },
        storageInstructions: 'Store in refrigerator for up to 5 days',
        benefits: ['Certified organic', 'No synthetic pesticides', 'Superior nutrition', 'Eco-friendly'],
      },
    ],
  },
];

async function seedGroceryData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get admin user for vendor
    let admin = await User.findOne({ email: 'admin@example.com' });
    if (!admin) {
      admin = await User.findOne({ role: 'admin' });
    }
    if (!admin) {
      console.log('⚠️  No admin user found. Creating one...');
      admin = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@greenbasket.com',
        password: 'admin123456',
        phone: '9999999999',
        role: 'admin',
        isVerified: true,
        isActive: true,
      });
      console.log('✓ Admin user created');
    }

    // Create grocery categories
    console.log('\n📁 Creating Grocery Categories...\n');
    const categoryMap = {};
    
    for (const catData of groceryCategories) {
      let category = await Category.findOne({ name: catData.name });
      if (!category) {
        category = await Category.create({
          name: catData.name,
          slug: catData.name.toLowerCase().replace(/\s+/g, '-'),
          description: catData.description,
          isActive: true,
          displayOrder: groceryCategories.indexOf(catData),
        });
        console.log(`✓ Category "${catData.name}" created`);
      } else {
        console.log(`ℹ Category "${catData.name}" already exists`);
      }
      categoryMap[catData.name] = category._id;
    }

    // Create products
    console.log('\n📦 Creating Grocery Products...\n');
    let productCount = 0;

    for (const categoryGroup of groceryProducts) {
      const categoryId = categoryMap[categoryGroup.categoryName];
      
      for (const productData of categoryGroup.products) {
        let product = await Product.findOne({ 
          name: productData.name,
          category: categoryId,
        });

        if (!product) {
          product = await Product.create({
            ...productData,
            slug: productData.name.toLowerCase().replace(/\s+/g, '-'),
            category: categoryId,
            vendor: admin._id,
            isActive: true,
            images: [
              {
                url: `https://via.placeholder.com/300x300?text=${encodeURIComponent(productData.name)}`,
                alt: productData.name,
              },
            ],
            sku: `SKU-${productData.name.replace(/\s+/g, '-').toUpperCase()}-${Date.now()}`,
          });
          productCount++;
          console.log(`✓ Product "${productData.name}" created`);
        } else {
          console.log(`ℹ Product "${productData.name}" already exists`);
        }
      }
    }

    console.log(`\n✅ Grocery data seeding completed!`);
    console.log(`   • Categories created: ${Object.keys(categoryMap).length}`);
    console.log(`   • Products created: ${productCount}`);
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

seedGroceryData();
