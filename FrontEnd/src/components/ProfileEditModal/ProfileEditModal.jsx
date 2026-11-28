import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  Camera,
  ImageOff,
  Loader2,
  Save,
  UserRound,
  X,
} from "lucide-react";
import { capNhatHoSo } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import { initials } from "../../utils/format";
import styles from "./ProfileEditModal.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ANH_TOI_DA = 5 * 1024 * 1024; // 5 MB
const TIEU_SU_TOI_DA = 500;

/**
 * Hộp thoại chỉnh sửa thông tin cá nhân (họ tên, email, tiểu sử, ảnh đại diện).
 *
 * Hộp thoại được dựng trong <body> để không bị header (có backdrop-filter)
 * nhốt `position: fixed` vào thanh điều hướng.
 */
export default function ProfileEditModal({ open, onClose, onSaved }) {
  // Đóng bằng Esc và khoá cuộn trang phía sau khi hộp thoại đang mở.
  useEffect(() => {
    if (!open) return undefined;

    function xuLyPhim(event) {
      if (event.key === "Escape") onClose?.();
    }

    const cuonTruocDo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", xuLyPhim);

    return () => {
      document.body.style.overflow = cuonTruocDo;
      window.removeEventListener("keydown", xuLyPhim);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className={styles.backdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-edit-title"
      >
        {/* Dựng lại biểu mẫu mỗi lần mở để state luôn khớp hồ sơ hiện tại. */}
        <EditProfileForm onClose={onClose} onSaved={onSaved} />
      </div>
    </div>,
    document.body,
  );
}

function EditProfileForm({ onClose, onSaved }) {
  const { user, refresh } = useAuth();

  const [hoTen, setHoTen] = useState(user?.ho_ten || "");
  const [email, setEmail] = useState(user?.email || "");
  const [tieuSu, setTieuSu] = useState(user?.tieu_su || "");
  const [tepAnh, setTepAnh] = useState(null);
  const [xoaAnh, setXoaAnh] = useState(false);
  const [anhXemTruoc, setAnhXemTruoc] = useState(user?.anh_dai_dien || "");
  const [loi, setLoi] = useState("");
  const [dangLuu, setDangLuu] = useState(false);

  const inputAnhRef = useRef(null);

  // Ảnh xem trước: ưu tiên ảnh vừa chọn, sau đó ảnh hiện tại, cuối cùng là chữ cái đầu.
  useEffect(() => {
    if (!tepAnh) return undefined;

    const url = URL.createObjectURL(tepAnh);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnhXemTruoc(url);

    return () => URL.revokeObjectURL(url);
  }, [tepAnh]);

  const tenHienThi = hoTen.trim() || user?.username || "";

  function chonAnh(event) {
    const tep = event.target.files?.[0];
    event.target.value = "";
    if (!tep) return;

    if (!tep.type.startsWith("image/")) {
      setLoi("Ảnh đại diện phải là tệp hình ảnh (JPG, PNG hoặc WebP).");
      return;
    }

    if (tep.size > ANH_TOI_DA) {
      setLoi("Ảnh đại diện quá lớn — vui lòng chọn ảnh nhỏ hơn 5 MB.");
      return;
    }

    setLoi("");
    setXoaAnh(false);
    setTepAnh(tep);
  }

  function boAnh() {
    setTepAnh(null);
    setXoaAnh(true);
    setAnhXemTruoc("");
  }

  function kiemTraDuLieu() {
    if (!hoTen.trim()) return "Vui lòng nhập họ và tên.";
    if (hoTen.trim().length > 150) return "Họ và tên tối đa 150 ký tự.";
    if (!email.trim()) return "Vui lòng nhập email.";
    if (!EMAIL_RE.test(email.trim())) return "Email chưa đúng định dạng.";
    if (tieuSu.length > TIEU_SU_TOI_DA) {
      return `Tiểu sử tối đa ${TIEU_SU_TOI_DA} ký tự.`;
    }
    return "";
  }

  async function xuLyGui(event) {
    event.preventDefault();

    const loiDuLieu = kiemTraDuLieu();
    if (loiDuLieu) {
      setLoi(loiDuLieu);
      return;
    }

    setDangLuu(true);
    setLoi("");

    try {
      if (tepAnh) {
        const form = new FormData();
        form.append("ho_ten", hoTen.trim());
        form.append("email", email.trim());
        form.append("tieu_su", tieuSu.trim());
        form.append("anh_dai_dien", tepAnh);
        await capNhatHoSo(form);
      } else {
        await capNhatHoSo({
          ho_ten: hoTen.trim(),
          email: email.trim(),
          tieu_su: tieuSu.trim(),
          // null = gỡ ảnh đại diện, giữ nguyên nếu người dùng không đụng tới.
          ...(xoaAnh ? { anh_dai_dien: null } : {}),
        });
      }

      await refresh();
      onSaved?.();
      onClose?.();
    } catch (loiApi) {
      setLoi(loiApi.message || "Không lưu được thông tin. Vui lòng thử lại.");
    } finally {
      setDangLuu(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={xuLyGui} encType="multipart/form-data">
      <header className={styles.head}>
        <span className={styles.kicker}>
          <UserRound size={13} aria-hidden="true" />
          Hồ sơ của bạn
        </span>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Đóng hộp thoại"
          disabled={dangLuu}
        >
          <X size={17} aria-hidden="true" />
        </button>
      </header>

      <h2 id="profile-edit-title">Chỉnh sửa thông tin cá nhân</h2>
      <p className={styles.intro}>
        Cập nhật họ tên, email, tiểu sử và ảnh đại diện hiển thị trên hồ sơ của
        bạn.
      </p>

      <div className={styles.avatarRow}>
        <div className={styles.avatarPreview}>
          {anhXemTruoc ? (
            <img src={anhXemTruoc} alt={`Ảnh đại diện của ${tenHienThi}`} />
          ) : (
            <span className={styles.avatarFallback} aria-hidden="true">
              {initials(tenHienThi)}
            </span>
          )}
        </div>

        <div className={styles.avatarActions}>
          <input
            ref={inputAnhRef}
            id="profile-avatar-input"
            className={styles.fileInput}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={chonAnh}
            disabled={dangLuu}
          />
          <button
            type="button"
            className={styles.uploadButton}
            onClick={() => inputAnhRef.current?.click()}
            disabled={dangLuu}
          >
            <Camera size={15} aria-hidden="true" />
            Chọn ảnh mới
          </button>

          {anhXemTruoc && (
            <button
              type="button"
              className={styles.removeButton}
              onClick={boAnh}
              disabled={dangLuu}
            >
              <ImageOff size={14} aria-hidden="true" />
              Xóa ảnh
            </button>
          )}

          <span className={styles.hint}>JPG, PNG hoặc WebP — tối đa 5 MB.</span>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="profile-ho-ten">Họ và tên</label>
        <input
          id="profile-ho-ten"
          type="text"
          autoComplete="name"
          maxLength={150}
          value={hoTen}
          onChange={(event) => setHoTen(event.target.value)}
          disabled={dangLuu}
          placeholder="Nguyễn Ngọc Trân"
        />
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label htmlFor="profile-username">Tên đăng nhập</label>
          <input
            id="profile-username"
            type="text"
            value={user?.username || ""}
            readOnly
            disabled
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="profile-email">Email</label>
          <input
            id="profile-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={dangLuu}
            placeholder="ban@email.vn"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="profile-tieu-su">Tiểu sử</label>
        <textarea
          id="profile-tieu-su"
          rows={4}
          maxLength={TIEU_SU_TOI_DA}
          value={tieuSu}
          onChange={(event) => setTieuSu(event.target.value)}
          disabled={dangLuu}
          placeholder="Vài dòng giới thiệu về bạn và gu ăn uống…"
        />
        <span className={styles.counter}>
          {tieuSu.length}/{TIEU_SU_TOI_DA}
        </span>
      </div>

      {loi && (
        <p className={styles.error} role="alert">
          <AlertCircle size={14} aria-hidden="true" />
          {loi}
        </p>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cancel}
          onClick={onClose}
          disabled={dangLuu}
        >
          Hủy
        </button>
        <button type="submit" className={styles.submit} disabled={dangLuu}>
          {dangLuu ? (
            <Loader2 size={15} className={styles.spin} aria-hidden="true" />
          ) : (
            <Save size={15} aria-hidden="true" />
          )}
          {dangLuu ? "Đang lưu…" : "Lưu thay đổi"}
        </button>
      </div>
    </form>
  );
}
