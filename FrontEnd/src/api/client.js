/**
 * Lớp gọi API dùng chung cho toàn bộ FrontEnd.
 *
 * - Dùng session cookie của Django nên KHÔNG lưu token vào localStorage.
 * - Tự gắn `X-CSRFToken` cho các request ghi dữ liệu.
 * - Tự chuẩn hoá thông báo lỗi tiếng Việt trả về từ DRF.
 *
 * Khi chạy dev, Vite proxy /api sang http://127.0.0.1:8000 (xem vite.config.js)
 * nên chỉ cần gọi đường dẫn tương đối. Nếu muốn gọi thẳng BackEnd, đặt biến
 * môi trường VITE_API_BASE_URL=http://127.0.0.1:8000 trong file .env.
 */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

const TEN_TRUONG = {
  username: "Tên đăng nhập",
  password: "Mật khẩu",
  mat_khau: "Mật khẩu",
  mat_khau_2: "Nhập lại mật khẩu",
  email: "Email",
  ho_ten: "Họ và tên",
  noi_dung: "Nội dung",
  tieu_de: "Tiêu đề",
  bai_review: "Bài review",
  nha_hang: "Quán ăn",
  video_url: "Link video",
  the_mon_an: "Thẻ món ăn",
  vi_giac: "Vị giác",
  khong_gian: "Không gian",
  phuc_vu: "Phục vụ",
  gia_ca: "Giá cả",
  hinh_anh: "Hình ảnh",
};

export class ApiError extends Error {
  constructor(message, { status = 0, data = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function getCookie(name) {
  if (typeof document === "undefined") return null;

  const target = `${name}=`;
  const found = document.cookie
    .split("; ")
    .find((row) => row.startsWith(target));

  return found ? decodeURIComponent(found.slice(target.length)) : null;
}

export function apiUrl(path) {
  if (!path) return API_BASE_URL || "/";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Ghép query string, bỏ qua giá trị rỗng. */
export function buildQuery(params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

function thongBaoMacDinh(status) {
  if (status === 401) return "Bạn cần đăng nhập để tiếp tục.";
  if (status === 403) return "Bạn không có quyền thực hiện thao tác này.";
  if (status === 404) return "Không tìm thấy dữ liệu yêu cầu.";
  if (status === 429) return "Bạn thao tác quá nhanh, vui lòng thử lại sau.";
  if (status >= 500) return "Máy chủ gặp sự cố. Vui lòng thử lại sau ít phút.";
  return "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại.";
}

/** Rút ra câu thông báo dễ đọc từ lỗi của DRF. */
export function extractErrorMessage(data, status = 0) {
  if (!data) return thongBaoMacDinh(status);

  if (typeof data === "string") {
    const text = data.trim();
    // Trả về lỗi HTML (trang lỗi Django) thì dùng thông báo mặc định.
    if (!text || text.startsWith("<")) return thongBaoMacDinh(status);
    return text.length > 300 ? `${text.slice(0, 300)}…` : text;
  }

  if (Array.isArray(data)) {
    return data.map((item) => extractErrorMessage(item, status)).join(" ");
  }

  if (typeof data === "object") {
    if (typeof data.detail === "string") return data.detail;
    if (typeof data.chi_tiet === "string") return data.chi_tiet;
    if (typeof data.thong_bao === "string") return data.thong_bao;

    const parts = [];

    Object.entries(data).forEach(([field, value]) => {
      if (field === "code") return;

      const label = TEN_TRUONG[field];
      const text = Array.isArray(value)
        ? value.map((item) => extractErrorMessage(item, status)).join(" ")
        : extractErrorMessage(value, status);

      parts.push(label ? `${label}: ${text}` : text);
    });

    if (parts.length) return parts.join(" · ");
  }

  return thongBaoMacDinh(status);
}

let csrfDangCho = null;

/** Đảm bảo trình duyệt đã có cookie csrftoken trước khi ghi dữ liệu. */
export async function ensureCsrfCookie() {
  if (getCookie("csrftoken")) return;

  if (!csrfDangCho) {
    csrfDangCho = fetch(apiUrl("/api/csrf/"), {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .catch(() => null)
      .finally(() => {
        csrfDangCho = null;
      });
  }

  await csrfDangCho;
}

function laPhuongThucAnToan(method) {
  return ["GET", "HEAD", "OPTIONS", "TRACE"].includes(method);
}

/**
 * Gọi API.
 *
 * @param {string} path   Ví dụ "/api/bai-review/"
 * @param {object} options
 * @param {string} [options.method="GET"]
 * @param {object|FormData} [options.body]
 * @param {AbortSignal} [options.signal]
 */
export async function apiFetch(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const body = options.body ?? null;
  const laFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const headers = { Accept: "application/json", ...(options.headers || {}) };

  if (body && !laFormData) headers["Content-Type"] = "application/json";

  if (!laPhuongThucAnToan(method)) {
    await ensureCsrfCookie();
    const csrf = getCookie("csrftoken");
    if (csrf) headers["X-CSRFToken"] = csrf;
  }

  let response;

  try {
    response = await fetch(apiUrl(path), {
      method,
      credentials: "include",
      headers,
      body: body == null ? undefined : laFormData ? body : JSON.stringify(body),
      signal: options.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new ApiError(
      "Không kết nối được máy chủ API. Hãy chắc chắn BackEnd đang chạy ở cổng 8000.",
      { status: 0 },
    );
  }

  const contentType = response.headers.get("content-type") || "";
  let data = null;

  if (response.status !== 204) {
    try {
      data = contentType.includes("application/json")
        ? await response.json()
        : await response.text();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw new ApiError(extractErrorMessage(data, response.status), {
      status: response.status,
      data,
    });
  }

  return data;
}
