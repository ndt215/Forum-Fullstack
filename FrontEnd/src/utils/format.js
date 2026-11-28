/* Các hàm định dạng dùng chung cho giao diện tiếng Việt. */

export const LOAI_AM_THUC = {
  mon_viet: "Món Việt",
  mon_nuoc: "Món nước",
  hai_san: "Hải sản",
  do_an_nhanh: "Đồ ăn nhanh",
  do_uong: "Đồ uống / Cà phê",
  khac: "Khác",
};

export const LOAI_AM_THUC_OPTIONS = Object.entries(LOAI_AM_THUC).map(
  ([value, label]) => ({ value, label }),
);

export function cuisineLabel(value) {
  return LOAI_AM_THUC[value] || value || "Món ngon";
}

export function formatScore(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(1).replace(".", ",") : "0,0";
}

export function formatDate(value, { withTime = false } = {}) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const options = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };

  if (withTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
  }

  return date.toLocaleDateString("vi-VN", options);
}

export function formatRelativeTime(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const giay = Math.max(0, (Date.now() - date.getTime()) / 1000);

  if (giay < 60) return "Vừa xong";
  if (giay < 3600) return `${Math.floor(giay / 60)} phút trước`;
  if (giay < 86400) return `${Math.floor(giay / 3600)} giờ trước`;
  if (giay < 7 * 86400) return `${Math.floor(giay / 86400)} ngày trước`;
  if (giay < 30 * 86400) return `${Math.floor(giay / (7 * 86400))} tuần trước`;
  if (giay < 365 * 86400) return `${Math.floor(giay / (30 * 86400))} tháng trước`;

  return `${Math.floor(giay / (365 * 86400))} năm trước`;
}

export function formatCompact(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  if (number < 1000) return String(number);

  return `${(number / 1000).toFixed(1).replace(".", ",")}k`;
}

export function initials(name) {
  const words = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return "MM";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

/**
 * Tên hiển thị: ưu tiên họ tên (người dùng sửa được ở trang cá nhân),
 * chưa đặt họ tên thì quay về username.
 */
export function displayName(hoTen, username) {
  return String(hoTen || "").trim() || username || "";
}

export function truncate(text, maxLength = 170) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength).trimEnd()}…`;
}

export function splitParagraphs(text) {
  return String(text || "")
    .split(/\n\s*\n|\r\n\s*\r\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function scoreLabel(score) {
  const number = Number(score) || 0;

  if (number >= 4.7) return "Xuất sắc";
  if (number >= 4.2) return "Rất tốt";
  if (number >= 3.5) return "Tốt";
  if (number > 0) return "Ổn";
  return "Chưa có điểm";
}

export function laAnhMacDinh(url) {
  return !url;
}
