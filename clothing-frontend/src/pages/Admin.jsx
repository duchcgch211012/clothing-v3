import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import API from "../services/api"

export default function Admin() {
  const navigate = useNavigate()
  const [tab, setTab] = useState("dashboard")
  const user = JSON.parse(localStorage.getItem("user"))

  const handleLogout = () => {
    localStorage.removeItem("user")
    navigate("/login")
  }

  return (
    <div style={styles.page}>
  
      <aside style={styles.sidebar}>
        <div style={styles.sidebarLogo}>👕 FPTShop</div>
        <p style={styles.sidebarRole}>Admin Shop</p>

        <nav style={styles.nav}>
          {[
            { key: "dashboard",  icon: "📊", label: "Dashboard" },
            { key: "products",   icon: "👕", label: "Sản phẩm" },
            { key: "categories", icon: "🏷️", label: "Danh mục" },
            { key: "orders",     icon: "📦", label: "Đơn hàng" },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              style={{ ...styles.navItem, ...(tab === item.key ? styles.navItemActive : {}) }}
            >
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={styles.sidebarBottom}>
          <div style={styles.sidebarUser}>
            <div style={styles.avatar}>{user?.username?.[0]?.toUpperCase()}</div>
            <div>
              <p style={styles.userName}>{user?.username}</p>
              <p style={styles.userRole}>Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>Đăng xuất</button>
        </div>
      </aside>


      <main style={styles.main}>
        {tab === "dashboard"  && <Dashboard />}
        {tab === "products"   && <Products />}
        {tab === "categories" && <Categories />}
        {tab === "orders"     && <Orders />}
      </main>
    </div>
  )
}


function Dashboard() {
  const [stats, setStats] = useState({ products: 0, categories: 0, orders: 0, revenue: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const statusColor = { pending: "#f59e0b", processing: "#3b82f6", shipped: "#8b5cf6", delivered: "#10b981", cancelled: "#ef4444" }
  const statusLabel = { pending: "Chờ xử lý", processing: "Đang xử lý", shipped: "Đang giao", delivered: "Đã giao", cancelled: "Đã hủy" }

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [p, c, o] = await Promise.all([
          API.get("/products"),
          API.get("/categories"),
          API.get("/orders"),
        ])
        const revenue = o.data.reduce((sum, ord) => sum + ord.totalPrice, 0)
        setStats({ products: p.data.length, categories: c.data.length, orders: o.data.length, revenue })
        setRecentOrders(o.data.slice(0, 5))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) return <Spinner />

  return (
    <div>
      <h1 style={styles.pageTitle}>Dashboard</h1>


      <div style={styles.statGrid}>
        {[
          { label: "Sản phẩm",  value: stats.products,                                  icon: "👕", color: "#e6f1fb" },
          { label: "Danh mục",  value: stats.categories,                                icon: "🏷️", color: "#f0fdf4" },
          { label: "Đơn hàng",  value: stats.orders,                                    icon: "📦", color: "#fff7ed" },
          { label: "Doanh thu", value: stats.revenue.toLocaleString("vi-VN") + "₫",    icon: "💰", color: "#fdf4ff" },
        ].map(card => (
          <div key={card.label} style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: card.color }}>
              <span style={{ fontSize: "22px" }}>{card.icon}</span>
            </div>
            <div>
              <p style={styles.statLabel}>{card.label}</p>
              <p style={styles.statValue}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

   
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Đơn hàng gần đây</h2>
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Khách hàng</th>
                <th style={styles.th}>Địa chỉ</th>
                <th style={styles.th}>Tổng tiền</th>
                <th style={styles.th}>Trạng thái</th>
                <th style={styles.th}>Ngày đặt</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order._id} style={styles.tr}>
                  <td style={styles.td}>{order.user?.username || "—"}</td>
                  <td style={styles.td}>{order.shippingAddress}</td>
                  <td style={styles.td}>{order.totalPrice.toLocaleString("vi-VN")}₫</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, background: statusColor[order.status] + "22", color: statusColor[order.status] }}>
                      {statusLabel[order.status]}
                    </span>
                  </td>
                  <td style={styles.td}>{new Date(order.createdAt).toLocaleDateString("vi-VN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: "", price: "", description: "", image: "",
    category: "", stock: "", sizes: "", colors: "",
    discount: 0, isHot: false
  })

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [p, c] = await Promise.all([API.get("/products"), API.get("/categories")])
      setProducts(p.data)
      setCategories(c.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ name: "", price: "", description: "", image: "", category: "", stock: "", sizes: "", colors: "", discount: 0, isHot: false })
    setShowModal(true)
  }

  const openEdit = (p) => {
    setEditing(p)
    setForm({
      name: p.name, price: p.price, description: p.description,
      image: p.image, category: p.category?._id || "", stock: p.stock,
      sizes: p.sizes?.join(", ") || "", colors: p.colors?.join(", ") || "",
      discount: p.discount || 0, isHot: p.isHot || false
    })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.category) return alert("Vui lòng nhập đầy đủ thông tin bắt buộc")
    setSaving(true)
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock) || 0,
      discount: Number(form.discount) || 0,
      isHot: form.isHot,
      sizes: form.sizes ? form.sizes.split(",").map(s => s.trim()).filter(Boolean) : [],
      colors: form.colors ? form.colors.split(",").map(s => s.trim()).filter(Boolean) : [],
    }
    try {
      if (editing) await API.put(`/products/${editing._id}`, payload)
      else await API.post("/products", payload)
      setShowModal(false)
      fetchAll()
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa sản phẩm này?")) return
    try { await API.delete(`/products/${id}`); fetchAll() }
    catch (err) { console.error(err) }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>Sản phẩm</h1>
        <button onClick={openCreate} style={styles.primaryBtn}>+ Thêm sản phẩm</button>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Ảnh</th>
              <th style={styles.th}>Tên sản phẩm</th>
              <th style={styles.th}>Danh mục</th>
              <th style={styles.th}>Giá</th>
              <th style={styles.th}>Giảm giá</th>
              <th style={styles.th}>Tồn kho</th>
              <th style={styles.th}>Đã bán</th>
              <th style={styles.th}>Hot</th>
              <th style={styles.th}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id} style={styles.tr}>
                <td style={styles.td}>
                  {p.image
                    ? <img src={p.image} alt={p.name} style={styles.productThumb} />
                    : <div style={styles.thumbPlaceholder}>?</div>
                  }
                </td>
                <td style={styles.td}><span style={{ fontWeight: 500 }}>{p.name}</span></td>
                <td style={styles.td}>{p.category?.name || "—"}</td>
                <td style={styles.td}>
                  {p.discount > 0 ? (
                    <div>
                      <span style={{ textDecoration: "line-through", color: "#9ca3af", fontSize: "12px" }}>
                        {Number(p.price).toLocaleString("vi-VN")}₫
                      </span>
                      <br />
                      <span style={{ color: "#ef4444", fontWeight: 600 }}>
                        {Math.round(p.price * (1 - p.discount / 100)).toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                  ) : (
                    <span>{Number(p.price).toLocaleString("vi-VN")}₫</span>
                  )}
                </td>
                <td style={styles.td}>
                  {p.discount > 0
                    ? <span style={styles.discountTag}>-{p.discount}%</span>
                    : <span style={{ color: "#9ca3af" }}>—</span>
                  }
                </td>
                <td style={styles.td}>
                  <span style={{ color: p.stock === 0 ? "#ef4444" : "#111" }}>{p.stock}</span>
                </td>
                <td style={styles.td}>{p.sold}</td>
                <td style={styles.td}>
                  {p.isHot
                    ? <span style={{ fontSize: "16px" }}>🔥</span>
                    : <span style={{ color: "#9ca3af" }}>—</span>
                  }
                </td>
                <td style={styles.td}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => openEdit(p)} style={styles.editBtn}>Sửa</button>
                    <button onClick={() => handleDelete(p._id)} style={styles.deleteBtn}>Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>{editing ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h2>
            <div style={styles.formGrid}>
              <FormField label="Tên sản phẩm *" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="Áo thun nam..." />
              <FormField label="Giá (₫) *" type="number" value={form.price} onChange={v => setForm({ ...form, price: v })} placeholder="150000" />
              <FormSelect label="Danh mục *" value={form.category} onChange={v => setForm({ ...form, category: v })} options={categories.map(c => ({ value: c._id, label: c.name }))} />
              <FormField label="Tồn kho" type="number" value={form.stock} onChange={v => setForm({ ...form, stock: v })} placeholder="100" />
              <FormField label="URL ảnh" value={form.image} onChange={v => setForm({ ...form, image: v })} placeholder="https://..." />
              <FormField label="Sizes (cách nhau bởi dấu phẩy)" value={form.sizes} onChange={v => setForm({ ...form, sizes: v })} placeholder="S, M, L, XL" />
              <FormField label="Màu sắc (cách nhau bởi dấu phẩy)" value={form.colors} onChange={v => setForm({ ...form, colors: v })} placeholder="Đỏ, Xanh, Trắng" />
              <FormField label="Giảm giá (%)" type="number" value={form.discount} onChange={v => setForm({ ...form, discount: v })} placeholder="0 - 100" />

    
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <label style={styles.label}>Sản phẩm hot</label>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", height: "40px" }}>
                  <input
                    type="checkbox"
                    id="isHot"
                    checked={form.isHot}
                    onChange={e => setForm({ ...form, isHot: e.target.checked })}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <label htmlFor="isHot" style={{ fontSize: "14px", cursor: "pointer", color: "#374151" }}>
                    🔥 Đánh dấu là hot
                  </label>
                </div>
              </div>
            </div>

    
            <div style={{ marginTop: "1rem" }}>
              <label style={styles.label}>Mô tả</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Mô tả sản phẩm..."
                style={{ ...styles.input, resize: "vertical" }}
              />
            </div>

            <div style={styles.modalFooter}>
              <button onClick={() => setShowModal(false)} style={styles.cancelBtn}>Hủy</button>
              <button onClick={handleSubmit} disabled={saving} style={{ ...styles.primaryBtn, opacity: saving ? 0.7 : 1 }}>
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: "", description: "", image: "" })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchCategories() }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try { const res = await API.get("/categories"); setCategories(res.data) }
    catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

