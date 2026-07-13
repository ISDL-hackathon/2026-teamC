"use client";


import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import styles from "./page.module.css";
import Header from "../Header/Header";

type ChallengeLayoutProps = {
  children: ReactNode;
};

export default function ChallengeLayout({
  children,
}: ChallengeLayoutProps) {
  const pathname = usePathname();

  return (
    <main className={styles.wrapper}>
      <div className={styles.page}>
       <Header/>

        <div className={styles.content}>
          <nav className={styles.tabs} aria-label="チャレンジ画面">
            <Link
              href="/challenge/point"
              className={`${styles.tab} ${
                pathname === "/challenge/point" ? styles.activeTab : ""
              }`}
            >
              ポイント
            </Link>

            <Link
              href="/challenge/mission"
              className={`${styles.tab} ${
                pathname === "/challenge/mission" ? styles.activeTab : ""
              }`}
            >
              ミッション
            </Link>

            <Link
              href="/challenge/team"
              className={`${styles.tab} ${
                pathname === "/challenge/team" ? styles.activeTab : ""
              }`}
            >
              チーム
            </Link>
          </nav>

          <section className={styles.screenContent}>{children}</section>
        </div>

        <nav className={styles.bottomNav} aria-label="メインメニュー">
          <Link href="/" className={styles.bottomNavItem}>
            <span className={styles.bottomNavIcon}>⌂</span>
            <span>ホーム</span>
          </Link>

          <Link
            href="/challenge/point"
            className={`${styles.bottomNavItem} ${styles.bottomNavActive}`}
          >
            <span className={styles.bottomNavIcon}>★</span>
            <span>チャレンジ</span>
          </Link>

          <Link href="/scan" className={styles.bottomNavItem}>
            <span className={styles.bottomNavIcon}>⌁</span>
            <span>スキャン</span>
          </Link>
        </nav>
      </div>
    </main>
  );
}