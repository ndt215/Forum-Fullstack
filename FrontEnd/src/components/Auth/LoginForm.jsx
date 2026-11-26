import { useState } from "react";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import styles from "./AuthCard.module.css";

export default function LoginForm({ onSuccess }) {
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [hienMatKhau, setHienMatKhau] = useState(false);
  const [error, setError] = useState("");
  const [dangGui, setDangGui] = useState(false);

  async function xuLyGui(event) {
    event.preventDefault();

    if (!username.trim() || !password) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }

    setDangGui(true);
    setError("");

    try {
      await login({ username: username.trim(), password });
      onSuccess?.();
    } catch (loi) {
      setError(loi.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setDangGui(false);
    }
  }

  function dienTaiKhoanDemo() {
    setUsername("ngoctran");
    setPassword("MamMam123!");
    setError("");
  }

  return (
    <form className={styles.form} onSubmit={xuLyGui} noValidate>
      <div className={styles.field}>
        <label htmlFor="login-username">Tên đăng nhập</label>
        <span className={styles.inputWrap}>
          <UserRound size={16} className={styles.inputIcon} aria-hidden="true" />
          <input
            id="login-username"
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
        <label htmlFor="login-password">Mật khẩu</label>
        <span className={styles.inputWrap}>
          <Lock size={16} className={styles.inputIcon} aria-hidden="true" />
          <input
            id="login-password"
            name="password"
            type={hienMatKhau ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
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
            Đang đăng nhập…
          </>
        ) : (
          <>
            <LogIn size={16} aria-hidden="true" />
            Đăng nhập
          </>
        )}
      </button>

      <button
        type="button"
        className={styles.demoButton}
        onClick={dienTaiKhoanDemo}
        disabled={dangGui}
      >
        <Sparkles size={13} aria-hidden="true" />
        Điền tài khoản demo
        <span>ngoctran / MamMam123!</span>
      </button>
    </form>
  );
}
