/**
 * DATABASE VIEWER SCRIPT
 * Run: node checkdb.js
 * Shows all users, products, categories, and orders in your MongoDB
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');
const Product = require('./models/product');
const Category = require('./models/category');
const { Order } = require('./models/order');

const line = '─'.repeat(50);

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('\n✅ Connected to MongoDB Atlas');
  console.log(`📦 Database: mernecommerce\n`);

  // ─── USERS ───────────────────────────────────────────
  const users = await User.find({}).select('name email role createdAt');
  console.log(`\n👥 USERS (${users.length} total)`);
  console.log(line);
  if (users.length === 0) {
    console.log('  No users found.');
  } else {
    users.forEach((u, i) => {
      console.log(`  ${i + 1}. ${u.name}`);
      console.log(`     Email : ${u.email}`);
      console.log(`     Role  : ${u.role === 1 ? '🔑 Admin' : '👤 User'}`);
      console.log(`     Joined: ${new Date(u.createdAt).toLocaleString()}`);
      console.log(`     ID    : ${u._id}`);
      if (i < users.length - 1) console.log('');
    });
  }

  // ─── CATEGORIES ──────────────────────────────────────
  const categories = await Category.find({});
  console.log(`\n\n🏷️  CATEGORIES (${categories.length} total)`);
  console.log(line);
  if (categories.length === 0) {
    console.log('  No categories found.');
  } else {
    categories.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.name}  (ID: ${c._id})`);
    });
  }

  // ─── PRODUCTS ────────────────────────────────────────
  const products = await Product.find({}).select('name price quantity sold category').populate('category', 'name');
  console.log(`\n\n📦 PRODUCTS (${products.length} total)`);
  console.log(line);
  if (products.length === 0) {
    console.log('  No products found.');
  } else {
    products.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name}`);
      console.log(`     Price   : $${p.price}`);
      console.log(`     Qty     : ${p.quantity} | Sold: ${p.sold}`);
      console.log(`     Category: ${p.category?.name || 'N/A'}`);
      console.log(`     ID      : ${p._id}`);
      if (i < products.length - 1) console.log('');
    });
  }

  // ─── ORDERS ──────────────────────────────────────────
  const orders = await Order.find({}).populate('user', 'name email');
  console.log(`\n\n🛒 ORDERS (${orders.length} total)`);
  console.log(line);
  if (orders.length === 0) {
    console.log('  No orders found.');
  } else {
    orders.forEach((o, i) => {
      console.log(`  ${i + 1}. Order ID: ${o._id}`);
      console.log(`     User    : ${o.user?.name} (${o.user?.email})`);
      console.log(`     Amount  : $${o.amount}`);
      console.log(`     Status  : ${o.status}`);
      console.log(`     Date    : ${new Date(o.createdAt).toLocaleString()}`);
      if (i < orders.length - 1) console.log('');
    });
  }

  console.log('\n' + line);
  console.log('✅ Done\n');
  mongoose.disconnect();

}).catch(err => {
  console.error('❌ Connection error:', err.message);
  process.exit(1);
});
