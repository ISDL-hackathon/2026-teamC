"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import "./notice.css";

type NoticeCategory = "team" | "mission" | "point" | "remind";

type NoticeItem = {
  id: number;
  category: NoticeCategory;
  categoryLabel: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  actionLabel?: string;
  isRead: boolean;
};

const initialTodayNotices: NoticeItem[] = [
  {
    id: 1,
    category: "team",
    categoryLabel: "チーム",
    title: "田中先輩が新しい募集を投稿しました",
    description: "「今日、飲みに行ける人！」という投稿があります。",
    time: "10分",
    icon: "👥",
    actionLabel: "投稿を見る",
    isRead: false,
  },
  {
    id: 2,
    category: "mission",
    categoryLabel: "ミッション",
    title: "今日の先輩が更新されました",
    description:
      "田中先輩のプロフィールと、話しかけるきっかけを確認できます。",
    time: "1時間",
    icon: "★",
    actionLabel: "今日の先輩を見る",
    isRead: false,
  },
  {
    id: 3,
    category: "point",
    categoryLabel: "ポイント",
    title: "来室スタンプで20pt獲得しました",
    description: "現在のポイント残高は1,520ptです。",
    time: "3時間",
    icon: "🎁",
    actionLabel: "おさいふを確認",
    isRead: false,
  },
];

const initialPastNotices: NoticeItem[] = [
  {
    id: 4,
    category: "remind",
    categoryLabel: "リマインド",
    title: "参加予定のイベントが30分後に始まります",
    description: "お昼ごはんの募集は12時30分開始です。",
    time: "7月6日",
    icon: "⏰",
    isRead: true,
  },
  {
    id: 5,
    category: "mission",
    categoryLabel: "ミッション",
    title: "交流ミッションを達成しました",
    description: "ミッションクリアにより30pt獲得しました。",
    time: "7月5日",
    icon: "★",
    isRead: true,
  },
];

export default function NoticePage() {
  const router = useRouter();

  const [todayNotices, setTodayNotices] =
    useState<NoticeItem[]>(initialTodayNotices);

  const [pastNotices, setPastNotices] =
    useState<NoticeItem[]>(initialPastNotices);

  const allNotices = [...todayNotices, ...pastNotices];

  const unreadNoticeCount = allNotices.filter(
    (notice) => !notice.isRead,
  ).length;

  const markNoticeAsRead = (id: number) => {
    setTodayNotices((currentNotices) =>
      currentNotices.map((notice) => {
        if (notice.id !== id || notice.isRead) {
          return notice;
        }

        return {
          ...notice,
          isRead: true,
        };
      }),
    );

    setPastNotices((currentNotices) =>
      currentNotices.map((notice) => {
        if (notice.id !== id || notice.isRead) {
          return notice;
        }

        return {
          ...notice,
          isRead: true,
        };
      }),
    );
  };

  const markAllNoticesAsRead = () => {
    setTodayNotices((currentNotices) =>
      currentNotices.map((notice) => ({
        ...notice,
        isRead: true,
      })),
    );

    setPastNotices((currentNotices) =>
      currentNotices.map((notice) => ({
        ...notice,
        isRead: true,
      })),
    );
  };

  const handleNoticeAction = (notice: NoticeItem) => {
    markNoticeAsRead(notice.id);

    /*
      遷移先の画面が完成したら、以下のコメントを外して使用できます。

      if (notice.category === "team") {
        router.push("/challenge/team");
        return;
      }

      if (notice.category === "mission") {
        router.push("/challenge/mission");
        return;
      }

      if (notice.category === "point") {
        router.push("/challenge/point");
        return;
      }
    */
  };

  return (
    <main className="notice-page">
      <div className="notice-container">
        <header className="notice-header">
          <button
            type="button"
            className="notice-back-button"
            onClick={() => router.back()}
            aria-label="前の画面に戻る"
          >
            <span aria-hidden="true">‹</span>
          </button>

          <h1 className="notice-header-title">通知</h1>

          <button
            type="button"
            className="notice-read-all-button"
            onClick={markAllNoticesAsRead}
            disabled={unreadNoticeCount === 0}
          >
            すべて既読
          </button>
        </header>

        <div className="notice-content">
          <NoticeSection
            title="今日"
            notices={todayNotices}
            showUnreadCount
            onRead={markNoticeAsRead}
            onAction={handleNoticeAction}
          />

          <NoticeSection
            title="過去の通知"
            notices={pastNotices}
            showUnreadCount={false}
            onRead={markNoticeAsRead}
            onAction={handleNoticeAction}
          />
        </div>
      </div>
    </main>
  );
}

type NoticeSectionProps = {
  title: string;
  notices: NoticeItem[];
  showUnreadCount: boolean;
  onRead: (id: number) => void;
  onAction: (notice: NoticeItem) => void;
};

function NoticeSection({
  title,
  notices,
  showUnreadCount,
  onRead,
  onAction,
}: NoticeSectionProps) {
  const unreadCount = notices.filter(
    (notice) => !notice.isRead,
  ).length;

  return (
    <section className="notice-section">
      <div className="notice-section-heading">
        <h2>{title}</h2>

        {showUnreadCount ? (
          unreadCount > 0 && (
            <span className="notice-count">
              {unreadCount}件
            </span>
          )
        ) : (
          <span className="notice-count">
            {notices.length}件
          </span>
        )}
      </div>

      <div className="notice-list">
        {notices.map((notice) => (
          <NoticeCard
            key={notice.id}
            notice={notice}
            onRead={onRead}
            onAction={onAction}
          />
        ))}
      </div>
    </section>
  );
}

type NoticeCardProps = {
  notice: NoticeItem;
  onRead: (id: number) => void;
  onAction: (notice: NoticeItem) => void;
};

function NoticeCard({
  notice,
  onRead,
  onAction,
}: NoticeCardProps) {
  const handleCardClick = () => {
    onRead(notice.id);
  };

  return (
    <article
      className={`notice-card ${
        notice.isRead
          ? "notice-card-read"
          : "notice-card-unread"
      }`}
      onClick={handleCardClick}
    >
      <div
        className={`notice-icon notice-icon-${notice.category}`}
        aria-hidden="true"
      >
        {notice.icon}
      </div>

      <div className="notice-card-content">
        <div className="notice-card-meta">
          <span
            className={`notice-category notice-category-${notice.category}`}
          >
            {notice.categoryLabel}
          </span>

          <div className="notice-time-wrapper">
            <time className="notice-time">
              {notice.time}
            </time>

            {!notice.isRead && (
              <span
                className="notice-unread-mark"
                aria-label="未読"
              />
            )}
          </div>
        </div>

        <h3 className="notice-title">
          {notice.title}
        </h3>

        <p className="notice-description">
          {notice.description}
        </p>

        {notice.actionLabel && (
          <button
            type="button"
            className="notice-action-button"
            onClick={(event) => {
              event.stopPropagation();
              onAction(notice);
            }}
          >
            <span>{notice.actionLabel}</span>

            <span
              className="notice-action-arrow"
              aria-hidden="true"
            >
              ›
            </span>
          </button>
        )}
      </div>
    </article>
  );
}