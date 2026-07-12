import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TeamPageClient, {
  type TeamEvent,
} from "./TeamPageClient";
import styles from "./page.module.css";

export default async function TeamPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("events")
    .select(`
      id,
      creator_id,
      title,
      comment,
      location,
      event_at,
      recruitment_deadline,
      capacity,
      created_at,
      creator:profiles!creator_id (
        id,
        nickname,
        avatar_url,
        selected_icon
      ),
      participants:event_participants (
        id,
        user_id,
        status,
        profile:profiles!user_id (
          id,
          nickname,
          avatar_url,
          selected_icon
        )
      )
    `)
    .is("deleted_at", null)
    .order("event_at", { ascending: true });

  if (error) {
    console.error("イベント取得エラー:", error);

    return (
      <section className={styles.messageCard}>
        <p>イベントを取得できませんでした。</p>
      </section>
    );
  }

  const events = (data ?? []) as TeamEvent[];

  return (
    <TeamPageClient
      initialEvents={events}
      currentUserId={user.id}
    />
  );
}