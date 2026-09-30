import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Category from '../src/models/Category.js';
import Order from '../src/models/Order.js';
import Product from '../src/models/Product.js';
import User from '../src/models/User.js';

dotenv.config();

/**
 * Seed Test Data Script
 * Creates sample categories, products, users, and orders for testing
 * Run: node scripts/seedData.js
 */
async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Create admin user
    console.log('👤 Creating users...');
    let admin = await User.findOne({ email: 'admin@greenbasket.com' });
    if (!admin) {
      admin = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@greenbasket.com',
        password: 'admin123456',
        phone: '1234567890',
        role: 'admin',
        isVerified: true,
        isActive: true,
      });
      console.log('   ✓ Admin user created');
    } else {
      console.log('   ℹ Admin user already exists');
    }

    // Create test customers
    const customers = [];
    for (let i = 1; i <= 5; i++) {
      let customer = await User.findOne({ email: `customer${i}@test.com` });
      if (!customer) {
        customer = await User.create({
          firstName: `Customer${i}`,
          lastName: 'Test',
          email: `customer${i}@test.com`,
          password: 'test123456',
          phone: `123456789${i}`,
          role: 'customer',
          isVerified: true,
          isActive: true,
        });
        console.log(`   ✓ Customer ${i} created`);
      } else {
        console.log(`   ℹ Customer ${i} already exists`);
      }
      customers.push(customer);
    }

    // Create categories
    console.log('\n📁 Creating categories...');
    const categoryData = [
      { name: "Women's Fashion", description: 'Latest fashion for women' },
      { name: "Men's Fashion", description: 'Trending styles for men' },
      { name: 'Accessories', description: 'Fashion accessories' },
      { name: 'Footwear', description: 'Shoes and sandals' },
      { name: 'Kids Fashion', description: 'Clothing for children' },
    ];

    const categories = [];
    for (const catData of categoryData) {
      let category = await Category.findOne({ name: catData.name });
      if (!category) {
        category = await Category.create(catData);
        console.log(`   ✓ Category "${catData.name}" created`);
      } else {
        console.log(`   ℹ Category "${catData.name}" already exists`);
      }
      categories.push(category);
    }

    // Create products
    console.log('\n📦 Creating products...');
    const productData = [
      {
        name: 'Cotton T-Shirt',
        description: 'Comfortable cotton t-shirt for everyday wear',
        price: 299,
        compareAtPrice: 499,
        stock: 100,
        category: categories[0]._id,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['White', 'Black', 'Blue'],
        isFeatured: true,
      },
      {
        name: 'Denim Jeans',
        description: 'Classic denim jeans with perfect fit',
        price: 1299,
        compareAtPrice: 1999,
        stock: 50,
        category: categories[0]._id,
        sizes: ['28', '30', '32', '34', '36'],
        colors: ['Blue', 'Black'],
        isFeatured: true,
      },
      {
        name: 'Formal Shirt',
        description: 'Premium formal shirt for office wear',
        price: 899,
        compareAtPrice: 1299,
        stock: 75,
        category: categories[1]._id,
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['White', 'Blue', 'Black'],
        isFeatured: false,
      },
      {
        name: 'Casual Sneakers',
        description: 'Comfortable sneakers for daily use',
        price: 1599,
        compareAtPrice: 2499,
        stock: 30,
        category: categories[3]._id,
        sizes: ['7', '8', '9', '10', '11'],
        colors: ['White', 'Black', 'Grey'],
        isFeatured: true,
      },
      {
        name: 'Leather Wallet',
        description: 'Genuine leather wallet with multiple compartments',
        price: 599,
        compareAtPrice: 999,
        stock: 200,
        category: categories[2]._id,
        colors: ['Brown', 'Black'],
        isFeatured: false,
      },
      {
        name: 'Summer Dress',
        description: 'Light and breezy summer dress',
        price: 1499,
        compareAtPrice: 2299,
        stock: 40,
        category: categories[0]._id,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Floral', 'Blue', 'Pink'],
        isFeatured: true,
      },
      {
        name: 'Sports Jacket',
        description: 'Waterproof sports jacket',
        price: 2499,
        compareAtPrice: 3999,
        stock: 25,
        category: categories[1]._id,
        sizes: ['M', 'L', 'XL', 'XXL'],
        colors: ['Black', 'Navy', 'Red'],
        isFeatured: false,
      },
      {
        name: 'Kids T-Shirt',
        description: 'Soft cotton t-shirt for kids',
        price: 199,
        compareAtPrice: 349,
        stock: 150,
        category: categories[4]._id,
        sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'],
        colors: ['Red', 'Blue', 'Yellow'],
        isFeatured: false,
      },
      {
        name: 'Sunglasses',
        description: 'UV protected sunglasses',
        price: 799,
        compareAtPrice: 1299,
        stock: 100,
        category: categories[2]._id,
        colors: ['Black', 'Brown'],
        isFeatured: true,
      },
      {
        name: 'Running Shoes',
        description: 'Professional running shoes',
        price: 2999,
        compareAtPrice: 4499,
        stock: 20,
        category: categories[3]._id,
        sizes: ['7', '8', '9', '10', '11'],
        colors: ['Black', 'White', 'Blue'],
        isFeatured: true,
      },
    ];

    const products = [];
    for (const prodData of productData) {
      let product = await Product.findOne({ name: prodData.name });
      if (!product) {
        product = await Product.create({
          ...prodData,
          vendor: admin._id,
        });
        console.log(`   ✓ Product "${prodData.name}" created`);
      } else {
        console.log(`   ℹ Product "${prodData.name}" already exists`);
      }
      products.push(product);
    }

    // Create sample orders
    console.log('\n📋 Creating sample orders...');
    const orderStatuses = ['delivered', 'processing', 'shipped', 'pending', 'cancelled'];
    const paymentMethods = ['cod', 'card', 'upi'];
    
    let ordersCreated = 0;
    for (let i = 0; i < 15; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const numItems = Math.floor(Math.random() * 3) + 1;
      const orderItems = [];
      let subtotal = 0;

      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 2) + 1;
        const itemSubtotal = product.price * quantity;
        
        orderItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity,
          size: product.sizes ? product.sizes[0] : undefined,
          color: product.colors ? product.colors[0] : undefined,
          subtotal: itemSubtotal,
        });
        
        subtotal += itemSubtotal;
      }

      const tax = subtotal * 0.18;
      const shippingFee = subtotal > 1000 ? 0 : 50;
      const discount = Math.random() > 0.7 ? subtotal * 0.1 : 0;
      const total = subtotal + tax + shippingFee - discount;

      const orderData = {
        user: customer._id,
        items: orderItems,
        shippingAddress: {
          street: `${Math.floor(Math.random() * 999) + 1} Main Street`,
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India',
        },
        payment: {
          method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          status: 'completed',
          transactionId: `TXN${Date.now()}${i}`,
        },
        pricing: {
          subtotal,
          tax,
          shippingFee,
          discount,
          total,
        },
        status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
      };

      await Order.create(orderData);
      ordersCreated++;
      
      if (ordersCreated % 5 === 0) {
        console.log(`   ✓ ${ordersCreated} orders created...`);
      }
    }
    console.log(`   ✓ Total ${ordersCreated} orders created`);

    console.log('\n🎉 Test data seeded successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('📊 Summary:');
    console.log(`   Users:      ${customers.length + 1} (${customers.length} customers + 1 admin)`);
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Products:   ${products.length}`);
    console.log(`   Orders:     ${ordersCreated}`);
    console.log('═══════════════════════════════════════\n');


    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the script
seedData();
