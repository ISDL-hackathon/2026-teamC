import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NoticePageClient, {
  type NoticeCategory,
  type NoticeItem,
} from "./NoticePageClient";

type NotificationRow = {
  id: number;
  notification_type:
    | "notice"
    | "challenge"
    | "team"
    | "point";
  title: string;
  message: string;
  link_url: string | null;
  is_read: boolean;
  created_at: string;
};

function getNoticeDisplay(
  notificationType:
    NotificationRow["notification_type"],
): {
  category: NoticeCategory;
  categoryLabel: string;
  icon: string;
  actionLabel?: string;
} {
  switch (notificationType) {
    case "team":
      return {
        category: "team",
        categoryLabel: "チーム",
        icon: "👥",
        actionLabel: "投稿を見る",
      };

    case "challenge":
      return {
        category: "mission",
        categoryLabel:
          "ミッション",
        icon: "⭐",
        actionLabel:
          "ミッションを見る",
      };

    case "point":
      return {
        category: "point",
        categoryLabel:
          "ポイント",
        icon: "🎁",
        actionLabel:
          "ポイントを見る",
      };

    case "notice":
    default:
      return {
        category: "remind",
        categoryLabel:
          "お知らせ",
        icon: "🔔",
        actionLabel:
          "内容を確認",
      };
  }
}

function getJapanDateParts(
  dateValue: string,
) {
  const date = new Date(dateValue);

  const formatter =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      },
    );

  const parts =
    formatter.formatToParts(
      date,
    );

  const year =
    parts.find(
      (part) =>
        part.type === "year",
    )?.value ?? "";

  const month =
    parts.find(
      (part) =>
        part.type === "month",
    )?.value ?? "";

  const day =
    parts.find(
      (part) =>
        part.type === "day",
    )?.value ?? "";

  return {
    dateKey:
      `${year}-${month}-${day}`,
    year,
    month,
    day,
  };
}

function getTodayJapanKey() {
  return getJapanDateParts(
    new Date().toISOString(),
  ).dateKey;
}

function formatNoticeTime(
  createdAt: string,
  isToday: boolean,
) {
  const createdDate =
    new Date(createdAt);

  if (
    Number.isNaN(
      createdDate.getTime(),
    )
  ) {
    return "";
  }

  if (isToday) {
    return new Intl.DateTimeFormat(
      "ja-JP",
      {
        timeZone: "Asia/Tokyo",
        hour: "2-digit",
        minute: "2-digit",
      },
    ).format(createdDate);
  }

  return new Intl.DateTimeFormat(
    "ja-JP",
    {
      timeZone: "Asia/Tokyo",
      month: "numeric",
      day: "numeric",
    },
  ).format(createdDate);
}

function convertNotification(
  notification:
    NotificationRow,
  todayKey: string,
): NoticeItem {
  const display =
    getNoticeDisplay(
      notification.notification_type,
    );

  const notificationDate =
    getJapanDateParts(
      notification.created_at,
    );

  const isToday =
    notificationDate.dateKey ===
    todayKey;

  return {
    id: notification.id,
    category:
      display.category,
    categoryLabel:
      display.categoryLabel,
    title: notification.title,
    description:
      notification.message,
    time: formatNoticeTime(
      notification.created_at,
      isToday,
    ),
    icon: display.icon,
    actionLabel:
      notification.link_url
        ? display.actionLabel
        : undefined,
    linkUrl:
      notification.link_url,
    isRead:
      notification.is_read,
  };
}

export default async function NoticePage() {
  const supabase =
    await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const {
    data,
    error:
      notificationsError,
  } = await supabase
    .from("notifications")
    .select(
      `
        id,
        notification_type,
        title,
        message,
        link_url,
        is_read,
        created_at
      `,
    )
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    })
    .limit(20);

  if (notificationsError) {
    console.error(
      "通知取得エラー:",
      notificationsError,
    );
  }

  const todayKey =
    getTodayJapanKey();

  const notifications = (
    (data ?? []) as NotificationRow[]
  ).map((notification) =>
    convertNotification(
      notification,
      todayKey,
    ),
  );

  const todayNotices =
    notifications.filter(
      (_, index) => {
        const source =
          (data ??
            [])[index] as
            | NotificationRow
            | undefined;

        if (!source) {
          return false;
        }

        return (
          getJapanDateParts(
            source.created_at,
          ).dateKey === todayKey
        );
      },
    );

  const pastNotices =
    notifications.filter(
      (_, index) => {
        const source =
          (data ??
            [])[index] as
            | NotificationRow
            | undefined;

        if (!source) {
          return false;
        }

        return (
          getJapanDateParts(
            source.created_at,
          ).dateKey !== todayKey
        );
      },
    );

  return (
    <NoticePageClient
      initialTodayNotices={
        todayNotices
      }
      initialPastNotices={
        pastNotices
      }
    />
  );
}