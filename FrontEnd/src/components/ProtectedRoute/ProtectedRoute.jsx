import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Header from "../Header/Header";
import styles from "./ProtectedRoute.module.css";

/**
 * Cổng bảo vệ cho toàn bộ khu vực cần đăng nhập.
 *
 * Khi mở web, <AuthProvider> gọi một lần GET /api/ho-so/ để kiểm tra phiên
 * đăng nhập đã lưu (session cookie do Django cấp). Trong lúc chờ thì hiện màn
 * hình "Đang kiểm tra phiên đăng nhập"; nếu chưa có phiên thì chuyển ngay sang
 * trang /dang-nhap kèm đường dẫn quay lại sau khi đăng nhập.
 */
export default function ProtectedRoute() {
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
    return <Navigate to={`/dang-nhap?next=${next}`} replace />;
  }

  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
}
