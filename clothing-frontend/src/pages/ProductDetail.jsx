import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import API from "../services/api"

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState("")
  const [added, setAdded] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${id}`)
        setProduct(res.data)
        setActiveImg(res.data.image || "")
        if (res.data.sizes?.length > 0) setSelectedSize(res.data.sizes[0])
        if (res.data.colors?.length > 0) setSelectedColor(res.data.colors[0])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const addToCart = () => {
    if (product.stock === 0) return
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const key = product._id + selectedSize + selectedColor
    const existing = cart.find(i => i.cartKey === key)
    const salePrice = product.discount > 0
      ? Math.round(product.price * (1 - product.discount / 100))
      : product.price
    const updated = existing
      ? cart.map(i => i.cartKey === key ? { ...i, qty: i.qty + qty } : i)
      : [...cart, { ...product, price: salePrice, qty, selectedSize, selectedColor, cartKey: key }]
    localStorage.setItem("cart", JSON.stringify(updated))
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) return (
    <div style={styles.loadingPage}>
      <div style={styles.spinner} />
    </div>
  )

  if (!product) return (
    <div style={styles.loadingPage}>
      <p style={{ color: "#6b7280" }}>Không tìm thấy sản phẩm</p>
    </div>
  )

  const allImages = [product.image, ...(product.images || [])].filter(Boolean)
  const salePrice = product.discount > 0
    ? Math.round(product.price * (1 - product.discount / 100))
    : null

  return (
    <div style={styles.page}>

      <nav style={styles.navbar}>
        <div style={styles.navInner}>
          <button onClick={() => navigate("/home")} style={styles.backBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Quay lại
          </button>
          <span style={styles.logo}>👕 FPTShop</span>
          <button onClick={() => navigate("/cart")} style={styles.cartBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Giỏ hàng
          </button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.grid}>
   
          <div style={styles.imageSection}>
            <div style={styles.mainImgWrap}>
              {activeImg
                ? <img src={activeImg} alt={product.name} style={styles.mainImg} />
                : <div style={styles.imgPlaceholder}>
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
              }

        
              <div style={styles.badgeGroup}>
                {product.isHot && (
                  <span style={styles.hotBadge}>🔥 Hot</span>
                )}
                {product.discount > 0 && (
                  <span style={styles.discountBadge}>-{product.discount}%</span>
                )}
              </div>

              {product.stock === 0 && (
                <div style={styles.soldOutBadge}>Hết hàng</div>
              )}
            </div>

            {allImages.length > 1 && (
              <div style={styles.thumbRow}>
                {allImages.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt=""
                    onClick={() => setActiveImg(img)}
                    style={{
                      ...styles.thumb,
                      border: activeImg === img ? "2px solid #111" : "2px solid transparent"
                    }}
                  />
                ))}
              </div>
            )}
          </div>

   
          <div style={styles.infoSection}>
            <p style={styles.categoryLabel}>{product.category?.name}</p>
            <h1 style={styles.productName}>{product.name}</h1>

   
            <div style={styles.ratingRow}>
              {[1,2,3,4,5].map(s => (
                <span key={s} style={{ color: s <= Math.round(product.rating) ? "#f59e0b" : "#e5e7eb", fontSize: "18px" }}>★</span>
              ))}
              <span style={styles.soldText}>{product.sold} đã bán</span>
            </div>

            <div style={{ marginBottom: "16px" }}>
              {salePrice ? (
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <span style={styles.salePrice}>
                    {salePrice.toLocaleString("vi-VN")}₫
                  </span>
                  <span style={styles.originalPrice}>
                    {product.price.toLocaleString("vi-VN")}₫
                  </span>
                  <span style={styles.discountTag}>
                    -{product.discount}%
                  </span>
                </div>
              ) : (
                <p style={styles.price}>{product.price.toLocaleString("vi-VN")}₫</p>
              )}
            </div>

     
            {product.description && (
              <p style={styles.description}>{product.description}</p>
            )}

            <div style={styles.divider} />

            
            {product.sizes?.length > 0 && (
              <div style={styles.optionGroup}>
                <p style={styles.optionLabel}>Kích thước</p>
                <div style={styles.optionRow}>
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      style={{ ...styles.optionBtn, ...(selectedSize === size ? styles.optionBtnActive : {}) }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

    
            {product.colors?.length > 0 && (
              <div style={styles.optionGroup}>
                <p style={styles.optionLabel}>Màu sắc</p>
                <div style={styles.optionRow}>
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      style={{ ...styles.optionBtn, ...(selectedColor === color ? styles.optionBtnActive : {}) }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

       
            <div style={styles.optionGroup}>
              <p style={styles.optionLabel}>Số lượng</p>
              <div style={styles.qtyRow}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={styles.qtyBtn}>−</button>
                <span style={styles.qtyVal}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} style={styles.qtyBtn}>+</button>
                <span style={styles.stockText}>Còn {product.stock} sản phẩm</span>
              </div>
            </div>

            <div style={styles.divider} />

          
            <div style={styles.actionRow}>
              <button
                onClick={addToCart}
                disabled={product.stock === 0}
                style={{
                  ...styles.addToCartBtn,
                  opacity: product.stock === 0 ? 0.5 : 1,
                  cursor: product.stock === 0 ? "not-allowed" : "pointer",
                  background: added ? "#10b981" : "#111",
                }}
              >
                {added ? "✓ Đã thêm vào giỏ!" : "Thêm vào giỏ hàng"}
              </button>
              <button
                onClick={() => { addToCart(); navigate("/cart") }}
                disabled={product.stock === 0}
                style={{
                  ...styles.buyNowBtn,
                  opacity: product.stock === 0 ? 0.5 : 1,
                  cursor: product.stock === 0 ? "not-allowed" : "pointer",
                }}
              >
                Mua ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: "100vh", background: "#f5f5f5" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  spinner: { width: "36px", height: "36px", border: "3px solid #e5e7eb", borderTop: "3px solid #111", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  navbar: { background: "#fff", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 100 },
  navInner: { maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  backBtn: { display: "flex", alignItems: "center", gap: "6px", background: "none", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "7px 14px", fontSize: "13px", cursor: "pointer", color: "#374151" },
  logo: { fontSize: "18px", fontWeight: "700", color: "#111" },
  cartBtn: { display: "flex", alignItems: "center", gap: "6px", background: "none", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "7px 14px", fontSize: "13px", cursor: "pointer", color: "#374151" },
  container: { maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "start" },
  imageSection: { position: "sticky", top: "80px" },
  mainImgWrap: { position: "relative", borderRadius: "16px", overflow: "hidden", background: "#fff", border: "1px solid #e5e7eb", aspectRatio: "1" },
  mainImg: { width: "100%", height: "100%", objectFit: "cover" },
  imgPlaceholder: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" },
  badgeGroup: { position: "absolute", top: "16px", left: "16px", display: "flex", flexDirection: "column", gap: "6px" },
  hotBadge: { background: "#ef4444", color: "#fff", fontSize: "12px", fontWeight: "600", padding: "4px 10px", borderRadius: "8px", display: "inline-block" },
  discountBadge: { background: "#f59e0b", color: "#fff", fontSize: "12px", fontWeight: "600", padding: "4px 10px", borderRadius: "8px", display: "inline-block" },
  soldOutBadge: { position: "absolute", bottom: "16px", left: "16px", background: "rgba(0,0,0,0.7)", color: "#fff", padding: "6px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: "500" },
  thumbRow: { display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" },
  thumb: { width: "64px", height: "64px", borderRadius: "8px", objectFit: "cover", cursor: "pointer" },
  infoSection: { paddingTop: "0.5rem" },
  categoryLabel: { fontSize: "12px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" },
  productName: { fontSize: "26px", fontWeight: "700", color: "#111", margin: "0 0 12px", lineHeight: "1.3" },
  ratingRow: { display: "flex", alignItems: "center", gap: "4px", marginBottom: "16px" },
  soldText: { fontSize: "13px", color: "#9ca3af", marginLeft: "8px" },
  price: { fontSize: "28px", fontWeight: "700", color: "#111", margin: 0 },
  salePrice: { fontSize: "28px", fontWeight: "700", color: "#ef4444" },
  originalPrice: { fontSize: "16px", color: "#9ca3af", textDecoration: "line-through" },
  discountTag: { background: "#fef2f2", color: "#ef4444", fontSize: "13px", fontWeight: "600", padding: "4px 10px", borderRadius: "20px" },
  description: { fontSize: "14px", color: "#6b7280", lineHeight: "1.7", margin: 0 },
  divider: { height: "1px", background: "#e5e7eb", margin: "1.5rem 0" },
  optionGroup: { marginBottom: "1.25rem" },
  optionLabel: { fontSize: "13px", fontWeight: "500", color: "#374151", margin: "0 0 10px" },
  optionRow: { display: "flex", gap: "8px", flexWrap: "wrap" },
  optionBtn: { padding: "7px 16px", border: "1.5px solid #e5e7eb", borderRadius: "8px", background: "#fff", fontSize: "13px", cursor: "pointer", color: "#374151", transition: "all 0.15s" },
  optionBtnActive: { border: "1.5px solid #111", background: "#111", color: "#fff", fontWeight: "500" },
  qtyRow: { display: "flex", alignItems: "center", gap: "12px" },
  qtyBtn: { width: "34px", height: "34px", border: "1.5px solid #e5e7eb", borderRadius: "8px", background: "#fff", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#374151" },
  qtyVal: { fontSize: "16px", fontWeight: "600", minWidth: "24px", textAlign: "center" },
  stockText: { fontSize: "12px", color: "#9ca3af", marginLeft: "4px" },
  actionRow: { display: "flex", gap: "12px" },
  addToCartBtn: { flex: 1, padding: "13px", background: "#111", color: "#fff", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "600", cursor: "pointer", transition: "background 0.3s" },
  buyNowBtn: { flex: 1, padding: "13px", background: "#fff", color: "#111", border: "2px solid #111", borderRadius: "12px", fontSize: "15px", fontWeight: "600", cursor: "pointer" },
}