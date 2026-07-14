"use client";

import {
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  deleteAllNotices,
  markAllNoticesAsRead,
  markNoticeAsRead,
} from "./actions";
import "./notice.css";

export type NoticeCategory =
  | "team"
  | "mission"
  | "point"
  | "remind";

export type NoticeItem = {
  id: number;
  category: NoticeCategory;
  categoryLabel: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  actionLabel?: string;
  linkUrl: string | null;
  isRead: boolean;
};

type NoticePageClientProps = {
  initialTodayNotices: NoticeItem[];
  initialPastNotices: NoticeItem[];
};

export default function NoticePageClient({
  initialTodayNotices,
  initialPastNotices,
}: NoticePageClientProps) {
  const router = useRouter();

  const [
    todayNotices,
    setTodayNotices,
  ] = useState<NoticeItem[]>(
    initialTodayNotices,
  );

  const [
    pastNotices,
    setPastNotices,
  ] = useState<NoticeItem[]>(
    initialPastNotices,
  );

  const [
    actionError,
    setActionError,
  ] = useState("");

  const [
    isMenuOpen,
    setIsMenuOpen,
  ] = useState(false);

  const [
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,
  ] = useState(false);

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const allNotices = [
    ...todayNotices,
    ...pastNotices,
  ];

  const unreadNoticeCount =
    allNotices.filter(
      (notice) => !notice.isRead,
    ).length;

  const updateNoticeLocally = (
    notificationId: number,
  ) => {
    setTodayNotices(
      (currentNotices) =>
        currentNotices.map(
          (notice) =>
            notice.id ===
            notificationId
              ? {
                  ...notice,
                  isRead: true,
                }
              : notice,
        ),
    );

    setPastNotices(
      (currentNotices) =>
        currentNotices.map(
          (notice) =>
            notice.id ===
            notificationId
              ? {
                  ...notice,
                  isRead: true,
                }
              : notice,
        ),
    );
  };

  const handleMarkNoticeAsRead = (
    notificationId: number,
  ) => {
    const targetNotice =
      allNotices.find(
        (notice) =>
          notice.id ===
          notificationId,
      );

    if (
      !targetNotice ||
      targetNotice.isRead ||
      isPending
    ) {
      return;
    }

    setActionError("");

    const previousTodayNotices =
      todayNotices;

    const previousPastNotices =
      pastNotices;

    updateNoticeLocally(
      notificationId,
    );

    startTransition(async () => {
      const result =
        await markNoticeAsRead(
          notificationId,
        );

      if (result.error) {
        setTodayNotices(
          previousTodayNotices,
        );

        setPastNotices(
          previousPastNotices,
        );

        setActionError(
          result.error,
        );
      }
    });
  };

  const handleMarkAllAsRead = () => {
    setIsMenuOpen(false);

    if (
      unreadNoticeCount === 0 ||
      isPending
    ) {
      return;
    }

    setActionError("");

    const previousTodayNotices =
      todayNotices;

    const previousPastNotices =
      pastNotices;

    setTodayNotices(
      (currentNotices) =>
        currentNotices.map(
          (notice) => ({
            ...notice,
            isRead: true,
          }),
        ),
    );

    setPastNotices(
      (currentNotices) =>
        currentNotices.map(
          (notice) => ({
            ...notice,
            isRead: true,
          }),
        ),
    );

    startTransition(async () => {
      const result =
        await markAllNoticesAsRead();

      if (result.error) {
        setTodayNotices(
          previousTodayNotices,
        );

        setPastNotices(
          previousPastNotices,
        );

        setActionError(
          result.error,
        );
      }
    });
  };

  const handleDeleteAllNotices = () => {
    if (
      allNotices.length === 0 ||
      isPending
    ) {
      return;
    }

    setActionError("");
    setIsMenuOpen(false);
    setIsDeleteConfirmOpen(false);

    const previousTodayNotices =
      todayNotices;

    const previousPastNotices =
      pastNotices;

    setTodayNotices([]);
    setPastNotices([]);

    startTransition(async () => {
      const result =
        await deleteAllNotices();

      if (result.error) {
        setTodayNotices(
          previousTodayNotices,
        );

        setPastNotices(
          previousPastNotices,
        );

        setActionError(
          result.error,
        );
      }
    });
  };

  const handleNoticeAction = (
    notice: NoticeItem,
  ) => {
    handleMarkNoticeAsRead(
      notice.id,
    );

    if (notice.linkUrl) {
      router.push(
        notice.linkUrl,
      );
    }
  };

  return (
    <>
      <main className="notice-page">
        <div className="notice-container">
          <header className="notice-header">
            <button
              type="button"
              className="notice-back-button"
              onClick={() =>
                router.back()
              }
              aria-label="前の画面に戻る"
            >
              <span aria-hidden="true">
                ‹
              </span>
            </button>

            <h1 className="notice-header-title">
              通知
            </h1>

            <div className="notice-menu-wrapper">
              <button
                type="button"
                className="notice-menu-button"
                onClick={() =>
                  setIsMenuOpen(
                    (current) =>
                      !current,
                  )
                }
                aria-label="通知メニューを開く"
                aria-expanded={
                  isMenuOpen
                }
                disabled={isPending}
              >
                <span aria-hidden="true">
                  ⋮
                </span>
              </button>

              {isMenuOpen && (
                <div className="notice-menu">
                  <button
                    type="button"
                    onClick={
                      handleMarkAllAsRead
                    }
                    disabled={
                      unreadNoticeCount ===
                        0 || isPending
                    }
                  >
                    すべて既読にする
                  </button>

                  <button
                    type="button"
                    className="notice-menu-delete"
                    onClick={() => {
                      setIsMenuOpen(
                        false,
                      );

                      setIsDeleteConfirmOpen(
                        true,
                      );
                    }}
                    disabled={
                      allNotices.length ===
                        0 || isPending
                    }
                  >
                    通知をすべて削除
                  </button>
                </div>
              )}
            </div>
          </header>

          <div className="notice-content">
            {actionError && (
              <p role="alert">
                {actionError}
              </p>
            )}

            {allNotices.length ===
            0 ? (
              <section className="notice-section">
                <div className="notice-section-heading">
                  <h2>通知</h2>
                </div>

                <div className="notice-list">
                  <p>
                    現在、通知はありません。
                  </p>
                </div>
              </section>
            ) : (
              <>
                <NoticeSection
                  title="今日"
                  notices={
                    todayNotices
                  }
                  showUnreadCount
                  onRead={
                    handleMarkNoticeAsRead
                  }
                  onAction={
                    handleNoticeAction
                  }
                />

                <NoticeSection
                  title="過去の通知"
                  notices={
                    pastNotices
                  }
                  showUnreadCount={
                    false
                  }
                  onRead={
                    handleMarkNoticeAsRead
                  }
                  onAction={
                    handleNoticeAction
                  }
                />
              </>
            )}
          </div>
        </div>
      </main>

      {isDeleteConfirmOpen && (
        <div
          className="notice-delete-overlay"
          onClick={() => {
            if (!isPending) {
              setIsDeleteConfirmOpen(
                false,
              );
            }
          }}
        >
          <div
            className="notice-delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="notice-delete-title"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="notice-delete-icon">
              🗑️
            </div>

            <h2 id="notice-delete-title">
              通知をすべて削除しますか？
            </h2>

            <p>
              削除した通知は元に戻せません。
            </p>

            <div className="notice-delete-buttons">
              <button
                type="button"
                className="notice-delete-cancel"
                onClick={() =>
                  setIsDeleteConfirmOpen(
                    false,
                  )
                }
                disabled={isPending}
              >
                キャンセル
              </button>

              <button
                type="button"
                className="notice-delete-confirm"
                onClick={
                  handleDeleteAllNotices
                }
                disabled={isPending}
              >
                {isPending
                  ? "削除中..."
                  : "すべて削除"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

type NoticeSectionProps = {
  title: string;
  notices: NoticeItem[];
  showUnreadCount: boolean;
  onRead: (
    notificationId: number,
  ) => void;
  onAction: (
    notice: NoticeItem,
  ) => void;
};

function NoticeSection({
  title,
  notices,
  showUnreadCount,
  onRead,
  onAction,
}: NoticeSectionProps) {
  const unreadCount =
    notices.filter(
      (notice) => !notice.isRead,
    ).length;

  if (notices.length === 0) {
    return null;
  }

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
        {notices.map(
          (notice) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              onRead={onRead}
              onAction={
                onAction
              }
            />
          ),
        )}
      </div>
    </section>
  );
}

type NoticeCardProps = {
  notice: NoticeItem;
  onRead: (
    notificationId: number,
  ) => void;
  onAction: (
    notice: NoticeItem,
  ) => void;
};

function NoticeCard({
  notice,
  onRead,
  onAction,
}: NoticeCardProps) {
  return (
    <article
      className={`notice-card ${
        notice.isRead
          ? "notice-card-read"
          : "notice-card-unread"
      }`}
      onClick={() =>
        onRead(notice.id)
      }
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

        {notice.actionLabel &&
          notice.linkUrl && (
            <button
              type="button"
              className="notice-action-button"
              onClick={(event) => {
                event.stopPropagation();
                onAction(notice);
              }}
            >
              <span>
                {notice.actionLabel}
              </span>

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