"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateParticipation(
  eventId: number,
  status: "joined" | "declined",
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("ログインが必要です。");
  }

  const { data: event, error: eventError } =
    await supabase
      .from("events")
      .select(`
        id,
        capacity,
        event_at,
        recruitment_deadline,
        participants:event_participants (
          user_id,
          status
        )
      `)
      .eq("id", eventId)
      .is("deleted_at", null)
      .single();

  if (eventError || !event) {
    throw new Error(
      "イベントが見つかりません。",
    );
  }

  if (status === "joined") {
    const now = new Date();

    if (new Date(event.event_at) <= now) {
      throw new Error(
        "このイベントは終了しています。",
      );
    }

    if (
      new Date(event.recruitment_deadline) <=
      now
    ) {
      throw new Error(
        "募集は締め切られています。",
      );
    }

    const joinedParticipants = (
      event.participants ?? []
    ).filter(
      (participant) =>
        participant.status === "joined",
    );

    const alreadyJoined =
      joinedParticipants.some(
        (participant) =>
          participant.user_id === user.id,
      );

    if (
      !alreadyJoined &&
      joinedParticipants.length >=
        event.capacity
    ) {
      throw new Error(
        "募集人数に達しています。",
      );
    }
  }

  const { error } = await supabase
    .from("event_participants")
    .upsert(
      {
        event_id: eventId,
        user_id: user.id,
        status,
      },
      {
        onConflict: "event_id,user_id",
      },
    );

  if (error) {
    console.error(
      "参加状態更新エラー:",
      error,
    );

    throw new Error(
      "参加状態を変更できませんでした。",
    );
  }

  revalidatePath("/challenge/team");
}

export async function deleteEvent(
  eventId: number,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("ログインが必要です。");
  }

  const { data: event, error: eventError } =
    await supabase
      .from("events")
      .select("id, creator_id")
      .eq("id", eventId)
      .is("deleted_at", null)
      .single();

  if (eventError || !event) {
    console.error(
      "イベント確認エラー:",
      eventError,
    );

    throw new Error(
      "イベントが見つかりません。",
    );
  }

  if (event.creator_id !== user.id) {
    throw new Error(
      "このイベントは削除できません。",
    );
  }

  const {
    data: deletedEvent,
    error: deleteError,
  } = await supabase
    .from("events")
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId)
    .eq("creator_id", user.id)
    .select("id")
    .single();

  if (deleteError || !deletedEvent) {
    console.error(
      "イベント削除エラー:",
      deleteError,
    );

    throw new Error(
      "イベントを削除できませんでした。",
    );
  }

  revalidatePath("/challenge/team");
}