"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signup(
  formData: FormData,
) {
  const email = formData.get("email");
  const password =
    formData.get("password");
  const passwordConfirm =
    formData.get("passwordConfirm");
  const favoriteSubject =
    formData.get("favoriteSubject");
  const favoriteColor =
    formData.get("favoriteColor");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof passwordConfirm !== "string" ||
    typeof favoriteSubject !== "string" ||
    typeof favoriteColor !== "string"
  ) {
    redirect(
      "/signup?error=invalid_input",
    );
  }

  const trimmedEmail = email.trim();
  const trimmedFavoriteSubject =
    favoriteSubject.trim();
  const trimmedFavoriteColor =
    favoriteColor.trim();

  if (!trimmedEmail) {
    redirect(
      "/signup?error=email_required",
    );
  }

  if (password.length < 8) {
    redirect(
      "/signup?error=password_too_short",
    );
  }

  if (password !== passwordConfirm) {
    redirect(
      "/signup?error=password_mismatch",
    );
  }

  if (!trimmedFavoriteSubject) {
    redirect(
      "/signup?error=favorite_subject_required",
    );
  }

  if (!trimmedFavoriteColor) {
    redirect(
      "/signup?error=favorite_color_required",
    );
  }

  if (
    trimmedFavoriteSubject.length > 20 ||
    trimmedFavoriteColor.length > 20
  ) {
    redirect(
      "/signup?error=quiz_answer_too_long",
    );
  }

  const supabase =
    await createClient();

  const { error } =
    await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
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

    redirect(
      "/signup?error=signup_failed",
    );
  }

  redirect(
    "/login?message=check_email",
  );
}