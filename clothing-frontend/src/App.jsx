import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"
import Admin from "./pages/Admin"
import ProductDetail from "./pages/ProductDetail"
import Cart from "./pages/Cart"


function RootRedirect() {
  const user = JSON.parse(localStorage.getItem("user") || "null")
  if (!user?.token) return <Navigate to="/login" replace />
  return <Navigate to={user.role === "admin" ? "/admin" : "/home"} replace />
}

function PrivateRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"))
  return user?.token ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"))
  if (!user?.token) return <Navigate to="/login" replace />
  if (user?.role !== "admin") return <Navigate to="/home" replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />

        <Route path="/product/:id" element={<PrivateRoute><ProductDetail /></PrivateRoute>} />
        <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />

        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App