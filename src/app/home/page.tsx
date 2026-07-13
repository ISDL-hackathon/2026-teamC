"use client";

import { useState } from "react";
import "./style.css";

export default function Home() {
  const [labCount, setLabCount] = useState(12);
  const [points, setPoints] = useState(1250);
  const [checkInCount, setCheckInCount] = useState(7);
  const [checkedInToday, setCheckedInToday] = useState(false);

  const handleCheckIn = () => {
    if (checkedInToday) {
      alert("今日はすでにチェックイン済みです");
      return;
    }

    setCheckedInToday(true);
    setCheckInCount((prev) => prev + 1);
    setPoints((prev) => prev + 50);
    setLabCount((prev) => prev + 1);

    alert("チェックインしました！ +50pt");
  };

  const handleLeave = () => {
    alert("退席機能は現在準備中です");
  };

  return (
    <main className="app">
      <header className="header">
        <button className="iconButton">☰</button>

        <h1 className="logo">ISDL</h1>

        <button className="iconButton">🔔</button>
      </header>

      <section className="hero">
        <div>
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

      <section className="statusCard">
        <div className="pinBox">📍</div>

        <div className="statusText">
          <h3>現在の研究室状況</h3>
          <p>最終更新：5分前</p>
        </div>

        <div className="countBox">
          <strong>{labCount}</strong>
          <span>人</span>
        </div>
      </section>

      <button
        type="button"
        className="leaveButton"
        onClick={handleLeave}
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
          <strong>退席する</strong>
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

        <button className="linkButton">
          もっと見る
        </button>
      </section>

      <section className="challengeCard">
        <span className="badge">
          {checkedInToday
            ? "達成済"
            : "達成中"}
        </span>

        <h3>
          研究室に来て1回チェックインしよう
        </h3>

        <p>
          研究室に来たらアプリで記録。毎日の継続状況を確認できます。
        </p>

        <div className="progressInfo">
          <span>進捗</span>
          <span>
            {checkInCount} / 10日
          </span>
        </div>

        <div className="progressBar">
          <div
            className="progressFill"
            style={{
              width: `${Math.min(
                (checkInCount / 10) * 100,
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

        <button className="linkButton">
          明細を見る
        </button>
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
            {points.toLocaleString()}
          </strong>

          <span>pt</span>
        </div>
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

        <button
          className="scanButton"
          onClick={handleCheckIn}
        >
          ⌁
        </button>
      </section>

      <nav className="bottomNav">
        <button className="active">
          <svg
            className="bottomNavIcon homeIcon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M3 11.5 12 4l9 7.5v8a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H4.5A1.5 1.5 0 0 1 3 19.5v-8Z" />
          </svg>

          <p>ホーム</p>
        </button>

        <button>
          <svg
            className="bottomNavIcon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="m12 3 2.6 5.27 5.82.85-4.21 4.1.99 5.79L12 16.27 6.8 19l.99-5.79-4.21-4.1 5.82-.85L12 3Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>

          <p>チャレンジ</p>
        </button>

        <button>
          <svg
            className="bottomNavIcon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M7 3H4a1 1 0 0 0-1 1v3M17 3h3a1 1 0 0 1 1 1v3M7 21H4a1 1 0 0 1-1-1v-3M17 21h3a1 1 0 0 0 1-1v-3M8 8h8v8H8z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <p>スキャン</p>
        </button>
      </nav>
    </main>
  );
}