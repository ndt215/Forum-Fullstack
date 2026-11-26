import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  Award,
  Bookmark,
  CalendarDays,
  Heart,
  Loader2,
  PenLine,
  RefreshCw,
  Share2,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';
import ReviewCard from '../../components/ReviewCard/ReviewCard';
import { useAuth } from '../../context/AuthContext';
import {
  layDanhSachBaiReview,
  layQuanYeuThich,
  layTheoDoi,
} from '../../api/reviews';
import { baiReviewToCard, quanYeuThichToCard } from '../../utils/adapters';
import {
  formatCompact,
  formatDate,
  initials,
} from '../../utils/format';
import styles from './ProfilePage.module.css';

const TABS = [
  { id: 'posts', label: 'Bài đã đăng', icon: PenLine },
  { id: 'saved', label: 'Quán đã lưu', icon: Bookmark },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [reviews, setReviews] = useState([]);
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [shareNote, setShareNote] = useState('');

  const tab = searchParams.get('tab') === 'saved' ? 'saved' : 'posts';

  function doiTab(tabMoi) {
    const thamSoMoi = new URLSearchParams(searchParams);

    if (tabMoi === 'posts') {
      thamSoMoi.delete('tab');
    } else {
      thamSoMoi.set('tab', tabMoi);
    }

    setSearchParams(thamSoMoi, { replace: true });
  }

  useEffect(() => {
    if (!user?.id) return undefined;

    let ignore = false;

    // Bật trạng thái tải trước khi gọi API (fetch nằm trong effect).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError('');

    Promise.allSettled([
      layDanhSachBaiReview({
        nguoi_dung: user.id,
        page_size: 100,
        ordering: '-ngay_tao',
      }),
      layQuanYeuThich(),
      layTheoDoi({ nguoi_duoc_theo_doi: user.id }),
    ])
      .then(([reviewRes, savedRes, followRes]) => {
        if (ignore) return;

        if (reviewRes.status === 'fulfilled') {
          setReviews((reviewRes.value?.results || []).map(baiReviewToCard));
          setReviewCount(reviewRes.value?.count || 0);
        } else {
          setError(
            reviewRes.reason?.message || 'Không tải được bài review của bạn.',
          );
        }

        if (savedRes.status === 'fulfilled') {
          setSavedPlaces(savedRes.value?.results || []);
        }

        if (followRes.status === 'fulfilled') {
          setFollowerCount(followRes.value?.count || 0);
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [user?.id, reloadKey]);

  async function chiaSeHoSo() {
    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      setShareNote('Đã sao chép liên kết hồ sơ.');
    } catch {
      setShareNote('Không sao chép được — hãy copy trên thanh địa chỉ.');
    }

    setTimeout(() => setShareNote(''), 3200);
  }

  if (!user) return null;

  const tongLuotThich = reviews.reduce(
    (tong, review) => tong + (Number(review.likes) || 0),
    0,
  );
  const tenHienThi = user.ho_ten || user.username;
  const thanhVienBadge =
    reviewCount >= 3
      ? 'Thành viên tích cực'
      : reviewCount >= 1
        ? 'Foodie mới'
        : 'Thành viên mới';

  if (loading) {
    return (
      <div className={styles.loadingPage} role="status" aria-live="polite">
        <Loader2 size={28} className={styles.spin} aria-hidden="true" />
        <p>Đang tải hồ sơ của {tenHienThi}…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="profile-name">
        <div className="container">
          <div className={styles.cover}>
            <span className={styles.coverPattern} aria-hidden="true" />
            <span className={styles.coverQuote}>
              Ăn thật,
              <br />
              kể thật.
              <small>Hồ sơ thành viên Măm Măm</small>
            </span>
          </div>

          <div className={styles.profileCard}>
            <div className={styles.avatarWrap}>
              {user.anh_dai_dien ? (
                <img
                  className={styles.avatar}
                  src={user.anh_dai_dien}
                  alt={`Ảnh đại diện của ${tenHienThi}`}
                  width="118"
                  height="118"
                />
              ) : (
                <span className={styles.avatarFallback} aria-hidden="true">
                  {initials(tenHienThi)}
                </span>
              )}
              <span className={styles.onlineDot} aria-label="Đang hoạt động" />
            </div>

            <div className={styles.info}>
              <div className={styles.nameRow}>
                <h1 id="profile-name">{tenHienThi}</h1>
                <span className={styles.memberBadge}>{thanhVienBadge}</span>
              </div>
              <span className={styles.handle}>@{user.username}</span>
              <p className={styles.bio}>
                {user.tieu_su ||
                  'Thành viên Măm Măm — mỗi bữa ăn là một câu chuyện để kể lại.'}
              </p>

              <div className={styles.meta}>
                <span>
                  <CalendarDays size={13} aria-hidden="true" />
                  Tham gia {formatDate(user.ngay_tao)}
                </span>
                <span>
                  <Award size={13} aria-hidden="true" />
                  {user.vai_tro === 'quan_tri_vien'
                    ? 'Quản trị viên'
                    : 'Thành viên'}
                </span>
              </div>

              <div className={styles.actions}>
                <Link to="/create" className={styles.primaryAction}>
                  <PenLine size={15} aria-hidden="true" />
                  Viết review mới
                </Link>
                <button
                  type="button"
                  className={styles.secondaryAction}
                  onClick={chiaSeHoSo}
                >
                  <Share2 size={15} aria-hidden="true" />
                  Chia sẻ hồ sơ
                </button>
              </div>

              {shareNote && (
                <p className={styles.shareNote} role="status">
                  {shareNote}
                </p>
              )}
            </div>

            <dl className={styles.stats}>
              <div>
                <dt>Bài review</dt>
                <dd>{formatCompact(reviewCount)}</dd>
              </div>
              <div>
                <dt>Quán đã lưu</dt>
                <dd>{formatCompact(savedPlaces.length)}</dd>
              </div>
              <div>
                <dt>Lượt thích</dt>
                <dd>{formatCompact(tongLuotThich)}</dd>
              </div>
              <div>
                <dt>Người theo dõi</dt>
                <dd>{formatCompact(followerCount)}</dd>
              </div>
            </dl>
          </div>

          <div className={styles.achievements} aria-label="Thành tích">
            <span>
              <Award size={14} aria-hidden="true" />
              {reviewCount >= 3 ? 'Top reviewer' : 'Thành viên Măm Măm'}
            </span>
            <span>
              <Sparkles size={14} aria-hidden="true" />
              {reviewCount >= 1 ? 'Chuyên gia ẩm thực' : 'Foodie mới'}
            </span>
            <span>
              <Heart size={14} aria-hidden="true" />
              {followerCount >= 1
                ? 'Thành viên được yêu mến'
                : 'Đang xây dựng cộng đồng'}
            </span>
          </div>
        </div>
      </section>

      <section className={styles.collection} aria-labelledby="collection-title">
        <div className="container">
          <div className={styles.collectionHead}>
            <div>
              <span className="eyebrow">
                <UtensilsCrossed size={13} aria-hidden="true" />
                Bộ sưu tập của bạn
              </span>
              <h2 id="collection-title">Dấu chân ăn uống</h2>
            </div>
            <span className={styles.collectionNote}>
              Dữ liệu lấy trực tiếp từ BackEnd
            </span>
          </div>

          {error && (
            <div className={styles.errorBox} role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              <span>{error}</span>
              <button
                type="button"
                className={styles.retryButton}
                onClick={() => setReloadKey((key) => key + 1)}
              >
                <RefreshCw size={13} aria-hidden="true" />
                Thử lại
              </button>
            </div>
          )}

          <div className={styles.tabs} role="tablist" aria-label="Bộ sưu tập">
            {TABS.map((item) => {
              const Icon = item.icon;
              const soLuong = item.id === 'posts' ? reviewCount : savedPlaces.length;

              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.id}
                  className={`${styles.tab} ${
                    tab === item.id ? styles.tabActive : ''
                  }`}
                  onClick={() => doiTab(item.id)}
                >
                  <Icon size={14} aria-hidden="true" />
                  {item.label}
                  <span>{soLuong}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.tabPanel}>
            {tab === 'posts' ? (
              reviewCount === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon} aria-hidden="true">
                    <PenLine size={26} />
                  </span>
                  <h3>Chưa có bài review nào</h3>
                  <p>
                    Chia sẻ bữa ăn đầu tiên của bạn để bắt đầu xây dựng bộ sưu
                    tập dấu chân ăn uống.
                  </p>
                  <Link to="/create" className={styles.emptyButton}>
                    <PenLine size={14} aria-hidden="true" />
                    Viết review đầu tiên
                  </Link>
                </div>
              ) : (
                <div className={styles.reviewGrid}>
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} {...review} />
                  ))}
                </div>
              )
            ) : savedPlaces.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon} aria-hidden="true">
                  <Bookmark size={26} />
                </span>
                <h3>Chưa lưu quán nào</h3>
                <p>
                  Khi xem một bài review, bấm “Lưu quán” để quán đó xuất hiện tại
                  đây cho lần ghé sau.
                </p>
                <Link to="/feed" className={styles.emptyButton}>
                  <UtensilsCrossed size={14} aria-hidden="true" />
                  Khám phá Feed
                </Link>
              </div>
            ) : (
              <div className={styles.reviewGrid}>
                {savedPlaces.map((muc) => (
                  <ReviewCard key={muc.id} {...quanYeuThichToCard(muc)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
