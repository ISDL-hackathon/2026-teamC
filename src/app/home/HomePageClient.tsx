"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import Header from "../Header/Header";
import BottomNav from "../BottomNav/BottomNav";
import { leaveLab } from "./actions";
import "./style.css";

type HomePageClientProps = {
  labCount: number;
  isInLab: boolean;
  checkInCount: number;
  totalPoints: number;
};

export default function HomePageClient({
  labCount,
  isInLab,
  checkInCount,
  totalPoints,
}: HomePageClientProps) {
  const router = useRouter();

  const [isLeaving, startLeaveTransition] =
    useTransition();

  const handleLeave = () => {
    startLeaveTransition(async () => {
      const result = await leaveLab();

      alert(result.message);

      if (result.success) {
        router.refresh();
      }
    });
  };

  return (
    <main className="app">
      <Header />

      <section className="hero">
        <div className="heroContent">
          <p className="sectionLabel heroLabel">
            LAB STATUS
          </p>

          <h2>
            研究室は今
            <br />
            {labCount}人です
          </h2>

          <p className="heroText">
            現在研究室にいる人数を確認できます。
            <br />
            混雑状況の目安として活用してください。
          </p>
        </div>

        <div className="heroEmoji">👩‍💻</div>
      </section>

      <section className="qrCard">
        <div>
          <h3>QRをスキャンする</h3>

          <p>
            研究室のQRを読み取って、
            <br />
            出席やチェックインを記録できます。
          </p>
        </div>

        <Link
          href="/scan"
          className="scanButton"
          aria-label="QRスキャン画面を開く"
        >
          ⌁
        </Link>
      </section>

      <button
        type="button"
        className="leaveButton"
        onClick={handleLeave}
        disabled={!isInLab || isLeaving}
        aria-label="研究室から退席する"
      >
        <span
          className="leaveIcon"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 17l5-5-5-5" />
            <path d="M15 12H3" />
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          </svg>
        </span>

        <span className="leaveText">
          <strong>
            {isLeaving
              ? "退席処理中..."
              : isInLab
                ? "退席する"
                : "現在は入室していません"}
          </strong>

          <small>
            研究室からの退出を記録
          </small>
        </span>
      </button>

      <section className="sectionHeader">
        <div>
          <p className="sectionLabel">
            CHALLENGE
          </p>

          <h2>今日のチャレンジ</h2>
        </div>

        <Link
          href="/challenge"
          className="linkButton"
        >
          もっと見る
        </Link>
      </section>

      <section className="challengeCard">
        <span className="badge">
          {isInLab ? "達成済" : "達成中"}
        </span>

        <h3>
          研究室に来て1回チェックインしよう
        </h3>

        <p>
          研究室に来たらアプリで記録。毎日の継続状況を確認できます。
        </p>

        <div className="progressInfo">
          <span>進捗</span>
          <span>{checkInCount} / 15日</span>
        </div>

        <div className="progressBar">
          <div
            className="progressFill"
            style={{
              width: `${Math.min(
                (checkInCount / 15) * 100,
                100,
              )}%`,
            }}
          />
        </div>
      </section>

      <section className="sectionHeader walletHeader">
        <div>
          <p className="sectionLabel">
            WALLET
          </p>

          <h2>おさいふ</h2>
        </div>

        <Link
          href="/challenge/point"
          className="linkButton"
        >
          明細を見る
        </Link>
      </section>

      <section className="pointCard">
        <div>
          <p className="sectionLabel pointLabel">
            CURRENT BALANCE
          </p>

          <h3>研究室ポイント</h3>

          <p>
            チェックインやチャレンジ達成で獲得
          </p>
        </div>

        <div className="pointValue">
          <strong>
            {totalPoints.toLocaleString()}
          </strong>

          <span>pt</span>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}