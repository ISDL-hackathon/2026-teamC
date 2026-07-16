"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

type LoginResult = {
  error: string | null;
};

export async function login(
  email: string,
  password: string,
): Promise<LoginResult> {
  const trimmedEmail = email.trim();

  if (!trimmedEmail || !password) {
    return {
      error:
        "メールアドレスとパスワードを入力してください。",
    };
  }

  const supabase =
    await createClient();

  const { error } =
    await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

  if (error) {
    return {
      error:
        "メールアドレスあるいはパスワードが間違っています。",
    };
  }

  redirect("/");
}