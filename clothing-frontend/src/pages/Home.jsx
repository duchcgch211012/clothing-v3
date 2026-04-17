import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import API from "../services/api"

export default function Home() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user"))

  const [products, setProducts] = useState([])
  const [hotProducts, setHotProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("cart") || "[]"))

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const [allRes, hotRes] = await Promise.all([
        API.get("/products"),
        API.get("/products?hot=true")
      ])
      setProducts(allRes.data)
      setHotProducts(hotRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await API.get("/categories")
      setCategories(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("cart")
    navigate("/login")
  }

  const addToCart = (product) => {
    const existing = cart.find(i => i._id === product._id)
    const updated = existing
      ? cart.map(i => i._id === product._id ? { ...i, qty: i.qty + 1 } : i)
      : [...cart, { ...product, qty: 1 }]
    setCart(updated)
    localStorage.setItem("cart", JSON.stringify(updated))
  }

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0)

  const filtered = products.filter(p => {
    const matchCat = selectedCategory === "all" || p.category?._id === selectedCategory
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div style={styles.page}>

      <nav style={styles.navbar}>
        <div style={styles.navInner}>
          <span style={styles.logo}>👕 FPTShop</span>
          <div style={styles.navCenter}>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div style={styles.navRight}>
            <span style={styles.navUser}>Hello, {user?.username}</span>
            <button onClick={() => navigate("/cart")} style={styles.cartBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {cartCount > 0 && <span style={styles.cartBadge}>{cartCount}</span>}
            </button>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </div>
        </div>
      </nav>

      <div style={styles.container}>

        <div style={styles.categoryBar}>
          <button
            onClick={() => setSelectedCategory("all")}
            style={{ ...styles.catBtn, ...(selectedCategory === "all" ? styles.catBtnActive : {}) }}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat._id)}
              style={{ ...styles.catBtn, ...(selectedCategory === cat._id ? styles.catBtnActive : {}) }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {!loading && hotProducts.length > 0 && (
          <div style={{ marginBottom: "2.5rem" }}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>🔥 Hot Products</h2>
              <span style={styles.sectionSub}>Best sellers right now</span>
            </div>
            <div style={styles.grid}>
              {hotProducts.map(product => (
                <ProductCard
                  key={product._id}
                  product={product}
                  navigate={navigate}
                  addToCart={addToCart}
                  isHot
                />
              ))}
            </div>
          </div>
        )}

        {!loading && hotProducts.length > 0 && (
          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>All Products</span>
            <div style={styles.dividerLine} />
          </div>
        )}

        {loading ? (
          <div style={styles.center}>
            <div style={styles.spinner} />
            <p style={{ color: "#6b7280", marginTop: "1rem" }}>Loading products...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={styles.center}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <p style={{ color: "#6b7280", marginTop: "1rem" }}>No products found</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filtered.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                navigate={navigate}
                addToCart={addToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


function ProductCard({ product, navigate, addToCart, isHot = false }) {
  return (
    <div style={styles.card}>

      <div style={styles.imgWrap} onClick={() => navigate(`/product/${product._id}`)}>
        {product.image ? (
          <img src={product.image} alt={product.name} style={styles.img} />
        ) : (
          <div style={styles.imgPlaceholder}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}

        <div style={styles.badgeGroup}>
          {isHot && (
            <span style={styles.hotBadge}>🔥 Hot</span>
          )}
          {product.discount > 0 && (
            <span style={styles.discountBadge}>-{product.discount}%</span>
          )}
        </div>

        {product.stock === 0 && (
          <div style={styles.outOfStock}>Out of Stock</div>
        )}
      </div>

      <div style={styles.cardBody}>
        <p style={styles.cardCategory}>{product.category?.name}</p>
        <h3
          style={styles.cardName}
          onClick={() => navigate(`/product/${product._id}`)}
        >
          {product.name}
        </h3>

        {product.rating > 0 && (
          <div style={styles.ratingRow}>
            {[1,2,3,4,5].map(s => (
              <span key={s} style={{ color: s <= Math.round(product.rating) ? "#f59e0b" : "#e5e7eb", fontSize: "13px" }}>★</span>
            ))}
            <span style={{ fontSize: "12px", color: "#9ca3af", marginLeft: "4px" }}>({product.sold} sold)</span>
          </div>
        )}

        <div style={styles.cardFooter}>
          <PriceDisplay product={product} />
          <button
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            style={{
              ...styles.addBtn,
              opacity: product.stock === 0 ? 0.4 : 1,
              cursor: product.stock === 0 ? "not-allowed" : "pointer",
            }}
          >
            + Add
          </button>
        </div>
      </div>
    </div>
  )
}

function PriceDisplay({ product }) {
  if (product.discount > 0) {
    const salePrice = Math.round(product.price * (1 - product.discount / 100))
    return (
      <div>
        <span style={{ fontSize: "11px", color: "#9ca3af", textDecoration: "line-through", display: "block", lineHeight: 1.4 }}>
          {product.price.toLocaleString("vi-VN")}₫
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ fontSize: "15px", fontWeight: "700", color: "#ef4444" }}>
            {salePrice.toLocaleString("vi-VN")}₫
          </span>
        </div>
      </div>
    )
  }
  return <span style={styles.price}>{product.price.toLocaleString("vi-VN")}₫</span>
}


const styles = {
  page: { minHeight: "100vh", background: "#f5f5f5" },
  navbar: { background: "#fff", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 100 },
  navInner: { maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem", height: "64px", display: "flex", alignItems: "center", gap: "1rem" },
  logo: { fontSize: "18px", fontWeight: "700", color: "#111", whiteSpace: "nowrap" },
  navCenter: { flex: 1 },
  searchInput: { width: "100%", padding: "9px 14px", fontSize: "14px", border: "1.5px solid #e5e7eb", borderRadius: "10px", outline: "none", background: "#fafafa", boxSizing: "border-box" },
  navRight: { display: "flex", alignItems: "center", gap: "12px", whiteSpace: "nowrap" },
  navUser: { fontSize: "13px", color: "#6b7280" },
  cartBtn: { position: "relative", background: "none", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "7px 10px", cursor: "pointer", display: "flex", alignItems: "center", color: "#374151" },
  cartBadge: { position: "absolute", top: "-6px", right: "-6px", background: "#ef4444", color: "#fff", fontSize: "10px", fontWeight: "700", borderRadius: "50%", width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center" },
  logoutBtn: { padding: "8px 16px", background: "none", border: "1px solid #e5e7eb", borderRadius: "10px", fontSize: "13px", cursor: "pointer", color: "#374151" },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "1.5rem" },
  categoryBar: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "1.5rem" },
  catBtn: { padding: "7px 16px", borderRadius: "20px", border: "1.5px solid #e5e7eb", background: "#fff", fontSize: "13px", cursor: "pointer", color: "#374151", fontWeight: "400", transition: "all 0.15s" },
  catBtnActive: { background: "#111", color: "#fff", borderColor: "#111", fontWeight: "500" },
  sectionHeader: { display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "1rem" },
  sectionTitle: { fontSize: "18px", fontWeight: "700", color: "#111", margin: 0 },
  sectionSub: { fontSize: "13px", color: "#9ca3af" },
  divider: { display: "flex", alignItems: "center", gap: "12px", margin: "0 0 2rem" },
  dividerLine: { flex: 1, height: "1px", background: "#e5e7eb" },
  dividerText: { fontSize: "13px", color: "#9ca3af", whiteSpace: "nowrap" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.25rem" },
  card: { background: "#fff", borderRadius: "14px", border: "1px solid #e5e7eb", overflow: "hidden" },
  imgWrap: { position: "relative", aspectRatio: "1", overflow: "hidden", cursor: "pointer", background: "#f9fafb" },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  imgPlaceholder: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" },
  badgeGroup: { position: "absolute", top: "10px", left: "10px", display: "flex", flexDirection: "column", gap: "4px" },
  hotBadge: { background: "#ef4444", color: "#fff", fontSize: "11px", fontWeight: "600", padding: "3px 8px", borderRadius: "6px", display: "inline-block" },
  discountBadge: { background: "#f59e0b", color: "#fff", fontSize: "11px", fontWeight: "600", padding: "3px 8px", borderRadius: "6px", display: "inline-block" },
  outOfStock: { position: "absolute", bottom: "10px", left: "10px", background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: "11px", padding: "3px 8px", borderRadius: "6px" },
  cardBody: { padding: "12px 14px 14px" },
  cardCategory: { fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px" },
  cardName: { fontSize: "14px", fontWeight: "500", color: "#111", margin: "0 0 6px", cursor: "pointer", lineHeight: "1.4", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  ratingRow: { display: "flex", alignItems: "center", marginBottom: "8px" },
  cardFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px" },
  price: { fontSize: "15px", fontWeight: "700", color: "#111" },
  addBtn: { padding: "6px 12px", background: "#111", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "500", cursor: "pointer" },
  center: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px" },
  spinner: { width: "32px", height: "32px", border: "3px solid #e5e7eb", borderTop: "3px solid #111", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
}