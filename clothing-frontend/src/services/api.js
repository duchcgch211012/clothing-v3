import axios from "axios"

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
})

API.interceptors.request.use((req) => {
  const user = JSON.parse(localStorage.getItem("user") || "null")

  if (user?.token) {
    req.headers.Authorization = `Bearer ${user.token}`
  }

  return req
})

API.interceptors.response.use(
  (response) => {
    // Backend chuẩn hóa dạng { success, data }. Interceptor này giúp các page cũ
    // vẫn dùng được response.data như mảng/sản phẩm trực tiếp.
    if (response.data && typeof response.data === "object" && "success" in response.data && "data" in response.data) {
      response.meta = {
        count: response.data.count,
        page: response.data.page,
        pages: response.data.pages,
        total: response.data.total,
      }
      response.data = response.data.data
    }
    return response
  },
  (error) => {
    const data = error.response?.data
    error.friendlyMessage = typeof data === "string" ? data : data?.message || error.message
    return Promise.reject(error)
  }
)

export default API
