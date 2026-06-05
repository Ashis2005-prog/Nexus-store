const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User    = require('./models/User');
const Product = require('./models/Product');
const Order   = require('./models/Order');

const PRODUCTS = [
  { name: 'Phantom X Pro Monitor', category: 'Electronics', price: 1299, stock: 14, image: '🖥️', description: 'Ultra-performance workstation monitor with HDR1000 and 240Hz refresh rate.', rating: 4.8, numReviews: 312, isFeatured: true },
  { name: 'Zephyr ANC Earbuds',    category: 'Audio',       price: 249,  stock: 53, image: '🎧', description: 'True wireless earbuds with adaptive noise cancellation and 32h battery.', rating: 4.6, numReviews: 874 },
  { name: 'NovaSkin Laptop',       category: 'Electronics', price: 1899, stock: 8,  image: '💻', description: 'Featherlight laptop with OLED display, M3 chip, and all-day battery.', rating: 4.9, numReviews: 1203, isFeatured: true },
  { name: 'Aura Smart Watch',      category: 'Wearables',   price: 349,  stock: 27, image: '⌚', description: 'Health-tracking smartwatch with ECG, SpO2, and 7-day battery life.', rating: 4.5, numReviews: 590 },
  { name: 'CloudShot Camera',      category: 'Photography', price: 799,  stock: 6,  image: '📷', description: 'Mirrorless 45MP camera with in-body stabilization and 8K video.', rating: 4.7, numReviews: 240, isFeatured: true },
  { name: 'Vertex Keyboard',       category: 'Peripherals', price: 179,  stock: 41, image: '⌨️', description: 'Mechanical keyboard with hot-swap switches and per-key RGB lighting.', rating: 4.4, numReviews: 1087 },
  { name: 'Arc Gaming Mouse',      category: 'Peripherals', price: 89,   stock: 62, image: '🖱️', description: 'Ultra-lightweight gaming mouse with 26K DPI sensor and 70h battery.', rating: 4.6, numReviews: 2341 },
  { name: 'SoundBar Pro 7',        category: 'Audio',       price: 599,  stock: 19, image: '🔊', description: 'Dolby Atmos soundbar with rear satellite speakers and wireless subwoofer.', rating: 4.7, numReviews: 408 },
];

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');

  // Clear existing data
  await User.deleteMany();
  await Product.deleteMany();
  await Order.deleteMany();
  console.log('🗑  Cleared existing data');

  // Create users (passwords will be hashed by pre-save hook)
  const admin = await User.create({ name: 'Admin User',  email: 'admin@nexus.dev', password: 'admin123', role: 'admin' });
  const user  = await User.create({ name: 'Alex Johnson', email: 'user@nexus.dev',  password: 'user123',  role: 'user' });
  console.log('👤 Created users');

  // Create products
  const products = await Product.insertMany(PRODUCTS);
  console.log(`📦 Created ${products.length} products`);

  // Create sample orders
  await Order.create({
    user: user._id,
    items: [
      { product: products[1]._id, name: products[1].name, image: products[1].image, price: products[1].price, qty: 1 },
      { product: products[6]._id, name: products[6].name, image: products[6].image, price: products[6].price, qty: 2 },
    ],
    shippingAddress: { street: '123 Main St', city: 'New York', state: 'NY', zip: '10001' },
    paymentMethod: 'Card',
    status: 'Delivered',
    isPaid: true,
    paidAt: new Date('2025-05-01'),
    deliveredAt: new Date('2025-05-05'),
  });

  await Order.create({
    user: user._id,
    items: [
      { product: products[2]._id, name: products[2].name, image: products[2].image, price: products[2].price, qty: 1 },
    ],
    shippingAddress: { street: '123 Main St', city: 'New York', state: 'NY', zip: '10001' },
    paymentMethod: 'Card',
    status: 'Shipped',
    isPaid: true,
    paidAt: new Date('2025-05-28'),
  });

  console.log('🛒 Created sample orders');
  console.log('\n✅ Seed complete!\n');
  console.log('  Admin → admin@nexus.dev  / admin123');
  console.log('  User  → user@nexus.dev   / user123\n');
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
