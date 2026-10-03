import { useEffect, useState } from "react";
import api, { errorMessage } from "../services/api";

function ProductDetails({ id, onBack, onAdd, onGoToCart }) {
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        api
            .get(`/products/${id}`)
            .then(({ data }) => {
                if (cancelled) return;
                setProduct(data.product);
                setQuantity(1);
            })
            .catch((err) => {
                if (!cancelled) setError(errorMessage(err, "Could not load product"));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [id]);

    if (loading) return <p className="muted">Loading product...</p>;
    if (error) return <p className="error-text">{error}</p>;
    if (!product) return <p className="muted">Product not found.</p>;

    return (
        <section>
            <button type="button" className="btn ghost" onClick={onBack}>
                &larr; Back to products
            </button>

            <div className="details">
                <img src={product.image} alt={product.name} className="details-image" />
                <div className="details-info">
                    <span className="chip">{product.category}</span>
                    <h2>{product.name}</h2>
                    <p className="price big">${product.price.toFixed(2)}</p>
                    <p className="description">{product.description || "No description available."}</p>

                    <div className="details-actions">
                        <div className="qty-box">
                            <button
                                type="button"
                                className="btn secondary"
                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            >
                                -
                            </button>
                            <span className="qty">{quantity}</span>
                            <button
                                type="button"
                                className="btn secondary"
                                onClick={() => setQuantity((q) => q + 1)}
                            >
                                +
                            </button>
                        </div>
                        <button
                            type="button"
                            className="btn primary"
                            onClick={() => onAdd(product._id, quantity)}
                        >
                            Add to cart
                        </button>
                        <button type="button" className="btn secondary" onClick={onGoToCart}>
                            Go to cart
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ProductDetails;
