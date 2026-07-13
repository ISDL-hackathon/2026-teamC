"use client";

import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <Link
        href="/setting"
        className={styles.headerButton}
        aria-label="設定"
      >
        ⚙️
      </Link>

      <h1 className={styles.logo}>ISDL</h1>

      <Link
        href="/notice"
        className={styles.headerButton}
        aria-label="通知"
      >
        🔔
      </Link>
    </header>
  );
}