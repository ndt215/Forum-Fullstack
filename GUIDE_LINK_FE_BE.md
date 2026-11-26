# Hướng Dẫn Liên Kết FrontEnd & BackEnd + Bổ Sung Video Review

Tài liệu này cung cấp lộ trình và chi tiết kỹ thuật để liên kết **FrontEnd (React + Vite)** và **BackEnd (Django + DRF)** thành một project hoàn chỉnh, đồng thời bổ sung tính năng **nhúng video review quán ăn (YouTube, TikTok, Vimeo, ...)** cho bài viết.

---

## 1. Hiện trạng dự án
- **BackEnd (`BackEnd/`)**:
  - Đã có sẵn REST API tại `/api/` (`BackEnd/reviews/urls.py`), hỗ trợ sẵn `SessionAuthentication` (dùng cookie session của Django, không cần JWT), đã bật `CORS_ALLOW_ALL_ORIGINS = True` và `CORS_ALLOW_CREDENTIALS = True` (`BackEnd/core/settings.py`).
  - Các endpoint chính:
    - Auth: `POST /api/dang-ky/`, `POST /api/dang-nhap/`, `POST /api/dang-xuat/`, `GET/PATCH /api/ho-so/`
    - Dữ liệu: `/api/nguoi-dung/`, `/api/nha-hang/`, `/api/the-mon-an/`, `/api/bai-review/`, `/api/cham-diem/`, `/api/hinh-anh/`, `/api/binh-luan/`, `/api/luot-thich/`, `/api/quan-yeu-thich/`, `/api/theo-doi/`, `/api/tong-quan/`
- **FrontEnd (`FrontEnd/`)**:
  - Hiện tại chỉ mới có giao diện (React 19 + React Router 7 + Vite 8), **chưa có lệnh gọi API (`fetch`/`axios`)** tới BackEnd.
  - Các trang hiện có: `HomePage` (`/`), `FeedPage` (`/feed`), `ProfilePage` (`/profile`), `ReviewDetailPage` (`/review`), `CreatePostPage` (`/create`).

---

## 2. Nhiệm vụ 1: Bổ sung tính năng nhúng Video Review (BackEnd)

### Bước 1.1: Cập nhật Model `BaiReview`
Trong `BackEnd/reviews/models.py`, thêm trường lưu URL video vào class `BaiReview`:
```python
video_url = models.URLField(
    max_length=500,
    blank=True,
    null=True,
    verbose_name="Link video review (YouTube, TikTok, ...)",
)
```

### Bước 1.2: Tạo và chạy Migration
```bash
cd BackEnd
python manage.py makemigrations
python manage.py migrate
```

### Bước 1.3: Cập nhật Serializer
Trong `BackEnd/reviews/serializers.py`, đảm bảo `BaiReviewSerializer` (và các serializer chi tiết/tạo bài viết liên quan) có bao gồm `"video_url"` trong `fields`.
- Nên thêm validate nhẹ (tùy chọn) để kiểm tra URL hợp lệ nếu `video_url` không rỗng.

---

## 3. Nhiệm vụ 2: Thiết lập kết nối API trên FrontEnd

### Bước 2.1: Cấu hình Proxy trong Vite (khuyên dùng khi dev)
Trong `FrontEnd/vite.config.js`, thêm `server.proxy` để tránh lỗi CORS/cookie khi gọi `/api` và `/media`:
```js
export default defineConfig({
  // ...
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8000",
      "/media": "http://127.0.0.1:8000",
    },
  },
});
```

### Bước 2.2: Tạo API Client & Auth Helper (dùng Session)
Tạo thư mục `FrontEnd/src/api/` với file `client.js`:
- Không cần lưu JWT hay `Token` vào `localStorage`; trình duyệt sẽ tự động lưu và gửi cookie `sessionid` khi dùng `credentials: "include"`.
- Hàm `apiFetch(endpoint, options)` tự động gắn:
  - `credentials: "include"` để gửi kèm cookie session.
  - Header `X-CSRFToken` lấy từ cookie `csrftoken` (cho các request `POST`, `PUT`, `PATCH`, `DELETE`).
  - `Content-Type: application/json` (trừ khi body là `FormData` để upload ảnh).
