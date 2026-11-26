import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  LogIn,
  LogOut,
  PenLine,
  ShieldCheck,
  UserRound,
  UserPlus,
  UtensilsCrossed,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { formatCompact, initials } from "../../utils/format";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import styles from "./AuthCard.module.css";

const TABS = [
  { id: "login", label: "Đăng nhập", icon: LogIn },
  { id: "register", label: "Đăng ký", icon: UserPlus },
];

/**
 * Thẻ đăng nhập / đăng ký hiển thị ở góc trên bên phải trang chủ.
 *
 * - Có 2 form riêng: <LoginForm /> và <RegisterForm />, chuyển bằng tab.
 * - Khi đã đăng nhập, thẻ chuyển thành lời chào + lối tắt tài khoản.
 */
export default function AuthCard({
  initialTab = "login",
  nextPath = "",
  onTabChange,
}) {
  const { user, isAuthenticated, dangKhoiTao, logout } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState(initialTab);
  const [thongBao, setThongBao] = useState("");
  const [dangXuat, setDangXuat] = useState(false);

  function doiTab(tabMoi) {
    setTab(tabMoi);
    setThongBao("");
    onTabChange?.(tabMoi);
  }

  function xuLyThanhCong(loai) {
    setThongBao(
      loai === "register"
        ? "Tạo tài khoản thành công. Chào mừng bạn đến với Măm Măm!"
        : "Đăng nhập thành công. Chúc bạn có những bữa ăn ngon!",
    );

    if (nextPath) {
      navigate(nextPath, { replace: true });
    }
  }

  async function xuLyDangXuat() {
    setDangXuat(true);
    try {
      await logout();
      setThongBao("Bạn đã đăng xuất khỏi Măm Măm.");
      setTab("login");
    } catch {
      setThongBao("Không thể đăng xuất lúc này, vui lòng thử lại.");
    } finally {
      setDangXuat(false);
    }
  }

  if (dangKhoiTao) {
    return (
      <section className={`${styles.card} ${styles.loadingCard}`} aria-busy="true">
        <span className={styles.spinner} aria-hidden="true" />
        <p>Đang kiểm tra phiên đăng nhập…</p>
      </section>
    );
  }

  if (isAuthenticated) {
    return (
      <section className={styles.card} aria-label="Tài khoản của bạn">
        <div className={styles.accountHead}>
          {user?.anh_dai_dien ? (
            <img
              className={styles.accountAvatar}
              src={user.anh_dai_dien}
              alt={`Ảnh đại diện của ${user.ho_ten || user.username}`}
            />
          ) : (
            <span className={styles.avatarFallback} aria-hidden="true">
              {initials(user?.ho_ten || user?.username)}
            </span>
          )}

          <div className={styles.accountInfo}>
            <span className={styles.accountKicker}>
              <CheckCircle size={12} aria-hidden="true" />
              Đã đăng nhập
            </span>
            <strong>{user?.ho_ten || user?.username}</strong>
            <span className={styles.accountHandle}>@{user?.username}</span>
          </div>
        </div>

        {thongBao && (
          <p className={styles.notice} role="status">
            {thongBao}
          </p>
        )}

        <dl className={styles.accountStats}>
          <div>
            <dt>Bài review</dt>
            <dd>{formatCompact(user?.so_bai_review)}</dd>
          </div>
          <div>
            <dt>Lượt thích</dt>
            <dd>{formatCompact(user?.tong_luot_thich)}</dd>
          </div>
          <div>
            <dt>Vai trò</dt>
            <dd className={styles.roleValue}>
              {user?.vai_tro === "quan_tri_vien" ? "Quản trị" : "Thành viên"}
            </dd>
          </div>
        </dl>

        <div className={styles.accountActions}>
          <Link className={styles.primaryButton} to="/create">
            <PenLine size={15} aria-hidden="true" />
            Viết review
          </Link>
          <Link className={styles.secondaryButton} to="/profile">
            <UserRound size={15} aria-hidden="true" />
            Trang cá nhân
          </Link>
          <button
            type="button"
            className={styles.ghostButton}
            onClick={xuLyDangXuat}
            disabled={dangXuat}
          >
            <LogOut size={15} aria-hidden="true" />
            {dangXuat ? "Đang đăng xuất…" : "Đăng xuất"}
          </button>
        </div>

        <p className={styles.accountHint}>
          <ShieldCheck size={13} aria-hidden="true" />
          Phiên đăng nhập được giữ bằng cookie an toàn của Django.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.card} aria-label="Đăng nhập hoặc đăng ký">
      <header className={styles.cardHead}>
        <span className={styles.cardKicker}>
          <UtensilsCrossed size={12} aria-hidden="true" />
          Thành viên Măm Măm
        </span>
        <h2>
          Tham gia <em>bàn ăn</em>
        </h2>
        <p>Đăng nhập hoặc tạo tài khoản để lưu quán, viết review và thảo luận.</p>
      </header>

      <div className={styles.tabs} role="tablist" aria-label="Chọn hình thức">
        {TABS.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={active}
              aria-controls={`panel-${item.id}`}
              className={`${styles.tab} ${active ? styles.tabActive : ""}`}
              onClick={() => doiTab(item.id)}
            >
              <Icon size={14} aria-hidden="true" />
              {item.label}
            </button>
          );
        })}
      </div>

      {thongBao && (
        <p className={styles.notice} role="status">
          {thongBao}
        </p>
      )}

      {tab === "login" ? (
        <div
          role="tabpanel"
          id="panel-login"
          aria-labelledby="tab-login"
          className={styles.panel}
        >
          <LoginForm onSuccess={() => xuLyThanhCong("login")} />
        </div>
      ) : (
        <div
          role="tabpanel"
          id="panel-register"
          aria-labelledby="tab-register"
          className={styles.panel}
        >
          <RegisterForm onSuccess={() => xuLyThanhCong("register")} />
        </div>
      )}

      <p className={styles.legal}>
        Tiếp tục nghĩa là bạn đồng ý chia sẻ review trung thực và tôn trọng cộng
        đồng.
      </p>
    </section>
  );
}
