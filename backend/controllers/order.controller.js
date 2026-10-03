import crypto from "crypto";
import mongoose from "mongoose";
import { Cart } from "../models/cartModel.js";
import { Order } from "../models/orderModel.js";
import { OrderItem } from "../models/orderItemModel.js";

const generateOrderId = () => `ORD-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const placeOrder = async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;

        if (!name || !email || !phone || !address) {
            return res.status(400).json({ success: false, message: "Name, email, phone and address are required" });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ success: false, message: "Please provide a valid email address" });
        }

        const cartItems = await Cart.find().populate("product");
        if (cartItems.length === 0) {
            return res.status(400).json({ success: false, message: "Your cart is empty" });
        }

        for (const item of cartItems) {
            if (!item.product) {
                return res.status(400).json({ success: false, message: "A product in your cart is no longer available" });
            }
        }

        const subtotal = Number(cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2));

        let order = null;
        for (let attempt = 0; attempt < 3 && !order; attempt++) {
            try {
                order = await Order.create({
                    orderId: generateOrderId(),
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    phone: phone.trim(),
                    address: address.trim(),
                    subtotal,
                    total: subtotal,
                });
            } catch (createError) {
                if (createError.code !== 11000) throw createError;
            }
        }
        if (!order) {
            return res.status(500).json({ success: false, message: "Could not generate a unique order id, please try again" });
        }

        try {
            const orderItems = cartItems.map((item) => ({
                order: order._id,
                product: item.product._id,
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
                itemTotal: Number((item.product.price * item.quantity).toFixed(2)),
            }));
            await OrderItem.insertMany(orderItems);
            await Cart.deleteMany({});
        } catch (persistError) {
            console.error("Order persistence error:", persistError);
            await Order.findByIdAndDelete(order._id);
            return res.status(500).json({ success: false, message: "Could not save the order, please try again" });
        }

        const items = await OrderItem.find({ order: order._id });

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            orderId: order.orderId,
            order,
            items,
        });
    } catch (error) {
        console.error("Place order error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, message: "Orders fetched successfully", count: orders.length, orders });
    } catch (error) {
        console.error("Get orders error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        let order = null;
        if (mongoose.isValidObjectId(id)) order = await Order.findById(id);
        if (!order) order = await Order.findOne({ orderId: id });
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        const items = await OrderItem.find({ order: order._id });

        return res.status(200).json({ success: true, message: "Order fetched successfully", orderId: order.orderId, order, items });
    } catch (error) {
        console.error("Get order error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
