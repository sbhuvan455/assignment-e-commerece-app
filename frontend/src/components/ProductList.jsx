import { useEffect, useState } from "react";
import api, { errorMessage } from "../services/api";

function ProductList({ onOpen, onAdd }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [sort, setSort] = useState("newest");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        api
            .get("/products/categories")
            .then(({ data }) => setCategories(data.categories))
            .catch(() => setCategories([]));
    }, []);

    useEffect(() => {
        let cancelled = false;

        const params = {};
        if (search.trim()) params.search = search.trim();
        if (category !== "all") params.category = category;
        if (sort === "price_asc") {
            params.sort = "price";
            params.order = "asc";
        } else if (sort === "price_desc") {
            params.sort = "price";
            params.order = "desc";
        }

        const timer = setTimeout(() => {
            setLoading(true);
            setError("");
            api
                .get("/products", { params })
                .then(({ data }) => {
                    if (!cancelled) setProducts(data.products);
                })
                .catch((err) => {
                    if (!cancelled) setError(errorMessage(err, "Could not load products"));
                })
                .finally(() => {
                    if (!cancelled) setLoading(false);
                });
        }, 250);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [search, category, sort]);

    return (
        <section>
            <div className="page-title">
                <h2>Products</h2>
                <span className="muted">{products.length} item(s)</span>
            </div>

            <div className="toolbar">
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="all">All categories</option>
                    {categories.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                </select>
            </div>

            {error && <p className="error-text">{error}</p>}
            {loading && <p className="muted">Loading products...</p>}

            {!loading && !error && products.length === 0 && (
                <p className="muted">No products found.</p>
            )}

            <div className="product-grid">
                {products.map((product) => (
                    <article className="card" key={product._id}>
                        <img
                            src={product.image}
                            alt={product.name}
                            className="card-image"
                            loading="lazy"
                        />
                        <div className="card-body">
                            <span className="chip">{product.category}</span>
                            <h3
                                className="card-title link"
                                onClick={() => onOpen(product._id)}
                            >
                                {product.name}
                            </h3>
                            <span className="price">${product.price.toFixed(2)}</span>
                            <div className="card-actions">
                                <button type="button" className="btn secondary" onClick={() => onOpen(product._id)}>
                                    Details
                                </button>
                                <button
                                    type="button"
                                    className="btn primary"
                                    onClick={() => onAdd(product._id, 1)}
                                >
                                    Add to cart
                                </button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default ProductList;
