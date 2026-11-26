import { apiFetch } from "./client";

/** Đăng nhập bằng session cookie của Django. */
export function dangNhap({ username, password }) {
  return apiFetch("/api/dang-nhap/", {
    method: "POST",
    body: { username, password },
  });
}

/** Đăng ký tài khoản mới (BackEnd tự đăng nhập sau khi tạo). */
export function dangKy({ username, email, ho_ten, mat_khau, mat_khau_2 }) {
  return apiFetch("/api/dang-ky/", {
    method: "POST",
    body: { username, email, ho_ten, mat_khau, mat_khau_2 },
  });
}

/** Đăng xuất, xoá session cookie. */
export function dangXuat() {
  return apiFetch("/api/dang-xuat/", { method: "POST" });
}

/** Lấy thông tin người dùng đang đăng nhập (401 nếu chưa đăng nhập). */
export function layHoSo() {
  return apiFetch("/api/ho-so/");
}

/** Cập nhật hồ sơ (nhận cả object thường và FormData khi đổi ảnh đại diện). */
export function capNhatHoSo(payload) {
  return apiFetch("/api/ho-so/", { method: "PATCH", body: payload });
}
