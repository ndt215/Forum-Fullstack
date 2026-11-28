import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Flag, Loader2, X } from "lucide-react";
import { guiBaoCao } from "../../api/reports";
import styles from "./ReportModal.module.css";

const LOAI_BAO_CAO = [
  {
    value: "noi_dung",
    label: "Tố cáo nội dung (spam, sai sự thật, thô tục...)",
  },
  { value: "loi_giao_dien", label: "Báo lỗi giao diện" },
  { value: "loi_du_lieu", label: "Báo lỗi dữ liệu (thông tin quán sai...)" },
  { value: "khac", label: "Khác" },
];

const SO_KY_TU_TOI_THIEU = 10;

/**
 * Hộp thoại gửi báo cáo tới quản trị viên.
 *
 * - `baiReviewId` + `tieuDe`: báo cáo gắn với một bài review (tố cáo nội dung).
 * - Không truyền: báo lỗi chung (dùng ở Header).
 *
 * Biểu mẫu nằm trong <ReportForm /> để mỗi lần mở lại là một lần dựng mới,
 * nhờ vậy không cần reset state bằng effect.
 */
export default function ReportModal({
  open,
  onClose,
  baiReviewId = null,
  tieuDe = "",
}) {
  // Đóng bằng phím Esc.
  useEffect(() => {
    if (!open) return undefined;

    function xuLyPhim(event) {
      if (event.key === "Escape") onClose?.();
    }

    window.addEventListener("keydown", xuLyPhim);
    return () => window.removeEventListener("keydown", xuLyPhim);
  }, [open, onClose]);

  if (!open) return null;

  return (
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
        aria-labelledby="report-title"
      >
        <header className={styles.head}>
          <span className={styles.kicker}>
            <Flag size={13} aria-hidden="true" />
            Báo cáo tới quản trị viên
          </span>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Đóng hộp thoại"
          >
            <X size={17} aria-hidden="true" />
          </button>
        </header>

        <ReportForm
          onClose={onClose}
          baiReviewId={baiReviewId}
          tieuDe={tieuDe}
        />
      </div>
    </div>
  );
}

function ReportForm({ onClose, baiReviewId, tieuDe }) {
  const [loai, setLoai] = useState(baiReviewId ? "noi_dung" : "loi_giao_dien");
  const [noiDung, setNoiDung] = useState("");
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState("");
  const [daGui, setDaGui] = useState(false);

  async function xuLyGui(event) {
    event.preventDefault();

    if (noiDung.trim().length < SO_KY_TU_TOI_THIEU) {
      setLoi(
        `Vui lòng mô tả chi tiết hơn (ít nhất ${SO_KY_TU_TOI_THIEU} ký tự).`,
      );
      return;
    }

    setDangGui(true);
    setLoi("");

    try {
      await guiBaoCao({
        loai,
        noi_dung: noiDung.trim(),
        bai_review: baiReviewId,
      });
      setDaGui(true);
    } catch (loiApi) {
      setLoi(loiApi.message || "Không gửi được báo cáo. Vui lòng thử lại.");
    } finally {
      setDangGui(false);
    }
  }

  if (daGui) {
    return (
      <div className={styles.done}>
        <span className={styles.doneIcon} aria-hidden="true">
          <CheckCircle2 size={26} />
        </span>
        <h2 id="report-title">Đã gửi báo cáo</h2>
        <p>
          Cảm ơn bạn đã giúp cộng đồng Măm Măm sạch và đúng hơn. Quản trị viên
          sẽ xem báo cáo này sớm nhất có thể.
        </p>
        <button type="button" className={styles.submit} onClick={onClose}>
          Đóng
        </button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={xuLyGui}>
      <h2 id="report-title">Gửi báo cáo</h2>

      {tieuDe ? (
        <p className={styles.context}>
          Về bài viết: <strong>{tieuDe}</strong>
        </p>
      ) : (
        <p className={styles.context}>
          Báo lỗi bạn gặp khi dùng Măm Măm (giao diện, dữ liệu, thao tác).
        </p>
      )}

      <div className={styles.field}>
        <label htmlFor="report-loai">Loại báo cáo</label>
        <select
          id="report-loai"
          value={loai}
          onChange={(event) => setLoai(event.target.value)}
          disabled={dangGui}
        >
          {LOAI_BAO_CAO.map((muc) => (
            <option key={muc.value} value={muc.value}>
              {muc.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="report-noi-dung">Nội dung chi tiết</label>
        <textarea
          id="report-noi-dung"
          rows={5}
          maxLength={1000}
          placeholder="Ví dụ: Bài viết có thông tin giá không đúng so với quán, hoặc ảnh bị lỗi khi mở trên điện thoại..."
          value={noiDung}
          onChange={(event) => setNoiDung(event.target.value)}
          disabled={dangGui}
          autoFocus
        />
        <span className={styles.counter}>{noiDung.length}/1000</span>
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
          disabled={dangGui}
        >
          Hủy
        </button>
        <button type="submit" className={styles.submit} disabled={dangGui}>
          {dangGui ? (
            <Loader2 size={15} className={styles.spin} aria-hidden="true" />
          ) : (
            <Flag size={15} aria-hidden="true" />
          )}
          {dangGui ? "Đang gửi…" : "Gửi báo cáo"}
        </button>
      </div>
    </form>
  );
}
