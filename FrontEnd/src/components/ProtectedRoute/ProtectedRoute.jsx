import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import styles from "./ProtectedRoute.module.css";

/**
 * Chặn các trang cần đăng nhập (/create, /profile).
 * Chưa đăng nhập thì quay về trang chủ và mở sẵn form đăng nhập.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, dangKhoiTao } = useAuth();
  const location = useLocation();

  if (dangKhoiTao) {
    return (
      <div className={styles.loading} role="status" aria-live="polite">
        <Loader2 size={26} className={styles.spin} aria-hidden="true" />
        <p>Đang kiểm tra phiên đăng nhập…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return (
      <Navigate to={`/?auth=dang-nhap&next=${next}`} replace />
    );
  }

  return children;
}
