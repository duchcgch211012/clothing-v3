import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import API from "../services/api"

export default function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError("") 
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!formData.email || !formData.password) {
      setError("Vui lòng nhập đầy đủ thông tin")
      return
    }

    setLoading(true)
    try {
      const res = await API.post("/auth/login", formData)
      const { token, user } = res.data

   
      localStorage.setItem("user", JSON.stringify({ token, ...user }))

 
      if (user.role === "admin") {
        navigate("/admin")
      } else {
        navigate("/home")
      }
    } catch (err) {
      const msg = err.response?.data
      if (msg === "User not found") setError("Email không tồn tại")
      else if (msg === "Wrong password") setError("Mật khẩu không đúng")
      else setError("Đăng nhập thất bại, thử lại sau")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
     
        <div style={styles.header}>
          <div style={styles.iconWrap}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="#185FA5" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h2 style={styles.title}>Đăng nhập</h2>
          <p style={styles.subtitle}>Chào mừng bạn quay trở lại</p>
        </div>

        

        <form onSubmit={handleSubmit} noValidate>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              autoComplete="email"
            />
          </div>

       
          <div style={styles.field}>
            <label style={styles.label}>Mật khẩu</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                style={{ ...styles.input, paddingRight: "40px" }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
       
            <div style={{ textAlign: "right", marginBottom: "1.5rem" }}>
                <span style={{ fontSize: "12px", color: "#185FA5", cursor: "pointer" }}>
                    Quên mật khẩu?
                </span>
            </div>

          {error && (
            <div style={styles.errorBox}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}


          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

   
        <p style={styles.footer}>
          Chưa có tài khoản?{" "}
          <Link to="/register" style={styles.link}>Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f0f2f5",
    padding: "1rem",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
    padding: "3rem 3.5rem",    
    width: "100%",
    maxWidth: "480px",           
    boxSizing: "border-box",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  header: {
    textAlign: "center",
    marginBottom: "2.25rem",
  },
  iconWrap: {
    width: "60px",                
    height: "60px",
    background: "#e6f1fb",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1.25rem",
  },
  title: {
    fontSize: "22px",
    fontWeight: "600",
    margin: "0 0 6px",
    color: "#111",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    margin: 0,
  },
  field: {
    marginBottom: "1.25rem",
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#374151",
    display: "block",
    marginBottom: "7px",
  },
  input: {
    width: "100%",
    padding: "11px 14px",         
    fontSize: "14px",
    border: "1.5px solid #e5e7eb",
    borderRadius: "10px",
    outline: "none",
    boxSizing: "border-box",
    color: "#111",
    background: "#fafafa",        
  },
  eyeBtn: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    color: "#9ca3af",
    display: "flex",
    alignItems: "center",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#fff1f1",
    border: "1px solid #fca5a5",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "13px",
    color: "#dc2626",
    marginBottom: "1rem",
  },
  submitBtn: {
    width: "100%",
    padding: "12px",
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    letterSpacing: "0.01em",
    transition: "opacity 0.2s",
  },
  footer: {
    textAlign: "center",
    fontSize: "13px",
    color: "#6b7280",
    marginTop: "1.5rem",
    marginBottom: 0,
  },
  link: {
    color: "#185FA5",
    fontWeight: "500",
    textDecoration: "none",
  },
}