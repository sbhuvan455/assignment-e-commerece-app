import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: [true, "Order is required"],
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Product is required"],
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    itemTotal: {
        type: Number,
        required: true,
        min: 0,
    },
}, { timestamps: true });

export const OrderItem = mongoose.model("OrderItem", orderItemSchema);
