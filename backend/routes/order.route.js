import express from "express";
import { placeOrder, getAllOrders, getOrderById } from "../controllers/order.controller.js";

const router = express.Router();

router.get("/", getAllOrders);
router.post("/", placeOrder);
router.get("/:id", getOrderById);

export default router;
