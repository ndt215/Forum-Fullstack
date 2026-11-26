import { apiFetch, buildQuery } from "./client";

/* ==========================================================================
 * BÀI REVIEW
 * ========================================================================== */

export function layDanhSachBaiReview(params = {}) {
  return apiFetch(`/api/bai-review/${buildQuery(params)}`);
}

export function layChiTietBaiReview(id) {
  return apiFetch(`/api/bai-review/${id}/`);
}

export function taoBaiReview(payload) {
  return apiFetch("/api/bai-review/", { method: "POST", body: payload });
}

export function capNhatBaiReview(id, payload) {
  return apiFetch(`/api/bai-review/${id}/`, { method: "PATCH", body: payload });
}

export function xoaBaiReview(id) {
  return apiFetch(`/api/bai-review/${id}/`, { method: "DELETE" });
}

/** Bật/tắt lượt thích, trả về { da_thich, luot_thich }. */
export function thichBaiReview(id) {
  return apiFetch(`/api/bai-review/${id}/thich/`, { method: "POST" });
}

/* ==========================================================================
 * CHẤM ĐIỂM
 * ========================================================================== */

export function chamDiemBaiReview(payload) {
  return apiFetch("/api/cham-diem/", { method: "POST", body: payload });
}

export function capNhatChamDiem(id, payload) {
  return apiFetch(`/api/cham-diem/${id}/`, { method: "PATCH", body: payload });
}

/* ==========================================================================
 * HÌNH ẢNH
 * ========================================================================== */

export function taiAnhBaiReview({
  reviewId,
  file,
  laAnhBia = false,
  thuTu = 0,
  moTa = "",
}) {
  const form = new FormData();
  form.append("bai_review", reviewId);
  form.append("hinh_anh", file);
  form.append("la_anh_bia", laAnhBia ? "true" : "false");
  form.append("thu_tu", String(thuTu));
  if (moTa) form.append("mo_ta", moTa);

  return apiFetch("/api/hinh-anh/", { method: "POST", body: form });
}

/* ==========================================================================
 * BÌNH LUẬN
 * ========================================================================== */

export function layBinhLuan(reviewId) {
  return apiFetch(
    `/api/binh-luan/${buildQuery({ bai_review: reviewId, page_size: 100 })}`,
  );
}

export function guiBinhLuan({ bai_review, noi_dung }) {
  return apiFetch("/api/binh-luan/", {
    method: "POST",
    body: { bai_review, noi_dung },
  });
}

/* ==========================================================================
 * QUÁN YÊU THÍCH
 * ========================================================================== */

export function layQuanYeuThich() {
  return apiFetch(`/api/quan-yeu-thich/${buildQuery({ page_size: 100 })}`);
}

export function luuQuanYeuThich(nhaHangId) {
  return apiFetch("/api/quan-yeu-thich/", {
    method: "POST",
    body: { nha_hang: nhaHangId },
  });
}

export function boLuuQuanYeuThich(id) {
  return apiFetch(`/api/quan-yeu-thich/${id}/`, { method: "DELETE" });
}

/* ==========================================================================
 * THEO DÕI
 * ========================================================================== */

export function layTheoDoi(params = {}) {
  return apiFetch(`/api/theo-doi/${buildQuery(params)}`);
}

export function theoDoiNguoiDung(nguoiDungId) {
  return apiFetch("/api/theo-doi/", {
    method: "POST",
    body: { nguoi_duoc_theo_doi: nguoiDungId },
  });
}

export function boTheoDoi(id) {
  return apiFetch(`/api/theo-doi/${id}/`, { method: "DELETE" });
}
