import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import API from "../services/api"

const STATUS_CONFIG = {
  pending:    { label: "Chờ xử lý",  bg: "#FFF7ED", color: "#9A3412", border: "#FED7AA" },
  processing: { label: "Đang xử lý", bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
  shipped:    { label: "Đang giao",  bg: "#F5F3FF", color: "#6D28D9", border: "#DDD6FE" },
  delivered:  { label: "Đã giao",    bg: "#F0FDF4", color: "#15803D", border: "#BBF7D0" },
  cancelled:  { label: "Đã huỷ",     bg: "#FFF1F2", color: "#BE123C", border: "#FECDD3" },
}

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN").format(price) + "đ"

const formatDate = (date) =>
  new Date(date).toLocaleString("vi-VN")

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || {}
  return (
    <span
      style={{
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        padding: "4px 10px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "600"
      }}
    >
      {cfg.label}
    </span>
  )
}

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get(`/orders/my/${id}`)
      .then(res => setOrder(res.data)) // ⚠️ fix
      .catch(() => navigate("/my-orders"))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={styles.center}>Đang tải...</div>
  if (!order) return <div style={styles.center}>Không có dữ liệu</div>

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <button onClick={() => navigate("/my-orders")} style={styles.backBtn}>
          ← Quay lại
        </button>

        <div>
          <h2 style={styles.title}>Chi tiết đơn hàng</h2>
          <p style={styles.sub}>
            #{order._id.slice(-8).toUpperCase()} • {formatDate(order.createdAt)}
          </p>
        </div>

        <StatusBadge status={order.status} />
      </div>

      {/* INFO */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Thông tin giao hàng</h3>
        <p>{order.shippingAddress}</p>
        <p style={{ color: "#6b7280" }}>{order.phone}</p>
      </div>

      {/* PRODUCTS */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Sản phẩm</h3>

        {order.products.map((item, i) => (
          <div key={i} style={styles.item}>
            <div>
              <p style={styles.itemName}>{item.name}</p>
              <p style={styles.itemSub}>
                {item.size && `Size: ${item.size}`} 
                {item.color && ` • ${item.color}`} 
                {" "}• x{item.quantity}
              </p>
            </div>

            <div style={styles.price}>
              {formatPrice(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      {/* TOTAL */}
      <div style={styles.total}>
        <span>Tổng cộng</span>
        <strong>{formatPrice(order.totalPrice)}</strong>
      </div>
    </div>
  )
}

const styles = {
  page: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "2rem 1rem"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem"
  },

  backBtn: {
    border: "none",
    background: "none",
    cursor: "pointer",
    color: "#6b7280"
  },

  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "600"
  },

  sub: {
    margin: 0,
    fontSize: "13px",
    color: "#9ca3af"
  },

  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "1rem",
    marginBottom: "1rem"
  },

  cardTitle: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "10px"
  },

  item: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #f3f4f6"
  },

  itemName: {
    margin: 0,
    fontWeight: "500"
  },

  itemSub: {
    margin: 0,
    fontSize: "12px",
    color: "#9ca3af"
  },

  price: {
    fontWeight: "600"
  },

  total: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "18px",
    fontWeight: "600",
    marginTop: "1rem"
  },

  center: {
    textAlign: "center",
    padding: "3rem"
  }
}