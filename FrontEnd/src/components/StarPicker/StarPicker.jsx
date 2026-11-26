import { useState } from "react";
import { Star } from "lucide-react";
import styles from "./StarPicker.module.css";

/** Chọn điểm 1–5 sao cho một tiêu chí chấm điểm. */
export default function StarPicker({
  value = 0,
  onChange,
  label,
  disabled = false,
  size = 19,
}) {
  const [hover, setHover] = useState(0);
  const hienThi = hover || Number(value) || 0;

  return (
    <span className={styles.wrap} role="radiogroup" aria-label={label}>
      <span className={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={Number(value) === star}
            aria-label={`${label ? `${label}: ` : ""}${star} sao`}
            className={star <= hienThi ? styles.starActive : styles.star}
            onClick={() => !disabled && onChange?.(star)}
            onMouseEnter={() => !disabled && setHover(star)}
            onMouseLeave={() => setHover(0)}
            onFocus={() => !disabled && setHover(star)}
            onBlur={() => setHover(0)}
            disabled={disabled}
          >
            <Star
              size={size}
              fill={star <= hienThi ? "currentColor" : "none"}
              strokeWidth={1.6}
              aria-hidden="true"
            />
          </button>
        ))}
      </span>
      <span className={styles.value}>
        {value ? `${Number(value).toFixed(1).replace(".", ",")}/5` : "Chưa chọn"}
      </span>
    </span>
  );
}
