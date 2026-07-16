"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./Header.module.css";

export default function Header() {
  const pathname = usePathname();

  const [unreadCount, setUnreadCount] =
    useState(0);

  const fetchUnreadCount =
    useCallback(async () => {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setUnreadCount(0);
        return;
      }

      const { count, error } =
        await supabase
          .from("notifications")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("user_id", user.id)
          .eq("is_read", false);

      if (error) {
        console.error(
          "未読通知件数取得エラー:",
          error,
        );

        return;
      }

      setUnreadCount(count ?? 0);
    }, []);

  useEffect(() => {
    void fetchUnreadCount();
  }, [fetchUnreadCount, pathname]);

  useEffect(() => {
    const handleFocus = () => {
      void fetchUnreadCount();
    };

    const handleVisibilityChange =
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          void fetchUnreadCount();
        }
      };

    window.addEventListener(
      "focus",
      handleFocus,
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus,
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, [fetchUnreadCount]);

  const badgeText =
    unreadCount > 9
      ? "9+"
      : unreadCount.toString();

  return (
    <header className={styles.header}>
      <Link
        href="/setting"
        className={styles.headerButton}
        aria-label="設定"
      >
        ⚙️
      </Link>

      <h1 className={styles.logo}>
        ISDL
      </h1>

      <Link
        href="/notice"
        className={styles.headerButton}
        aria-label={
          unreadCount > 0
            ? `通知、未読${unreadCount}件`
            : "通知"
        }
      >
        <span aria-hidden="true">
          🔔
        </span>

        {unreadCount > 0 && (
          <span
            className={
              styles.notificationBadge
            }
            aria-hidden="true"
          >
            {badgeText}
          </span>
        )}
      </Link>
    </header>
  );
}