import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import API from "../services/api"

export default function Cart() {
  const navigate = useNavigate()
  const [cart, setCart] = useState([])
  const [step, setStep] = useState("cart")
  const [form, setForm] = useState({ shippingAddress: "", phone: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("cart") || "[]")
    setCart(saved)
  }, [])

  const syncCart = (updated) => {
    setCart(updated)
    localStorage.setItem("cart", JSON.stringify(updated))
  }

  const updateQty = (cartKey, delta) => {
    const updated = cart.map(i => {
      if (i.cartKey !== cartKey) return i
      const newQty = i.qty + delta
      return newQty < 1 ? null : { ...i, qty: newQty }
    }).filter(Boolean)
    syncCart(updated)
  }

  const removeItem = (cartKey) => {
    syncCart(cart.filter(i => i.cartKey !== cartKey))
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0)
  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0)

  const handleOrder = async () => {
    setError("")
    if (!form.shippingAddress.trim()) { setError("Please enter a shipping address"); return }
    if (!form.phone.trim()) { setError("Please enter a phone number"); return }

    setLoading(true)
    try {
      const payload = {
        products: cart.map(i => ({
          product: i._id,
          name: i.name,
          price: i.price,
          quantity: i.qty,
          size: i.selectedSize || "",
          color: i.selectedColor || "",
        })),
        totalPrice: total,
        shippingAddress: form.shippingAddress,
        phone: form.phone,
      }
      await API.post("/orders", payload)
      localStorage.removeItem("cart")
      setCart([])
      setStep("success")
    } catch (err) {
      setError("Order failed, please try again")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (step === "success") return (
    <div style={styles.page}>
      <div style={styles.successWrap}>
        <div style={styles.successIcon}>✓</div>
        <h2 style={styles.successTitle}>Order Placed Successfully!</h2>
        <p style={styles.successSub}>Thank you for your purchase. We will process your order as soon as possible.</p>
        <button onClick={() => navigate("/home")} style={styles.primaryBtn}>Continue Shopping</button>
      </div>
    </div>
  )

  return (
    <div style={styles.page}>

      <nav style={styles.navbar}>
        <div style={styles.navInner}>
          <button onClick={() => navigate("/home")} style={styles.backBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Continue Shopping
          </button>
          <span style={styles.logo}>👕 FPTShop</span>
          <span style={styles.cartTitle}>Cart ({totalItems})</span>
        </div>
      </nav>

      <div style={styles.container}>
        {cart.length === 0 && step === "cart" ? (
          <div style={styles.emptyWrap}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <p style={styles.emptyText}>Your cart is empty</p>
            <button onClick={() => navigate("/home")} style={styles.primaryBtn}>Explore Products</button>
          </div>
        ) : (
          <div style={styles.layout}>

            <div style={styles.leftCol}>
              {step === "cart" ? (
                <>
                  <h2 style={styles.sectionTitle}>Cart Items</h2>
                  <div style={styles.cartList}>
                    {cart.map(item => (
                      <div key={item.cartKey} style={styles.cartItem}>
                        <div style={styles.itemImgWrap}>
                          {item.image
                            ? <img src={item.image} alt={item.name} style={styles.itemImg} />
                            : <div style={styles.itemImgPlaceholder}>👕</div>
                          }
                        </div>
                        <div style={styles.itemInfo}>
                          <p style={styles.itemName}>{item.name}</p>
                          <div style={styles.itemMeta}>
                            {item.selectedSize && <span style={styles.metaTag}>Size: {item.selectedSize}</span>}
                            {item.selectedColor && <span style={styles.metaTag}>Color: {item.selectedColor}</span>}
                          </div>
                          <p style={styles.itemPrice}>{item.price.toLocaleString("vi-VN")}₫</p>
                        </div>
                        <div style={styles.itemRight}>
                          <div style={styles.qtyRow}>
                            <button onClick={() => updateQty(item.cartKey, -1)} style={styles.qtyBtn}>−</button>
                            <span style={styles.qtyVal}>{item.qty}</span>
                            <button onClick={() => updateQty(item.cartKey, 1)} style={styles.qtyBtn}>+</button>
                          </div>
                          <p style={styles.itemTotal}>{(item.price * item.qty).toLocaleString("vi-VN")}₫</p>
                          <button onClick={() => removeItem(item.cartKey)} style={styles.removeBtn}>Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h2 style={styles.sectionTitle}>Shipping Information</h2>
                  <div style={styles.checkoutForm}>
                    <div style={styles.formField}>
                      <label style={styles.label}>Phone Number *</label>
                      <input
                        type="tel"
                        placeholder="0912 345 678"
                        value={form.phone}
                        onChange={e => { setForm({ ...form, phone: e.target.value }); setError("") }}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.formField}>
                      <label style={styles.label}>Shipping Address *</label>
                      <textarea
                        placeholder="House number, street, ward, district, city/province"
                        value={form.shippingAddress}
                        onChange={e => { setForm({ ...form, shippingAddress: e.target.value }); setError("") }}
                        rows={3}
                        style={{ ...styles.input, resize: "vertical" }}
                      />
                    </div>
                    {error && (
                      <div style={styles.errorBox}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        {error}
                      </div>
                    )}
                  </div>
                  <button onClick={() => setStep("cart")} style={styles.backLinkBtn}>← Back to Cart</button>
                </>
              )}
            </div>

            <div style={styles.rightCol}>
              <div style={styles.summaryCard}>
                <h2 style={styles.sectionTitle}>Order Summary</h2>

                {cart.map(item => (
                  <div key={item.cartKey} style={styles.summaryItem}>
                    <span style={styles.summaryItemName}>{item.name} x{item.qty}</span>
                    <span style={styles.summaryItemPrice}>{(item.price * item.qty).toLocaleString("vi-VN")}₫</span>
                  </div>
                ))}

                <div style={styles.summaryDivider} />

                <div style={styles.summaryRow}>
                  <span style={{ color: "#6b7280" }}>Subtotal</span>
                  <span>{total.toLocaleString("vi-VN")}₫</span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={{ color: "#6b7280" }}>Shipping</span>
                  <span style={{ color: "#10b981", fontWeight: 500 }}>Free</span>
                </div>

                <div style={styles.summaryDivider} />

                <div style={{ ...styles.summaryRow, fontSize: "17px" }}>
                  <span style={{ fontWeight: 700 }}>Total</span>
                  <span style={{ fontWeight: 700 }}>{total.toLocaleString("vi-VN")}₫</span>
                </div>

                {step === "cart" ? (
                  <button onClick={() => setStep("checkout")} style={{ ...styles.primaryBtn, width: "100%", marginTop: "1.25rem" }}>
                    Proceed to Checkout →
                  </button>
                ) : (
                  <button
                    onClick={handleOrder}
                    disabled={loading}
                    style={{ ...styles.primaryBtn, width: "100%", marginTop: "1.25rem", opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
                  >
                    {loading ? "Processing..." : "Confirm Order"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: "100vh", background: "#f5f5f5" },
  navbar: { background: "#fff", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 100 },
  navInner: { maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  backBtn: { display: "flex", alignItems: "center", gap: "6px", background: "none", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "7px 14px", fontSize: "13px", cursor: "pointer", color: "#374151" },
  logo: { fontSize: "18px", fontWeight: "700", color: "#111" },
  cartTitle: { fontSize: "14px", color: "#6b7280" },
  container: { maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem" },
  layout: { display: "grid", gridTemplateColumns: "1fr 380px", gap: "2rem", alignItems: "start" },
  leftCol: {},
  rightCol: { position: "sticky", top: "80px" },
  sectionTitle: { fontSize: "18px", fontWeight: "600", color: "#111", marginBottom: "1.25rem" },
  cartList: { display: "flex", flexDirection: "column", gap: "1rem" },
  cartItem: { background: "#fff", borderRadius: "14px", border: "1px solid #e5e7eb", padding: "1rem 1.25rem", display: "flex", gap: "1rem", alignItems: "center" },
  itemImgWrap: { flexShrink: 0 },
  itemImg: { width: "80px", height: "80px", borderRadius: "10px", objectFit: "cover" },
  itemImgPlaceholder: { width: "80px", height: "80px", borderRadius: "10px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" },
  itemInfo: { flex: 1, minWidth: 0 },
  itemName: { fontSize: "14px", fontWeight: "600", color: "#111", margin: "0 0 6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  itemMeta: { display: "flex", gap: "6px", marginBottom: "6px", flexWrap: "wrap" },
  metaTag: { fontSize: "11px", background: "#f3f4f6", color: "#6b7280", padding: "2px 8px", borderRadius: "6px" },
  itemPrice: { fontSize: "13px", color: "#6b7280", margin: 0 },
  itemRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 },
  qtyRow: { display: "flex", alignItems: "center", gap: "8px" },
  qtyBtn: { width: "30px", height: "30px", border: "1.5px solid #e5e7eb", borderRadius: "7px", background: "#fff", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  qtyVal: { fontSize: "14px", fontWeight: "600", minWidth: "20px", textAlign: "center" },
  itemTotal: { fontSize: "14px", fontWeight: "700", color: "#111", margin: 0 },
  removeBtn: { fontSize: "12px", color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 0 },
  summaryCard: { background: "#fff", borderRadius: "14px", border: "1px solid #e5e7eb", padding: "1.5rem" },
  summaryItem: { display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#6b7280", marginBottom: "8px" },
  summaryItemName: { flex: 1, marginRight: "8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  summaryItemPrice: { flexShrink: 0 },
  summaryDivider: { height: "1px", background: "#e5e7eb", margin: "1rem 0" },
  summaryRow: { display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "8px" },
  checkoutForm: { background: "#fff", borderRadius: "14px", border: "1px solid #e5e7eb", padding: "1.5rem", marginBottom: "1rem" },
  formField: { marginBottom: "1.25rem" },
  label: { fontSize: "13px", fontWeight: "500", color: "#374151", display: "block", marginBottom: "7px" },
  input: { width: "100%", padding: "11px 14px", fontSize: "14px", border: "1.5px solid #e5e7eb", borderRadius: "10px", outline: "none", boxSizing: "border-box", background: "#fafafa", color: "#111" },
  errorBox: { display: "flex", alignItems: "center", gap: "8px", background: "#fff1f1", border: "1px solid #fca5a5", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", color: "#dc2626" },
  primaryBtn: { padding: "12px 24px", background: "#111", color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "600", cursor: "pointer" },
  backLinkBtn: { background: "none", border: "none", color: "#6b7280", fontSize: "13px", cursor: "pointer", padding: 0, marginTop: "0.5rem" },
  emptyWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px", gap: "1rem" },
  emptyText: { fontSize: "16px", color: "#6b7280" },
  successWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", gap: "1rem", textAlign: "center" },
  successIcon: { width: "72px", height: "72px", background: "#d1fae5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", color: "#10b981" },
  successTitle: { fontSize: "24px", fontWeight: "700", color: "#111" },
  successSub: { fontSize: "14px", color: "#6b7280", maxWidth: "320px" },
}