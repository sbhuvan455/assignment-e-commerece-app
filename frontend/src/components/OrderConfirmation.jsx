import { useEffect, useState } from "react";
import api, { errorMessage } from "../services/api";

function OrderConfirmation({ orderId, onContinue }) {
    const [order, setOrder] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        api
            .get(`/orders/${orderId}`)
            .then(({ data }) => {
                if (cancelled) return;
                setOrder(data.order);
                setItems(data.items);
            })
            .catch((err) => {
                if (!cancelled) setError(errorMessage(err, "Could not load the order"));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [orderId]);

    if (loading) return <p className="muted">Loading order...</p>;
    if (error) return <p className="error-text">{error}</p>;
    if (!order) return <p className="muted">Order not found.</p>;

    return (
        <section className="confirmation">
            <div className="success-box">
                <h2>Thank you, your order has been placed!</h2>
                <p className="order-id">
                    Order ID: <strong>{order.orderId}</strong>
                </p>
                <p className="muted">Status: {order.status}</p>
            </div>

            <div className="card summary-block">
                <h3>Order Summary</h3>
                {items.map((item) => (
                    <div className="summary-row" key={item._id}>
                        <span>
                            {item.name} x {item.quantity}
                        </span>
                        <span>${item.itemTotal.toFixed(2)}</span>
                    </div>
                ))}
                <div className="summary-row total">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                </div>

                <h3 className="checkout-title">Shipping to</h3>
                <p>
                    {order.name}
                    <br />
                    {order.email}
                    <br />
                    {order.phone}
                    <br />
                    {order.address}
                </p>
            </div>

            <button type="button" className="btn primary" onClick={onContinue}>
                Continue shopping
            </button>
        </section>
    );
}

export default OrderConfirmation;
