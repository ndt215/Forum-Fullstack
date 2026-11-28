import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus, UtensilsCrossed } from "lucide-react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import styles from "./AuthCard.module.css";

const TABS = [
  { id: "login", label: "Đăng nhập", icon: LogIn },
  { id: "register", label: "Đăng ký", icon: UserPlus },
];

/**
 * Thẻ đăng nhập / đăng ký dùng ở trang xác thực riêng (/dang-nhap, /dang-ky).
 *
 * - Tab đang chọn do URL quyết định (prop `tab`), bấm tab sẽ do component cha
 *   điều hướng để đường dẫn luôn khớp với biểu mẫu đang hiển thị.
 * - Đăng nhập/đăng ký xong sẽ chuyển tới `nextPath` (trang người dùng định mở)
 *   hoặc về trang chủ.
 */
export default function AuthCard({ tab = "login", nextPath = "", onTabChange }) {
  const navigate = useNavigate();
  const [thongBao, setThongBao] = useState("");

  function doiTab(tabMoi) {
    if (tabMoi === tab) return;
    setThongBao("");
    onTabChange?.(tabMoi);
  }

  function xuLyThanhCong() {
    setThongBao("Đăng nhập thành công. Chào mừng bạn đến với Măm Măm!");
    navigate(nextPath || "/", { replace: true });
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
          <LoginForm onSuccess={xuLyThanhCong} />
        </div>
      ) : (
        <div
          role="tabpanel"
          id="panel-register"
          aria-labelledby="tab-register"
          className={styles.panel}
        >
          <RegisterForm onSuccess={xuLyThanhCong} />
        </div>
      )}

      <p className={styles.legal}>
        Tiếp tục nghĩa là bạn đồng ý chia sẻ review trung thực và tôn trọng cộng
        đồng.
      </p>
    </section>
  );
}