- Xử lý response JSON và ném lỗi rõ ràng khi `!res.ok`.

---

## 4. Nhiệm vụ 3: Liên kết các trang FrontEnd với BackEnd

1. **Xác thực (`Header` / trang hoặc modal Đăng nhập - Đăng ký)**:
   - Gọi `POST /api/dang-nhap/` (với `credentials: "include"`) -> Django tự tạo session cookie, lưu thông tin user trả về vào React state/context.
   - Gọi `POST /api/dang-ky/` -> tạo tài khoản mới.
   - Gọi `POST /api/dang-xuat/` -> Django xóa session; xóa user khỏi React state.
2. **Trang chủ & Bảng tin (`HomePage`, `FeedPage`)**:
   - Gọi `GET /api/bai-review/` (hỗ trợ phân trang `PageNumberPagination`: `results`, `next`, `previous`).
   - Gọi `GET /api/nha-hang/` và `GET /api/the-mon-an/` nếu có bộ lọc.
3. **Chi tiết bài viết (`ReviewDetailPage`)**:
   - Cập nhật route thành `/review/:id` trong `App.jsx` (hoặc đọc query param) để lấy đúng bài viết.
   - Gọi `GET /api/bai-review/<id>/` để lấy chi tiết bài viết, điểm chấm, hình ảnh, `video_url` và bình luận.
   - Tích hợp Thích (`POST /api/luot-thich/`) và Bình luận (`POST /api/binh-luan/`).
4. **Tạo bài viết (`CreatePostPage`)**:
   - Gửi `POST /api/bai-review/` kèm `video_url` (nếu người dùng nhập).
   - Upload ảnh qua `POST /api/hinh-anh/` bằng `FormData`.
   - Gửi điểm đánh giá qua `POST /api/cham-diem/`.
5. **Trang cá nhân (`ProfilePage`)**:
   - Gọi `GET /api/ho-so/` để lấy thông tin người dùng hiện tại, bài viết của họ và quán yêu thích (`/api/quan-yeu-thich/`).

---

## 5. Nhiệm vụ 4: Nhúng Video Review trên FrontEnd

### Bước 4.1: Helper chuyển đổi link thành Embed URL
Tạo `FrontEnd/src/utils/videoEmbed.js` để chuyển các link phổ biến sang dạng nhúng `<iframe>`:
- **YouTube** (`youtube.com/watch?v=ID`, `youtu.be/ID`, `youtube.com/shorts/ID`) -> `https://www.youtube.com/embed/<ID>`
- **Vimeo** (`vimeo.com/ID`) -> `https://player.vimeo.com/video/<ID>`
- **TikTok** (`tiktok.com/@user/video/ID`) -> `https://www.tiktok.com/embed/v2/<ID>`

### Bước 4.2: Hiển thị trên UI
- **`CreatePostPage`**: Thêm input `Link video review (YouTube, TikTok, ...)` và preview nhẹ nếu link hợp lệ.
- **`ReviewDetailPage`** (và `ReviewCard` nếu muốn): Nếu bài viết có `video_url`, render `<iframe>` responsive (tỷ lệ `16:9`) với `allowFullScreen`.

---

## 6. Kiểm tra sau khi hoàn thành
1. Chạy BackEnd: `cd BackEnd && python manage.py runserver`
2. Chạy FrontEnd: `cd FrontEnd && npm run dev`
3. Kiểm tra luồng: Đăng ký / Đăng nhập -> Tạo bài review có ảnh + link YouTube -> Xem bài viết trên Feed và trang Chi tiết (video hiển thị & phát được) -> Thích & Bình luận.
