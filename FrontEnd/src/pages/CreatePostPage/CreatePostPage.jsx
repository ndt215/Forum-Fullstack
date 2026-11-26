import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronDown,
  ImagePlus,
  Link2,
  Loader2,
  MapPin,
  PenLine,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react';
import RatingStars from '../../components/RatingStars/RatingStars';
import StarPicker from '../../components/StarPicker/StarPicker';
import { useAuth } from '../../context/AuthContext';
import {
  layNhaHang,
  layTheMonAn,
  taoNhaHang,
  taoTheMonAn,
} from '../../api/catalog';
import { chamDiemBaiReview, taiAnhBaiReview, taoBaiReview } from '../../api/reviews';
import {
  cuisineLabel,
  formatScore,
  LOAI_AM_THUC_OPTIONS,
} from '../../utils/format';
import { parseVideoLink } from '../../utils/videoEmbed';
import anhDuPhong from '../../assets/img/restaurant.jpg';
import styles from './CreatePostPage.module.css';

const THANH_PHO = [
  'Hà Nội',
  'TP. Hồ Chí Minh',
  'Đà Nẵng',
  'Huế',
  'Hải Phòng',
  'Cần Thơ',
  'Khác',
];

const TIEU_CHI = [
  {
    key: 'vi_giac',
    label: 'Vị giác',
    hint: 'Món ăn ngon, đậm đà?',
  },
  {
    key: 'khong_gian',
    label: 'Không gian',
    hint: 'Sạch sẽ, dễ chịu?',
  },
  {
    key: 'phuc_vu',
    label: 'Phục vụ',
    hint: 'Nhanh nhẹn, thân thiện?',
  },
  {
    key: 'gia_ca',
    label: 'Giá cả',
    hint: 'Xứng đáng với chất lượng?',
  },
];

const TAO_HINH_QUAN_RONG = {
  ten_quan: '',
  dia_chi: '',
  quan_huyen: '',
  thanh_pho: 'Hà Nội',
  loai_am_thuc: 'mon_viet',
  gia_tu: '',
  gia_den: '',
  gio_mo_cua: '10:00',
  gio_dong_cua: '21:00',
  so_dien_thoai: '',
};

/**
 * Trang đăng review: ghi trực tiếp vào BackEnd qua REST API.
 *
 * Luồng: (tạo quán nếu cần) -> tạo bài review -> tải ảnh -> chấm điểm.
 */
