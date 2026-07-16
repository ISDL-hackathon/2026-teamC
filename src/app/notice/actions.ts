"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type NoticeActionResult = {
  error?: string;
};

export async function markNoticeAsRead(
  notificationId: number,
): Promise<NoticeActionResult> {
  if (
    !Number.isInteger(notificationId) ||
    notificationId <= 0
  ) {
    return {
      error: "通知IDが正しくありません。",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error: "ログイン情報を確認できませんでした。",
    };
  }

  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
    })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) {
    console.error(
      "通知既読エラー:",
      error,
    );

    return {
      error: "通知を既読にできませんでした。",
    };
  }

  revalidatePath("/notice");

  return {};
}

export async function markAllNoticesAsRead(): Promise<NoticeActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error: "ログイン情報を確認できませんでした。",
    };
  }

  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
    })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    console.error(
      "全通知既読エラー:",
      error,
    );

    return {
      error: "通知をすべて既読にできませんでした。",
    };
  }

  revalidatePath("/notice");

  return {};
}

export async function deleteAllNotices(): Promise<NoticeActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error: "ログイン情報を確認できませんでした。",
    };
  }

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    console.error(
      "通知全削除エラー:",
      error,
    );

    return {
      error: "通知を削除できませんでした。",
    };
  }

  revalidatePath("/notice");

  return {};
}