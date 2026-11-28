import anhDuPhong from "../assets/img/restaurant.jpg";
import { cuisineLabel, formatRelativeTime, truncate } from "./format";

/** Chuyển dữ liệu bài review của API thành props cho <ReviewCard />. */
export function baiReviewToCard(review) {
  const diem = Number(review.diem_trung_binh) || 0;
  const luotThich = Number(review.luot_thich) || 0;

  return {
    id: review.id,
    to: `/review/${review.id}`,
    // ID quán để bật/tắt lưu quán yêu thích (bảng QuanYeuThich).
    restaurantId: review.nha_hang,
    image: review.anh_bia || anhDuPhong,
    cuisine: cuisineLabel(review.loai_am_thuc),
    title: review.tieu_de,
    excerpt: truncate(review.noi_dung, 168),
    restaurant: review.ten_nha_hang,
    area: review.khu_vuc,
    price: review.khoang_gia,
    rating: diem,
    tags: (review.danh_sach_the || []).map((the) => the.ten_the),
    author: review.ten_nguoi_dung,
    avatar: review.avatar_nguoi_dung,
    time: formatRelativeTime(review.ngay_tao),
    likes: luotThich,
    comments: review.so_binh_luan || 0,
    isHot: diem >= 4.5 || luotThich >= 3,
    videoUrl: review.video_url || null,
    // Trạng thái kiểm duyệt: dùng cho mục "Đang được duyệt" ở trang cá nhân.
    status: review.trang_thai || 'da_dang',
    statusLabel: review.trang_thai_hien_thi || 'Đã đăng',
    rejectReason: review.ly_do_tu_choi || '',
  };
}

/** Chuyển dữ liệu quán yêu thích thành props cho <ReviewCard />. */
export function quanYeuThichToCard(muc) {
  const quan = muc.nha_hang_chi_tiet || {};
  const bai = quan.bai_review_gan_nhat || {};

  return {
    id: quan.id,
    to: bai.id ? `/review/${bai.id}` : '/feed',
    restaurantId: quan.id,
    image: bai.anh_bia || anhDuPhong,
    cuisine: cuisineLabel(quan.loai_am_thuc),
    title: bai.tieu_de || `${quan.ten_quan} chưa có review nào`,
    excerpt:
      bai.trich_doan ||
      `${quan.dia_chi || ''} · ${quan.khu_vuc || ''}`.replace(/^ · | · $/g, ''),
    restaurant: quan.ten_quan,
    area: quan.khu_vuc,
    price: quan.khoang_gia,
    rating: Number(bai.diem_trung_binh) || 0,
    tags: bai.tags || [],
    author: bai.ten_nguoi_dung || '',
    avatar: bai.avatar_nguoi_dung || null,
    time: bai.ngay_tao ? formatRelativeTime(bai.ngay_tao) : '',
    likes: bai.luot_thich || 0,
    comments: bai.so_binh_luan || 0,
    isHot: false,
  };
}
