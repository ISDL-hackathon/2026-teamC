import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateEvent } from "./actions";
import styles from "./page.module.css";

type EditEventPageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditEventPage({
  params,
  searchParams,
}: EditEventPageProps) {
  const { id } = await params;
  const { error } = await searchParams;

  const eventId = Number(id);

  if (
    !Number.isInteger(eventId) ||
    eventId < 1
  ) {
    notFound();
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const {
    data: event,
    error: eventError,
  } = await supabase
    .from("events")
    .select(`
      id,
      creator_id,
      title,
      comment,
      location,
      event_at,
      recruitment_deadline,
      capacity
    `)
    .eq("id", eventId)
    .is("deleted_at", null)
    .single();

  if (eventError || !event) {
    notFound();
  }

  if (event.creator_id !== user.id) {
    redirect("/challenge/team");
  }

  const updateEventWithId =
    updateEvent.bind(null, event.id);

  return (
    <>
      <div className={styles.header}>
        <Link
          href="/challenge/team"
          className={styles.backButton}
          aria-label="チーム画面へ戻る"
        >
          ←
        </Link>

        <div>
          <p className={styles.label}>
            EDIT EVENT
          </p>

          <h1>投稿を編集する</h1>
        </div>
      </div>

      <form
        action={updateEventWithId}
        className={styles.formCard}
      >
        {error && (
          <p className={styles.errorMessage}>
            {error}
          </p>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="title">
            イベント名
            <span>必須</span>
          </label>

          <input
            id="title"
            name="title"
            type="text"
            defaultValue={event.title}
            maxLength={100}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="comment">
            コメント
          </label>

          <textarea
            id="comment"
            name="comment"
            defaultValue={
              event.comment ?? ""
            }
            maxLength={500}
            rows={4}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="location">
            場所
            <span>必須</span>
          </label>

          <input
            id="location"
            name="location"
            type="text"
            defaultValue={event.location}
            maxLength={100}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="event_at">
            開催日時
            <span>必須</span>
          </label>

          <input
            id="event_at"
            name="event_at"
            type="datetime-local"
            defaultValue={formatForDateTimeLocal(
              event.event_at,
            )}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="recruitment_deadline">
            募集締切
            <span>必須</span>
          </label>

          <input
            id="recruitment_deadline"
            name="recruitment_deadline"
            type="datetime-local"
            defaultValue={formatForDateTimeLocal(
              event.recruitment_deadline,
            )}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="capacity">
            定員
            <span>必須</span>
          </label>

          <div className={styles.capacityInput}>
            <input
              id="capacity"
              name="capacity"
              type="number"
              min={1}
              max={100}
              defaultValue={event.capacity}
              required
            />

            <strong>人</strong>
          </div>
        </div>

        <div className={styles.buttonArea}>
          <Link
            href="/challenge/team"
            className={styles.cancelButton}
          >
            キャンセル
          </Link>

          <button
            type="submit"
            className={styles.submitButton}
          >
            変更を保存する
          </button>
        </div>
      </form>
    </>
  );
}

function formatForDateTimeLocal(
  isoDate: string,
) {
  const date = new Date(isoDate);

  const formatter =
    new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });

  return formatter
    .format(date)
    .replace(" ", "T");
}