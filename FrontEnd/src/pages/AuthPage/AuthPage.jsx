import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { PenLine, Sparkles, Star, UtensilsCrossed } from "lucide-react";
import AuthCard from "../../components/Auth/AuthCard";
import styles from "./AuthPage.module.css";
import heroFood from "../../assets/img/hero-food.jpg";

const DUONG_DAN_THEO_TAB = {
  login: "/dang-nhap",
  register: "/dang-ky",
};

/**
 * Trang xác thực riêng (tách khỏi trang chủ).
 *
 * - /dang-nhap: biểu mẫu đăng nhập.
 * - /dang-ky: biểu mẫu đăng ký.
 * - ?next=...: đường dẫn sẽ mở sau khi đăng nhập thành công.
 */
export default function AuthPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const tab = pathname === DUONG_DAN_THEO_TAB.register ? "register" : "login";

  const rawNext = searchParams.get("next") || "";
  const nextPath =
    rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "";

  function doiTab(tabMoi) {
    const query = searchParams.toString();
    const duongDan = DUONG_DAN_THEO_TAB[tabMoi] || DUONG_DAN_THEO_TAB.login;
    navigate(query ? `${duongDan}?${query}` : duongDan, { replace: true });
  }

  return (
    <div className={styles.page}>
      <aside className={styles.brandPane} aria-label="Giới thiệu Măm Măm">
        <img
          className={styles.brandImage}
          src={heroFood}
          alt=""
          aria-hidden="true"
        />
        <span className={styles.brandOverlay} aria-hidden="true" />

        <div className={styles.brandContent}>
          <span className={styles.brandMark}>
            <span className={styles.brandLogo} aria-hidden="true">
              <UtensilsCrossed size={21} strokeWidth={2.2} />
            </span>
            <span className={styles.brandText}>
              <strong>Măm Măm</strong>
              <small>ăn thật · kể thật</small>
            </span>
          </span>

          <h1 className={styles.brandTitle}>
            Mỗi bữa ăn,
            <br />
            <em>một câu chuyện.</em>
          </h1>

          <p className={styles.brandDesc}>
            Nơi những người mê ăn kể lại trải nghiệm thật — từ quán vỉa hè quen
            thuộc đến bàn tiệc đáng nhớ. Đăng nhập để tiếp tục câu chuyện của
            bạn.
          </p>

          <ul className={styles.brandPerks}>
            <li>
              <Sparkles size={14} aria-hidden="true" />
              Lưu quán yêu thích cho lần ghé sau
            </li>
            <li>
              <PenLine size={14} aria-hidden="true" />
              Viết review kèm ảnh và video
            </li>
            <li>
              <Star size={14} aria-hidden="true" />
              Chấm điểm 4 tiêu chí, tìm quán hợp gu
            </li>
          </ul>

          <p className={styles.cityNote}>Hà Nội · Sài Gòn · Đà Nẵng</p>
        </div>
      </aside>

      <section className={styles.formPane}>
        <div className={styles.formInner}>
          <AuthCard tab={tab} nextPath={nextPath} onTabChange={doiTab} />
          <p className={styles.paneFooter}>
            Măm Măm — diễn đàn review quán ăn của người Việt.
          </p>
        </div>
      </section>
    </div>
  );
}
