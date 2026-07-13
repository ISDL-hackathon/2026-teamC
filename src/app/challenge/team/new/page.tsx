import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createEvent } from "./actions";
import styles from "./page.module.css";

type NewEventPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewEventPage({
  searchParams,
}: NewEventPageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await searchParams;

  return (
    <>
      <div className={styles.header}>
        <Link
          href="/challenge/team"
          className={styles.backButton}
        >
          ←
        </Link>

        <div>
          <p className={styles.label}>
            NEW EVENT
          </p>

          <h1>みんなを誘う</h1>
        </div>
      </div>

      <form
        action={createEvent}
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
            placeholder="例：ラーメン食べに行きませんか？"
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
            placeholder="気軽に参加してください！"
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
            placeholder="例：研究室前"
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
              defaultValue={4}
              required
            />

            <span>人</span>
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
            投稿する
          </button>
        </div>
      </form>
    </>
  );
}