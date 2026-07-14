import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import styles from "./page.module.css";

const MAX_STAMP_COUNT = 15;
const POINT_PER_VISIT = 20;

function getJapanMonthRange() {
  const now = new Date();

  const parts = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "numeric",
    },
  ).formatToParts(now);

  const year = Number(
    parts.find(
      (part) => part.type === "year",
    )?.value,
  );

  const month = Number(
    parts.find(
      (part) => part.type === "month",
    )?.value,
  );

  const startDate =
    `${year}-${String(month).padStart(2, "0")}-01T00:00:00+09:00`;

  const nextMonthDate = new Date(
    Date.UTC(year, month, 1),
  );

  const nextYear =
    nextMonthDate.getUTCFullYear();

  const nextMonth =
    nextMonthDate.getUTCMonth() + 1;

  const endDate =
    `${nextYear}-${String(nextMonth).padStart(2, "0")}-01T00:00:00+09:00`;

  return {
    month,
    startDate,
    endDate,
  };
}

export default async function PointPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const {
    month,
    startDate,
    endDate,
  } = getJapanMonthRange();

  const {
    count,
    error: attendanceError,
  } = await supabase
    .from("attendance_records")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("user_id", user.id)
    .gte("entered_at", startDate)
    .lt("entered_at", endDate);

  if (attendanceError) {
    console.error(
      "来室記録取得エラー:",
      attendanceError,
    );
  }

  const visitCount = count ?? 0;

  const stampCount = Math.min(
    visitCount,
    MAX_STAMP_COUNT,
  );

  const point =
    stampCount * POINT_PER_VISIT;

  const progressPercent = Math.min(
    (stampCount / MAX_STAMP_COUNT) *
      100,
    100,
  );

  return (
    <>
      <section className={styles.card}>
        <p className={styles.label}>
          MONTHLY POINTS
        </p>

        <h2 className={styles.mainTitle}>
          今月の来室スタンプ
        </h2>

        <h3 className={styles.monthTitle}>
          {month}月の記録
        </h3>

        <p className={styles.centerText}>
          今月は{" "}
          <span className={styles.redText}>
            {visitCount}回
          </span>
          研究室に来ています
        </p>

        <div className={styles.stampGrid}>
          {Array.from(
            {
              length: MAX_STAMP_COUNT,
            },
            (_, index) => {
              const stampNumber =
                index + 1;

              const isStamped =
                stampNumber <=
                stampCount;

              const isSpecial =
                stampNumber ===
                MAX_STAMP_COUNT;

              return (
                <div
                  key={stampNumber}
                  className={`${styles.stamp} ${
                    isStamped
                      ? styles.stampActive
                      : styles.stampInactive
                  } ${
                    isSpecial
                      ? styles.stampSpecial
                      : ""
                  }`}
                >
                  <span>
                    {stampNumber}
                  </span>

                  {isSpecial && (
                    <small>
                      特典
                    </small>
                  )}
                </div>
              );
            },
          )}
        </div>

        <p className={styles.note}>
          研究室に来るたびにスタンプが1つたまります
        </p>
      </section>

      <section
        className={styles.nextGoalCard}
      >
        <div className={styles.trophy}>
          🏆
        </div>

        <div className={styles.grow}>
          <h3 className={styles.goalTitle}>
            次は15回達成を目指そう！
          </h3>

          <div
            className={styles.progressBar}
          >
            <div
              className={
                styles.progressValue
              }
              style={{
                width:
                  `${progressPercent}%`,
              }}
            />
          </div>

          <p
            className={
              styles.progressText
            }
          >
            <span
              className={
                styles.redText
              }
            >
              {stampCount}回
            </span>

            <span>
              {" "}
              / {MAX_STAMP_COUNT}回
            </span>
          </p>
        </div>
      </section>

      <section className={styles.card}>
        <div
          className={styles.rowBetween}
        >
          <div>
            <p className={styles.label}>
              BONUS
            </p>

            <h2
              className={
                styles.mainTitle
              }
            >
              今月の獲得ポイント
            </h2>
          </div>

          <span
            className={
              styles.pointBadge
            }
          >
            +{point} pt
          </span>
        </div>

        <p
          className={
            styles.description
          }
        >
          来室スタンプによって、ポイントが加算されます。
        </p>
      </section>
    </>
  );
}