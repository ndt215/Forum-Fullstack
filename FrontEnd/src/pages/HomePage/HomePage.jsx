import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, PenLine, Sparkles } from "lucide-react";
import RatingStars from "../../components/RatingStars/RatingStars";
import { layDanhSachBaiReview } from "../../api/reviews";
import { layNhaHang } from "../../api/catalog";
import {
  formatCompact,
  formatScore,
  formatRelativeTime,
  truncate,
} from "../../utils/format";
import styles from "./HomePage.module.css";
import heroFood from "../../assets/img/hero-food.jpg";
import avatarMinhAnh from "../../assets/img/avatar-minh-anh.jpg";
import avatarNgocTran from "../../assets/img/avatar-ngoc-tran.jpg";

export default function HomePage() {
  const [noiBat, setNoiBat] = useState(null);
  const [thongKe, setThongKe] = useState({
    reviews: null,
    restaurants: null,
    cities: null,
  });

  // Bài review nổi bật (điểm cao nhất) + số liệu thật từ API.
  useEffect(() => {
    let conHieuLuc = true;

    layDanhSachBaiReview({ ordering: "-diem_trung_binh", page_size: 1 })
      .then((data) => {
        if (conHieuLuc) setNoiBat(data?.results?.[0] || null);
      })
      .catch(() => {
        if (conHieuLuc) setNoiBat(null);
      });

    Promise.allSettled([
      layDanhSachBaiReview({ page_size: 1 }),
      layNhaHang({ pageSize: 100 }),
    ]).then(([reviewRes, quanRes]) => {
      if (!conHieuLuc) return;

      const danhSachQuan =
        quanRes.status === "fulfilled" ? quanRes.value?.results || [] : [];

      setThongKe({
        reviews:
          reviewRes.status === "fulfilled" ? reviewRes.value?.count ?? 0 : null,
        restaurants:
          quanRes.status === "fulfilled" ? quanRes.value?.count ?? 0 : null,
        cities: quanRes.status === "fulfilled"
          ? new Set(danhSachQuan.map((quan) => quan.thanh_pho).filter(Boolean))
              .size
          : null,
      });
    });

    return () => {
      conHieuLuc = false;
    };
  }, []);

  const soReview =
    thongKe.reviews === null ? "1.200+" : formatCompact(thongKe.reviews);
  const soQuan =
    thongKe.restaurants === null
      ? "350+"
      : formatCompact(thongKe.restaurants);
  const soThanhPho =
    thongKe.cities === null ? "18" : formatCompact(thongKe.cities);

  const diemNoiBat = Number(noiBat?.diem_trung_binh) || 0;
  const tieuDeNoiBat =
    noiBat?.tieu_de ||
    "Bún chả Hương Liên: hương khói than hoa giữa lòng Hà Nội";
  const trichDoanNoiBat =
    noiBat?.noi_dung ||
    "Chả nướng than hoa xém cạnh, nước chấm chua ngọt vừa vặn — bữa trưa khiến mình nhớ mãi.";
  const linkNoiBat = noiBat ? `/review/${noiBat.id}` : "/feed";
  const tacGiaNoiBat = noiBat?.ten_nguoi_dung || "Minh Anh";
  const thoiGianNoiBat = noiBat?.ngay_tao
    ? formatRelativeTime(noiBat.ngay_tao)
    : "2 ngày trước";

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <img
        className={styles.background}
        src={heroFood}
        alt=""
        aria-hidden="true"
      />
      <span className={styles.overlay} aria-hidden="true" />
      <span className={styles.glow} aria-hidden="true" />

      <div className={`container ${styles.inner}`}>
        <div className={styles.content}>
          <span className={styles.eyebrow}>
            <Sparkles size={14} aria-hidden="true" />
            Diễn đàn review quán ăn
          </span>

          <h1 className={styles.title} id="hero-title">
            Mỗi bữa ăn,
            <br />
            <em>một câu chuyện.</em>
          </h1>

          <p className={styles.description}>
            Nơi những người mê ăn kể lại trải nghiệm thật — từ quán vỉa hè quen
            thuộc đến bàn tiệc đáng nhớ. Tìm quán hợp gu, lưu lại và rủ bạn cùng
            đi.
          </p>

          <div className={styles.actions}>
            <Link className={styles.primaryButton} to="/feed">
              Khám phá món ăn
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link className={styles.secondaryButton} to="/create">
              <PenLine size={16} aria-hidden="true" />
              Viết review của bạn
            </Link>
          </div>

          <dl className={styles.stats}>
            <div>
              <dt>Review thật</dt>
              <dd>{soReview}</dd>
            </div>
            <div>
              <dt>Quán đã thử</dt>
              <dd>{soQuan}</dd>
            </div>
            <div>
              <dt>Tỉnh thành</dt>
              <dd>{soThanhPho}</dd>
            </div>
          </dl>

          <p className={styles.sideNote}>Hà Nội · Sài Gòn · Đà Nẵng</p>
        </div>

        <div className={styles.rightColumn}>
          <aside className={styles.featuredCard} aria-label="Review nổi bật">
            <span className={styles.featuredLabel}>
              <Sparkles size={12} aria-hidden="true" />
              Được yêu thích tuần này
            </span>

            <div className={styles.scoreLine}>
              <strong>{formatScore(diemNoiBat || 4.8)}</strong>
              <span>
                <RatingStars value={diemNoiBat || 4.8} size="md" />
                <small>
                  {noiBat
                    ? `từ ${noiBat.danh_sach_cham_diem?.length || 1} foodie`
                    : "từ 1.284 foodie"}
                </small>
              </span>
            </div>

            <p className={styles.quote}>“{truncate(trichDoanNoiBat, 160)}”</p>
            <p className={styles.featuredTitle}>{tieuDeNoiBat}</p>

            <div className={styles.cardFooter}>
              <span className={styles.avatars}>
                {noiBat?.avatar_nguoi_dung ? (
                  <img src={noiBat.avatar_nguoi_dung} alt="" width="30" height="30" />
                ) : (
                  <img src={avatarMinhAnh} alt="" width="30" height="30" />
                )}
                <img src={avatarNgocTran} alt="" width="30" height="30" />
                <span>
                  {noiBat?.luot_thich
                    ? `+${formatCompact(noiBat.luot_thich)}`
                    : "+1.2k"}
                </span>
              </span>
              <Link to={linkNoiBat} className={styles.readMore}>
                Đọc review
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>

            <p className={styles.featuredMeta}>
              {tacGiaNoiBat} · {thoiGianNoiBat}
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
