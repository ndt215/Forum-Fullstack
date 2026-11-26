import { Star } from "lucide-react";
import styles from "./RatingStars.module.css";

const iconSizes = {
  sm: 14,
  md: 18,
  lg: 24,
};

const cx = (...classes) => classes.filter(Boolean).join(" ");

export default function RatingStars({
  value,
  max = 5,
  size = "md",
  showValue = false,
  className,
}) {
  const iconSize = iconSizes[size];
  const clampedValue = Math.min(max, Math.max(0, value));
  const filledPercent = (clampedValue / max) * 100;

  const outlineStars = Array.from({ length: max }, (_, index) => (
    <Star
      key={`outline-${index}`}
      width={iconSize}
      height={iconSize}
      strokeWidth={1.7}
      aria-hidden="true"
    />
  ));

  const filledStars = Array.from({ length: max }, (_, index) => (
    <Star
      key={`filled-${index}`}
      width={iconSize}
      height={iconSize}
      strokeWidth={1.7}
      fill="currentColor"
      aria-hidden="true"
    />
  ));

  return (
    <span className={cx(styles.display, styles[size], className)}>
      <span
        className={styles.starStack}
        role="img"
        aria-label={`${clampedValue.toFixed(1).replace(".", ",")} trên ${max} sao`}
      >
        <span className={styles.starLayer}>{outlineStars}</span>
        <span
          className={styles.starLayerFilled}
          style={{ width: `${filledPercent}%` }}
          aria-hidden="true"
        >
          {filledStars}
        </span>
      </span>
      {showValue && (
        <span className={styles.value}>
          {clampedValue.toFixed(1).replace(".", ",")}
        </span>
      )}
    </span>
  );
}
