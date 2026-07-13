"use server";

import { redirect } from "next/navigation";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_SETTING_ICONS = [
  "👩‍💻",
  "👨‍💻",
  "👱‍♀️",
  "👨‍🦱",
  "🐱",
  "🐶",
  "🐥",
  "🤖",
];

type DeleteAccountResult = {
  error: string | null;
};

type ProfileSettingsResult = {
  data?: {
    nickname: string;
    selectedIcon: string;
    avatarUrl: string | null;
    noticeEnabled: boolean;
    challengeNoticeEnabled: boolean;
  };
  error?: string;
};

type SaveProfileSettingsResult = {
  error: string | null;
};

export async function getProfileSettings(): Promise<ProfileSettingsResult> {
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

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      nickname,
      selected_icon,
      avatar_url,
      notice_enabled,
      challenge_notice_enabled
    `)
    .eq("id", user.id)
    .single();

  if (error || !data) {
    console.error("プロフィール取得エラー:", error);

    return {
      error: "プロフィールを取得できませんでした。",
    };
  }

  return {
    data: {
      nickname: data.nickname ?? "",
      selectedIcon:
        data.selected_icon ?? DEFAULT_SETTING_ICONS[0],
      avatarUrl: data.avatar_url ?? null,
      noticeEnabled: data.notice_enabled ?? true,
      challengeNoticeEnabled:
        data.challenge_notice_enabled ?? true,
    },
  };
}

export async function saveProfileSettings(
  nickname: string,
  selectedIcon: string,
  noticeEnabled: boolean,
  challengeNoticeEnabled: boolean,
): Promise<SaveProfileSettingsResult> {
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

  const trimmedNickname = nickname.trim();

  if (!trimmedNickname) {
    return {
      error: "ニックネームを入力してください。",
    };
  }

  if (trimmedNickname.length > 12) {
    return {
      error: "ニックネームは12文字以内で入力してください。",
    };
  }

  if (!DEFAULT_SETTING_ICONS.includes(selectedIcon)) {
    return {
      error: "アイコンを正しく選択してください。",
    };
  }

  const {
    data: updatedProfile,
    error: updateError,
  } = await supabase
    .from("profiles")
    .update({
      nickname: trimmedNickname,
      selected_icon: selectedIcon,
      avatar_url: null,
      notice_enabled: noticeEnabled,
      challenge_notice_enabled:
        challengeNoticeEnabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select("id")
    .single();

  if (updateError || !updatedProfile) {
    console.error(
      "プロフィール保存エラー:",
      updateError,
    );

    return {
      error: "プロフィールを保存できませんでした。",
    };
  }

  return {
    error: null,
  };
}

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