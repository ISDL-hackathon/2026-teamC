"use server";

import { redirect } from "next/navigation";
import {
  createClient as createAdminClient,
} from "@supabase/supabase-js";
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
    realName: string;
    selectedIcon: string;
    avatarUrl: string | null;
    noticeEnabled: boolean;
    challengeNoticeEnabled: boolean;
    highSchoolClub: string;
    studentGoal: string;
    bestPurchase: string;
  };
  error?: string;
};

type SaveProfileSettingsResult = {
  error: string | null;
};

type UpdateNoticeSettingResult = {
  error: string | null;
};

type SaveAvatarImageResult = {
  avatarUrl?: string;
  error: string | null;
};

export async function getProfileSettings():
Promise<ProfileSettingsResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error:
        "ログイン情報を確認できませんでした。",
    };
  }

  const {
    data,
    error,
  } = await supabase
    .from("profiles")
    .select(`
      nickname,
      real_name,
      selected_icon,
      avatar_url,
      notice_enabled,
      challenge_notice_enabled
    `)
    .eq("id", user.id)
    .single();

  if (error || !data) {
    console.error(
      "プロフィール取得エラー:",
      error,
    );

    return {
      error:
        "プロフィールを取得できませんでした。",
    };
  }

  const {
    data: missionProfile,
    error: missionProfileError,
  } = await supabase
    .from("mission_profiles")
    .select(`
      high_school_club,
      student_goal,
      best_purchase
    `)
    .eq("user_id", user.id)
    .maybeSingle();

  if (missionProfileError) {
    console.error(
      "ミッションプロフィール取得エラー:",
      missionProfileError,
    );

    return {
      error:
        "クイズ情報を取得できませんでした。",
    };
  }

  return {
    data: {
      nickname:
        data.nickname ?? "",
      realName:
        data.real_name ?? "",
      selectedIcon:
        data.selected_icon ??
        DEFAULT_SETTING_ICONS[0],
      avatarUrl:
        data.avatar_url ?? null,
      noticeEnabled:
        data.notice_enabled ?? true,
      challengeNoticeEnabled:
        data.challenge_notice_enabled ??
        true,
      highSchoolClub:
        missionProfile
          ?.high_school_club ?? "",
      studentGoal:
        missionProfile
          ?.student_goal ?? "",
      bestPurchase:
        missionProfile
          ?.best_purchase ?? "",
    },
  };
}

export async function saveProfileSettings(
  nickname: string,
  realName: string,
  selectedIcon: string,
  noticeEnabled: boolean,
  challengeNoticeEnabled: boolean,
  highSchoolClub: string,
  studentGoal: string,
  bestPurchase: string,
): Promise<SaveProfileSettingsResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error:
        "ログイン情報を確認できませんでした。",
    };
  }

  const trimmedNickname =
    nickname.trim();

  const trimmedRealName =
    realName.trim();

  const trimmedHighSchoolClub =
    highSchoolClub.trim();

  const trimmedStudentGoal =
    studentGoal.trim();

  const trimmedBestPurchase =
    bestPurchase.trim();

  if (!trimmedNickname) {
    return {
      error:
        "ニックネームを入力してください。",
    };
  }

  if (
    trimmedNickname.length > 12
  ) {
    return {
      error:
        "ニックネームは12文字以内で入力してください。",
    };
  }

  if (!trimmedRealName) {
    return {
      error:
        "本名を入力してください。",
    };
  }

  if (
    trimmedRealName.length > 30
  ) {
    return {
      error:
        "本名は30文字以内で入力してください。",
    };
  }

  if (!trimmedHighSchoolClub) {
    return {
      error:
        "高校の頃の部活を入力してください。",
    };
  }

  if (!trimmedStudentGoal) {
    return {
      error:
        "学生のうちにやりたいことを入力してください。",
    };
  }

  if (!trimmedBestPurchase) {
    return {
      error:
        "買って良かったものを入力してください。",
    };
  }

  if (
    trimmedHighSchoolClub.length > 30 ||
    trimmedStudentGoal.length > 50 ||
    trimmedBestPurchase.length > 50
  ) {
    return {
      error:
        "クイズ用プロフィールの文字数を確認してください。",
    };
  }

  const isAvatarUrl =
    selectedIcon.startsWith("https://") ||
    selectedIcon.startsWith("http://");

  if (
    !isAvatarUrl &&
    !DEFAULT_SETTING_ICONS.includes(
      selectedIcon,
    )
  ) {
    return {
      error:
        "アイコンを正しく選択してください。",
    };
  }

  const profileUpdates = {
    nickname:
      trimmedNickname,
    real_name:
      trimmedRealName,
    notice_enabled:
      noticeEnabled,
    challenge_notice_enabled:
      challengeNoticeEnabled,
    updated_at:
      new Date().toISOString(),
    ...(isAvatarUrl
      ? {
          avatar_url:
            selectedIcon,
        }
      : {
          selected_icon:
            selectedIcon,
          avatar_url: null,
        }),
  };

  const {
    data: updatedProfile,
    error: updateError,
  } = await supabase
    .from("profiles")
    .update(profileUpdates)
    .eq("id", user.id)
    .select("id")
    .single();

  if (
    updateError ||
    !updatedProfile
  ) {
    console.error(
      "プロフィール保存エラー:",
      updateError,
    );

    return {
      error:
        "プロフィールを保存できませんでした。",
    };
  }

  const {
    error: missionProfileError,
  } = await supabase
    .from("mission_profiles")
    .upsert(
      {
        user_id:
          user.id,
        high_school_club:
          trimmedHighSchoolClub,
        student_goal:
          trimmedStudentGoal,
        best_purchase:
          trimmedBestPurchase,
        updated_at:
          new Date().toISOString(),
      },
      {
        onConflict:
          "user_id",
      },
    );

  if (missionProfileError) {
    console.error(
      "ミッションプロフィール保存エラー:",
      missionProfileError,
    );

    return {
      error:
        "クイズ情報を保存できませんでした。",
    };
  }

  return {
    error: null,
  };
}

