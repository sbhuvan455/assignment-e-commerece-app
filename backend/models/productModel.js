import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Product name is required"],
        trim: true,
        maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    price: {
        type: Number,
        required: [true, "Product price is required"],
        min: [0, "Price cannot be negative"],
    },
    category: {
        type: String,
        required: [true, "Product category is required"],
        trim: true,
        maxlength: [100, "Category cannot exceed 100 characters"],
    },
    image: {
        type: String,
        trim: true,
        default: "",
    },
}, { timestamps: true });

productSchema.index({ name: "text", category: "text" });

export const Product = mongoose.model("Product", productSchema);
