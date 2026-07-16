import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMonthlyQuestionData } from "./actions";
import MonthlyQuestionForm from "./MonthlyQuestionForm";
import styles from "./page.module.css";

export default async function MonthlyQuestionPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const result = await getMonthlyQuestionData();

  if (result.error || !result.data) {
    return (
      <main className={styles.page}>
        <section className={styles.errorCard}>
          <div
            className={styles.errorIcon}
            aria-hidden="true"
          >
            ⚠️
          </div>

          <h1>
            質問を表示できませんでした
          </h1>

          <p>
            {result.error ??
              "今月の質問を取得できませんでした。"}
          </p>
        </section>
      </main>
    );
  }

  if (result.data.existingAnswer) {
    redirect("/home");
  }

  const targetMonthDate = new Date(
    `${result.data.targetMonth}T00:00:00+09:00`,
  );

  const targetMonthText =
    new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "long",
    }).format(targetMonthDate);

  return (
    <main className={styles.page}>
      <section className={styles.container}>
        <div className={styles.brandArea}>
          <div
            className={styles.logoMark}
            aria-hidden="true"
          >
            I
          </div>

          <p className={styles.logoText}>
            ISDL
          </p>
        </div>

        <section className={styles.card}>
          <div
            className={styles.monthBadge}
          >
            {targetMonthText}
          </div>

          <div
            className={styles.questionIcon}
            aria-hidden="true"
          >
            💬
          </div>

          <p className={styles.label}>
            MONTHLY QUESTION
          </p>

          <h1>
            今月のプチ質問
          </h1>

          <p className={styles.description}>
            月に一度、研究室のみんなが
            お互いを少し知るための質問です。
          </p>

          <div className={styles.questionBox}>
            <p>
              {result.data.questionText}
            </p>
          </div>

          <MonthlyQuestionForm
            monthlyQuestionId={
              result.data.monthlyQuestionId
            }
          />

          <p className={styles.notice}>
            ※ 今月の質問に回答すると、
            アプリを利用できます。
          </p>
        </section>

        <p className={styles.footer}>
          ISDL Laboratory Communication App
        </p>
      </section>
    </main>
  );
}