export async function updateNoticeSetting(
  noticeEnabled: boolean,
): Promise<UpdateNoticeSettingResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error:
        "ログイン情報を確認できませんでした。",
    };
  }

  const {
    data: updatedProfile,
    error,
  } = await supabase
    .from("profiles")
    .update({
      notice_enabled:
        noticeEnabled,
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", user.id)
    .select("id")
    .single();

  if (
    error ||
    !updatedProfile
  ) {
    console.error(
      "通知設定保存エラー:",
      error,
    );

    return {
      error:
        "通知設定を保存できませんでした。",
    };
  }

  return {
    error: null,
  };
}

export async function saveAvatarImage(
  imageDataUrl: string,
): Promise<SaveAvatarImageResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error:
        "ログイン情報を確認できませんでした。",
    };
  }

  const match = imageDataUrl.match(
    /^data:(image\/(?:png|jpeg|webp));base64,(.+)$/,
  );

  if (!match) {
    return {
      error:
        "画像データを確認できませんでした。",
    };
  }

  const contentType =
    match[1];

  const base64Data =
    match[2];

  const imageBuffer =
    Buffer.from(
      base64Data,
      "base64",
    );

  const maxFileSize =
    5 * 1024 * 1024;

  if (
    imageBuffer.length >
    maxFileSize
  ) {
    return {
      error:
        "画像サイズは5MB以下にしてください。",
    };
  }

  const extension =
    contentType === "image/jpeg"
      ? "jpg"
      : contentType === "image/webp"
        ? "webp"
        : "png";

  const filePath =
    `${user.id}/avatar.${extension}`;

  const {
    error: uploadError,
  } = await supabase.storage
    .from("avatars")
    .upload(
      filePath,
      imageBuffer,
      {
        contentType,
        upsert: true,
        cacheControl: "3600",
      },
    );

  if (uploadError) {
    console.error(
      "プロフィール画像アップロードエラー:",
      uploadError,
    );

    return {
      error:
        "プロフィール画像を保存できませんでした。",
    };
  }

  const {
    data: publicUrlData,
  } = supabase.storage
    .from("avatars")
    .getPublicUrl(
      filePath,
    );

  const avatarUrl =
    `${publicUrlData.publicUrl}?t=${Date.now()}`;

  const {
    data: updatedProfile,
    error: profileUpdateError,
  } = await supabase
    .from("profiles")
    .update({
      avatar_url:
        avatarUrl,
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", user.id)
    .select("id")
    .single();

  if (
    profileUpdateError ||
    !updatedProfile
  ) {
    console.error(
      "プロフィール画像URL保存エラー:",
      profileUpdateError,
    );

    await supabase.storage
      .from("avatars")
      .remove([
        filePath,
      ]);

    return {
      error:
        "プロフィール画像の情報を保存できませんでした。",
    };
  }

  return {
    avatarUrl,
    error: null,
  };
}

export async function deleteAccount():
Promise<DeleteAccountResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error:
        "ログイン情報を確認できませんでした。",
    };
  }

  const supabaseUrl =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL;

  const secretKey =
    process.env
      .SUPABASE_SERVICE_ROLE_KEY;

  if (
    !supabaseUrl ||
    !secretKey
  ) {
    console.error(
      "Supabaseの管理者用環境変数が設定されていません。",
    );

    return {
      error:
        "退会処理の設定に問題があります。",
    };
  }

  const adminSupabase =
    createAdminClient(
      supabaseUrl,
      secretKey,
      {
        auth: {
          autoRefreshToken:
            false,
          persistSession:
            false,
        },
      },
    );

  const {
    error: deleteError,
  } =
    await adminSupabase
      .auth.admin
      .deleteUser(
        user.id,
      );

  if (deleteError) {
    console.error(
      "アカウント削除エラー:",
      deleteError,
    );

    return {
      error:
        "アカウントを削除できませんでした。",
    };
  }

  await supabase.auth.signOut();

  redirect("/login");
}