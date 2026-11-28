import { Link } from "react-router-dom";
import { UtensilsCrossed, Phone, Mail, MapPin } from "lucide-react";
import styles from "./Footer.module.css";

const quickLinks = [
  { to: "/", label: "Trang chủ" },
  { to: "/feed", label: "Khám phá Feed" },
  { to: "/create", label: "Viết review mới" },
  { to: "/profile", label: "Trang cá nhân" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.topGrid}>
          <div className={styles.brandCol}>
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

            <p className={styles.description}>
              Nơi lưu giữ những trải nghiệm ẩm thực chân thực nhất — từ quán cóc
              vỉa hè đến những góc bếp nhỏ ấm cúng quanh thành phố.
            </p>
          </div>

          <div className={styles.linkCol}>
            <h3 className={styles.colTitle}>Khám phá</h3>
            <ul className={styles.linkList}>
              {quickLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={styles.link}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.contactCol}>
            <h3 className={styles.colTitle}>Liên hệ</h3>
            <ul className={styles.contactList}>
              <li>
                <a href="tel:0901234567" className={styles.contactItem}>
                  <span className={styles.contactIcon} aria-hidden="true">
                    <Phone size={15} />
                  </span>
                  <span>0901 234 567</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:mammamofficial@gmail.com"
                  className={styles.contactItem}
                >
                  <span className={styles.contactIcon} aria-hidden="true">
                    <Mail size={15} />
                  </span>
                  <span>mammamofficial@gmail.com</span>
                </a>
              </li>
              <li className={styles.contactItem}>
                <span className={styles.contactIcon} aria-hidden="true">
                  <MapPin size={15} />
                </span>
                <span>TP. Hồ Chí Minh, Việt Nam</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            © {currentYear} Măm Măm. Mọi trải nghiệm đều từ những bữa ăn thật.
          </p>
          <div className={styles.bottomNotes}>
            <span>Ăn ngon mỗi ngày</span>
            <span className={styles.dot} aria-hidden="true">
              ·
            </span>
            <span>Chia sẻ chân thành</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
