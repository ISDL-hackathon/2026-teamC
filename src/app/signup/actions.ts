"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signup(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const passwordConfirm = formData.get("passwordConfirm");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof passwordConfirm !== "string"
  ) {
    throw new Error("入力内容が正しくありません");
  }

  if (password !== passwordConfirm) {
    redirect("/signup?error=password_mismatch");
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    redirect("/signup?error=signup_failed");
  }

  redirect("/login?message=check_email");
}