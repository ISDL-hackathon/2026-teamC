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

  const { data: activeAttendance, error: checkError } =
    await supabase
      .from("attendance_records")
      .select("id")
      .eq("user_id", user.id)
      .is("exited_at", null)
      .maybeSingle();

  if (checkError) {
    console.error("入室状態の確認エラー:", checkError);

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

  const { error: insertError } = await supabase
    .from("attendance_records")
    .insert({
      user_id: user.id,
    });

  if (insertError) {
    console.error("入室登録エラー:", insertError);

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