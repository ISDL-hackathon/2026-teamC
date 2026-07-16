"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function redirectWithError(
  eventId: number,
  message: string,
): never {
  redirect(
    `/challenge/team/${eventId}/edit?error=${encodeURIComponent(
      message,
    )}`,
  );
}

export async function updateEvent(
  eventId: number,
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

  const locationAddress = String(
  formData.get("location_address") ?? "",
).trim();

const locationPlaceId = String(
  formData.get("location_place_id") ?? "",
).trim();

const locationLatitudeValue = String(
  formData.get("location_latitude") ?? "",
).trim();

const locationLongitudeValue = String(
  formData.get("location_longitude") ?? "",
).trim();

const locationLatitude = Number(
  locationLatitudeValue,
);

const locationLongitude = Number(
  locationLongitudeValue,
);


  const eventAtValue = String(
    formData.get("event_at") ?? "",
  );

  const deadlineValue = String(
    formData.get("recruitment_deadline") ?? "",
  );

  const capacity = Number(
    formData.get("capacity"),
  );

  if (!title) {
    redirectWithError(
      eventId,
      "イベント名を入力してください。",
    );
  }

  if (
  !location ||
  !locationAddress ||
  !locationPlaceId ||
  !locationLatitudeValue ||
  !locationLongitudeValue
) {
  redirectWithError(
    eventId,
    "検索結果から開催場所を選択してください。",
  );
}

if (
  !Number.isFinite(locationLatitude) ||
  locationLatitude < -90 ||
  locationLatitude > 90 ||
  !Number.isFinite(locationLongitude) ||
  locationLongitude < -180 ||
  locationLongitude > 180
) {
  redirectWithError(
    eventId,
    "開催場所の位置情報が正しくありません。場所を検索し直してください。",
  );
}


  if (!eventAtValue) {
    redirectWithError(
      eventId,
      "開催日時を入力してください。",
    );
  }

  if (!deadlineValue) {
    redirectWithError(
      eventId,
      "募集締切を入力してください。",
    );
  }

  if (
    !Number.isInteger(capacity) ||
    capacity < 1 ||
    capacity > 100
  ) {
    redirectWithError(
      eventId,
      "定員は1〜100人で入力してください。",
    );
  }

  const eventAt = new Date(
    `${eventAtValue}:00+09:00`,
  );

  const recruitmentDeadline = new Date(
    `${deadlineValue}:00+09:00`,
  );

  if (
    Number.isNaN(eventAt.getTime()) ||
    Number.isNaN(
      recruitmentDeadline.getTime(),
    )
  ) {
    redirectWithError(
      eventId,
      "日時を正しく入力してください。",
    );
  }

  if (
    recruitmentDeadline >= eventAt
  ) {
    redirectWithError(
      eventId,
      "募集締切は開催日時より前にしてください。",
    );
  }

  const {
    data: existingEvent,
    error: eventError,
  } = await supabase
    .from("events")
    .select("id, creator_id")
    .eq("id", eventId)
    .is("deleted_at", null)
    .single();

  if (eventError || !existingEvent) {
    console.error(
      "イベント確認エラー:",
      eventError,
    );

    redirectWithError(
      eventId,
      "イベントが見つかりません。",
    );
  }

  if (
    existingEvent.creator_id !== user.id
  ) {
    redirectWithError(
      eventId,
      "このイベントは編集できません。",
    );
  }

  const {
    data: updatedEvent,
    error: updateError,
  } = await supabase
    .from("events")
    .update({
  title,
  comment: comment || null,

  location,
  location_address:
    locationAddress,
  location_place_id:
    locationPlaceId,
  location_latitude:
    locationLatitude,
  location_longitude:
    locationLongitude,

  event_at: eventAt.toISOString(),
  recruitment_deadline:
    recruitmentDeadline.toISOString(),
  capacity,
  updated_at: new Date().toISOString(),
})
    .eq("id", eventId)
    .eq("creator_id", user.id)
    .select("id")
    .single();

  if (updateError || !updatedEvent) {
    console.error(
      "イベント更新エラー:",
      updateError,
    );

    redirectWithError(
      eventId,
      "イベントを更新できませんでした。",
    );
  }

  revalidatePath("/challenge/team");

  redirect("/challenge/team");
}