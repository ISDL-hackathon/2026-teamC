"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";


export type NominatimPlace = {
  place_id: number;
  display_name: string;
  name?: string;
  lat: string;
  lon: string;
  type?: string;
  class?: string;
};

type SearchPlacesResult = {
  places: NominatimPlace[];
  error: string | null;
};

export async function searchPlaces(
  query: string,
): Promise<SearchPlacesResult> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return {
      places: [],
      error: "場所名を入力してください。",
    };
  }

  const params = new URLSearchParams({
    format: "jsonv2",
    q: trimmedQuery,
    limit: "5",
    countrycodes: "jp",
    "accept-language": "ja",
  });

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: {
          "User-Agent":
            "2026-TeamC-LabApp/1.0",
          "Accept-Language": "ja",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error(
        "場所検索レスポンスエラー:",
        response.status,
      );

      return {
        places: [],
        error:
          "場所を検索できませんでした。",
      };
    }

    const places =
      (await response.json()) as NominatimPlace[];

    return {
      places,
      error: null,
    };
  } catch (error) {
    console.error(
      "場所検索エラー:",
      error,
    );

    return {
      places: [],
      error:
        "場所の検索中にエラーが発生しました。",
    };
  }
}

type FormValues = {
  title: string;
  comment: string;
  location: string;
  locationAddress: string;
  locationPlaceId: string;
  locationLatitudeValue: string;
  locationLongitudeValue: string;
  eventAtValue: string;
  deadlineValue: string;
  capacityValue: number;
};

type ClearDateFields = {
  eventAt?: boolean;
  deadline?: boolean;
};




function redirectWithError(
  message: string,
  values: FormValues,
  clearDateFields: ClearDateFields = {},
): never {
  const searchParams =
  new URLSearchParams({
    error: message,
    title: values.title,
    comment: values.comment,
    location: values.location,
    location_address:
      values.locationAddress,
    location_place_id:
      values.locationPlaceId,
    location_latitude:
      values.locationLatitudeValue,
    location_longitude:
      values.locationLongitudeValue,
    capacity: String(
      values.capacityValue,
    ),
  });

  if (!clearDateFields.eventAt) {
    searchParams.set(
      "event_at",
      values.eventAtValue,
    );
  }

  if (!clearDateFields.deadline) {
    searchParams.set(
      "recruitment_deadline",
      values.deadlineValue,
    );
  }

  redirect(
    `/challenge/team/new?${searchParams.toString()}`,
  );
}

export async function createEvent(
  formData: FormData,
) {
  const supabase =
    await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
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

const locationLatitude =
  locationLatitudeValue === ""
    ? null
    : Number(locationLatitudeValue);

const locationLongitude =
  locationLongitudeValue === ""
    ? null
    : Number(locationLongitudeValue);


  const eventAtValue = String(
    formData.get("event_at") ?? "",
  );

  const deadlineValue = String(
    formData.get(
      "recruitment_deadline",
    ) ?? "",
  );

  const capacityValue = Number(
    formData.get("capacity"),
  );

 const formValues: FormValues = {
  title,
  comment,
  location,
  locationAddress,
  locationPlaceId,
  locationLatitudeValue,
  locationLongitudeValue,
  eventAtValue,
  deadlineValue,
  capacityValue,
};


  if (!title) {
    redirectWithError(
      "イベント名を入力してください。",
      formValues,
    );
  }

  if (!location) {
  redirectWithError(
    "開催場所を入力してください。",
    formValues,
  );
}

if (
  (locationLatitude === null) !==
  (locationLongitude === null)
) {
  redirectWithError(
    "開催場所の位置情報が正しくありません。場所を検索し直してください。",
    formValues,
  );
}

if (
  locationLatitude !== null &&
  (
    !Number.isFinite(locationLatitude) ||
    locationLatitude < -90 ||
    locationLatitude > 90
  )
) {
  redirectWithError(
    "開催場所の緯度が正しくありません。場所を検索し直してください。",
    formValues,
  );
}

if (
  locationLongitude !== null &&
  (
    !Number.isFinite(locationLongitude) ||
    locationLongitude < -180 ||
    locationLongitude > 180
  )
) {
  redirectWithError(
    "開催場所の経度が正しくありません。場所を検索し直してください。",
    formValues,
  );
}

  if (!eventAtValue) {
    redirectWithError(
      "開催日時を入力してください。",
      formValues,
    );
  }

  if (!deadlineValue) {
    redirectWithError(
      "募集締切を入力してください。",
      formValues,
    );
  }

  if (
    !Number.isInteger(
      capacityValue,
    ) ||
    capacityValue < 1 ||
    capacityValue > 100
  ) {
    redirectWithError(
      "定員は1〜100人で入力してください。",
      formValues,
    );
  }

  const eventAt = new Date(
    `${eventAtValue}:00+09:00`,
  );

  const recruitmentDeadline =
    new Date(
      `${deadlineValue}:00+09:00`,
    );

  if (
    Number.isNaN(
      eventAt.getTime(),
    ) ||
    Number.isNaN(
      recruitmentDeadline.getTime(),
    )
  ) {
    redirectWithError(
      "日時を正しく入力してください。",
       formValues,
  {
    eventAt: true,
    deadline: true,
  },
    );
  }

  const now = new Date();

  if (eventAt <= now) {
    redirectWithError(
      "開催日時は現在より後にしてください。",
    formValues,
  {
    eventAt: true,
  },
    );
  }

  if (
    recruitmentDeadline <= now
  ) {
    redirectWithError(
      "募集締切は現在より後にしてください。",
      formValues,
  {
    deadline: true,
  },
    );
  }

  if (
    recruitmentDeadline >= eventAt
  ) {
    redirectWithError(
      "募集締切は開催日時より前にしてください。",
       formValues,
  {
    deadline: true,
  },
    );
  }

  const {
    data: createdEvent,
    error: eventError,
  } = await supabase
    .from("events")
    .insert({
  creator_id: user.id,
  title,
  comment: comment || null,

  location,
location_address:
  locationAddress || null,
location_place_id:
  locationPlaceId || null,
location_latitude:
  locationLatitude,
location_longitude:
  locationLongitude,

  event_at:
    eventAt.toISOString(),
  recruitment_deadline:
    recruitmentDeadline.toISOString(),
  capacity: capacityValue,
})
    .select("id")
    .single();

  if (
    eventError ||
    !createdEvent
  ) {
    console.error(
      "イベント投稿エラー:",
      eventError,
    );

    redirectWithError(
      "イベントを投稿できませんでした。",
       formValues,
    );
  }

  const {
    error: participantError,
  } = await supabase
    .from("event_participants")
    .upsert(
      {
        event_id:
          createdEvent.id,
        user_id: user.id,
        status: "joined",
      },
      {
        onConflict:
          "event_id,user_id",
      },
    );

  if (participantError) {
    console.error(
      "投稿者の参加登録エラー:",
      participantError,
    );

    await supabase
      .from("events")
      .update({
        deleted_at:
          new Date().toISOString(),
        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        createdEvent.id,
      )
      .eq(
        "creator_id",
        user.id,
      );

    redirectWithError(
      "投稿者の参加情報を登録できませんでした。",
       formValues,
    );
  }

  const {
    error: notificationError,
  } = await supabase.rpc(
    "notify_new_team_event",
    {
      target_event_id:
        createdEvent.id,
      event_title: title,
    },
  );

  if (notificationError) {
    console.error(
      "イベント通知作成エラー:",
      notificationError,
    );
  }

  redirect("/challenge/team");
}