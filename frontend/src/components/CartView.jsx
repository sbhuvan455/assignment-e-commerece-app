import { useState } from "react";
import { errorMessage } from "../services/api";

const EMPTY_FORM = { name: "", email: "", phone: "", address: "" };

function CartView({ cart, onQuantity, onRemove, onPlaceOrder, onBrowse }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (cart.items.length === 0) {
        return (
            <section>
                <div className="page-title">
                    <h2>Your Cart</h2>
                </div>
                <p className="muted">Your cart is empty.</p>
                <button type="button" className="btn primary" onClick={onBrowse}>
                    Browse products
                </button>
            </section>
        );
    }

    const changeField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.address.trim()) {
            setError("Please fill in name, email, phone and address.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            setError("Please enter a valid email address.");
            return;
        }

        setSubmitting(true);
        try {
            await onPlaceOrder({
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                address: form.address.trim(),
            });
            setForm(EMPTY_FORM);
        } catch (err) {
            setError(errorMessage(err, "Could not place the order"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section>
            <div className="page-title">
                <h2>Your Cart</h2>
            </div>

            <div className="cart-layout">
                <div className="cart-items">
                    {cart.items.map((item) => (
                        <div className="cart-item" key={item._id}>
                            <img src={item.product.image} alt={item.product.name} />
                            <div className="cart-item-info">
                                <h3>{item.product.name}</h3>
                                <p className="muted">${item.product.price.toFixed(2)} each</p>
                            </div>
                            <div className="qty-box">
                                <button
                                    type="button"
                                    className="btn secondary"
                                    disabled={item.quantity <= 1}
                                    onClick={() => onQuantity(item._id, item.quantity - 1)}
                                >
                                    -
                                </button>
                                <span className="qty">{item.quantity}</span>
                                <button
                                    type="button"
                                    className="btn secondary"
                                    onClick={() => onQuantity(item._id, item.quantity + 1)}
                                >
                                    +
                                </button>
                            </div>
                            <span className="price">${item.itemTotal.toFixed(2)}</span>
                            <button
                                type="button"
                                className="btn ghost danger"
                                onClick={() => onRemove(item._id)}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>

                <aside className="summary">
                    <h3>Order Summary</h3>
                    <div className="summary-row">
                        <span>Subtotal ({cart.itemCount} items)</span>
                        <span>${cart.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                        <span>Shipping</span>
                        <span>Free</span>
                    </div>
                    <div className="summary-row total">
                        <span>Total</span>
                        <span>${cart.total.toFixed(2)}</span>
                    </div>

                    <h3 className="checkout-title">Checkout</h3>
                    {error && <p className="error-text">{error}</p>}
                    <form onSubmit={submit} className="checkout-form">
                        <label>
                            Name
                            <input type="text" value={form.name} onChange={changeField("name")} placeholder="John Doe" />
                        </label>
                        <label>
                            Email
                            <input type="email" value={form.email} onChange={changeField("email")} placeholder="john@example.com" />
                        </label>
                        <label>
                            Phone
                            <input type="tel" value={form.phone} onChange={changeField("phone")} placeholder="+1 555 123 4567" />
                        </label>
                        <label>
                            Address
                            <textarea
                                rows="3"
                                value={form.address}
                                onChange={changeField("address")}
                                placeholder="Street, city, zip code"
                            />
                        </label>
                        <button type="submit" className="btn primary block" disabled={submitting}>
                            {submitting ? "Placing order..." : "Place Order"}
                        </button>
                    </form>
                </aside>
            </div>
        </section>
    );
}

export default CartView;
