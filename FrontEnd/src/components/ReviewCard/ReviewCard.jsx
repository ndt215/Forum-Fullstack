import { Link } from 'react-router-dom';
import {
  Bookmark,
  BookmarkCheck,
  Flame,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Play,
  UtensilsCrossed,
} from 'lucide-react';
import RatingStars from '../RatingStars/RatingStars';
import { initials } from '../../utils/format';
import styles from './ReviewCard.module.css';

/**
 * Card món ăn dùng chung cho Feed và Profile.
 * Dữ liệu có thể đến từ API (xem utils/adapters.js).
 *
 * Nếu truyền `onToggleSave`, góc trên bên phải thẻ có nút lưu / bỏ lưu quán
 * (bảng QuanYeuThich ở BackEnd).
 */
export default function ReviewCard({
  id,
  to,
  image,
  alt,
  cuisine,
  title,
  excerpt,
  restaurant,
  area,
  price,
  rating = 0,
  tags = [],
  author,
  avatar,
  time,
  likes = 0,
  comments = 0,
  isHot = false,
  videoUrl,
  saved = false,
  saveLoading = false,
  onToggleSave,
}) {
  const href = to || (id ? `/review/${id}` : '/feed');
  const diem = Number(rating) || 0;
  const tenQuan = restaurant || 'quán ăn';

  return (
    <article className={styles.card}>
      {onToggleSave ? (
        <button
          type="button"
          className={`${styles.saveButton} ${saved ? styles.saveButtonActive : ''}`}
          onClick={onToggleSave}
          disabled={saveLoading}
          aria-pressed={saved}
          aria-label={saved ? `Bỏ lưu ${tenQuan}` : `Lưu ${tenQuan}`}
          title={saved ? 'Bỏ lưu quán' : 'Lưu quán'}
        >
          {saveLoading ? (
            <Loader2 size={15} className={styles.spin} aria-hidden="true" />
          ) : saved ? (
            <BookmarkCheck size={16} aria-hidden="true" />
          ) : (
            <Bookmark size={16} aria-hidden="true" />
          )}
        </button>
      ) : (
        // Không truyền onToggleSave vẫn giữ biểu tượng dấu trang như trước.
        <span
          className={`${styles.saveButton} ${styles.saveButtonStatic}`}
          aria-hidden="true"
        >
          <Bookmark size={16} />
        </span>
      )}

      <Link to={href} className={styles.link} aria-label={`Xem review: ${title}`}>
        <div className={styles.media}>
          {image ? (
            <img
              src={image}
              alt={alt || `Món ăn tại ${restaurant || 'quán ăn'}`}
              loading="lazy"
            />
          ) : (
            <span className={styles.mediaFallback} aria-hidden="true">
              <UtensilsCrossed size={34} />
            </span>
          )}
          <span className={styles.mediaOverlay} aria-hidden="true" />

          <span className={styles.badgeGroup}>
            {isHot && (
              <span className={`${styles.badge} ${styles.hotBadge}`}>
                <Flame size={12} aria-hidden="true" />
                Hot
              </span>
            )}
            {cuisine && <span className={styles.badge}>{cuisine}</span>}
          </span>

          {videoUrl && (
            <span className={styles.videoBadge}>
              <Play size={11} fill="currentColor" aria-hidden="true" />
              Video
            </span>
          )}

          {price && <span className={styles.price}>{price}</span>}
        </div>

        <div className={styles.body}>
          {area && (
            <span className={styles.location}>
              <MapPin size={13} aria-hidden="true" />
              {area}
            </span>
          )}

          <h2 className={styles.title}>{title}</h2>
          {excerpt && <p className={styles.excerpt}>{excerpt}</p>}

          {tags.length > 0 && (
            <ul className={styles.tags} aria-label="Thẻ món ăn">
              {tags.slice(0, 3).map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}

          <div className={styles.ratingRow}>
            <strong>{diem.toFixed(1).replace('.', ',')}</strong>
            <RatingStars value={diem} size="sm" />
            <span>{restaurant}</span>
          </div>

          <div className={styles.footer}>
            <span className={styles.author}>
              {avatar ? (
                <img src={avatar} alt="" width="28" height="28" loading="lazy" />
              ) : (
                <span className={styles.avatarFallback} aria-hidden="true">
                  {initials(author || 'Măm Măm')}
                </span>
              )}
              <span>
                <strong>{author || 'Thành viên Măm Măm'}</strong>
                <small>{time}</small>
              </span>
            </span>

            <span className={styles.actions}>
              <span>
                <Heart size={14} aria-hidden="true" />
                {likes}
              </span>
              <span>
                <MessageCircle size={14} aria-hidden="true" />
                {comments}
              </span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
