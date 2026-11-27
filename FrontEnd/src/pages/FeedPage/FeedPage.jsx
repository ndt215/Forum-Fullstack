import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  Loader2,
  PenLine,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';
import ReviewCard from '../../components/ReviewCard/ReviewCard';
import {
  boLuuQuanYeuThich,
  layDanhSachBaiReview,
  layQuanYeuThich,
  luuQuanYeuThich,
} from '../../api/reviews';
import { baiReviewToCard } from '../../utils/adapters';
import styles from './FeedPage.module.css';

const filterChips = [
  { value: '', label: 'Tất cả' },
  { value: 'mon_viet', label: 'Món Việt' },
  { value: 'mon_nuoc', label: 'Món nước' },
  { value: 'hai_san', label: 'Hải sản' },
  { value: 'do_an_nhanh', label: 'Ăn nhanh' },
  { value: 'khac', label: 'Món Âu / Khác' },
];

const sortOptions = [
  { value: '-ngay_tao', label: 'Mới nhất' },
  { value: '-diem_trung_binh', label: 'Điểm cao' },
  { value: '-luot_thich', label: 'Nhiều lượt thích' },
];

const PAGE_SIZE = 9;

export default function FeedPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [ordering, setOrdering] = useState('-ngay_tao');
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [savedMap, setSavedMap] = useState({});
  const [saveLoadingId, setSaveLoadingId] = useState(null);
  const [saveNote, setSaveNote] = useState('');

  // Quán đã lưu của người dùng: { [nha_hang_id]: quan_yeu_thich_id }
  useEffect(() => {
    let ignore = false;

    layQuanYeuThich()
      .then((data) => {
        if (ignore) return;

        const banDo = {};
        (data?.results || []).forEach((muc) => {
          banDo[muc.nha_hang] = muc.id;
        });
        setSavedMap(banDo);
      })
      .catch(() => {
        if (!ignore) setSavedMap({});
      });

    return () => {
      ignore = true;
    };
  }, []);

  async function xuLyLuuQuan(nhaHangId) {
    if (!nhaHangId || saveLoadingId) return;

    const daLuuId = savedMap[nhaHangId];

    setSaveLoadingId(nhaHangId);
    setSaveNote('');

    try {
      if (daLuuId) {
        await boLuuQuanYeuThich(daLuuId);
        setSavedMap((truoc) => {
          const sau = { ...truoc };
          delete sau[nhaHangId];
          return sau;
        });
        setSaveNote('Đã bỏ lưu quán khỏi bộ sưu tập.');
      } else {
        const moi = await luuQuanYeuThich(nhaHangId);
        setSavedMap((truoc) => ({ ...truoc, [nhaHangId]: moi.id }));
        setSaveNote('Đã lưu quán vào bộ sưu tập của bạn.');
      }
    } catch (loi) {
      setSaveNote(loi.message || 'Không cập nhật được quán yêu thích.');
    } finally {
      setSaveLoadingId(null);
    }
  }

  // Gõ tìm kiếm -> chờ 350ms rồi mới gọi API.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let ignore = false;

    // Bật trạng thái tải ngay khi đổi bộ lọc (fetch nằm trong effect).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError('');

    layDanhSachBaiReview({
      search,
      loai_am_thuc: cuisine,
      ordering,
      page: 1,
      page_size: PAGE_SIZE,
    })
      .then((data) => {
        if (ignore) return;
        setItems(data?.results || []);
        setCount(data?.count || 0);
        setNextPage(data?.next ? 2 : null);
      })
      .catch((loi) => {
        if (ignore) return;
        setError(loi.message || 'Không tải được danh sách bài review.');
        setItems([]);
        setCount(0);
        setNextPage(null);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [search, cuisine, ordering, reloadKey]);

  async function xemThem() {
    if (!nextPage || loadingMore) return;

    setLoadingMore(true);
    setError('');

    try {
      const data = await layDanhSachBaiReview({
        search,
        loai_am_thuc: cuisine,
        ordering,
        page: nextPage,
        page_size: PAGE_SIZE,
      });

      setItems((truoc) => [...truoc, ...(data?.results || [])]);
      setCount(data?.count || 0);
      setNextPage(data?.next ? nextPage + 1 : null);
    } catch (loi) {
      setError(loi.message || 'Không tải thêm được bài review.');
    } finally {
      setLoadingMore(false);
    }
  }

  const dangLoc = Boolean(search || cuisine);

  return (
    <div className={styles.page}>
      <header className={styles.feedHeader}>
        <div className={`container ${styles.headerInner}`}>
          <div>
            <span className="eyebrow">
              <Sparkles size={13} aria-hidden="true" />
              Cộng đồng Măm Măm
            </span>
            <h1>Feed món ngon</h1>
            <p>
              Những bài review mới nhất từ người ăn thật. Chọn một món, đọc câu
              chuyện và lưu quán cho lần ghé sau.
            </p>
          </div>

          <Link className={styles.createLink} to="/create">
            <PenLine size={16} aria-hidden="true" />
            Chia sẻ quán của bạn
          </Link>
        </div>
      </header>

      <div className="container">
        <div className={styles.toolbar} aria-label="Bộ lọc bài review">
          <label className={styles.searchBox}>
            <Search size={18} aria-hidden="true" />
            <input
              className={styles.searchInput}
              type="search"
              placeholder="Tìm tên quán, món ăn hoặc khu vực..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              aria-label="Tìm kiếm bài review"
            />
          </label>

          <div className={styles.filterChips}>
            {filterChips.map((chip) => (
              <button
                key={chip.value || 'tat-ca'}
                type="button"
                className={`${styles.chip} ${
                  cuisine === chip.value ? styles.chipActive : ''
                }`}
                onClick={() => setCuisine(chip.value)}
                aria-pressed={cuisine === chip.value}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <label className={styles.sortBox}>
            <SlidersHorizontal size={14} aria-hidden="true" />
            <select
              value={ordering}
              onChange={(event) => setOrdering(event.target.value)}
              aria-label="Sắp xếp bài review"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} aria-hidden="true" />
          </label>
        </div>

        <div className={styles.feedMeta}>
          <span>
            <UtensilsCrossed size={14} aria-hidden="true" />
            {loading ? 'Đang tải bài review…' : `${count} bài review`}
          </span>
          {dangLoc && <span>Kết quả theo bộ lọc đang chọn</span>}
        </div>

        {saveNote && (
          <p className={styles.saveNote} role="status">
            {saveNote}
          </p>
        )}

        {error && (
          <div className={styles.stateBox} role="alert">
            <p>{error}</p>
            <button
              type="button"
              className={styles.retryButton}
              onClick={() => setReloadKey((key) => key + 1)}
            >
              <RefreshCw size={14} aria-hidden="true" />
              Thử lại
            </button>
          </div>
        )}

        {loading ? (
          <div className={styles.skeletonGrid} aria-hidden="true">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className={styles.skeletonCard} />
            ))}
          </div>
        ) : (
          <>
            {!error && items.length === 0 && (
              <div className={styles.stateBox}>
                <UtensilsCrossed size={26} aria-hidden="true" />
                <p>
                  Chưa có bài review nào phù hợp. Hãy thử từ khóa khác hoặc là
                  người đầu tiên chia sẻ!
                </p>
                <Link to="/create" className={styles.retryButton}>
                  <PenLine size={14} aria-hidden="true" />
                  Viết review đầu tiên
                </Link>
              </div>
            )}

            {items.length > 0 && (
              <div className={styles.grid}>
                {items.map((review) => (
                  <ReviewCard
                    key={review.id}
                    {...baiReviewToCard(review)}
                    saved={Boolean(savedMap[review.nha_hang])}
                    saveLoading={saveLoadingId === review.nha_hang}
                    onToggleSave={() => xuLyLuuQuan(review.nha_hang)}
                  />
                ))}
              </div>
            )}

            {nextPage && (
              <div className={styles.loadMoreWrap}>
                <button
                  type="button"
                  className={styles.loadMore}
                  onClick={xemThem}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <Loader2 size={15} className={styles.spin} aria-hidden="true" />
                      Đang tải thêm…
                    </>
                  ) : (
                    'Xem thêm bài review'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
