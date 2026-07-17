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
  highSchoolClub: string;
  studentGoal: string;
  bestPurchase: string;
};

export async function signup(
  input: SignupInput,
): Promise<SignupResult> {
  const trimmedRealName =
    input.realName.trim();

  const trimmedEmail =
    input.email.trim();

  const trimmedHighSchoolClub =
    input.highSchoolClub.trim();

  const trimmedStudentGoal =
    input.studentGoal.trim();

  const trimmedBestPurchase =
    input.bestPurchase.trim();

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
          high_school_club:
            trimmedHighSchoolClub,
          student_goal:
            trimmedStudentGoal,
          best_purchase:
            trimmedBestPurchase,
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
