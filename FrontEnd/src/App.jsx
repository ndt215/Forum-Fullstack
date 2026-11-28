import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import AuthProvider from "./context/AuthProvider";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import GuestRoute from "./components/ProtectedRoute/GuestRoute";
import AuthPage from "./pages/AuthPage/AuthPage";
import HomePage from "./pages/HomePage/HomePage";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import ReviewDetailPage from "./pages/ReviewDetailPage/ReviewDetailPage";
import CreatePostPage from "./pages/CreatePostPage/CreatePostPage";
import FeedPage from "./pages/FeedPage/FeedPage";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

/** Màn hình chờ trong lúc kiểm tra phiên đăng nhập đã lưu. */
function BootScreen() {
  return (
    <div className="boot-screen" role="status" aria-live="polite">
      <Loader2 size={28} className="boot-spinner" aria-hidden="true" />
      <p>Đang kiểm tra phiên đăng nhập…</p>
    </div>
  );
}

function AppRoutes() {
  const { dangKhoiTao } = useAuth();

  // Chưa biết người dùng đã có phiên hay chưa thì chưa điều hướng gì cả.
  if (dangKhoiTao) return <BootScreen />;

  return (
    <Routes>
      {/* Trang xác thực riêng, chỉ dành cho khách chưa đăng nhập */}
      <Route
        path="/dang-nhap"
        element={
          <GuestRoute>
            <AuthPage />
          </GuestRoute>
        }
      />
      <Route
        path="/dang-ky"
        element={
          <GuestRoute>
            <AuthPage />
          </GuestRoute>
        }
      />

      {/* Toàn bộ phần còn lại yêu cầu đăng nhập */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/review/:id" element={<ReviewDetailPage />} />
        <Route path="/review" element={<Navigate to="/feed" replace />} />
        <Route path="/create" element={<CreatePostPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
