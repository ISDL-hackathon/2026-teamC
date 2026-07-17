"use server";

import { createClient } from "@/lib/supabase/server";

export type RankingPeriod =
  | "weekly"
  | "monthly"
  | "overall";

export type RankingUser = {
  userId: string;
  rank: number;
  nickname: string;
  realName: string;
  icon: string;
  avatarUrl: string | null;
  point: number;
  isCurrentUser: boolean;
};

export type RankingResult = {
  users: RankingUser[];
  updatedText: string;
  error: string | null;
};

type ProfileRow = {
  id: string;
  nickname: string | null;
  real_name: string | null;
  selected_icon: string | null;
  avatar_url: string | null;
};

type PointTransactionRow = {
  user_id: string;
  amount: number;
  created_at: string;
};

function getStartDate(
  period: RankingPeriod,
): Date | null {
  const now = new Date();

  if (period === "overall") {
    return null;
  }

  if (period === "monthly") {
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    );
  }

  const startOfWeek = new Date(now);

  const day = startOfWeek.getDay();

  const daysFromMonday =
    day === 0 ? 6 : day - 1;

  startOfWeek.setDate(
    startOfWeek.getDate() -
      daysFromMonday,
  );

  startOfWeek.setHours(
    0,
    0,
    0,
    0,
  );

  return startOfWeek;
}

function getUpdatedText() {
  return new Intl.DateTimeFormat(
    "ja-JP",
    {
      timeZone: "Asia/Tokyo",
      month: "numeric",
      day: "numeric",
    },
  ).format(new Date()) + "更新";
}

export async function getRankingData(
  period: RankingPeriod,
): Promise<RankingResult> {
  const supabase =
    await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      users: [],
      updatedText:
        getUpdatedText(),
      error:
        "ログイン情報を確認できませんでした。",
    };
  }

  const {
    data: profileData,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(`
      id,
      nickname,
      real_name,
      selected_icon,
      avatar_url
    `);

  if (profileError) {
    console.error(
      "ランキングプロフィール取得エラー:",
      profileError,
    );

    return {
      users: [],
      updatedText:
        getUpdatedText(),
      error:
        "メンバー情報を取得できませんでした。",
    };
  }

  const startDate =
    getStartDate(period);

  let transactionQuery =
    supabase
      .from("point_transactions")
      .select(`
        user_id,
        amount,
        created_at
      `);

  if (startDate) {
    transactionQuery =
      transactionQuery.gte(
        "created_at",
        startDate.toISOString(),
      );
  }

  const {
    data: transactionData,
    error: transactionError,
  } = await transactionQuery;

  if (transactionError) {
    console.error(
      "ランキングポイント取得エラー:",
      transactionError,
    );

    return {
      users: [],
      updatedText:
        getUpdatedText(),
      error:
        "ポイント情報を取得できませんでした。",
    };
  }

  const profiles =
    (profileData ?? []) as ProfileRow[];

  const transactions =
    (transactionData ??
      []) as PointTransactionRow[];

  const pointMap =
    new Map<string, number>();

  for (const transaction of transactions) {
    const currentPoint =
      pointMap.get(
        transaction.user_id,
      ) ?? 0;

    pointMap.set(
      transaction.user_id,
      currentPoint +
        transaction.amount,
    );
  }

  const sortedUsers = profiles
    .map((profile) => {
      const nickname =
        profile.nickname?.trim() ||
        "研究室メンバー";

      const realName =
        profile.real_name?.trim() ||
        "名前未設定";

      const icon =
        profile.selected_icon?.trim() ||
        "👤";

      return {
        userId: profile.id,
        nickname,
        realName,
        icon,
        avatarUrl:
          profile.avatar_url,
        point:
          pointMap.get(
            profile.id,
          ) ?? 0,
        isCurrentUser:
          profile.id === user.id,
      };
    })
    .sort((first, second) => {
      if (
        second.point !==
        first.point
      ) {
        return (
          second.point -
          first.point
        );
      }

      return first.nickname.localeCompare(
        second.nickname,
        "ja",
      );
    });

  const rankedUsers: RankingUser[] =
    sortedUsers.map(
      (rankingUser, index) => ({
        ...rankingUser,
        rank: index + 1,
      }),
    );

  return {
    users: rankedUsers,
    updatedText:
      getUpdatedText(),
    error: null,
  };
}