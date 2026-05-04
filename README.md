# Clothing Store V3 - Docker Full Package

Dự án đã được đóng gói full Docker gồm:

- `frontend`: React + Vite, build static và chạy bằng Nginx.
- `backend`: Node.js + Express + MongoDB/Mongoose.
- `mongodb`: MongoDB 7 kèm volume lưu dữ liệu.
- Seed dữ liệu tự động: tài khoản admin, danh mục và sản phẩm mẫu.
- Proxy `/api` từ frontend sang backend để chạy một domain/port duy nhất.

## Chạy nhanh bằng Docker

Yêu cầu máy đã cài Docker Desktop hoặc Docker Engine có Compose.

```bash
docker compose up --build
```

Sau khi build xong, mở:

- Frontend: http://localhost:3000
- Backend healthcheck: http://localhost:5001/health
- MongoDB: localhost:27017

Tài khoản admin mặc định:

```txt
Email: admin@clothing.local
Password: Admin@123456
```

Có thể đổi thông tin bằng cách copy `.env.example` thành `.env` rồi sửa:

```bash
cp .env.example .env
```

## Lệnh hữu ích

```bash
# Chạy full stack
docker compose up --build

# Chạy nền
docker compose up -d --build

# Xem log
docker compose logs -f

# Dừng container nhưng giữ dữ liệu MongoDB
docker compose down

# Dừng và xóa luôn dữ liệu MongoDB
docker compose down -v
```

## Chạy local không Docker

Backend:

```bash
cd clothing-backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

Frontend:

```bash
cd clothing-frontend
cp .env.example .env
npm install
npm run dev
```

Nếu chạy frontend bằng Vite local, đặt `VITE_API_URL=http://localhost:5001/api` trong `clothing-frontend/.env`.

## Các cải tiến đã bổ sung

- Docker Compose full stack chạy một lệnh.
- Dockerfile riêng cho backend và frontend.
- Nginx reverse proxy cho React SPA và API.
- Healthcheck cho backend và MongoDB.
- Seed script tự tạo admin, danh mục, sản phẩm mẫu.
- Backend chuẩn hóa response, thêm endpoint `/health`, xử lý 404 và error handler.
- API sản phẩm hỗ trợ tìm kiếm, lọc danh mục, lọc hot, sắp xếp, phân trang.
- Tạo đơn hàng an toàn hơn: backend tự tính lại giá, kiểm tra tồn kho, trừ stock và tăng sold.
- Frontend dùng `VITE_API_URL`, tự unwrap response `{ success, data }`.
- Sửa lỗi giỏ hàng khi thêm từ trang Home thiếu `cartKey`.
- Thêm sắp xếp sản phẩm trên trang Home.
- Sửa điều hướng `/` để tự vào trang phù hợp theo trạng thái đăng nhập.

## Cấu trúc chính

```txt
.
├── docker-compose.yml
├── .env.example
├── clothing-backend
│   ├── Dockerfile
│   ├── server.js
│   ├── scripts/seed.js
│   ├── controllers
│   ├── models
│   └── routes
└── clothing-frontend
    ├── Dockerfile
    ├── nginx.conf
    └── src
```
