"use server";

import { createClient } from "@/lib/supabase/server";

export async function enterLab() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "ログイン情報を確認できませんでした。",
    };
  }

  /*
   * 昨日以前から入室中のままになっているデータを、
   * 翌日の0時に退席した扱いへ更新する
   */
  const { error: cleanupError } = await supabase.rpc(
    "close_stale_attendance",
  );

  if (cleanupError) {
    console.error(
      "前日以前の入室データ整理エラー:",
      cleanupError,
    );

    return {
      success: false,
      message: "入室状態を確認できませんでした。",
    };
  }

  /*
   * ログイン中のユーザーが現在入室中か確認する
   */
  const { data: activeAttendance, error: checkError } =
    await supabase
      .from("attendance_records")
      .select("id")
      .eq("user_id", user.id)
      .is("exited_at", null)
      .maybeSingle();

  if (checkError) {
    console.error(
      "入室状態の確認エラー:",
      checkError,
    );

    return {
      success: false,
      message: "入室状態を確認できませんでした。",
    };
  }

  if (activeAttendance) {
    return {
      success: false,
      message: "すでに入室しています。",
    };
  }

  /*
   * 新しい入室データを追加する
   */
  const { error: insertError } = await supabase
    .from("attendance_records")
    .insert({
      user_id: user.id,
    });

  if (insertError) {
    console.error(
      "入室登録エラー:",
      insertError,
    );

    return {
      success: false,
      message: "入室登録に失敗しました。",
    };
  }

  return {
    success: true,
    message: "入室を記録しました。",
  };
}