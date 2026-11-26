# Măm Măm — FrontEnd (React + Vite)

Giao diện React 19 + React Router 7, gọi REST API của Django qua Vite proxy.

## Chạy

```bash
npm install
npm run dev
```

Mở http://localhost:5173. Cần chạy BackEnd Django ở `http://127.0.0.1:8000` (xem README ở thư mục gốc dự án).

## Cấu hình

- `vite.config.js`: proxy `/api`, `/media`, `/static` sang BackEnd.
- `VITE_API_BASE_URL` (tùy chọn): đặt trong `.env` nếu muốn gọi thẳng BackEnd thay vì proxy.

## Cấu trúc

- `src/api/`: `client.js` (session + CSRF), `auth.js`, `reviews.js`, `catalog.js`
- `src/context/`: `AuthProvider`, `useAuth`
- `src/components/Auth/`: form đăng nhập / đăng ký ở góc trên bên phải trang chủ
- `src/pages/`: Home, Feed, ReviewDetail, CreatePost, Profile
- `src/utils/`: nhúng video, định dạng ngày/giá, adapter dữ liệu API → card

Tài liệu đầy đủ: [`../README.md`](../README.md).
