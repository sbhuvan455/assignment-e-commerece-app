import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import productRouter from "./routes/product.route.js";
import cartRouter from "./routes/cart.route.js";
import orderRouter from "./routes/order.route.js";

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",").map((o) => o.trim()).filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
    res.status(200).json({ success: true,
        message: "E-commerce API is running",
        timestamp: new Date().toISOString() });
});

app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);

app.use((req, res) => {
    res.status(404).json({ success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}` });
});

const PORT = process.env.PORT || 8001;

const start = async () => {
    try {
        await connectDB();
    } catch (error) {
        console.error("Database connection failed:", error.message);
        console.error("Set MONGO_URI in your .env file and restart the server.");
        process.exit(1);
    }
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
};

start();
