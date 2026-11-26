import { apiFetch, buildQuery } from "./client";

/** Danh sách quán ăn, hỗ trợ tìm theo tên/địa chỉ. */
export function layNhaHang({ search = "", page = 1, pageSize = 50 } = {}) {
  return apiFetch(
    `/api/nha-hang/${buildQuery({
      search,
      page,
      page_size: pageSize,
    })}`,
  );
}

/** Thêm quán mới khi viết review (thành viên đã đăng nhập được phép). */
export function taoNhaHang(payload) {
  return apiFetch("/api/nha-hang/", { method: "POST", body: payload });
}

/** Toàn bộ thẻ món ăn. */
export function layTheMonAn() {
  return apiFetch(`/api/the-mon-an/${buildQuery({ page_size: 100 })}`);
}

/** Tạo thẻ mới (thành viên đã đăng nhập được phép). */
export function taoTheMonAn(tenThe) {
  return apiFetch("/api/the-mon-an/", {
    method: "POST",
    body: { ten_the: tenThe },
  });
}
