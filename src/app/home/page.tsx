import { createClient } from "@/lib/supabase/server";
import { requireMonthlyAnswer } from "@/lib/petit-question/checkMonthlyAnswer";
import HomePageClient from "./HomePageClient";

const TOTAL_QUIZ_STAMP_COUNT = 10;

/**
 * 日本時間の今日を YYYY-MM-DD 形式で取得する
 */
function getJapanDateKey() {
  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  ).format(new Date());
}

/**
 * 日本時間で今月の開始日と
 * 翌月の開始日を取得する
 */
function getJapanMonthRange() {
  const parts =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "numeric",
      },
    ).formatToParts(new Date());

  const year = Number(
    parts.find(
      (part) =>
        part.type === "year",
    )?.value,
  );

  const month = Number(
    parts.find(
      (part) =>
        part.type === "month",
    )?.value,
  );

  const startDate =
    `${year}-${String(month).padStart(
      2,
      "0",
    )}-01`;

  const nextMonthDate =
    new Date(
      Date.UTC(
        year,
        month,
        1,
      ),
    );

  const nextYear =
    nextMonthDate.getUTCFullYear();

  const nextMonth =
    nextMonthDate.getUTCMonth() + 1;

  const endDate =
    `${nextYear}-${String(
      nextMonth,
    ).padStart(2, "0")}-01`;

  return {
    startDate,
    endDate,
  };
}

export default async function HomePage() {
  const user =
    await requireMonthlyAnswer();

  const supabase =
    await createClient();

  const { error: cleanupError } =
    await supabase.rpc(
      "close_stale_attendance",
    );

  if (cleanupError) {
    console.error(
      "前日以前の入室データ整理エラー:",
      cleanupError,
    );
  }

  const todayKey =
    getJapanDateKey();

  const {
    startDate,
    endDate,
  } = getJapanMonthRange();

  /**
   * 日本時間の今日の開始時刻と
   * 翌日の開始時刻を作成する
   */
  const todayStart =
    `${todayKey}T00:00:00+09:00`;

  const tomorrowDate =
    new Date(
      `${todayKey}T00:00:00+09:00`,
    );

  tomorrowDate.setDate(
    tomorrowDate.getDate() + 1,
  );

  const tomorrowKey =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      },
    ).format(tomorrowDate);

  const tomorrowStart =
    `${tomorrowKey}T00:00:00+09:00`;

  /**
   * 現在入室中の人数を取得
   */
  const {
    count: labCount,
    error: countError,
  } = await supabase
    .from("attendance_records")
    .select("id", {
      count: "exact",
      head: true,
    })
    .is("exited_at", null);

  if (countError) {
    console.error(
      "研究室人数の取得エラー:",
      countError,
    );
  }

  /**
   * ログイン中のユーザーが
   * 現在入室中か確認
   */
  const {
    data: activeAttendance,
    error: attendanceError,
  } = await supabase
    .from("attendance_records")
    .select("id")
    .eq("user_id", user.id)
    .is("exited_at", null)
    .maybeSingle();

  if (attendanceError) {
    console.error(
      "入室状態の取得エラー:",
      attendanceError,
    );
  }

  /**
   * 今日チェックイン済みか確認
   *
   * 退席済みかどうかに関係なく、
   * 今日の入室記録が1件以上あれば達成済みとする
   */
  const {
    count: todayCheckInCount,
    error: todayCheckInError,
  } = await supabase
    .from("attendance_records")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("user_id", user.id)
    .gte(
      "entered_at",
      todayStart,
    )
    .lt(
      "entered_at",
      tomorrowStart,
    );

  if (todayCheckInError) {
    console.error(
      "本日のチェックイン状況取得エラー:",
      todayCheckInError,
    );
  }

  /**
   * 今月の自分のチェックイン回数を取得
   */
  /**
 * 今月チェックインした日数を取得
 *
 * 同じ日に複数回入室していても、
 * 進捗は1日分だけ増えるようにする
 */
const {
  data: monthlyCheckInRecords,
  error: monthlyCheckInError,
} = await supabase
  .from("attendance_records")
  .select("entered_at")
  .eq("user_id", user.id)
  .gte(
    "entered_at",
    `${startDate}T00:00:00+09:00`,
  )
  .lt(
    "entered_at",
    `${endDate}T00:00:00+09:00`,
  );

if (monthlyCheckInError) {
  console.error(
    "今月のチェックイン記録取得エラー:",
    monthlyCheckInError,
  );
}

/**
 * 入室日時を日本時間の日付に変換し、
 * 同じ日付の重複を取り除く
 */
const monthlyCheckInDateKeys =
  new Set(
    (monthlyCheckInRecords ?? []).map(
      (record) =>
        new Intl.DateTimeFormat(
          "en-CA",
          {
            timeZone: "Asia/Tokyo",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          },
        ).format(
          new Date(record.entered_at),
        ),
    ),
  );

const monthlyCheckInDayCount =
  monthlyCheckInDateKeys.size;
   

  /**
   * 今日のクイズに回答済みか確認
   *
   * 正解・不正解に関係なく、
   * 今日の回答履歴があれば達成済みとする
   */
  const {
    data: todayQuizAttempt,
    error: todayQuizAttemptError,
  } = await supabase
    .from("mission_quiz_attempts")
    .select("id")
    .eq("user_id", user.id)
    .eq("quiz_date", todayKey)
    .maybeSingle();

  if (todayQuizAttemptError) {
    console.error(
      "本日のクイズ回答状況取得エラー:",
      todayQuizAttemptError,
    );
  }

  /**
   * 今月のクイズ正解数を取得
   */
  const {
    count: monthlyQuizCorrectCount,
    error: quizProgressError,
  } = await supabase
    .from("mission_quiz_attempts")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("user_id", user.id)
    .eq("is_correct", true)
    .gte(
      "quiz_date",
      startDate,
    )
    .lt(
      "quiz_date",
      endDate,
    );

  if (quizProgressError) {
    console.error(
      "今月のクイズ進捗取得エラー:",
      quizProgressError,
    );
  }

  /**
   * 自分のポイント履歴を取得
   */
  const {
    data: pointTransactions,
    error: pointError,
  } = await supabase
    .from("point_transactions")
    .select("amount")
    .eq("user_id", user.id);

  if (pointError) {
    console.error(
      "ポイント取得エラー:",
      pointError,
    );
  }

  /**
   * ポイントの合計を計算
   */
  const totalPoints =
    pointTransactions?.reduce(
      (total, transaction) =>
        total + transaction.amount,
      0,
    ) ?? 0;

  const quizStampCount =
    Math.min(
      monthlyQuizCorrectCount ?? 0,
      TOTAL_QUIZ_STAMP_COUNT,
    );

  return (
    <HomePageClient
      labCount={labCount ?? 0}
      isInLab={Boolean(
        activeAttendance,
      )}
      hasCheckedInToday={
        (todayCheckInCount ?? 0) > 0
      }
      hasAnsweredQuizToday={
        Boolean(todayQuizAttempt)
      }
      checkInCount={
  monthlyCheckInDayCount
}
      quizStampCount={
        quizStampCount
      }
      totalPoints={totalPoints}
    />
  );
}