import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import { Product } from "../models/productModel.js";
import { Cart } from "../models/cartModel.js";
import { Order } from "../models/orderModel.js";
import { OrderItem } from "../models/orderItemModel.js";

const img = (seed) => `https://picsum.photos/seed/${seed}/600/400`;

const products = [
    {
        name: "Wireless Bluetooth Headphones",
        description: "Over-ear wireless headphones with active noise cancellation, 30-hour battery life and deep bass.",
        price: 79.99,
        category: "Electronics",
        image: img("headphones"),
    },
    {
        name: "Smartphone X200",
        description: "6.5-inch AMOLED display, 128GB storage, 50MP triple camera and all-day battery.",
        price: 499.0,
        category: "Electronics",
        image: img("smartphone"),
    },
    {
        name: "Mechanical Gaming Keyboard",
        description: "RGB backlit mechanical keyboard with hot-swappable switches and aluminium frame.",
        price: 59.5,
        category: "Electronics",
        image: img("keyboard"),
    },
    {
        name: "4K Ultra HD Smart TV 55\"",
        description: "55-inch 4K HDR smart TV with built-in streaming apps and voice control.",
        price: 649.99,
        category: "Electronics",
        image: img("television"),
    },
    {
        name: "Classic Denim Jacket",
        description: "Timeless denim jacket made from premium cotton, perfect for all seasons.",
        price: 49.99,
        category: "Clothing",
        image: img("denimjacket"),
    },
    {
        name: "Cotton Crew Neck T-Shirt",
        description: "Soft 100% cotton crew neck t-shirt available in everyday colours.",
        price: 14.99,
        category: "Clothing",
        image: img("tshirt"),
    },
    {
        name: "Running Sneakers Pro",
        description: "Lightweight breathable running shoes with cushioned sole for long-distance comfort.",
        price: 89.0,
        category: "Clothing",
        image: img("sneakers"),
    },
    {
        name: "Stainless Steel Coffee Maker",
        description: "12-cup programmable coffee maker with thermal carafe and auto shut-off.",
        price: 64.99,
        category: "Home & Kitchen",
        image: img("coffeemaker"),
    },
    {
        name: "Non-Stick Cookware Set (5 Pieces)",
        description: "Durable non-stick pots and pans set, dishwasher safe and induction compatible.",
        price: 119.0,
        category: "Home & Kitchen",
        image: img("cookware"),
    },
    {
        name: "Aromatherapy Diffuser",
        description: "Ultrasonic essential oil diffuser with 7-colour LED light and auto shut-off.",
        price: 24.99,
        category: "Home & Kitchen",
        image: img("diffuser"),
    },
    {
        name: "The Art of Clean Code",
        description: "Practical guide to writing maintainable, elegant and efficient software.",
        price: 29.99,
        category: "Books",
        image: img("book1"),
    },
    {
        name: "Atomic Habits",
        description: "Proven strategies to build good habits and break bad ones, by James Clear.",
        price: 18.5,
        category: "Books",
        image: img("book2"),
    },
    {
        name: "Yoga Mat 6mm",
        description: "Anti-slip exercise yoga mat with carrying strap, ideal for yoga and floor workouts.",
        price: 21.99,
        category: "Sports & Outdoors",
        image: img("yogamat"),
    },
    {
        name: "Adjustable Dumbbell Set 20kg",
        description: "Space-saving adjustable dumbbells with quick-lock weight plates.",
        price: 149.0,
        category: "Sports & Outdoors",
        image: img("dumbbells"),
    },
    {
        name: "Insulated Water Bottle 1L",
        description: "Double-wall vacuum insulated bottle keeps drinks cold for 24 hours or hot for 12.",
        price: 27.5,
        category: "Sports & Outdoors",
        image: img("waterbottle"),
    },
    {
        name: "Vitamin C Face Serum",
        description: "Brightening serum with 20% vitamin C and hyaluronic acid for glowing skin.",
        price: 34.0,
        category: "Beauty",
        image: img("serum"),
    },
];

const sampleOrders = [
    {
        orderId: "ORD-DEMO0001",
        name: "Alice Johnson",
        email: "alice@example.com",
        phone: "+1 555 0101",
        address: "12 Maple Street, Springfield, 62704",
        status: "DELIVERED",
        items: [
            ["Wireless Bluetooth Headphones", 1],
            ["Cotton Crew Neck T-Shirt", 2],
        ],
    },
    {
        orderId: "ORD-DEMO0002",
        name: "Bob Smith",
        email: "bob@example.com",
        phone: "+1 555 0102",
        address: "84 Oak Avenue, Shelbyville, 62565",
        status: "SHIPPED",
        items: [
            ["Stainless Steel Coffee Maker", 1],
            ["Atomic Habits", 2],
        ],
    },
    {
        orderId: "ORD-DEMO0003",
        name: "Carol Davis",
        email: "carol@example.com",
        phone: "+1 555 0103",
        address: "9 Pine Road, Capital City, 62701",
        status: "PENDING",
        items: [["Running Sneakers Pro", 1]],
    },
];

const seedOrders = async (createdProducts) => {
    const byName = new Map(createdProducts.map((p) => [p.name, p]));

    for (const sample of sampleOrders) {
        const items = sample.items.map(([productName, quantity]) => {
            const product = byName.get(productName);
            if (!product) throw new Error(`Unknown seed product: ${productName}`);
            return {
                product,
                quantity,
                price: product.price,
                itemTotal: Number((product.price * quantity).toFixed(2)),
            };
        });

        const subtotal = Number(items.reduce((sum, i) => sum + i.itemTotal, 0).toFixed(2));

        const order = await Order.create({
            orderId: sample.orderId,
            name: sample.name,
            email: sample.email,
            phone: sample.phone,
            address: sample.address,
            subtotal,
            total: subtotal,
            status: sample.status,
        });

        await OrderItem.insertMany(
            items.map((i) => ({
                order: order._id,
                product: i.product._id,
                name: i.product.name,
                price: i.price,
                quantity: i.quantity,
                itemTotal: i.itemTotal,
            })),
        );
    }

    return sampleOrders.length;
};

const seed = async () => {
    try {
        await connectDB();

        await Promise.all([
            Product.deleteMany({}),
            Cart.deleteMany({}),
            Order.deleteMany({}),
            OrderItem.deleteMany({}),
        ]);

        const created = await Product.insertMany(products);
        const orderCount = await seedOrders(created);

        console.log(`Seeded ${created.length} products`);
        console.log("Categories:", [...new Set(created.map((p) => p.category))].join(", "));
        console.log(`Seeded ${orderCount} sample orders (cart left empty)`);
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("Seed error:", error.message);
        process.exit(1);
    }
};

seed();
