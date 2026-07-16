"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./BottomNav.module.css";

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m4 11 8-7 8 7v9h-6v-6h-4v6H4v-9Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function ChallengeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m12 2 2.8 6.3 6.8.7-5.1 4.6 1.5 6.7-6-3.4-6 3.4 1.5-6.7L2.4 9l6.8-.7L12 2Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function RankingIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8 4h8v3a4 4 0 0 1-8 0V4Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />

      <path
        d="M8 6H5v1a4 4 0 0 0 4 4M16 6h3v1a4 4 0 0 1-4 4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />

      <path
        d="M12 11v4M9 20h6M10 15h4v5h-4z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ScanIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8 4H4v4M16 4h4v4M8 20H4v-4M16 20h4v-4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />

      <path
        d="M7 12h10"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function BottomNav() {
  const pathname = usePathname();

  const isHomeActive =
    pathname === "/" || pathname === "/home";

  const isChallengeActive =
    pathname.startsWith("/challenge");

  const isRankingActive =
    pathname.startsWith("/ranking");

  const isScanActive =
    pathname === "/scan";

  return (
    <nav
      className={styles.bottomNavigation}
      aria-label="メインナビゲーション"
    >
      <Link
        href="/home"
        className={`${styles.navigationItem} ${
          isHomeActive
            ? styles.navigationItemActive
            : ""
        }`}
        aria-current={
          isHomeActive ? "page" : undefined
        }
      >
        <HomeIcon />
        <span>ホーム</span>
      </Link>

      <Link
        href="/challenge"
        className={`${styles.navigationItem} ${
          isChallengeActive
            ? styles.navigationItemActive
            : ""
        }`}
        aria-current={
          isChallengeActive ? "page" : undefined
        }
      >
        <ChallengeIcon />
        <span>チャレンジ</span>
      </Link>

      <Link
        href="/ranking"
        className={`${styles.navigationItem} ${
          isRankingActive
            ? styles.navigationItemActive
            : ""
        }`}
        aria-current={
          isRankingActive ? "page" : undefined
        }
      >
        <RankingIcon />
        <span>ランキング</span>
      </Link>

      <Link
        href="/scan"
        className={`${styles.navigationItem} ${
          isScanActive
            ? styles.navigationItemActive
            : ""
        }`}
        aria-current={
          isScanActive ? "page" : undefined
        }
      >
        <ScanIcon />
        <span>スキャン</span>
      </Link>
    </nav>
  );
}