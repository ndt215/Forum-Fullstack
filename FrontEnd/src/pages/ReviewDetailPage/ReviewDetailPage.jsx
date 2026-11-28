import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Clock,
  Flag,
  Flame,
  Heart,
  Loader2,
  LogIn,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  PlaySquare,
  RefreshCw,
  Send,
  Star,
  UserCheck,
  UserPlus,
  Wallet,
} from "lucide-react";
import RatingStars from "../../components/RatingStars/RatingStars";
import StarPicker from "../../components/StarPicker/StarPicker";
import ReportModal from "../../components/ReportModal/ReportModal";
import { useAuth } from "../../context/AuthContext";
import {
  boLuuQuanYeuThich,
  boTheoDoi,
  chamDiemBaiReview,
  guiBinhLuan,
  layBinhLuan,
  layChiTietBaiReview,
  layQuanYeuThich,
  layTheoDoi,
  luuQuanYeuThich,
  theoDoiNguoiDung,
  thichBaiReview,
} from "../../api/reviews";
import {
  cuisineLabel,
  formatDate,
  formatRelativeTime,
  formatScore,
  initials,
  scoreLabel,
  splitParagraphs,
  truncate,
} from "../../utils/format";
import { parseVideoLink } from "../../utils/videoEmbed";
import anhDuPhong from "../../assets/img/restaurant.jpg";
import styles from "./ReviewDetailPage.module.css";

const TIEU_CHI = [
  { key: "vi_giac", label: "Vị giác" },
  { key: "khong_gian", label: "Không gian" },
  { key: "phuc_vu", label: "Phục vụ" },
  { key: "gia_ca", label: "Giá cả" },
];

function tinhTrungBinhTieuChi(danhSach) {
  const soLuot = danhSach.length;

  return TIEU_CHI.map((tieuChi) => {
    const tong = danhSach.reduce(
      (sum, muc) => sum + (Number(muc[tieuChi.key]) || 0),
      0,
    );

    return {
      ...tieuChi,
      value: soLuot ? tong / soLuot : 0,
    };
  });
}

function tinhPhutDoc(noiDung) {
  const soTu = String(noiDung || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.round(soTu / 200));
}

function kiemTraDangMoCua(gioMo, gioDong) {
  if (!gioMo || !gioDong) return null;

  const [gioMoH, gioMoM] = gioMo.split(":").map(Number);
  const [gioDongH, gioDongM] = gioDong.split(":").map(Number);

  if ([gioMoH, gioMoM, gioDongH, gioDongM].some(Number.isNaN)) return null;

  const hienTai = new Date();
  const phutHienTai = hienTai.getHours() * 60 + hienTai.getMinutes();
  const batDau = gioMoH * 60 + gioMoM;
  const ketThuc = gioDongH * 60 + gioDongM;

  if (ketThuc < batDau) {
    return phutHienTai >= batDau || phutHienTai <= ketThuc;
  }

  return phutHienTai >= batDau && phutHienTai <= ketThuc;
}

