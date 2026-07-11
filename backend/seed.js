const mongoose = require('mongoose');
const https = require('https');
require('dotenv').config();

const User = require('./models/user');
const Category = require('./models/category');
const Product = require('./models/product');

// Helper to download an image as a Buffer
const downloadImage = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
      }
      const data = [];
      res.on('data', (chunk) => data.push(chunk));
      res.on('end', () => resolve(Buffer.concat(data)));
    }).on('error', reject);
  });
};

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for Seeding');

    // Clear existing data to prevent duplicates
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data.');

    // 1. Create Admin User
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 1 
    });
    await adminUser.save();
    console.log('Admin user created: admin@example.com / password123');
    
    // 2. Create Regular User
    const regUser = new User({
      name: 'Regular User',
      email: 'user@example.com',
      password: 'password123',
      role: 0 
    });
    await regUser.save();
    console.log('Regular user created: user@example.com / password123');

    // 3. Create Categories
    const catElectronics = new Category({ name: 'Electronics' });
    const catBooks = new Category({ name: 'Books' });
    const catClothing = new Category({ name: 'Clothing' });
    const catHome = new Category({ name: 'Home & Kitchen' });
    const catFitness = new Category({ name: 'Fitness & Outdoors' });
    const catBeauty = new Category({ name: 'Beauty & Personal Care' });
    
    await catElectronics.save();
    await catBooks.save();
    await catClothing.save();
    await catHome.save();
    await catFitness.save();
    await catBeauty.save();
    console.log('Categories created.');

    // 4. Define Products with Real Object Image URLs
    const productData = [
      {
        name: 'MacBook Pro M2 14-inch',
        description: 'Apple M2 Pro chip with 10‑core CPU and 16‑core GPU, 16GB Memory, 512GB SSD Storage.',
        price: 1999,
        category: catElectronics._id,
        quantity: 10,
        shipping: true,
        imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80'
      },
      {
        name: 'Sony WH-1000XM5 Headphones',
        description: 'Industry leading noise canceling headphones. Enjoy uncompromised sound quality.',
        price: 398,
        category: catElectronics._id,
        quantity: 50,
        shipping: true,
        imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=1000&q=80'
      },
      {
        name: 'Mechanical Gaming Keyboard',
        description: 'RGB Back-lit, Clicky Blue Switches, Aluminum Frame, Detachable USB-C.',
        price: 89,
        category: catElectronics._id,
        quantity: 120,
        shipping: true,
        imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1000&q=80'
      },
      {
        name: 'Smartwatch Series 8 Pro',
        description: 'Stay connected in style. Heart rate tracking, blood oxygen levels, and multi-sport mode tracking with a 7-day battery life.',
        price: 249,
        category: catElectronics._id,
        quantity: 40,
        shipping: true,
        imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1000&q=80'
      },
      {
        name: 'Wireless ANC Earbuds',
        description: 'True wireless earbuds with smart active noise cancellation, water resistance, and up to 30 hours of battery life with charging case.',
        price: 129,
        category: catElectronics._id,
        quantity: 80,
        shipping: true,
        imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80'
      },
      {
        name: 'Clean Code: A Handbook',
        description: 'Even bad code can function. But if code is not clean, it can bring a development organization to its knees.',
        price: 45,
        category: catBooks._id,
        quantity: 100,
        shipping: true,
        imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=1000&q=80'
      },
      {
        name: 'Design Patterns',
        description: 'Elements of Reusable Object-Oriented Software. The definitive guide.',
        price: 55,
        category: catBooks._id,
        quantity: 30,
        shipping: true,
        imageUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&w=1000&q=80'
      },
      {
        name: 'Premium Cotton T-Shirt',
        description: 'Incredibly soft 100% organic cotton crew neck t-shirt. Breathable and perfect for an everyday fit.',
        price: 25,
        category: catClothing._id,
        quantity: 200,
        shipping: true,
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=80'
      },
      {
        name: 'Classic Vintage Denim Jacket',
        description: 'Timeless light wash denim jacket with a relaxed fit and durable construction.',
        price: 75,
        category: catClothing._id,
        quantity: 45,
        shipping: true,
        imageUrl: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=1000&q=80'
      },
      {
        name: 'Premium Leather Backpack',
        description: 'Handcrafted top-grain leather backpack featuring a padded laptop compartment and heavy-duty steel zippers.',
        price: 120,
        category: catClothing._id,
        quantity: 25,
        shipping: true,
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80'
      },
      {
        name: 'Ultra-Light Running Shoes',
        description: 'Highly breathable mesh upper running shoes with responsive cushioning for maximum energy return.',
        price: 85,
        category: catClothing._id,
        quantity: 80,
        shipping: true,
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80'
      },
      {
        name: 'Ceramic Pour Over Coffee Maker',
        description: 'V60 style ceramic pour over brewer. Experience a rich, flavorful cup of coffee every morning.',
        price: 22,
        category: catHome._id,
        quantity: 150,
        shipping: true,
        imageUrl: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?auto=format&fit=crop&w=1000&q=80'
      },
      {
        name: 'Organic Dark Roast Coffee Beans',
        description: '100% Arabica whole bean coffee. Rich body with chocolatey notes, ethically sourced from single-origin farms.',
        price: 18,
        category: catHome._id,
        quantity: 200,
        shipping: true,
        imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1000&q=80'
      },
      {
        name: 'Ergonomic Office Chair',
        description: 'High-back office chair with adjustable lumbar support, 3D armrests, and breathable mesh backrest for ultimate comfort.',
        price: 189,
        category: catHome._id,
        quantity: 15,
        shipping: true,
        imageUrl: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=1000&q=80'
      },
      {
        name: 'Hydro-Insulated Water Bottle',
        description: 'Double-walled stainless steel water bottle. Keeps beverages cold for 24 hours or hot for 12 hours.',
        price: 32,
        category: catFitness._id,
        quantity: 140,
        shipping: true,
        imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1000&q=80'
      },
      {
        name: 'Non-Slip Pro Yoga Mat',
        description: 'Eco-friendly TPE yoga mat with alignment lines. Extra thick cushioning for joints during intensive stretches.',
        price: 48,
        category: catFitness._id,
        quantity: 90,
        shipping: true,
        imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=1000&q=80'
      },
      {
        name: 'Organic Argan Hair Oil',
        description: '100% pure cold-pressed Moroccan argan oil. Nourishes dry hair, restores shine, and moisturizes skin layers.',
        price: 29,
        category: catBeauty._id,
        quantity: 160,
        shipping: true,
        imageUrl: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=1000&q=80'
      },
      {
        name: 'Hydrating Face Moisturizer',
        description: 'Lightweight hyaluronic acid face gel cream. Deeply hydrates sensitive skin for up to 48 hours without oiliness.',
        price: 35,
        category: catBeauty._id,
        quantity: 110,
        shipping: true,
        imageUrl: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=1000&q=80'
      }
    ];

    console.log('Downloading high-res images and seeding products...');
    
    for (let data of productData) {
      try {
        const imageBuffer = await downloadImage(data.imageUrl);
        const product = new Product({
          name: data.name,
          description: data.description,
          price: data.price,
          category: data.category,
          quantity: data.quantity,
          shipping: data.shipping
        });
        
        product.photo.data = imageBuffer;
        product.photo.contentType = 'image/jpeg';
        
        await product.save();
        console.log(`Saved product with image: ${product.name}`);
      } catch (err) {
        console.error(`Error saving product ${data.name}:`, err.message);
      }
    }
    
    console.log('Database seeding completely finished!');
    process.exit(0);

  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedDB();
