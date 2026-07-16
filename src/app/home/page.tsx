import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HomePageClient from "./HomePageClient";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error: cleanupError } = await supabase.rpc(
    "close_stale_attendance",
  );

  if (cleanupError) {
    console.error(
      "前日以前の入室データ整理エラー:",
      cleanupError,
    );
  }

  // 現在入室中の人数を取得
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

  // ログイン中のユーザーが現在入室中か確認
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

  // 今月の開始日時を作成
  const now = new Date();

  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  );

  // 今月の自分のチェックイン回数を取得
  const {
    count: monthlyCheckInCount,
    error: monthlyCheckInError,
  } = await supabase
    .from("attendance_records")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("user_id", user.id)
    .gte(
      "entered_at",
      startOfMonth.toISOString(),
    );

  if (monthlyCheckInError) {
    console.error(
      "今月のチェックイン回数取得エラー:",
      monthlyCheckInError,
    );
  }

  // 自分のポイント履歴を取得
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

  // ポイントの合計を計算
  const totalPoints =
    pointTransactions?.reduce(
      (total, transaction) =>
        total + transaction.amount,
      0,
    ) ?? 0;

  return (
    <HomePageClient
      labCount={labCount ?? 0}
      isInLab={Boolean(activeAttendance)}
      checkInCount={
        monthlyCheckInCount ?? 0
      }
      totalPoints={totalPoints}
    />
  );
}