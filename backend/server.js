const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category');
const productRoutes = require('./routes/product');
const braintreeRoutes = require('./routes/braintree');
const orderRoutes = require('./routes/order');

// Initialize app
const app = express();

// ======================
// MongoDB Connection
// ======================
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully');
  } catch (err) {
    console.log('❌ MongoDB Connection Failed');
    console.error(err);
  }
};

connectDB();

// ======================
// Middlewares
// ======================
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:3000',
];
if (process.env.CLIENT_URL) {
  const cleanClientUrl = process.env.CLIENT_URL.trim().replace(/\/$/, "");
  allowedOrigins.push(cleanClientUrl);
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      const cleanOrigin = origin.trim().replace(/\/$/, "");
      
      // Allow if it matches allowedOrigins or is a Vercel deployment
      if (allowedOrigins.includes(cleanOrigin) || cleanOrigin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      
      console.log(`⚠️ Blocked by CORS: Origin '${origin}' is not allowed.`);
      return callback(null, false);
    },
    credentials: true,
  })
);

// ======================
// API Routes
// ======================
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', categoryRoutes);
app.use('/api', productRoutes);
app.use('/api', braintreeRoutes);
app.use('/api', orderRoutes);

// ======================
// Production Build
// ======================
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));

  app.get('*splat', (req, res) => {
    res.sendFile(
      path.resolve(__dirname, 'client', 'build', 'index.html')
    );
  });
}

// ======================
// Start Server
// ======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});