export default function ReviewDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);

  const [likeLoading, setLikeLoading] = useState(false);
  const [savedEntry, setSavedEntry] = useState(null);
  const [savedLoading, setSavedLoading] = useState(false);
  const [followEntry, setFollowEntry] = useState(null);
  const [followLoading, setFollowLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [reportOpen, setReportOpen] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const [rating, setRating] = useState({
    vi_giac: 0,
    khong_gian: 0,
    phuc_vu: 0,
    gia_ca: 0,
  });
  const [ratingError, setRatingError] = useState("");
  const [ratingSuccess, setRatingSuccess] = useState("");
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  /* ---------------------------------------------------------------- */
  /* Tải dữ liệu                                                       */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    let ignore = false;

    // Bật trạng thái tải trước khi gọi API (fetch nằm trong effect).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError("");

    layChiTietBaiReview(id)
      .then((data) => {
        if (ignore) return;
        setReview(data);

        if (data?.diem_cua_toi) {
          setRating({
            vi_giac: data.diem_cua_toi.vi_giac,
            khong_gian: data.diem_cua_toi.khong_gian,
            phuc_vu: data.diem_cua_toi.phuc_vu,
            gia_ca: data.diem_cua_toi.gia_ca,
          });
        }
      })
      .catch((loi) => {
        if (ignore) return;
        setReview(null);
        setError(
          loi.status === 404
            ? "Bài review không tồn tại hoặc đã bị ẩn."
            : loi.message || "Không tải được bài review.",
        );
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id, reloadKey]);

  useEffect(() => {
    let ignore = false;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCommentsLoading(true);

    layBinhLuan(id)
      .then((data) => {
        if (ignore) return;
        // API trả mới nhất trước; đảo lại để thảo luận đọc từ trên xuống.
        setComments((data?.results || []).slice().reverse());
      })
      .catch(() => {
        if (!ignore) setComments([]);
      })
      .finally(() => {
        if (!ignore) setCommentsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  // Trạng thái lưu quán + theo dõi tác giả của người đang đăng nhập.
  useEffect(() => {
    if (!isAuthenticated || !review) {
      // Xoá trạng thái lưu quán/theo dõi khi đăng xuất hoặc đổi bài.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSavedEntry(null);
      setFollowEntry(null);
      return undefined;
    }

    let ignore = false;

    Promise.allSettled([
      layQuanYeuThich(),
      layTheoDoi({
        nguoi_theo_doi: user?.id,
        nguoi_duoc_theo_doi: review.nguoi_dung,
      }),
    ]).then(([quanRes, theoDoiRes]) => {
      if (ignore) return;

      if (quanRes.status === "fulfilled") {
        const muc = (quanRes.value?.results || []).find(
          (item) => item.nha_hang === review.nha_hang,
        );
        setSavedEntry(muc || null);
      }

      if (theoDoiRes.status === "fulfilled") {
        setFollowEntry((theoDoiRes.value?.results || [])[0] || null);
      }
    });

    return () => {
      ignore = true;
    };
  }, [isAuthenticated, review, user?.id]);

  /* ---------------------------------------------------------------- */
  /* Hành động                                                         */
  /* ---------------------------------------------------------------- */
  function yeuCauDangNhap() {
    const next = encodeURIComponent(`/review/${id}`);
    navigate(`/dang-nhap?next=${next}`);
  }

  async function xuLyThich() {
    if (!isAuthenticated) {
      yeuCauDangNhap();
      return;
    }

    setLikeLoading(true);
    setActionError("");

    try {
      const data = await thichBaiReview(id);
      setReview((truoc) =>
        truoc
          ? {
              ...truoc,
              da_thich: data.da_thich,
              luot_thich: data.luot_thich,
            }
          : truoc,
      );
    } catch (loi) {
      setActionError(loi.message);
    } finally {
      setLikeLoading(false);
    }
  }

  async function xuLyLuuQuan() {
    if (!isAuthenticated) {
      yeuCauDangNhap();
      return;
    }

    if (!review) return;

    setSavedLoading(true);
    setActionError("");

    try {
      if (savedEntry) {
        await boLuuQuanYeuThich(savedEntry.id);
        setSavedEntry(null);
      } else {
        const moi = await luuQuanYeuThich(review.nha_hang);
        setSavedEntry(moi);
      }
    } catch (loi) {
      setActionError(loi.message);
    } finally {
      setSavedLoading(false);
    }
  }

  async function xuLyTheoDoi() {
    if (!isAuthenticated) {
      yeuCauDangNhap();
      return;
    }

    if (!review) return;

    setFollowLoading(true);
    setActionError("");

    try {
      if (followEntry) {
        await boTheoDoi(followEntry.id);
        setFollowEntry(null);
      } else {
        const moi = await theoDoiNguoiDung(review.nguoi_dung);
        setFollowEntry(moi);
      }
    } catch (loi) {
      setActionError(loi.message);
    } finally {
      setFollowLoading(false);
    }
  }

  async function xuLyGuiBinhLuan(event) {
    event.preventDefault();

    if (!commentText.trim()) {
      setCommentError("Vui lòng nhập nội dung bình luận.");
      return;
    }

    setCommentSubmitting(true);
    setCommentError("");

    try {
      const moi = await guiBinhLuan({
        bai_review: Number(id),
        noi_dung: commentText.trim(),
      });

      setComments((truoc) => [...truoc, moi]);
      setCommentText("");
      setReview((truoc) =>
        truoc ? { ...truoc, so_binh_luan: (truoc.so_binh_luan || 0) + 1 } : truoc,
      );
    } catch (loi) {
      setCommentError(loi.message);
    } finally {
      setCommentSubmitting(false);
    }
  }

  async function xuLyChamDiem(event) {
    event.preventDefault();

    if (!isAuthenticated) {
      yeuCauDangNhap();
      return;
    }

    if (TIEU_CHI.some((tieuChi) => !rating[tieuChi.key])) {
      setRatingError("Vui lòng chọn điểm cho cả 4 tiêu chí.");
      return;
    }

    setRatingSubmitting(true);
    setRatingError("");
    setRatingSuccess("");

    try {
      await chamDiemBaiReview({ bai_review: Number(id), ...rating });
      const capNhat = await layChiTietBaiReview(id);
      setReview(capNhat);
      setRatingSuccess("Đã ghi nhận điểm của bạn. Cảm ơn bạn!");
    } catch (loi) {
      setRatingError(loi.message);
    } finally {
      setRatingSubmitting(false);
    }
  }

  /* ---------------------------------------------------------------- */
  /* Trạng thái tải / lỗi                                              */
  /* ---------------------------------------------------------------- */
  if (loading) {
    return (
      <div className={styles.statePage} role="status" aria-live="polite">
        <Loader2 size={28} className={styles.spin} aria-hidden="true" />
        <p>Đang tải bài review…</p>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className={styles.statePage}>
        <AlertCircle size={30} aria-hidden="true" />
        <h1>Không mở được bài review</h1>
        <p>{error || "Dữ liệu không tồn tại."}</p>
        <div className={styles.stateActions}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => setReloadKey((key) => key + 1)}
          >
            <RefreshCw size={15} aria-hidden="true" />
            Thử lại
          </button>
          <Link to="/feed" className={styles.secondaryButton}>
            <ArrowLeft size={15} aria-hidden="true" />
            Về Feed
          </Link>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Dữ liệu hiển thị                                                  */
  /* ---------------------------------------------------------------- */
  const diem = Number(review.diem_trung_binh) || 0;
  const danhSachChamDiem = review.danh_sach_cham_diem || [];
  const trungBinhTieuChi = tinhTrungBinhTieuChi(danhSachChamDiem);
  const paragraphs = splitParagraphs(review.noi_dung);
  const embed = parseVideoLink(review.video_url);
  const hinhAnh = (review.hinh_anh || [])
    .map((anh) => anh.url)
    .filter(Boolean);
  const laTacGia = isAuthenticated && user?.id === review.nguoi_dung;
  const dangMoCua = kiemTraDangMoCua(review.gio_mo_cua, review.gio_dong_cua);
  const soBinhLuan = Math.max(review.so_binh_luan || 0, comments.length);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${review.ten_nha_hang} ${review.dia_chi_quan} ${review.khu_vuc}`,
  )}`;
  const galleryClass =
    hinhAnh.length === 1
      ? `${styles.gallery} ${styles.gallerySingle}`
      : hinhAnh.length === 2
        ? `${styles.gallery} ${styles.galleryTwo}`
        : styles.gallery;

  return (
    <div className={styles.page}>
      <div className="container">
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to="/feed" className={styles.backLink}>
            <ArrowLeft size={15} aria-hidden="true" />
            Quay lại Feed
          </Link>
          <span aria-hidden="true">/</span>
          <span>{review.khu_vuc}</span>
          <span aria-hidden="true">/</span>
          <span>{cuisineLabel(review.loai_am_thuc)}</span>
        </nav>

        <header className={styles.header}>
          <div className={styles.tagRow}>
            {diem >= 4.5 && (
              <span className={styles.trendingTag}>
                <Flame size={12} aria-hidden="true" />
                Đang hot
              </span>
            )}
            <span className={styles.tag}>{cuisineLabel(review.loai_am_thuc)}</span>
            {(review.danh_sach_the || []).slice(0, 2).map((the) => (
              <span key={the.id} className={styles.tag}>
                {the.ten_the}
              </span>
            ))}
          </div>

          <h1 className={styles.title}>{review.tieu_de}</h1>
          <p className={styles.excerpt}>
            {truncate(paragraphs[0] || review.noi_dung, 220)}
          </p>

          <p className={styles.restaurantLine}>
            <MapPin size={15} aria-hidden="true" />
            <strong>{review.ten_nha_hang}</strong>
            <span>{review.khu_vuc}</span>
          </p>

          <div className={styles.byline}>
            <span className={styles.authorInline}>
              {review.avatar_nguoi_dung ? (
                <img
                  src={review.avatar_nguoi_dung}
                  alt=""
                  width="42"
                  height="42"
                />
              ) : (
                <span className={styles.avatarFallback} aria-hidden="true">
                  {initials(review.ten_nguoi_dung)}
                </span>
              )}
              <span>
                <strong>{review.ten_nguoi_dung}</strong>
                <small>
                  {formatDate(review.ngay_tao)} · {tinhPhutDoc(review.noi_dung)}{" "}
                  phút đọc
                </small>
              </span>
            </span>

            <span className={styles.headerActions}>
              <button
                type="button"
                className={`${styles.actionButton} ${
                  review.da_thich ? styles.actionActive : ""
                }`}
                onClick={xuLyThich}
                disabled={likeLoading}
              >
                {likeLoading ? (
                  <Loader2 size={15} className={styles.spin} aria-hidden="true" />
                ) : (
                  <Heart
                    size={15}
                    fill={review.da_thich ? "currentColor" : "none"}
                    aria-hidden="true"
                  />
                )}
                {review.luot_thich || 0}
              </button>

              <button
                type="button"
                className={`${styles.actionButton} ${
                  savedEntry ? styles.actionActive : ""
                }`}
                onClick={xuLyLuuQuan}
                disabled={savedLoading}
              >
                {savedEntry ? (
                  <BookmarkCheck size={15} aria-hidden="true" />
                ) : (
                  <Bookmark size={15} aria-hidden="true" />
                )}
                {savedEntry ? "Đã lưu quán" : "Lưu quán"}
              </button>

              <button
                type="button"
                className={styles.actionButton}
                onClick={() => (isAuthenticated ? setReportOpen(true) : yeuCauDangNhap())}
                title="Báo cáo bài viết này tới quản trị viên"
              >
                <Flag size={15} aria-hidden="true" />
                Báo cáo
              </button>
            </span>
          </div>

          {review.trang_thai === "cho_duyet" && (
            <p className={styles.statusNotice}>
              <Clock size={13} aria-hidden="true" />
              Bài viết đang chờ duyệt — chỉ bạn và quản trị viên nhìn thấy.
            </p>
          )}

          {review.trang_thai === "bi_tu_choi" && (
            <p className={`${styles.statusNotice} ${styles.statusRejected}`}>
              <AlertCircle size={13} aria-hidden="true" />
              Bài viết bị từ chối.
              {review.ly_do_tu_choi
                ? ` Lý do: ${review.ly_do_tu_choi}`
                : " Vui lòng liên hệ quản trị viên để biết thêm chi tiết."}
            </p>
          )}

          {review.trang_thai === "an" && (
            <p className={styles.statusNotice}>
              <AlertCircle size={13} aria-hidden="true" />
              Bài viết đang bị ẩn khỏi cộng đồng.
            </p>
          )}

          {actionError && (
            <p className={styles.inlineError} role="alert">
              <AlertCircle size={13} aria-hidden="true" />
              {actionError}
            </p>
          )}
        </header>

        {hinhAnh.length > 0 ? (
          <div className={galleryClass}>
            <figure className={styles.galleryMain}>
              <img src={hinhAnh[0]} alt={`Ảnh review ${review.tieu_de}`} />
              <figcaption>{review.ten_nha_hang}</figcaption>
            </figure>
            {hinhAnh.slice(1, 3).map((url, index) => (
              <figure key={url} className={styles.gallerySide}>
                <img
                  src={url}
                  alt={`Ảnh ${index + 2} của ${review.ten_nha_hang}`}
                  loading="lazy"
                />
                <figcaption>Khoảnh khắc tại {review.ten_nha_hang}</figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className={styles.galleryEmpty}>
            <img src={anhDuPhong} alt={`Không gian ${review.ten_nha_hang}`} />
          </div>
        )}

        <div className={styles.layout}>
          <div className={styles.mainColumn}>
            {embed && (
              <section className={styles.videoSection} aria-labelledby="video-title">
                <div className={styles.videoHead}>
                  <span className="eyebrow">
                    <PlaySquare size={13} aria-hidden="true" />
                    Video review
                  </span>
                  <h2 id="video-title">Xem trực tiếp từ {embed.provider}</h2>
                </div>
                <div className={styles.videoFrame}>
                  <iframe
                    src={embed.embedUrl}
                    title={`Video review: ${review.tieu_de}`}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
                <a
                  className={styles.videoLink}
                  href={embed.watchUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Mở video gốc trên {embed.provider}
                </a>
              </section>
            )}

            <article className={styles.article}>
              <div className={styles.articleHeading}>
                <span className="eyebrow">Câu chuyện bữa ăn</span>
                <h2>Review chi tiết</h2>
              </div>

              <div className={styles.story}>
                {paragraphs.length > 0 ? (
                  paragraphs.map((paragraph, index) => (
                    <p key={`${paragraph.slice(0, 24)}-${index}`}>{paragraph}</p>
                  ))
                ) : (
                  <p>{review.noi_dung}</p>
                )}
              </div>

              <div className={styles.articleBottom}>
                {(review.danh_sach_the || []).length > 0 && (
                  <ul className={styles.articleTags} aria-label="Thẻ bài viết">
                    {(review.danh_sach_the || []).map((the) => (
                      <li key={the.id}>{the.ten_the}</li>
                    ))}
                  </ul>
                )}

                <div className={styles.helpfulRow}>
                  <span>Bạn thấy review này hữu ích?</span>
                  <button
                    type="button"
                    className={`${styles.helpfulButton} ${
                      review.da_thich ? styles.helpfulActive : ""
                    }`}
                    onClick={xuLyThich}
                    disabled={likeLoading}
                  >
                    <Heart
                      size={14}
                      fill={review.da_thich ? "currentColor" : "none"}
                      aria-hidden="true"
                    />
                    Hữu ích · {review.luot_thich || 0}
                  </button>
                  <button
                    type="button"
                    className={styles.helpfulButton}
                    onClick={xuLyLuuQuan}
                    disabled={savedLoading}
                  >
                    <Bookmark size={14} aria-hidden="true" />
                    {savedEntry ? "Bỏ lưu quán" : "Lưu quán"}
                  </button>
                </div>
              </div>
            </article>

            <section
              className={styles.commentsSection}
              id="comments"
              aria-labelledby="comments-title"
            >
              <div className={styles.commentsHead}>
                <div>
                  <span className="eyebrow">
                    <MessageCircle size={13} aria-hidden="true" />
                    Cùng bàn luận
                  </span>
                  <h2 id="comments-title">
                    Thảo luận <span>({soBinhLuan})</span>
                  </h2>
                </div>
              </div>

              {commentsLoading ? (
                <p className={styles.commentLoading}>
                  <Loader2 size={14} className={styles.spin} aria-hidden="true" />
                  Đang tải bình luận…
                </p>
              ) : comments.length === 0 ? (
                <p className={styles.commentEmpty}>
                  Chưa có bình luận nào. Hãy là người mở màn!
                </p>
              ) : (
                <div className={styles.commentList}>
                  {comments.map((comment) => (
                    <article key={comment.id} className={styles.comment}>
                      {comment.avatar_nguoi_dung ? (
                        <img
                          className={styles.commentAvatar}
                          src={comment.avatar_nguoi_dung}
                          alt=""
                          width="40"
                          height="40"
                        />
                      ) : (
                        <span
                          className={styles.commentAvatarFallback}
                          aria-hidden="true"
                        >
                          {initials(comment.ten_nguoi_dung)}
                        </span>
                      )}
                      <div className={styles.commentBody}>
                        <div className={styles.commentBubble}>
                          <div className={styles.commentTop}>
                            <strong>{comment.ten_nguoi_dung}</strong>
                            <small>{formatRelativeTime(comment.ngay_tao)}</small>
                          </div>
                          <p>{comment.noi_dung}</p>
                        </div>
                        <div className={styles.commentActions}>
                          <span>
                            <Heart size={13} aria-hidden="true" />
                            Thích · {comment.luot_thich || 0}
                          </span>
                          <span>Trả lời</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {isAuthenticated ? (
                <form className={styles.commentForm} onSubmit={xuLyGuiBinhLuan}>
                  <label htmlFor="comment-input" className="sr-only">
                    Nội dung bình luận
                  </label>
                  <textarea
                    id="comment-input"
                    rows={3}
                    placeholder={`Chia sẻ cảm nhận của ${user?.ho_ten || user?.username}…`}
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    disabled={commentSubmitting}
                  />
                  <div className={styles.commentFormFooter}>
                    <span>{commentText.length}/1000</span>
                    <button
                      type="submit"
                      className={styles.commentSubmit}
                      disabled={commentSubmitting}
                    >
                      {commentSubmitting ? (
                        <Loader2 size={14} className={styles.spin} aria-hidden="true" />
                      ) : (
                        <Send size={14} aria-hidden="true" />
                      )}
                      Gửi bình luận
                    </button>
                  </div>
                  {commentError && (
                    <p className={styles.commentError} role="alert">
                      <AlertCircle size={13} aria-hidden="true" />
                      {commentError}
                    </p>
                  )}
                </form>
              ) : (
                <div className={styles.commentForm}>
                  <textarea
                    className={styles.commentLockedInput}
                    rows={3}
                    readOnly
                    placeholder="Đăng nhập để bình luận…"
                    onClick={yeuCauDangNhap}
                    aria-label="Đăng nhập để bình luận"
                  />
                  <div className={styles.commentFormFooter}>
                    <span>Bạn cần đăng nhập để tham gia thảo luận.</span>
                    <button
                      type="button"
                      className={styles.commentSubmit}
                      onClick={yeuCauDangNhap}
                    >
                      <LogIn size={14} aria-hidden="true" />
                      Đăng nhập để bình luận
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>

          <aside className={styles.sidebar} aria-label="Thông tin quán và đánh giá">
            <section className={styles.scoreCard} aria-labelledby="score-title">
              <div className={styles.scoreTop}>
                <div>
                  <span className={styles.cardKicker} id="score-title">
                    Điểm tổng
                  </span>
                  <div className={styles.bigScore}>
                    {formatScore(diem)}
                    <small>/5</small>
                  </div>
                  <RatingStars value={diem} size="sm" />
                  <p className={styles.ratingCount}>
                    {danhSachChamDiem.length} lượt đánh giá
                  </p>
                </div>
                <span className={styles.scoreBadge}>
                  <Star size={12} fill="currentColor" aria-hidden="true" />
                  {scoreLabel(diem)}
                </span>
              </div>

              <div className={styles.criteriaList}>
                {trungBinhTieuChi.map((tieuChi) => (
                  <div key={tieuChi.key} className={styles.criteriaRow}>
                    <div className={styles.criteriaHead}>
                      <span>{tieuChi.label}</span>
                      <strong>{formatScore(tieuChi.value)}</strong>
                    </div>
                    <div className={styles.criteriaBar}>
                      <span style={{ width: `${(tieuChi.value / 5) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {isAuthenticated && review.diem_cua_toi && (
                <p className={styles.ratedNote}>
                  Bạn đã chấm {formatScore(review.diem_cua_toi.diem_trung_binh)}/5
                </p>
              )}
            </section>

            {isAuthenticated && !review.diem_cua_toi && (
              <section className={styles.ratingCard} aria-labelledby="rating-title">
                <span className={styles.cardKicker} id="rating-title">
                  Chấm điểm của bạn
                </span>
                <form className={styles.ratingForm} onSubmit={xuLyChamDiem}>
                  {TIEU_CHI.map((tieuChi) => (
                    <div key={tieuChi.key} className={styles.ratingItem}>
                      <span className={styles.ratingLabel}>{tieuChi.label}</span>
                      <StarPicker
                        label={tieuChi.label}
                        value={rating[tieuChi.key]}
                        onChange={(diemMoi) =>
                          setRating((truoc) => ({
                            ...truoc,
                            [tieuChi.key]: diemMoi,
                          }))
                        }
                        disabled={ratingSubmitting}
                        size={17}
                      />
                    </div>
                  ))}

                  {ratingError && (
                    <p className={styles.ratingError} role="alert">
                      <AlertCircle size={13} aria-hidden="true" />
                      {ratingError}
                    </p>
                  )}

                  {ratingSuccess && (
                    <p className={styles.ratingSuccess} role="status">
                      {ratingSuccess}
                    </p>
                  )}

                  <button
                    type="submit"
                    className={styles.ratingSubmit}
                    disabled={ratingSubmitting}
                  >
                    {ratingSubmitting && (
                      <Loader2 size={14} className={styles.spin} aria-hidden="true" />
                    )}
                    Gửi điểm đánh giá
                  </button>
                </form>
              </section>
            )}

            {!isAuthenticated && (
              <p className={styles.loginHint}>
                <Link to={`/dang-nhap?next=${encodeURIComponent(`/review/${id}`)}`}>
                  Đăng nhập
                </Link>{" "}
                để chấm điểm và bình luận bài review này.
              </p>
            )}

            <section className={styles.infoCard} aria-labelledby="info-title">
              <span className={styles.cardKicker} id="info-title">
                Thông tin quán
              </span>
              <h2 className={styles.infoName}>{review.ten_nha_hang}</h2>

              <ul className={styles.infoList}>
                <li>
                  <span className={styles.infoIcon} aria-hidden="true">
                    <MapPin size={16} />
                  </span>
                  <div>
                    <span className={styles.infoLabel}>Địa chỉ</span>
                    <p>
                      {[review.dia_chi_quan, review.khu_vuc]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </li>

                {review.gio_mo_cua && review.gio_dong_cua && (
                  <li>
                    <span className={styles.infoIcon} aria-hidden="true">
                      <Clock size={16} />
                    </span>
                    <div>
                      <span className={styles.infoLabel}>Giờ mở cửa</span>
                      <p>
                        {review.gio_mo_cua} – {review.gio_dong_cua}{" "}
                        {dangMoCua !== null && (
                          <em className={styles.openStatus}>
                            {dangMoCua ? "Đang mở cửa" : "Đang đóng cửa"}
                          </em>
                        )}
                      </p>
                    </div>
                  </li>
                )}

                {review.khoang_gia && (
                  <li>
                    <span className={styles.infoIcon} aria-hidden="true">
                      <Wallet size={16} />
                    </span>
                    <div>
                      <span className={styles.infoLabel}>Giá tham khảo</span>
                      <p>{review.khoang_gia} / người</p>
                    </div>
                  </li>
                )}

                {review.so_dien_thoai_quan && (
                  <li>
                    <span className={styles.infoIcon} aria-hidden="true">
                      <Phone size={16} />
                    </span>
                    <div>
                      <span className={styles.infoLabel}>Điện thoại</span>
                      <p>{review.so_dien_thoai_quan}</p>
                    </div>
                  </li>
                )}
              </ul>

              <a
                className={styles.directionButton}
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Navigation size={15} aria-hidden="true" />
                Chỉ đường trên Google Maps
              </a>
            </section>

            <section className={styles.authorCard} aria-labelledby="author-title">
              <span className={styles.cardKicker} id="author-title">
                Người viết
              </span>
              <div className={styles.authorCardHead}>
                {review.avatar_nguoi_dung ? (
                  <img src={review.avatar_nguoi_dung} alt="" width="56" height="56" />
                ) : (
                  <span className={styles.authorAvatarFallback} aria-hidden="true">
                    {initials(review.ten_nguoi_dung)}
                  </span>
                )}
                <div>
                  <strong>{review.ten_nguoi_dung}</strong>
                  <span>Thành viên Măm Măm</span>
                </div>
              </div>
              <p className={styles.authorBio}>
                {review.tieu_su_nguoi_dung ||
                  "Thành viên cộng đồng Măm Măm, thích chia sẻ những bữa ăn ngon."}
              </p>

              {laTacGia ? (
                <p className={styles.selfAuthorNote}>Đây là bài viết của bạn.</p>
              ) : (
                <button
                  type="button"
                  className={styles.followButton}
                  onClick={xuLyTheoDoi}
                  disabled={followLoading}
                >
                  {followLoading ? (
                    <Loader2 size={15} className={styles.spin} aria-hidden="true" />
                  ) : followEntry ? (
                    <UserCheck size={15} aria-hidden="true" />
                  ) : (
                    <UserPlus size={15} aria-hidden="true" />
                  )}
                  {followEntry ? "Đang theo dõi" : "Theo dõi tác giả"}
                </button>
              )}
            </section>
          </aside>
        </div>
      </div>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        baiReviewId={review.id}
        tieuDe={review.tieu_de}
      />
    </div>
  );
}
