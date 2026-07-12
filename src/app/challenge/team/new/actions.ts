"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function redirectWithError(message: string): never {
  redirect(
    `/challenge/team/new?error=${encodeURIComponent(message)}`,
  );
}

export async function createEvent(
  formData: FormData,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const title = String(
    formData.get("title") ?? "",
  ).trim();

  const comment = String(
    formData.get("comment") ?? "",
  ).trim();

  const location = String(
    formData.get("location") ?? "",
  ).trim();

  const eventAtValue = String(
    formData.get("event_at") ?? "",
  );

  const deadlineValue = String(
    formData.get("recruitment_deadline") ?? "",
  );

  const capacityValue = Number(
    formData.get("capacity"),
  );

  if (!title) {
    redirectWithError(
      "イベント名を入力してください。",
    );
  }

  if (!location) {
    redirectWithError(
      "開催場所を入力してください。",
    );
  }

  if (!eventAtValue) {
    redirectWithError(
      "開催日時を入力してください。",
    );
  }

  if (!deadlineValue) {
    redirectWithError(
      "募集締切を入力してください。",
    );
  }

  if (
    !Number.isInteger(capacityValue) ||
    capacityValue < 1 ||
    capacityValue > 100
  ) {
    redirectWithError(
      "定員は1〜100人で入力してください。",
    );
  }

  // datetime-localの値を日本時間として変換
  const eventAt = new Date(
    `${eventAtValue}:00+09:00`,
  );

  const recruitmentDeadline = new Date(
    `${deadlineValue}:00+09:00`,
  );

  if (
    Number.isNaN(eventAt.getTime()) ||
    Number.isNaN(recruitmentDeadline.getTime())
  ) {
    redirectWithError(
      "日時を正しく入力してください。",
    );
  }

  if (eventAt <= new Date()) {
    redirectWithError(
      "開催日時は現在より後にしてください。",
    );
  }

  if (recruitmentDeadline >= eventAt) {
    redirectWithError(
      "募集締切は開催日時より前にしてください。",
    );
  }

  const { error } = await supabase
    .from("events")
    .insert({
      creator_id: user.id,
      title,
      comment: comment || null,
      location,
      event_at: eventAt.toISOString(),
      recruitment_deadline:
        recruitmentDeadline.toISOString(),
      capacity: capacityValue,
    });

  if (error) {
    console.error("イベント投稿エラー:", error);

    redirectWithError(
      "イベントを投稿できませんでした。",
    );
  }

  redirect("/challenge/team");
}