const handleSubmit = async () => {
  const name = form.name.trim()

  if (!name) {
    return alert("Tên danh mục không được để trống")
  }

  if (name.length < 2) {
    return alert("Tên phải >= 2 ký tự")
  }

  const isDuplicate = categories.some(
    c => c.name.toLowerCase() === name.toLowerCase()
  )

  if (isDuplicate) {
    return alert("Danh mục đã tồn tại")
  }

  setSaving(true)
  try {
    await API.post("/categories", { ...form, name })
    setShowModal(false)
    setForm({ name: "", description: "", image: "" })
    fetchCategories()
  } catch (err) {
    console.error(err)
  } finally {
    setSaving(false)
  }
}

 const handleDelete = async (cat) => {
  if (!window.confirm(`Bạn có chắc chắn muốn xoá danh mục "${cat.name}" không?`)) return

  try {
    await API.delete(`/categories/${cat._id}`)
    fetchCategories()
  } catch (err) {
    console.error(err)
  }
}

  if (loading) return <Spinner />

  return (
    <div>
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>Danh mục</h1>
        <button onClick={() => setShowModal(true)} style={styles.primaryBtn}>+ Thêm danh mục</button>
      </div>

      <div style={styles.catGrid}>
        {categories.map(cat => (
          <div key={cat._id} style={styles.catCard}>
            {cat.image
              ? <img src={cat.image} alt={cat.name} style={styles.catImg} />
              : <div style={styles.catImgPlaceholder}><span style={{ fontSize: "28px" }}>🏷️</span></div>
            }
            <div style={styles.catInfo}>
              <p style={styles.catName}>{cat.name}</p>
              {cat.description && <p style={styles.catDesc}>{cat.description}</p>}
            </div>
           <button onClick={() => handleDelete(cat)} style={styles.deleteBtnSm}>✕</button>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, maxWidth: "420px" }}>
            <h2 style={styles.modalTitle}>Thêm danh mục</h2>
            <FormField label="Tên danh mục *" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="Áo nam, Quần nữ..." />
            <div style={{ marginTop: "1rem" }}>
              <FormField label="Mô tả" value={form.description} onChange={v => setForm({ ...form, description: v })} placeholder="Mô tả danh mục..." />
            </div>
            <div style={{ marginTop: "1rem" }}>
              <FormField label="URL ảnh" value={form.image} onChange={v => setForm({ ...form, image: v })} placeholder="https://..." />
            </div>
            <div style={styles.modalFooter}>
              <button onClick={() => setShowModal(false)} style={styles.cancelBtn}>Hủy</button>
              <button onClick={handleSubmit} disabled={saving} style={{ ...styles.primaryBtn, opacity: saving ? 0.7 : 1 }}>
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  const statusColor = { pending: "#f59e0b", processing: "#3b82f6", shipped: "#8b5cf6", delivered: "#10b981", cancelled: "#ef4444" }
  const statusLabel = { pending: "Chờ xử lý", processing: "Đang xử lý", shipped: "Đang giao", delivered: "Đã giao", cancelled: "Đã hủy" }
  const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"]

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try { const res = await API.get("/orders"); setOrders(res.data) }
    catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/orders/${id}`, { status })
      setOrders(orders.map(o => o._id === id ? { ...o, status } : o))
      if (selected?._id === id) setSelected({ ...selected, status })
    } catch (err) { console.error(err) }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <h1 style={styles.pageTitle}>Đơn hàng</h1>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Khách hàng</th>
              <th style={styles.th}>SĐT</th>
              <th style={styles.th}>Địa chỉ</th>
              <th style={styles.th}>Tổng tiền</th>
              <th style={styles.th}>Trạng thái</th>
              <th style={styles.th}>Ngày đặt</th>
              <th style={styles.th}>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id} style={styles.tr}>
                <td style={styles.td}>{order.user?.username || "—"}</td>
                <td style={styles.td}>{order.phone}</td>
                <td style={styles.td}>{order.shippingAddress}</td>
                <td style={styles.td}><strong>{order.totalPrice.toLocaleString("vi-VN")}₫</strong></td>
                <td style={styles.td}>
                  <select
                    value={order.status}
                    onChange={e => updateStatus(order._id, e.target.value)}
                    style={{ ...styles.statusSelect, color: statusColor[order.status], borderColor: statusColor[order.status] + "55" }}
                  >
                    {statusOptions.map(s => <option key={s} value={s}>{statusLabel[s]}</option>)}
                  </select>
                </td>
                <td style={styles.td}>{new Date(order.createdAt).toLocaleDateString("vi-VN")}</td>
                <td style={styles.td}>
                  <button onClick={() => setSelected(order)} style={styles.editBtn}>Xem</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, maxWidth: "520px" }}>
            <h2 style={styles.modalTitle}>Chi tiết đơn hàng</h2>
            <div style={styles.orderInfo}>
              <div style={styles.orderInfoRow}><span style={styles.orderInfoLabel}>Khách hàng</span><span>{selected.user?.username}</span></div>
              <div style={styles.orderInfoRow}><span style={styles.orderInfoLabel}>SĐT</span><span>{selected.phone}</span></div>
              <div style={styles.orderInfoRow}><span style={styles.orderInfoLabel}>Địa chỉ</span><span>{selected.shippingAddress}</span></div>
              <div style={styles.orderInfoRow}>
                <span style={styles.orderInfoLabel}>Trạng thái</span>
                <span style={{ color: statusColor[selected.status], fontWeight: 500 }}>{statusLabel[selected.status]}</span>
              </div>
            </div>

            <h3 style={{ fontSize: "14px", fontWeight: 500, margin: "1rem 0 0.5rem" }}>Sản phẩm</h3>
            <div style={styles.orderItems}>
              {selected.products.map((item, i) => (
                <div key={i} style={styles.orderItem}>
                  <div>
                    <p style={{ fontWeight: 500, margin: 0 }}>{item.name}</p>
                    <p style={{ fontSize: "12px", color: "#9ca3af", margin: "2px 0 0" }}>
                      {item.size && `Size: ${item.size}`} {item.color && `• Màu: ${item.color}`}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0 }}>x{item.quantity}</p>
                    <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>{item.price.toLocaleString("vi-VN")}₫</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.orderTotal}>
              <span>Tổng cộng</span>
              <strong>{selected.totalPrice.toLocaleString("vi-VN")}₫</strong>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={() => setSelected(null)} style={styles.primaryBtn}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


function FormField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label style={styles.label}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={styles.input} />
    </div>
  )
}

function FormSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label style={styles.label}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={styles.input}>
        <option value="">-- Chọn danh mục --</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px", flexDirection: "column", gap: "1rem" }}>
      <div style={{ width: "32px", height: "32px", border: "3px solid #e5e7eb", borderTop: "3px solid #111", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "#9ca3af", fontSize: "14px" }}>Đang tải...</p>
    </div>
  )
}


const styles = {
  page: { display: "flex", minHeight: "100vh", background: "#f5f5f5" },
  sidebar: { width: "240px", minHeight: "100vh", background: "#111", display: "flex", flexDirection: "column", padding: "1.5rem 1rem", flexShrink: 0, position: "sticky", top: 0 },
  sidebarLogo: { fontSize: "18px", fontWeight: "700", color: "#fff", marginBottom: "4px" },
  sidebarRole: { fontSize: "11px", color: "#6b7280", marginBottom: "2rem", paddingLeft: "2px" },
  nav: { display: "flex", flexDirection: "column", gap: "4px", flex: 1 },
  navItem: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", border: "none", background: "transparent", color: "#9ca3af", fontSize: "14px", cursor: "pointer", textAlign: "left", transition: "all 0.15s" },
  navItemActive: { background: "#fff", color: "#111", fontWeight: "500" },
  sidebarBottom: { borderTop: "1px solid #222", paddingTop: "1rem" },
  sidebarUser: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" },
  avatar: { width: "34px", height: "34px", borderRadius: "50%", background: "#185FA5", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "14px", fontWeight: "600", flexShrink: 0 },
  userName: { fontSize: "13px", color: "#fff", fontWeight: "500", margin: 0 },
  userRole: { fontSize: "11px", color: "#6b7280", margin: 0 },
  logoutBtn: { width: "100%", padding: "8px", background: "transparent", border: "1px solid #333", borderRadius: "8px", color: "#9ca3af", fontSize: "13px", cursor: "pointer" },
  main: { flex: 1, padding: "2rem", maxWidth: "calc(100vw - 240px)", overflowX: "hidden" },
  pageTitle: { fontSize: "22px", fontWeight: "600", color: "#111", marginBottom: "1.5rem" },
  pageHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" },
  statCard: { background: "#fff", borderRadius: "14px", border: "1px solid #e5e7eb", padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" },
  statIcon: { width: "52px", height: "52px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  statLabel: { fontSize: "12px", color: "#9ca3af", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" },
  statValue: { fontSize: "22px", fontWeight: "700", color: "#111", margin: 0 },
  section: { background: "#fff", borderRadius: "14px", border: "1px solid #e5e7eb", padding: "1.5rem" },
  sectionTitle: { fontSize: "16px", fontWeight: "500", color: "#111", marginBottom: "1rem" },
  tableWrap: { background: "#fff", borderRadius: "14px", border: "1px solid #e5e7eb", overflow: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f9fafb" },
  th: { padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "500", color: "#6b7280", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" },
  tr: { borderBottom: "1px solid #f3f4f6" },
  td: { padding: "12px 16px", fontSize: "13px", color: "#374151", verticalAlign: "middle" },
  badge: { display: "inline-block", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500" },
  discountTag: { background: "#fef2f2", color: "#ef4444", fontSize: "12px", fontWeight: "600", padding: "3px 8px", borderRadius: "6px", display: "inline-block" },
  productThumb: { width: "44px", height: "44px", borderRadius: "8px", objectFit: "cover" },
  thumbPlaceholder: { width: "44px", height: "44px", borderRadius: "8px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "18px" },
  editBtn: { padding: "5px 12px", background: "#f3f4f6", border: "none", borderRadius: "7px", fontSize: "12px", cursor: "pointer", color: "#374151", fontWeight: "500" },
  deleteBtn: { padding: "5px 12px", background: "#fff1f1", border: "none", borderRadius: "7px", fontSize: "12px", cursor: "pointer", color: "#ef4444", fontWeight: "500" },
  deleteBtnSm: { background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "16px", padding: "4px", lineHeight: 1, flexShrink: 0 },
  primaryBtn: { padding: "9px 18px", background: "#111", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "500", cursor: "pointer" },
  cancelBtn: { padding: "9px 18px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "10px", fontSize: "14px", cursor: "pointer" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" },
  modal: { background: "#fff", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "620px", maxHeight: "90vh", overflowY: "auto" },
  modalTitle: { fontSize: "18px", fontWeight: "600", color: "#111", marginBottom: "1.5rem" },
  modalFooter: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "1.5rem" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  label: { fontSize: "13px", fontWeight: "500", color: "#374151", display: "block", marginBottom: "6px" },
  input: { width: "100%", padding: "9px 12px", fontSize: "14px", border: "1.5px solid #e5e7eb", borderRadius: "9px", outline: "none", boxSizing: "border-box", background: "#fafafa", color: "#111" },
  catGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" },
  catCard: { background: "#fff", borderRadius: "14px", border: "1px solid #e5e7eb", overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" },
  catImg: { width: "100%", height: "120px", objectFit: "cover" },
  catImgPlaceholder: { width: "100%", height: "120px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" },
  catInfo: { padding: "12px 14px" },
  catName: { fontSize: "14px", fontWeight: "600", color: "#111", margin: "0 0 4px" },
  catDesc: { fontSize: "12px", color: "#9ca3af", margin: 0 },
  statusSelect: { padding: "5px 10px", border: "1.5px solid", borderRadius: "8px", fontSize: "12px", fontWeight: "500", background: "#fff", cursor: "pointer", outline: "none" },
  orderInfo: { background: "#f9fafb", borderRadius: "10px", padding: "1rem", display: "flex", flexDirection: "column", gap: "8px" },
  orderInfoRow: { display: "flex", justifyContent: "space-between", fontSize: "13px" },
  orderInfoLabel: { color: "#9ca3af" },
  orderItems: { display: "flex", flexDirection: "column", gap: "8px", maxHeight: "200px", overflowY: "auto" },
  orderItem: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 12px", background: "#f9fafb", borderRadius: "8px", fontSize: "13px" },
  orderTotal: { display: "flex", justifyContent: "space-between", fontSize: "15px", borderTop: "1px solid #e5e7eb", paddingTop: "12px", marginTop: "8px" },
}