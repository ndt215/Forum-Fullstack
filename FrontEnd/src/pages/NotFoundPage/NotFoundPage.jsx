import { Link } from "react-router-dom";
import { ArrowLeft, Home, UtensilsCrossed } from "lucide-react";
import styles from "./NotFoundPage.module.css";

export default function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <span className={styles.icon} aria-hidden="true">
          <UtensilsCrossed size={27} />
        </span>
        <h1>Món này không có trên bàn</h1>
        <p>
          Trang bạn tìm có thể đã bị dời, bị xóa hoặc chưa từng tồn tại. Quay
          lại để tiếp tục tìm quán ngon nhé.
        </p>
        <div className={styles.actions}>
          <Link to="/" className={styles.primaryButton}>
            <Home size={16} aria-hidden="true" />
            Về trang chủ
          </Link>
          <Link to="/feed" className={styles.secondaryButton}>
            <ArrowLeft size={16} aria-hidden="true" />
            Khám phá review
          </Link>
        </div>
      </div>
    </div>
  );
}
