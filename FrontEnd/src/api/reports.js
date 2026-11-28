import { apiFetch, buildQuery } from "./client";

/* ==========================================================================
 * BÁO CÁO GỬI QUẢN TRỊ VIÊN
 * ========================================================================== */

/**
 * Gửi báo cáo (tố cáo nội dung hoặc báo lỗi).
 *
 * @param {object} payload
 * @param {"noi_dung"|"loi_giao_dien"|"loi_du_lieu"|"khac"} payload.loai
 * @param {string} payload.noi_dung  Mô tả chi tiết (>= 10 ký tự)
 * @param {number|null} [payload.bai_review]  ID bài review liên quan (nếu có)
 */
export function guiBaoCao({ loai, noi_dung, bai_review = null }) {
  const body = { loai, noi_dung };

  // Chỉ gửi kèm khi báo cáo gắn với một bài viết cụ thể.
  if (bai_review) body.bai_review = bai_review;

  return apiFetch("/api/bao-cao/", { method: "POST", body });
}

/** Danh sách báo cáo: thành viên thấy báo cáo của mình, admin thấy tất cả. */
export function layBaoCao(params = {}) {
  return apiFetch(`/api/bao-cao/${buildQuery(params)}`);
}
