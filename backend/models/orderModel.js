import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    name: {
        type: String,
        required: [true, "Customer name is required"],
        trim: true,
        maxlength: [200, "Name cannot exceed 200 characters"],
    },
    email: {
        type: String,
        required: [true, "Customer email is required"],
        trim: true,
        lowercase: true,
    },
    phone: {
        type: String,
        required: [true, "Customer phone is required"],
        trim: true,
        maxlength: [30, "Phone cannot exceed 30 characters"],
    },
    address: {
        type: String,
        required: [true, "Customer address is required"],
        trim: true,
        maxlength: [500, "Address cannot exceed 500 characters"],
    },
    subtotal: {
        type: Number,
        required: true,
        min: 0,
    },
    total: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: String,
        enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
        default: "PENDING",
    },
}, { timestamps: true });

export const Order = mongoose.model("Order", orderSchema);
