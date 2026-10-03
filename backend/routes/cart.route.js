import express from "express";
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from "../controllers/cart.controller.js";

const router = express.Router();

router.get("/", getCart);
router.post("/", addToCart);
router.put("/:id", updateCartItem);
router.delete("/:id", removeCartItem);
router.delete("/", clearCart);

export default router;
