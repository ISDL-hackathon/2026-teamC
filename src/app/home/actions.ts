"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function leaveLab() {
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

  const { data, error } = await supabase
    .from("attendance_records")
    .update({
      exited_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .is("exited_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("退席処理エラー:", error);

    return {
      success: false,
      message: "退席処理に失敗しました。",
    };
  }

  if (!data) {
    return {
      success: false,
      message: "現在は入室していません。",
    };
  }

  revalidatePath("/home");

  return {
    success: true,
    message: "退席しました。",
  };
}