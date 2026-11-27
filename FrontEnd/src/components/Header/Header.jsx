import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Loader2,
  LogIn,
  LogOut,
  PenLine,
  UserPlus,
  UtensilsCrossed,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { initials } from "../../utils/format";
import styles from "./Header.module.css";

const navItems = [
  { to: "/", label: "Trang chủ", end: true },
  { to: "/feed", label: "Feed" },
  { to: "/create", label: "Đăng bài" },
  { to: "/profile", label: "Trang cá nhân" },
];

export default function Header() {
  const { user, isAuthenticated, dangKhoiTao, logout } = useAuth();
  const [dangXuat, setDangXuat] = useState(false);

  async function xuLyDangXuat() {
    setDangXuat(true);
    try {
      await logout();
    } finally {
      setDangXuat(false);
    }
  }

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link
          className={styles.brandLink}
          to="/"
          aria-label="Măm Măm - Trang chủ"
        >
          <span className={styles.logoMark} aria-hidden="true">
            <UtensilsCrossed size={21} strokeWidth={2.2} />
          </span>
          <span className={styles.brandText}>
            <span className={styles.brandName}>Măm Măm</span>
            <span className={styles.brandTagline}>ăn thật · kể thật</span>
          </span>
        </Link>

        <nav className={styles.nav} aria-label="Điều hướng chính">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actions}>
          {dangKhoiTao ? (
            <span className={styles.sessionLoading} aria-label="Đang tải">
              <Loader2 size={17} className={styles.spin} aria-hidden="true" />
            </span>
          ) : isAuthenticated ? (
            <>
              <Link className={styles.cta} to="/create">
                <PenLine size={15} aria-hidden="true" />
                Viết review
              </Link>

              <Link className={styles.userLink} to="/profile">
                {user?.anh_dai_dien ? (
                  <img
                    className={styles.avatar}
                    src={user.anh_dai_dien}
                    alt=""
                    width="36"
                    height="36"
                  />
                ) : (
                  <span className={styles.avatarFallback} aria-hidden="true">
                    {initials(user?.ho_ten || user?.username)}
                  </span>
                )}
                <span className={styles.userName}>
                  {user?.ho_ten || user?.username}
                </span>
              </Link>

              <button
                type="button"
                className={styles.logoutButton}
                onClick={xuLyDangXuat}
                disabled={dangXuat}
                title="Đăng xuất"
                aria-label="Đăng xuất"
              >
                {dangXuat ? (
                  <Loader2 size={15} className={styles.spin} aria-hidden="true" />
                ) : (
                  <LogOut size={15} aria-hidden="true" />
                )}
              </button>
            </>
          ) : (
            <>
              <Link className={styles.loginLink} to="/dang-nhap">
                <LogIn size={15} aria-hidden="true" />
                Đăng nhập
              </Link>
              <Link className={styles.cta} to="/dang-ky">
                <UserPlus size={15} aria-hidden="true" />
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
