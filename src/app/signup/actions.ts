"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type SignupResult = {
  error: string | null;
};

type SignupInput = {
  realName: string;
  email: string;
  password: string;
  passwordConfirm: string;
  favoriteSubject: string;
  favoriteColor: string;
};

export async function signup(
  input: SignupInput,
): Promise<SignupResult> {
  const trimmedRealName =
    input.realName.trim();

  const trimmedEmail =
    input.email.trim();

  const trimmedFavoriteSubject =
    input.favoriteSubject.trim();

  const trimmedFavoriteColor =
    input.favoriteColor.trim();

  if (!trimmedRealName) {
    return {
      error:
        "本名を入力してください。",
    };
  }

  if (!trimmedEmail) {
    return {
      error:
        "メールアドレスを入力してください。",
    };
  }

  if (input.password.length < 8) {
    return {
      error:
        "パスワードは8文字以上で入力してください。",
    };
  }

  if (
    input.password !==
    input.passwordConfirm
  ) {
    return {
      error:
        "確認用パスワードが一致していません。",
    };
  }

  if (!trimmedFavoriteSubject) {
    return {
      error:
        "好きな教科を入力してください。",
    };
  }

  if (!trimmedFavoriteColor) {
    return {
      error:
        "好きな色を入力してください。",
    };
  }

  if (
    trimmedFavoriteSubject.length >
      20 ||
    trimmedFavoriteColor.length > 20
  ) {
    return {
      error:
        "好きな教科と好きな色は20文字以内で入力してください。",
    };
  }

  if (trimmedRealName.length > 50) {
    return {
      error:
        "本名は50文字以内で入力してください。",
    };
  }

  const supabase =
    await createClient();

  const { error } =
    await supabase.auth.signUp({
      email: trimmedEmail,
      password: input.password,
      options: {
        data: {
          real_name:
            trimmedRealName,
          favorite_subject:
            trimmedFavoriteSubject,
          favorite_color:
            trimmedFavoriteColor,
        },
      },
    });

  if (error) {
    console.error(
      "サインアップエラー:",
      error,
    );

    if (
      error.message
        .toLowerCase()
        .includes(
          "already registered",
        )
    ) {
      return {
        error:
          "このメールアドレスはすでに登録されています。",
      };
    }

    return {
      error:
        "アカウントを作成できませんでした。入力内容を確認してください。",
    };
  }

  redirect(
    "/login?message=check_email",
  );
}