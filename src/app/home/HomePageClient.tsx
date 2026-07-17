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
  hasCheckedInToday: boolean;
  hasAnsweredQuizToday: boolean;
  checkInCount: number;
  quizStampCount: number;
  totalPoints: number;
};

const TOTAL_CHECK_IN_COUNT = 15;
const TOTAL_QUIZ_STAMP_COUNT = 10;

export default function HomePageClient({
  labCount,
  isInLab,
  hasCheckedInToday,
  hasAnsweredQuizToday,
  checkInCount,
  quizStampCount,
  totalPoints,
}: HomePageClientProps) {
  const router = useRouter();

  const [
    isLeaving,
    startLeaveTransition,
  ] = useTransition();

  const handleLeave = () => {
    startLeaveTransition(
      async () => {
        const result =
          await leaveLab();

        alert(result.message);

        if (result.success) {
          router.refresh();
        }
      },
    );
  };

  const checkInProgress =
    Math.min(
      (
        checkInCount /
        TOTAL_CHECK_IN_COUNT
      ) * 100,
      100,
    );

  const quizProgress =
    Math.min(
      (
        quizStampCount /
        TOTAL_QUIZ_STAMP_COUNT
      ) * 100,
      100,
    );

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

        <div className="heroEmoji">
          👩‍💻
        </div>
      </section>

      <Link
        href="/scan"
        className="qrCard"
        aria-label="QRスキャン画面を開く"
      >
        <div>
          <h3>
            QRをスキャンする
          </h3>

          <p>
            研究室のQRを読み取って、
            <br />
            出席やチェックインを記録できます。
          </p>
        </div>

        <span
          className="scanButton"
          aria-hidden="true"
        >
          ⌁
        </span>
      </Link>

      <button
        type="button"
        className="leaveButton"
        onClick={handleLeave}
        disabled={
          !isInLab ||
          isLeaving
        }
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
            DAILY CHALLENGE
          </p>

          <h2>
            毎日のチャレンジ
          </h2>
        </div>
      </section>

      <section className="dailyTaskList">
        <Link
          href="/scan"
          className="dailyTaskCard"
          aria-label="研究室に行こうのQRスキャン画面を開く"
        >
          <div className="dailyTaskTop">
            <div className="dailyTaskIcon">
              📍
            </div>

            <div className="dailyTaskContent">
              <span
                className={
                  hasCheckedInToday
                    ? "taskStatusBadge completedBadge"
                    : "taskStatusBadge incompleteBadge"
                }
              >
                {hasCheckedInToday
                  ? "達成済"
                  : "未達成"}
              </span>

              <h3>
                研究室に行こう！！
              </h3>

              <p>
                研究室のQRコードを読み取って、
                チェックインを記録しよう。
              </p>
            </div>

            <span
              className="dailyTaskArrow"
              aria-hidden="true"
            >
              ›
            </span>
          </div>

          <div className="dailyTaskProgress">
            <div className="progressInfo">
              <span>
                今月の進捗
              </span>

              <span>
                {checkInCount} /{" "}
                {TOTAL_CHECK_IN_COUNT}
                日
              </span>
            </div>

            <div className="progressBar">
              <div
                className="progressFill"
                style={{
                  width:
                    `${checkInProgress}%`,
                }}
              />
            </div>
          </div>
        </Link>

        <Link
          href="/challenge/mission"
          className="dailyTaskCard"
          aria-label="今日のクイズ画面を開く"
        >
          <div className="dailyTaskTop">
            <div className="dailyTaskIcon quizTaskIcon">
              ❓
            </div>

            <div className="dailyTaskContent">
              <span
                className={
                  hasAnsweredQuizToday
                    ? "taskStatusBadge completedBadge"
                    : "taskStatusBadge incompleteBadge"
                }
              >
                {hasAnsweredQuizToday
                  ? "達成済"
                  : "未達成"}
              </span>

              <h3>
                今日のクイズに答えよう！！
              </h3>

              <p>
                今日のクイズに挑戦して、
                ミッションスタンプを集めよう。
              </p>
            </div>

            <span
              className="dailyTaskArrow"
              aria-hidden="true"
            >
              ›
            </span>
          </div>

          <div className="dailyTaskProgress">
            <div className="progressInfo">
              <span>
                今月の進捗
              </span>

              <span>
                {quizStampCount} /{" "}
                {TOTAL_QUIZ_STAMP_COUNT}
                個
              </span>
            </div>

            <div className="progressBar">
              <div
                className="progressFill quizProgressFill"
                style={{
                  width:
                    `${quizProgress}%`,
                }}
              />
            </div>
          </div>
        </Link>
      </section>

      <section className="sectionHeader walletHeader">
        <div>
          <p className="sectionLabel">
            WALLET
          </p>

          <h2>おさいふ</h2>
        </div>
      </section>

      <section className="pointCard">
        <div>
          <p className="sectionLabel pointLabel">
            CURRENT BALANCE
          </p>

          <h3>
            研究室ポイント
          </h3>

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