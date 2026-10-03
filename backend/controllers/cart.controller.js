import { Cart } from "../models/cartModel.js";
import { Product } from "../models/productModel.js";

const buildCart = async () => {
    const items = await Cart.find().populate("product").sort({ createdAt: 1 });

    const validItems = items.filter((item) => item.product);

    const mappedItems = validItems.map((item) => ({
        _id: item._id,
        product: item.product,
        quantity: item.quantity,
        itemTotal: Number((item.product.price * item.quantity).toFixed(2)),
    }));

    const subtotal = Number(mappedItems.reduce((sum, item) => sum + item.itemTotal, 0).toFixed(2));
    const itemCount = mappedItems.reduce((sum, item) => sum + item.quantity, 0);

    return { items: mappedItems, subtotal, total: subtotal, itemCount };
};

export const getCart = async (req, res) => {
    try {
        const cart = await buildCart();
        return res.status(200).json({ success: true, message: "Cart fetched successfully", cart });
    } catch (error) {
        console.error("Get cart error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const qty = quantity === undefined ? 1 : Number(quantity);

        if (!productId) return res.status(400).json({ success: false, message: "Product id is required" });
        if (!Number.isInteger(qty) || qty < 1) {
            return res.status(400).json({ success: false, message: "Quantity must be a whole number greater than 0" });
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        const existing = await Cart.findOne({ product: productId });
        const newQuantity = existing ? existing.quantity + qty : qty;

        if (existing) {
            existing.quantity = newQuantity;
            await existing.save();
        } else {
            await Cart.create({ product: productId, quantity: qty });
        }

        const cart = await buildCart();
        return res.status(201).json({ success: true, message: "Product added to cart", cart });
    } catch (error) {
        console.error("Add to cart error:", error);
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: Object.values(error.errors).map((e) => e.message).join(", ") });
        }
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const updateCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        const qty = Number(quantity);

        if (quantity === undefined || quantity === null) {
            return res.status(400).json({ success: false, message: "Quantity is required" });
        }
        if (!Number.isInteger(qty) || qty < 1) {
            return res.status(400).json({ success: false, message: "Quantity must be a whole number greater than 0" });
        }

        const item = await Cart.findById(id).populate("product");
        if (!item) return res.status(404).json({ success: false, message: "Cart item not found" });
        if (!item.product) {
            await Cart.findByIdAndDelete(id);
            return res.status(404).json({ success: false, message: "Product no longer exists and was removed from the cart" });
        }

        item.quantity = qty;
        await item.save();

        const cart = await buildCart();
        return res.status(200).json({ success: true, message: "Cart item updated", cart });
    } catch (error) {
        console.error("Update cart item error:", error);
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: Object.values(error.errors).map((e) => e.message).join(", ") });
        }
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const removeCartItem = async (req, res) => {
    try {
        const { id } = req.params;

        const item = await Cart.findById(id);
        if (!item) return res.status(404).json({ success: false, message: "Cart item not found" });

        await Cart.findByIdAndDelete(id);

        const cart = await buildCart();
        return res.status(200).json({ success: true, message: "Item removed from cart", cart });
    } catch (error) {
        console.error("Remove cart item error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const clearCart = async (req, res) => {
    try {
        await Cart.deleteMany({});
        const cart = await buildCart();
        return res.status(200).json({ success: true, message: "Cart cleared", cart });
    } catch (error) {
        console.error("Clear cart error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export { buildCart };