export default function CreatePostPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(true);
  const [restaurantSearch, setRestaurantSearch] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showNewRestaurant, setShowNewRestaurant] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState(TAO_HINH_QUAN_RONG);

  const [tags, setTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [newTagName, setNewTagName] = useState('');
  const [tagLoading, setTagLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const [ratings, setRatings] = useState({
    vi_giac: 5,
    khong_gian: 5,
    phuc_vu: 5,
    gia_ca: 5,
  });

  const [images, setImages] = useState([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const previewUrls = useRef([]);
  const uploadedRef = useRef(new Set());

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState('');
  const [createdReview, setCreatedReview] = useState(null);
  const [ratingDone, setRatingDone] = useState(false);

  /* ---------------------------------------------------------------- */
  /* Tải danh mục quán + thẻ                                           */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    let ignore = false;

    Promise.allSettled([layNhaHang({ pageSize: 100 }), layTheMonAn()])
      .then(([quanRes, theRes]) => {
        if (ignore) return;

        if (quanRes.status === 'fulfilled') {
          setRestaurants(quanRes.value?.results || []);
        } else {
          setError('Không tải được danh sách quán ăn.');
        }

        if (theRes.status === 'fulfilled') {
          setTags(theRes.value?.results || []);
        }
      })
      .finally(() => {
        if (!ignore) setRestaurantsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Giải phóng URL xem trước khi rời trang.
  useEffect(
    () => () => {
      previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  /* ---------------------------------------------------------------- */
  /* Chọn quán                                                         */
  /* ---------------------------------------------------------------- */
  const tuKhoaQuan = restaurantSearch.trim().toLowerCase();

  const ketQuaQuan = restaurants
    .filter((quan) => {
      if (!tuKhoaQuan) return true;

      return [quan.ten_quan, quan.dia_chi, quan.quan_huyen, quan.thanh_pho]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(tuKhoaQuan);
    })
    .slice(0, 6);

  function chonQuan(quan) {
    setSelectedRestaurant(quan);
    setRestaurantSearch('');
    setShowNewRestaurant(false);
    setFieldErrors((truoc) => ({ ...truoc, restaurant: undefined }));
  }

  /* ---------------------------------------------------------------- */
  /* Ảnh                                                               */
  /* ---------------------------------------------------------------- */
  function chonAnh(event) {
    const fileMoi = Array.from(event.target.files || []);
    event.target.value = '';

    if (!fileMoi.length) return;

    const quaLon = fileMoi.find((file) => file.size > 8 * 1024 * 1024);
    if (quaLon) {
      setError(`Ảnh "${quaLon.name}" lớn hơn 8MB. Vui lòng chọn ảnh nhỏ hơn.`);
    }

    const hopLe = fileMoi.filter(
      (file) => file.type.startsWith('image/') && file.size <= 8 * 1024 * 1024,
    );

    if (!hopLe.length) return;

    const conLai = Math.max(0, 8 - images.length);
    if (hopLe.length > conLai) {
      setError('Chỉ được tải lên tối đa 8 ảnh cho mỗi bài review.');
    }

    const themMoi = hopLe.slice(0, conLai).map((file, index) => {
      const preview = URL.createObjectURL(file);
      previewUrls.current.push(preview);

      return {
        id: `${file.name}-${file.size}-${Date.now()}-${index}`,
        file,
        preview,
      };
    });

    setImages((truoc) => [...truoc, ...themMoi]);
  }

  function xoaAnh(id) {
    const anhCanXoa = images.find((anh) => anh.id === id);
    if (anhCanXoa) URL.revokeObjectURL(anhCanXoa.preview);

    const conLai = images.filter((anh) => anh.id !== id);
    setImages(conLai);

    if (coverIndex >= conLai.length) {
      setCoverIndex(0);
    }
  }

  /* ---------------------------------------------------------------- */
  /* Thẻ món ăn                                                        */
  /* ---------------------------------------------------------------- */
  function batTatThe(id) {
    setSelectedTagIds((truoc) => {
      if (truoc.includes(id)) {
        return truoc.filter((item) => item !== id);
      }

      if (truoc.length >= 5) {
        setError('Chỉ chọn tối đa 5 thẻ món ăn.');
        return truoc;
      }

      return [...truoc, id];
    });
  }

  async function themTheMoi() {
    const ten = newTagName.trim();
    if (!ten) return;

    const daCo = tags.find(
      (the) => the.ten_the.toLowerCase() === ten.toLowerCase(),
    );

    if (daCo) {
      if (!selectedTagIds.includes(daCo.id)) {
        if (selectedTagIds.length >= 5) {
          setError('Chỉ chọn tối đa 5 thẻ món ăn.');
          return;
        }
        setSelectedTagIds((truoc) => [...truoc, daCo.id]);
      }
      setNewTagName('');
      return;
    }

    setTagLoading(true);
    setError('');

    try {
      const theMoi = await taoTheMonAn(ten);
      setTags((truoc) => [theMoi, ...truoc]);

      if (selectedTagIds.length < 5) {
        setSelectedTagIds((truoc) => [...truoc, theMoi.id]);
      }

      setNewTagName('');
    } catch (loi) {
      setError(loi.message || 'Không thêm được thẻ món ăn.');
    } finally {
      setTagLoading(false);
    }
  }

  /* ---------------------------------------------------------------- */
  /* Gửi form                                                          */
  /* ---------------------------------------------------------------- */
  function kiemTraDuLieu() {
    const loi = {};

    if (showNewRestaurant) {
      if (!newRestaurant.ten_quan.trim()) loi.ten_quan = 'Nhập tên quán.';
      if (!newRestaurant.dia_chi.trim()) loi.dia_chi = 'Nhập địa chỉ quán.';
      if (!newRestaurant.quan_huyen.trim()) loi.quan_huyen = 'Nhập quận/huyện.';
      if (!newRestaurant.thanh_pho.trim()) loi.thanh_pho = 'Chọn thành phố.';

      if (
        newRestaurant.gia_den &&
        newRestaurant.gia_tu &&
        Number(newRestaurant.gia_den) < Number(newRestaurant.gia_tu)
      ) {
        loi.gia = 'Giá đến phải lớn hơn hoặc bằng giá từ.';
      }
    } else if (!selectedRestaurant) {
      loi.restaurant = 'Chọn một quán đã có hoặc thêm quán mới.';
    }

    if (!title.trim()) loi.title = 'Nhập tiêu đề bài review.';
    if (title.trim().length > 255) loi.title = 'Tiêu đề tối đa 255 ký tự.';
    if (!content.trim()) loi.content = 'Nhập nội dung review.';
    if (content.trim().length < 20) {
      loi.content = 'Nội dung cần ít nhất 20 ký tự để hữu ích cho người đọc.';
    }

    if (videoUrl.trim() && !parseVideoLink(videoUrl)) {
      loi.video_url = 'Link video phải là YouTube, TikTok hoặc Vimeo hợp lệ.';
    }

    if (TIEU_CHI.some((tieuChi) => !ratings[tieuChi.key])) {
      loi.ratings = 'Chọn điểm cho cả 4 tiêu chí.';
    }

    return loi;
  }

  async function xuLyDangBai(event) {
    event.preventDefault();

    const loi = kiemTraDuLieu();

    if (Object.keys(loi).length) {
      setFieldErrors(loi);
      setError('Vui lòng kiểm tra lại các trường được đánh dấu.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setFieldErrors({});
    setError('');
    setProgress('');
    setSubmitting(true);

    let review = createdReview;

    try {
      let nhaHangId = selectedRestaurant?.id;

      if (!review) {
        if (showNewRestaurant) {
          setProgress('Đang thêm quán mới…');
          const quanMoi = await taoNhaHang({
            ten_quan: newRestaurant.ten_quan.trim(),
            dia_chi: newRestaurant.dia_chi.trim(),
            quan_huyen: newRestaurant.quan_huyen.trim(),
            thanh_pho: newRestaurant.thanh_pho,
            loai_am_thuc: newRestaurant.loai_am_thuc,
            gia_tu: Number(newRestaurant.gia_tu) || 0,
            gia_den: Number(newRestaurant.gia_den) || 0,
            so_dien_thoai: newRestaurant.so_dien_thoai.trim(),
            gio_mo_cua: newRestaurant.gio_mo_cua || null,
            gio_dong_cua: newRestaurant.gio_dong_cua || null,
          });

          nhaHangId = quanMoi.id;
          setRestaurants((truoc) => [quanMoi, ...truoc]);
          setSelectedRestaurant(quanMoi);
          setShowNewRestaurant(false);
        }

        setProgress('Đang đăng bài review…');
        review = await taoBaiReview({
          nha_hang: nhaHangId,
          tieu_de: title.trim(),
          noi_dung: content.trim(),
          video_url: videoUrl.trim(),
          the_mon_an: selectedTagIds,
        });

        setCreatedReview(review);
      }

      for (let index = 0; index < images.length; index += 1) {
        const image = images[index];

        if (uploadedRef.current.has(image.id)) continue;

        setProgress(`Đang tải ảnh ${index + 1}/${images.length}…`);
        await taiAnhBaiReview({
          reviewId: review.id,
          file: image.file,
          laAnhBia: index === coverIndex,
          thuTu: index,
          moTa: title.trim(),
        });
        uploadedRef.current.add(image.id);
      }

      if (!ratingDone) {
        setProgress('Đang ghi nhận điểm đánh giá…');

        try {
          await chamDiemBaiReview({ bai_review: review.id, ...ratings });
        } catch (loiDiem) {
          // Nếu lần thử trước đã chấm thành công (ví dụ mất mạng sau khi lưu),
          // bỏ qua lỗi trùng thay vì chặn người dùng.
          if (loiDiem.status !== 400) throw loiDiem;
        }

        setRatingDone(true);
      }

      setProgress('Hoàn tất! Đang mở bài review…');
      navigate(`/review/${review.id}`);
    } catch (loiApi) {
      setError(loiApi.message || 'Đăng bài thất bại. Vui lòng thử lại.');
      setProgress('');
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------------------------------------------------------------- */
  /* Dữ liệu hiển thị                                                  */
  /* ---------------------------------------------------------------- */
  const videoEmbed = parseVideoLink(videoUrl);
  const diemTrungBinh =
    TIEU_CHI.reduce((sum, tieuChi) => sum + (Number(ratings[tieuChi.key]) || 0), 0) /
    TIEU_CHI.length;
  const anhBia = images[coverIndex]?.preview || images[0]?.preview || anhDuPhong;
  const tenQuanHienThi =
    selectedRestaurant?.ten_quan || newRestaurant.ten_quan || 'Quán chưa đặt tên';
  const khuVucHienThi = selectedRestaurant
    ? `${selectedRestaurant.quan_huyen}, ${selectedRestaurant.thanh_pho}`
    : [newRestaurant.quan_huyen, newRestaurant.thanh_pho]
        .filter(Boolean)
        .join(', ');
  const giaHienThi = selectedRestaurant
    ? selectedRestaurant.khoang_gia
    : newRestaurant.gia_tu && newRestaurant.gia_den
      ? `${Number(newRestaurant.gia_tu).toLocaleString('vi-VN')}đ – ${Number(
          newRestaurant.gia_den,
        ).toLocaleString('vi-VN')}đ`
      : '';
  const loaiHienThi = cuisineLabel(
    selectedRestaurant?.loai_am_thuc || newRestaurant.loai_am_thuc,
  );
  const tagDaChon = tags.filter((the) => selectedTagIds.includes(the.id));

  return (
    <div className={styles.page}>
      <div className="container">
        <Link to="/feed" className={styles.backLink}>
          <ArrowLeft size={15} aria-hidden="true" />
          Quay lại Feed
        </Link>

        <header className={styles.pageHeader}>
          <span className="eyebrow">
            <Sparkles size={13} aria-hidden="true" />
            Chia sẻ trải nghiệm
          </span>
          <h1>
            Kể lại <em>bữa ăn</em> của bạn
          </h1>
          <p>
            Một review chân thành có thể giúp ai đó tìm được quán ngon. Bài viết
            được lưu vào BackEnd và hiển thị ngay trên Feed của bạn.
          </p>
        </header>

        <div className={styles.layout}>
          <div className={styles.formColumn}>
            {error && (
              <div className={styles.errorSummary} role="alert">
                <AlertCircle size={18} aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* 01. Quán ăn                                          */}
            {/* ---------------------------------------------------- */}
            <section className={styles.section} aria-labelledby="section-info">
              <div className={styles.sectionHead}>
                <span className={styles.stepNumber} aria-hidden="true">
                  01
                </span>
                <div>
                  <h2 id="section-info">Thông tin quán</h2>
                  <p>Chọn quán đã có trên hệ thống hoặc thêm quán mới.</p>
                </div>
              </div>

              <div className={styles.modeSwitch} role="tablist" aria-label="Cách chọn quán">
                <button
                  type="button"
                  role="tab"
                  aria-selected={!showNewRestaurant}
                  className={`${styles.modeButton} ${
                    !showNewRestaurant ? styles.modeButtonActive : ''
                  }`}
                  onClick={() => setShowNewRestaurant(false)}
                >
                  <Store size={14} aria-hidden="true" />
                  Quán đã có
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={showNewRestaurant}
                  className={`${styles.modeButton} ${
                    showNewRestaurant ? styles.modeButtonActive : ''
                  }`}
                  onClick={() => {
                    setShowNewRestaurant(true);
                    setSelectedRestaurant(null);
                  }}
                >
                  <Plus size={14} aria-hidden="true" />
                  Thêm quán mới
                </button>
              </div>

              {showNewRestaurant ? (
                <div className={styles.fieldGrid}>
                  <div className={`${styles.field} ${styles.full}`}>
                    <label htmlFor="restaurant-name">Tên quán *</label>
                    <input
                      id="restaurant-name"
                      type="text"
                      placeholder="Ví dụ: Bún chả Hương Liên"
                      value={newRestaurant.ten_quan}
                      onChange={(event) =>
                        setNewRestaurant((truoc) => ({
                          ...truoc,
                          ten_quan: event.target.value,
                        }))
                      }
                      aria-invalid={Boolean(fieldErrors.ten_quan)}
                    />
                    {fieldErrors.ten_quan && (
                      <span className={styles.fieldError}>
                        <AlertCircle size={12} aria-hidden="true" />
                        {fieldErrors.ten_quan}
                      </span>
                    )}
                  </div>

                  <div className={`${styles.field} ${styles.full}`}>
                    <label htmlFor="restaurant-address">Địa chỉ *</label>
                    <input
                      id="restaurant-address"
                      type="text"
                      placeholder="Số nhà, đường, phường"
                      value={newRestaurant.dia_chi}
                      onChange={(event) =>
                        setNewRestaurant((truoc) => ({
                          ...truoc,
                          dia_chi: event.target.value,
                        }))
                      }
                      aria-invalid={Boolean(fieldErrors.dia_chi)}
                    />
                    {fieldErrors.dia_chi && (
                      <span className={styles.fieldError}>
                        <AlertCircle size={12} aria-hidden="true" />
                        {fieldErrors.dia_chi}
                      </span>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="restaurant-city">Thành phố *</label>
                    <span className={styles.selectWrap}>
                      <select
                        id="restaurant-city"
                        value={newRestaurant.thanh_pho}
                        onChange={(event) =>
                          setNewRestaurant((truoc) => ({
                            ...truoc,
                            thanh_pho: event.target.value,
                          }))
                        }
                      >
                        {THANH_PHO.map((thanhPho) => (
                          <option key={thanhPho}>{thanhPho}</option>
                        ))}
                      </select>
                      <ChevronDown size={15} aria-hidden="true" />
                    </span>
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="restaurant-district">Quận / huyện *</label>
                    <input
                      id="restaurant-district"
                      type="text"
                      placeholder="Ví dụ: Hai Bà Trưng"
                      value={newRestaurant.quan_huyen}
                      onChange={(event) =>
                        setNewRestaurant((truoc) => ({
                          ...truoc,
                          quan_huyen: event.target.value,
                        }))
                      }
                      aria-invalid={Boolean(fieldErrors.quan_huyen)}
                    />
                    {fieldErrors.quan_huyen && (
                      <span className={styles.fieldError}>
                        <AlertCircle size={12} aria-hidden="true" />
                        {fieldErrors.quan_huyen}
                      </span>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="restaurant-cuisine">Loại món ăn</label>
                    <span className={styles.selectWrap}>
                      <select
                        id="restaurant-cuisine"
                        value={newRestaurant.loai_am_thuc}
                        onChange={(event) =>
                          setNewRestaurant((truoc) => ({
                            ...truoc,
                            loai_am_thuc: event.target.value,
                          }))
                        }
                      >
                        {LOAI_AM_THUC_OPTIONS.map((loai) => (
                          <option key={loai.value} value={loai.value}>
                            {loai.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={15} aria-hidden="true" />
                    </span>
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="restaurant-phone">
                      Số điện thoại{' '}
                      <span className={styles.optional}>(không bắt buộc)</span>
                    </label>
                    <input
                      id="restaurant-phone"
                      type="tel"
                      placeholder="024 3943 4106"
                      value={newRestaurant.so_dien_thoai}
                      onChange={(event) =>
                        setNewRestaurant((truoc) => ({
                          ...truoc,
                          so_dien_thoai: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="price-from">Giá từ (VNĐ)</label>
                    <input
                      id="price-from"
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="60000"
                      value={newRestaurant.gia_tu}
                      onChange={(event) =>
                        setNewRestaurant((truoc) => ({
                          ...truoc,
                          gia_tu: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="price-to">Giá đến (VNĐ)</label>
                    <input
                      id="price-to"
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="150000"
                      value={newRestaurant.gia_den}
                      onChange={(event) =>
                        setNewRestaurant((truoc) => ({
                          ...truoc,
                          gia_den: event.target.value,
                        }))
                      }
                      aria-invalid={Boolean(fieldErrors.gia)}
                    />
                    {fieldErrors.gia && (
                      <span className={styles.fieldError}>
                        <AlertCircle size={12} aria-hidden="true" />
                        {fieldErrors.gia}
                      </span>
                    )}
                  </div>

                  <div className={`${styles.field} ${styles.full}`}>
                    <label htmlFor="restaurant-hours">Giờ mở cửa</label>
                    <div className={styles.hoursRow}>
                      <input
                        id="restaurant-hours"
                        type="time"
                        value={newRestaurant.gio_mo_cua}
                        onChange={(event) =>
                          setNewRestaurant((truoc) => ({
                            ...truoc,
                            gio_mo_cua: event.target.value,
                          }))
                        }
                      />
                      <span aria-hidden="true">đến</span>
                      <input
                        type="time"
                        value={newRestaurant.gio_dong_cua}
                        onChange={(event) =>
                          setNewRestaurant((truoc) => ({
                            ...truoc,
                            gio_dong_cua: event.target.value,
                          }))
                        }
                        aria-label="Giờ đóng cửa"
                      />
                    </div>
                  </div>
                </div>
              ) : selectedRestaurant ? (
                <div className={styles.selectedRestaurant}>
                  <span className={styles.selectedIcon} aria-hidden="true">
                    <Store size={19} />
                  </span>
                  <div className={styles.selectedInfo}>
                    <strong>{selectedRestaurant.ten_quan}</strong>
                    <span>
                      {selectedRestaurant.dia_chi} ·{' '}
                      {selectedRestaurant.quan_huyen},{' '}
                      {selectedRestaurant.thanh_pho}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={styles.changeButton}
                    onClick={() => setSelectedRestaurant(null)}
                  >
                    Đổi quán
                  </button>
                </div>
              ) : (
                <>
                  <div className={styles.restaurantSearch}>
                    <Search size={17} aria-hidden="true" />
                    <input
                      type="search"
                      placeholder="Tìm quán theo tên, địa chỉ, quận huyện..."
                      value={restaurantSearch}
                      onChange={(event) => setRestaurantSearch(event.target.value)}
                      aria-label="Tìm quán ăn"
                    />
                  </div>

                  {restaurantsLoading ? (
                    <p className={styles.searchEmpty}>Đang tải danh sách quán…</p>
                  ) : restaurantSearch.trim() ? (
                    <ul className={styles.searchResults}>
                      {ketQuaQuan.length > 0 ? (
                        ketQuaQuan.map((quan) => (
                          <li key={quan.id}>
                            <button
                              type="button"
                              className={styles.searchResult}
                              onClick={() => chonQuan(quan)}
                            >
                              <span className={styles.resultIcon} aria-hidden="true">
                                <UtensilsCrossed size={15} />
                              </span>
                              <span>
                                <strong>{quan.ten_quan}</strong>
                                <small>
                                  {quan.quan_huyen}, {quan.thanh_pho} ·{' '}
                                  {quan.khoang_gia}
                                </small>
                              </span>
                            </button>
                          </li>
                        ))
                      ) : (
                        <li className={styles.searchEmpty}>
                          Không tìm thấy quán phù hợp. Hãy chuyển sang “Thêm quán
                          mới”.
                        </li>
                      )}
                    </ul>
                  ) : (
                    <p className={styles.searchEmpty}>
                      Gõ tên quán để tìm, hoặc chọn “Thêm quán mới” nếu quán chưa
                      có trên hệ thống.
                    </p>
                  )}
                </>
              )}

              {fieldErrors.restaurant && (
                <span className={styles.fieldError}>
                  <AlertCircle size={12} aria-hidden="true" />
                  {fieldErrors.restaurant}
                </span>
              )}
            </section>

            {/* ---------------------------------------------------- */}
            {/* 02. Chấm điểm                                        */}
            {/* ---------------------------------------------------- */}
            <section className={styles.section} aria-labelledby="section-rating">
              <div className={styles.sectionHead}>
                <span className={styles.stepNumber} aria-hidden="true">
                  02
                </span>
                <div>
                  <h2 id="section-rating">Chấm điểm trải nghiệm</h2>
                  <p>Bấm vào số sao để chấm — điểm được lưu vào bài review.</p>
                </div>
              </div>

              <div className={styles.ratingGrid}>
                {TIEU_CHI.map((tieuChi) => (
                  <div key={tieuChi.key} className={styles.ratingItem}>
                    <div>
                      <span className={styles.ratingLabel}>{tieuChi.label}</span>
                      <span className={styles.ratingHint}>{tieuChi.hint}</span>
                    </div>
                    <StarPicker
                      label={tieuChi.label}
                      value={ratings[tieuChi.key]}
                      onChange={(diem) =>
                        setRatings((truoc) => ({
                          ...truoc,
                          [tieuChi.key]: diem,
                        }))
                      }
                      size={20}
                    />
                  </div>
                ))}

                <div className={styles.averageBox}>
                  <span>Điểm dự kiến</span>
                  <strong>
                    {formatScore(diemTrungBinh)}
                    <small>/5</small>
                  </strong>
                  <RatingStars value={diemTrungBinh} size="sm" />
                </div>
              </div>

              {fieldErrors.ratings && (
                <span className={styles.fieldError}>
                  <AlertCircle size={12} aria-hidden="true" />
                  {fieldErrors.ratings}
                </span>
              )}
            </section>

            {/* ---------------------------------------------------- */}
            {/* 03. Hình ảnh                                         */}
            {/* ---------------------------------------------------- */}
            <section className={styles.section} aria-labelledby="section-photos">
              <div className={styles.sectionHead}>
                <span className={styles.stepNumber} aria-hidden="true">
                  03
                </span>
                <div>
                  <h2 id="section-photos">Hình ảnh món ăn</h2>
                  <p>Ảnh được tải lên sau khi bài review được tạo.</p>
                </div>
              </div>

              <label className={styles.dropzone} htmlFor="review-images">
                <span className={styles.dropIcon} aria-hidden="true">
                  <ImagePlus size={23} />
                </span>
                <strong>Chọn ảnh từ thiết bị</strong>
                <span>JPG, PNG, WEBP · tối đa 8MB mỗi ảnh · tối đa 8 ảnh</span>
                <input
                  id="review-images"
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={chonAnh}
                  disabled={submitting}
                />
              </label>

              <div className={styles.previewGrid}>
                {images.map((image, index) => (
                  <div key={image.id} className={styles.previewTile}>
                    <img src={image.preview} alt={`Ảnh ${index + 1} xem trước`} />
                    <span className={styles.imageIndex}>
                      {index === coverIndex ? 'Ảnh bìa' : `Ảnh ${index + 1}`}
                    </span>
                    <div className={styles.previewActions}>
                      {index !== coverIndex && (
                        <button
                          type="button"
                          aria-label="Đặt làm ảnh bìa"
                          onClick={() => setCoverIndex(index)}
                        >
                          <Star size={13} aria-hidden="true" />
                        </button>
                      )}
                      <button
                        type="button"
                        aria-label="Xóa ảnh"
                        onClick={() => xoaAnh(image.id)}
                      >
                        <Trash2 size={13} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}

                {images.length < 8 && (
                  <label className={styles.addTile} htmlFor="review-images-2">
                    <ImagePlus size={18} aria-hidden="true" />
                    Thêm ảnh
                    <input
                      id="review-images-2"
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={chonAnh}
                      disabled={submitting}
                    />
                  </label>
                )}
              </div>

              <p className={styles.hint}>
                Ảnh đánh dấu “Ảnh bìa” sẽ hiển thị ở Feed và trang chủ. Bạn vẫn
                có thể đăng bài khi chưa có ảnh.
              </p>
            </section>

            {/* ---------------------------------------------------- */}
            {/* 04. Nội dung + video                                 */}
            {/* ---------------------------------------------------- */}
            <section className={styles.section} aria-labelledby="section-story">
              <div className={styles.sectionHead}>
                <span className={styles.stepNumber} aria-hidden="true">
                  04
                </span>
                <div>
                  <h2 id="section-story">Nội dung &amp; thẻ món ăn</h2>
                  <p>
                    Kể điều bạn thích, điều chưa ổn và mẹo gọi món cho người đến
                    sau.
                  </p>
                </div>
              </div>

              <div className={styles.fieldGrid}>
                <div className={`${styles.field} ${styles.full}`}>
                  <label htmlFor="review-title">Tiêu đề review *</label>
                  <input
                    id="review-title"
                    type="text"
                    maxLength={255}
                    placeholder="Ví dụ: Bún chả Hương Liên — hương khói than hoa giữa lòng Hà Nội"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    aria-invalid={Boolean(fieldErrors.title)}
                  />
                  <span className={styles.counter}>{title.length}/255</span>
                  {fieldErrors.title && (
                    <span className={styles.fieldError}>
                      <AlertCircle size={12} aria-hidden="true" />
                      {fieldErrors.title}
                    </span>
                  )}
                </div>

                <div className={`${styles.field} ${styles.full}`}>
                  <label htmlFor="review-content">Cảm nhận chi tiết *</label>
                  <textarea
                    id="review-content"
                    rows={8}
                    maxLength={2000}
                    placeholder="Kể lại trải nghiệm: món đã gọi, hương vị, không gian, phục vụ, giá cả..."
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    aria-invalid={Boolean(fieldErrors.content)}
                  />
                  <span className={styles.counter}>{content.length}/2000</span>
                  {fieldErrors.content && (
                    <span className={styles.fieldError}>
                      <AlertCircle size={12} aria-hidden="true" />
                      {fieldErrors.content}
                    </span>
                  )}
                </div>

                <div className={`${styles.field} ${styles.full}`}>
                  <label htmlFor="review-video">
                    Link video review{' '}
                    <span className={styles.optional}>
                      (YouTube, TikTok, Vimeo — không bắt buộc)
                    </span>
                  </label>
                  <div className={styles.videoInputRow}>
                    <Link2 size={16} aria-hidden="true" />
                    <input
                      id="review-video"
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(event) => setVideoUrl(event.target.value)}
                      aria-invalid={Boolean(fieldErrors.video_url)}
                    />
                  </div>
                  {fieldErrors.video_url && (
                    <span className={styles.fieldError}>
                      <AlertCircle size={12} aria-hidden="true" />
                      {fieldErrors.video_url}
                    </span>
                  )}
                  {videoUrl.trim() && videoEmbed && (
                    <div className={styles.videoPreview}>
                      <iframe
                        src={videoEmbed.embedUrl}
                        title="Xem trước video review"
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                      <span className={styles.videoProvider}>
                        {videoEmbed.provider} · video hợp lệ
                      </span>
                    </div>
                  )}
                </div>

                <div className={`${styles.field} ${styles.full}`}>
                  <span className={styles.fieldLabel}>
                    Thẻ món ăn / trải nghiệm
                  </span>
                  <p className={styles.tagHint}>
                    Chọn tối đa 5 thẻ ({selectedTagIds.length}/5). Thẻ mới sẽ được
                    tạo trên hệ thống.
                  </p>

                  <div className={styles.tagList}>
                    {tags.map((the) => {
                      const daChon = selectedTagIds.includes(the.id);

                      return (
                        <button
                          key={the.id}
                          type="button"
                          className={`${styles.tagChip} ${
                            daChon ? styles.tagChipSelected : ''
                          }`}
                          onClick={() => batTatThe(the.id)}
                          aria-pressed={daChon}
                        >
                          {daChon && <Check size={12} aria-hidden="true" />}
                          {the.ten_the}
                        </button>
                      );
                    })}
                  </div>

                  <div className={styles.tagInputRow}>
                    <input
                      type="text"
                      placeholder="Thêm thẻ mới, ví dụ: Đồ nướng"
                      value={newTagName}
                      onChange={(event) => setNewTagName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          themTheMoi();
                        }
                      }}
                      maxLength={100}
                    />
                    <button
                      type="button"
                      className={styles.addTagButton}
                      onClick={themTheMoi}
                      disabled={tagLoading || !newTagName.trim()}
                    >
                      {tagLoading ? (
                        <Loader2 size={14} className={styles.spin} aria-hidden="true" />
                      ) : (
                        <Plus size={14} aria-hidden="true" />
                      )}
                      Thêm thẻ
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <div className={styles.formActions}>
              <p>
                Bằng việc đăng bài, bạn đồng ý chia sẻ trải nghiệm một cách trung
                thực và tôn trọng cộng đồng.
              </p>
              <div>
                <Link to="/feed" className={styles.cancelButton}>
                  Hủy
                </Link>
                <button
                  type="button"
                  className={styles.submitButton}
                  onClick={xuLyDangBai}
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 size={16} className={styles.spin} aria-hidden="true" />
                  ) : (
                    <PenLine size={16} aria-hidden="true" />
                  )}
                  {submitting ? 'Đang đăng…' : 'Đăng review'}
                </button>
              </div>
            </div>

            {progress && (
              <p className={styles.progress} role="status">
                {progress}
              </p>
            )}
          </div>

          <aside className={styles.previewColumn}>
            <div className={styles.previewSticky}>
              <div className={styles.previewLabel}>
                <span>Xem trước bài viết</span>
                <span className={styles.liveDot}>Live</span>
              </div>

              <article className={styles.liveCard}>
                <div className={styles.liveMedia}>
                  <img src={anhBia} alt="Ảnh bìa xem trước" />
                  <span className={styles.mediaBadge}>{loaiHienThi}</span>
                  {giaHienThi && (
                    <span className={styles.mediaPrice}>{giaHienThi}</span>
                  )}
                </div>

                <div className={styles.liveBody}>
                  <span className={styles.liveMeta}>
                    <MapPin size={11} aria-hidden="true" />
                    {khuVucHienThi || 'Chưa chọn khu vực'}
                  </span>
                  <h2>
                    {title.trim() || 'Tiêu đề review của bạn sẽ hiển thị ở đây'}
                  </h2>
                  <p className={styles.liveRestaurant}>{tenQuanHienThi}</p>
                  <div className={styles.liveRating}>
                    <strong>{formatScore(diemTrungBinh)}</strong>
                    <RatingStars value={diemTrungBinh} size="sm" />
                  </div>
                  <ul className={styles.liveTags}>
                    {tagDaChon.slice(0, 3).map((the) => (
                      <li key={the.id}>{the.ten_the}</li>
                    ))}
                    {tagDaChon.length === 0 && <li>Chưa chọn thẻ</li>}
                  </ul>
                  <div className={styles.liveFooter}>
                    {user?.anh_dai_dien ? (
                      <img src={user.anh_dai_dien} alt="" width="26" height="26" />
                    ) : (
                      <span className={styles.liveAvatarFallback} aria-hidden="true">
                        {user?.username?.slice(0, 2).toUpperCase() || 'MM'}
                      </span>
                    )}
                    <span>{user?.ho_ten || user?.username}</span>
                    <small>Vừa xong</small>
                  </div>
                </div>
              </article>

              {videoEmbed && (
                <div className={styles.previewVideo}>
                  <span className={styles.previewVideoLabel}>
                    <PlayIcon /> Video đính kèm
                  </span>
                  <div className={styles.previewVideoFrame}>
                    <iframe
                      src={videoEmbed.embedUrl}
                      title="Xem trước video"
                      loading="lazy"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              <div className={styles.tipCard}>
                <span className={styles.tipTitle}>
                  <ShieldCheck size={14} aria-hidden="true" />
                  Mẹo viết review được yêu
                </span>
                <ul>
                  <li>Kể một chi tiết cụ thể bạn nhớ nhất.</li>
                  <li>Nêu cả điểm cộng và điểm cần cải thiện.</li>
                  <li>Ghi rõ món đã gọi và giá tham khảo.</li>
                  <li>Thêm video nếu bạn có clip thực tế.</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
