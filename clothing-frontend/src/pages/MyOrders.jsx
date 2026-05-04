import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import API from "../services/api"

const STATUS_CONFIG = {
  pending:    { label: "Chờ xử lý",  bg: "#FFF7ED", color: "#9A3412", dot: "#F97316", border: "#FED7AA" },
  processing: { label: "Đang xử lý", bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6", border: "#BFDBFE" },
  shipped:    { label: "Đang giao",  bg: "#F5F3FF", color: "#6D28D9", dot: "#8B5CF6", border: "#DDD6FE" },
  delivered:  { label: "Đã giao",    bg: "#F0FDF4", color: "#15803D", dot: "#22C55E", border: "#BBF7D0" },
  cancelled:  { label: "Đã huỷ",     bg: "#FFF1F2", color: "#BE123C", dot: "#EF4444", border: "#FECDD3" },
}

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN").format(price) + "đ"

const formatDate = (date) => {
  const d = new Date(date)
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " " + d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
}

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: "#F9FAFB", color: "#374151", dot: "#9CA3AF", border: "#E5E7EB" }
  return (
    <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, ...styles.badge }}>
      <span style={{ background: cfg.dot, ...styles.dot }} />
      {cfg.label}
    </span>
  )
}

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    API.get("/orders/my")
      .then(res => setOrders(res.data))
      .catch(() => setError("Không thể tải danh sách đơn hàng."))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner} />
        <p style={{ color: "#9ca3af", fontSize: "14px" }}>Đang tải...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ ...styles.centered, flexDirection: "column", gap: "12px" }}>
        <div style={styles.errorIcon}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#ef4444">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p style={{ color: "#ef4444", fontSize: "14px", fontWeight: 500 }}>{error}</p>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Đơn hàng của tôi</h1>
          {orders.length > 0 && (
            <p style={styles.pageSubtitle}>{orders.length} đơn hàng</p>
          )}
        </div>
        <Link to="/" style={styles.shopBtn}>
          Tiếp tục mua sắm →
        </Link>
      </div>

      {/* Empty */}
      {orders.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#d1d5db">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p style={{ fontSize: "15px", fontWeight: 600, color: "#374151", margin: "0 0 6px" }}>
            Chưa có đơn hàng nào
          </p>
          <p style={{ fontSize: "13px", color: "#9ca3af", margin: "0 0 20px" }}>
            Hãy khám phá và đặt đơn đầu tiên của bạn
          </p>
          <Link to="/" style={styles.primaryBtn}>Khám phá sản phẩm</Link>
        </div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Mã đơn</th>
                <th style={styles.th}>Ngày đặt</th>
                <th style={styles.th}>Sản phẩm</th>
                <th style={styles.th}>Tổng tiền</th>
                <th style={styles.th}>Trạng thái</th>
                <th style={styles.th}>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id} style={styles.tr}>
                  <td style={styles.td}>
                    <span style={styles.orderId}>#{order._id.slice(-8).toUpperCase()}</span>
                  </td>
                  <td style={{ ...styles.td, color: "#6b7280", whiteSpace: "nowrap" }}>
                    {formatDate(order.createdAt)}
                  </td>
                  <td style={styles.td}>
                    <p style={{ margin: 0, fontWeight: 500, color: "#111", maxWidth: "240px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {order.products?.[0]?.name || "—"}
                    </p>
                    {order.products?.length > 1 && (
                      <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#9ca3af" }}>
                        +{order.products.length - 1} sản phẩm khác
                      </p>
                    )}
                  </td>
                  <td style={styles.td}>
                    <strong style={{ color: "#111" }}>{formatPrice(order.totalPrice)}</strong>
                  </td>
                  <td style={styles.td}>
                    <StatusBadge status={order.status} />
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => navigate(`/my-orders/${order._id}`)}
                      style={styles.viewBtn}
                    >
                      Xem
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const styles = {
  page: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "2rem 1rem",
  },
  pageHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "1.5rem",
  },
  pageTitle: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#111",
    margin: "0 0 4px",
  },
  pageSubtitle: {
    fontSize: "13px",
    color: "#9ca3af",
    margin: 0,
  },
  shopBtn: {
    fontSize: "13px",
    color: "#374151",
    textDecoration: "none",
    padding: "8px 14px",
    border: "1px solid #e5e7eb",
    borderRadius: "9px",
    background: "#fff",
    fontWeight: 500,
    flexShrink: 0,
  },
  primaryBtn: {
    padding: "9px 18px",
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
  },
  centered: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    flexDirection: "column",
    gap: "12px",
  },
  spinner: {
    width: "32px",
    height: "32px",
    border: "3px solid #e5e7eb",
    borderTop: "3px solid #111",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  errorIcon: {
    width: "48px",
    height: "48px",
    background: "#fef2f2",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    background: "#fff",
    borderRadius: "14px",
    border: "1px solid #e5e7eb",
    padding: "4rem 2rem",
    textAlign: "center",
  },
  emptyIcon: {
    width: "64px",
    height: "64px",
    background: "#f3f4f6",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  tableWrap: {
    background: "#fff",
    borderRadius: "14px",
    border: "1px solid #e5e7eb",
    overflow: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  thead: {
    background: "#f9fafb",
  },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: 500,
    color: "#6b7280",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  tr: {
    borderBottom: "1px solid #f3f4f6",
  },
  td: {
    padding: "13px 16px",
    fontSize: "13px",
    color: "#374151",
    verticalAlign: "middle",
  },
  orderId: {
    fontFamily: "monospace",
    fontSize: "12px",
    fontWeight: 600,
    color: "#6b7280",
    background: "#f3f4f6",
    padding: "3px 8px",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "11px",
    fontWeight: 700,
    padding: "3px 10px",
    borderRadius: "20px",
    whiteSpace: "nowrap",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  viewBtn: {
    padding: "5px 12px",
    background: "#f3f4f6",
    border: "none",
    borderRadius: "7px",
    fontSize: "12px",
    cursor: "pointer",
    color: "#374151",
    fontWeight: 500,
  },
}