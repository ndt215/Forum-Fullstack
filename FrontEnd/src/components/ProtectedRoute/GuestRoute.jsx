import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Ngược lại với <ProtectedRoute>: chỉ dành cho khách.
 *
 * Người đã đăng nhập mở /dang-nhap hoặc /dang-ky sẽ được đưa về trang họ muốn
 * (?next=...) hoặc về trang chủ, tránh việc đăng nhập hai lần.
 */
export default function GuestRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();

  const rawNext = searchParams.get("next") || "";
  const nextPath =
    rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  if (isAuthenticated) {
    return <Navigate to={nextPath} replace />;
  }

  return children;
}
