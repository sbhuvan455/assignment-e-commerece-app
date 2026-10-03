import { Product } from "../models/productModel.js";
import { Cart } from "../models/cartModel.js";

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getAllProducts = async (req, res) => {
    try {
        const { search, name, category, sort, order, minPrice, maxPrice } = req.query;

        const filter = {};

        const searchTerm = (search || name || "").trim();
        if (searchTerm) filter.name = { $regex: escapeRegex(searchTerm), $options: "i" };

        if (category && category.trim() && category.trim().toLowerCase() !== "all") {
            filter.category = { $regex: `^${escapeRegex(category.trim())}$`, $options: "i" };
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.price = {};
            if (minPrice !== undefined && !Number.isNaN(Number(minPrice))) filter.price.$gte = Number(minPrice);
            if (maxPrice !== undefined && !Number.isNaN(Number(maxPrice))) filter.price.$lte = Number(maxPrice);
        }

        const sortField = ["price", "name", "createdAt"].includes(sort) ? sort : "createdAt";
        const sortOrder = order === "asc" || order === "1" ? 1 : -1;
        const allowedSorts = {
            price_asc: { price: 1 },
            price_desc: { price: -1 },
            name_asc: { name: 1 },
            name_desc: { name: -1 },
        };
        const sortSpec = allowedSorts[sort] || { [sortField]: sortOrder };

        const products = await Product.find(filter).sort(sortSpec);

        return res.status(200).json({ success: true, message: "Products fetched successfully", count: products.length, products });
    } catch (error) {
        console.error("Get products error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getCategories = async (req, res) => {
    try {
        const categories = await Product.distinct("category");
        return res.status(200).json({ success: true, message: "Categories fetched successfully", categories: categories.sort() });
    } catch (error) {
        console.error("Get categories error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        return res.status(200).json({ success: true, message: "Product fetched successfully", product });
    } catch (error) {
        console.error("Get product error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image } = req.body;

        if (!name || !category || price === undefined || price === null) {
            return res.status(400).json({ success: false, message: "Name, price and category are required" });
        }
        if (Number(price) < 0) return res.status(400).json({ success: false, message: "Price cannot be negative" });

        const product = await Product.create({
            name,
            description,
            price: Number(price),
            category,
            image,
        });

        return res.status(201).json({ success: true, message: "Product created successfully", product });
    } catch (error) {
        console.error("Create product error:", error);
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: Object.values(error.errors).map((e) => e.message).join(", ") });
        }
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, image } = req.body;

        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        if (price !== undefined && Number(price) < 0) {
            return res.status(400).json({ success: false, message: "Price cannot be negative" });
        }

        if (name !== undefined) product.name = name;
        if (description !== undefined) product.description = description;
        if (price !== undefined) product.price = Number(price);
        if (category !== undefined) product.category = category;
        if (image !== undefined) product.image = image;

        await product.save();

        return res.status(200).json({ success: true, message: "Product updated successfully", product });
    } catch (error) {
        console.error("Update product error:", error);
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: Object.values(error.errors).map((e) => e.message).join(", ") });
        }
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        await Product.findByIdAndDelete(id);
        await Cart.deleteMany({ product: id });

        return res.status(200).json({ success: true, message: "Product deleted successfully", product });
    } catch (error) {
        console.error("Delete product error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
