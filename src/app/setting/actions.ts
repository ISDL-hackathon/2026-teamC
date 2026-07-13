"use server";

import { redirect } from "next/navigation";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

type DeleteAccountResult = {
  error: string | null;
};

export async function deleteAccount(): Promise<DeleteAccountResult> {
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

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const secretKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !secretKey) {
    console.error(
      "Supabaseの管理者用環境変数が設定されていません。",
    );

    return {
      error: "退会処理の設定に問題があります。",
    };
  }

  const adminSupabase = createAdminClient(
    supabaseUrl,
    secretKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  const { error: deleteError } =
    await adminSupabase.auth.admin.deleteUser(
      user.id,
    );

  if (deleteError) {
    console.error(
      "アカウント削除エラー:",
      deleteError,
    );

    return {
      error: "アカウントを削除できませんでした。",
    };
  }

  await supabase.auth.signOut();

  redirect("/login");
}