import app from "./app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./Model/productModel.js";

dotenv.config({ path: "./config.env" });

// Database Connection
const DB = process.env.DATABASE_URI || "";

async function connectDB() {
  try {
    await mongoose.connect(DB);
    console.log("✅ Database Connected Successfully");

    await seedProducts();

    app.listen(5000, () => {
      console.log(`🚀 Server running on http://127.0.0.1:5000`);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

connectDB();

async function seedProducts() {
  const count = await Product.countDocuments();
  if (count > 0) return;

  const res = await fetch("https://fakestoreapi.com/products?limit=8");
  const data = await res.json();

  const items = data.map((p) => ({
    name: p.title,
    price: Math.round(Number(p.price) * 100),
    category: p.category,
    image: p.image,
  }));

  await Product.insertMany(items);
  console.log("🛒 Products seeded successfully!");
}