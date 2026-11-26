import { useState } from "react";
import {
  AlertCircle,
  AtSign,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  UserPlus,
  UserRound,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import styles from "./AuthCard.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function RegisterForm({ onSuccess }) {
  const { register } = useAuth();

  const [hoTen, setHoTen] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [matKhau2, setMatKhau2] = useState("");
  const [hienMatKhau, setHienMatKhau] = useState(false);
  const [error, setError] = useState("");
  const [dangGui, setDangGui] = useState(false);

  function kiemTraDuLieu() {
    if (!hoTen.trim()) return "Vui lòng nhập họ và tên.";
    if (!username.trim()) return "Vui lòng nhập tên đăng nhập.";
    if (username.trim().length < 3) {
      return "Tên đăng nhập cần ít nhất 3 ký tự.";
    }
    if (email.trim() && !EMAIL_RE.test(email.trim())) {
      return "Email chưa đúng định dạng.";
    }
    if (matKhau.length < 6) return "Mật khẩu cần ít nhất 6 ký tự.";
    if (matKhau !== matKhau2) return "Mật khẩu nhập lại không khớp.";
    return "";
  }

  async function xuLyGui(event) {
    event.preventDefault();

    const loi = kiemTraDuLieu();
    if (loi) {
      setError(loi);
      return;
    }

    setDangGui(true);
    setError("");

    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        ho_ten: hoTen.trim(),
        mat_khau: matKhau,
        mat_khau_2: matKhau2,
      });
      onSuccess?.();
    } catch (loiApi) {
      setError(loiApi.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setDangGui(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={xuLyGui} noValidate>
      <div className={styles.field}>
        <label htmlFor="register-name">Họ và tên</label>
        <span className={styles.inputWrap}>
          <UserRound size={16} className={styles.inputIcon} aria-hidden="true" />
          <input
            id="register-name"
            name="ho_ten"
            type="text"
            autoComplete="name"
            placeholder="Nguyễn Ngọc Trân"
            value={hoTen}
            onChange={(event) => setHoTen(event.target.value)}
            disabled={dangGui}
          />
        </span>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label htmlFor="register-username">Tên đăng nhập</label>
          <span className={styles.inputWrap}>
            <AtSign size={16} className={styles.inputIcon} aria-hidden="true" />
            <input
              id="register-username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder="ngoctran"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              disabled={dangGui}
            />
          </span>
        </div>

        <div className={styles.field}>
          <label htmlFor="register-email">Email</label>
          <span className={styles.inputWrap}>
            <Mail size={16} className={styles.inputIcon} aria-hidden="true" />
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="ban@email.vn"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={dangGui}
            />
          </span>
        </div>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label htmlFor="register-password">Mật khẩu</label>
          <span className={styles.inputWrap}>
            <Lock size={16} className={styles.inputIcon} aria-hidden="true" />
            <input
              id="register-password"
              name="mat_khau"
              type={hienMatKhau ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Tối thiểu 6 ký tự"
              value={matKhau}
              onChange={(event) => setMatKhau(event.target.value)}
              disabled={dangGui}
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setHienMatKhau((giaTri) => !giaTri)}
              aria-label={hienMatKhau ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              tabIndex={-1}
            >
              {hienMatKhau ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </span>
        </div>

        <div className={styles.field}>
          <label htmlFor="register-password-2">Nhập lại</label>
          <span className={styles.inputWrap}>
            <Lock size={16} className={styles.inputIcon} aria-hidden="true" />
            <input
              id="register-password-2"
              name="mat_khau_2"
              type={hienMatKhau ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Gõ lại mật khẩu"
              value={matKhau2}
              onChange={(event) => setMatKhau2(event.target.value)}
              disabled={dangGui}
            />
          </span>
        </div>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          <AlertCircle size={14} aria-hidden="true" />
          {error}
        </p>
      )}

      <button type="submit" className={styles.submit} disabled={dangGui}>
        {dangGui ? (
          <>
            <Loader2 size={16} className={styles.spin} aria-hidden="true" />
            Đang tạo tài khoản…
          </>
        ) : (
          <>
            <UserPlus size={16} aria-hidden="true" />
            Tạo tài khoản
          </>
        )}
      </button>

      <p className={styles.formHint}>
        Tài khoản mới có thể viết review, chấm điểm và bình luận ngay.
      </p>
    </form>
  );
}
