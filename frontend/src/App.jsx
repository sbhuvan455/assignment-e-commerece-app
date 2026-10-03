import { useEffect, useState } from "react";
import api, { errorMessage } from "./services/api";
import ProductList from "./components/ProductList";
import ProductDetails from "./components/ProductDetails";
import CartView from "./components/CartView";
import OrderConfirmation from "./components/OrderConfirmation";
import "./App.css";

const EMPTY_CART = { items: [], subtotal: 0, total: 0, itemCount: 0 };

function App() {
    const [view, setView] = useState({ name: "products" });
    const [cart, setCart] = useState(EMPTY_CART);
    const [notice, setNotice] = useState("");

    useEffect(() => {
        const ignore = { cancelled: false };
        api.get("/cart")
            .then(({ data }) => {
                if (!ignore.cancelled) setCart(data.cart);
            })
            .catch((error) => console.error("Load cart error:", errorMessage(error)));
        return () => {
            ignore.cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!notice) return undefined;
        const timer = setTimeout(() => setNotice(""), 2500);
        return () => clearTimeout(timer);
    }, [notice]);

    const addToCart = async (productId, quantity = 1) => {
        try {
            const { data } = await api.post("/cart", { productId, quantity });
            setCart(data.cart);
            setNotice("Added to cart");
        } catch (error) {
            setNotice(errorMessage(error, "Could not add to cart"));
        }
    };

    const updateCartItem = async (id, quantity) => {
        try {
            const { data } = await api.put(`/cart/${id}`, { quantity });
            setCart(data.cart);
        } catch (error) {
            setNotice(errorMessage(error, "Could not update quantity"));
        }
    };

    const removeCartItem = async (id) => {
        try {
            const { data } = await api.delete(`/cart/${id}`);
            setCart(data.cart);
            setNotice("Removed from cart");
        } catch (error) {
            setNotice(errorMessage(error, "Could not remove item"));
        }
    };

    const placeOrder = async (details) => {
        const { data } = await api.post("/orders", details);
        setCart(EMPTY_CART);
        setNotice("Order placed successfully");
        setView({ name: "order", orderId: data.orderId });
        return data;
    };

    const goHome = () => setView({ name: "products" });

    return (
        <div className="app">
            <header className="header">
                <button type="button" className="brand" onClick={goHome}>
                    SimpleShop
                </button>
                <button type="button" className="cart-btn" onClick={() => setView({ name: "cart" })}>
                    Cart
                    {cart.itemCount > 0 && <span className="cart-badge">{cart.itemCount}</span>}
                </button>
            </header>

            {notice && <div className="notice">{notice}</div>}

            <main className="main">
                {view.name === "products" && (
                    <ProductList
                        onOpen={(id) => setView({ name: "details", id })}
                        onAdd={addToCart}
                    />
                )}

                {view.name === "details" && (
                    <ProductDetails
                        key={view.id}
                        id={view.id}
                        onBack={goHome}
                        onAdd={addToCart}
                        onGoToCart={() => setView({ name: "cart" })}
                    />
                )}

                {view.name === "cart" && (
                    <CartView
                        cart={cart}
                        onQuantity={updateCartItem}
                        onRemove={removeCartItem}
                        onPlaceOrder={placeOrder}
                        onBrowse={goHome}
                    />
                )}

                {view.name === "order" && (
                    <OrderConfirmation key={view.orderId} orderId={view.orderId} onContinue={goHome} />
                )}
            </main>
        </div>
    );
}

export default App;
