"use client";

import { useEffect, useState } from "react";
import {
  getCurrentMonthText,
  loadStampData,
  MAX_STAMP_COUNT,
  type StampData,
} from "@/lib/stamp";
import styles from "./page.module.css";

export default function PointPage() {
  const [stampData, setStampData] = useState<StampData>({
    monthKey: "",
    stampCount: 0,
    lastStampedDate: null,
  });

  useEffect(() => {
    const loadedStampData = loadStampData();
    setStampData(loadedStampData);
  }, []);

  const stampCount = stampData.stampCount;
  const point = stampCount * 20;
  const progressPercent = Math.min(
    (stampCount / MAX_STAMP_COUNT) * 100,
    100
  );

  return (
    <>
      <section className={styles.card}>
        <p className={styles.label}>MONTHLY POINTS</p>
        <h2 className={styles.mainTitle}>今月の来室スタンプ</h2>
        <h3 className={styles.monthTitle}>{getCurrentMonthText()}</h3>

        <p className={styles.centerText}>
          今月は <span className={styles.redText}>{stampCount}回</span>
          研究室に来ています
        </p>

        <div className={styles.stampGrid}>
          {Array.from({ length: MAX_STAMP_COUNT }, (_, index) => {
            const stampNumber = index + 1;
            const isStamped = stampNumber <= stampCount;
            const isSpecial = stampNumber === MAX_STAMP_COUNT;

            return (
              <div
                key={stampNumber}
                className={`${styles.stamp} ${
                  isStamped ? styles.stampActive : styles.stampInactive
                } ${isSpecial ? styles.stampSpecial : ""}`}
              >
                <span>{stampNumber}</span>

                {isSpecial && <small>特典</small>}
              </div>
            );
          })}
        </div>

        <p className={styles.note}>
          研究室に来るたびにスタンプが1つたまります
        </p>
      </section>

      <section className={styles.nextGoalCard}>
        <div className={styles.trophy}>🏆</div>

        <div className={styles.grow}>
          <h3 className={styles.goalTitle}>次は15回達成を目指そう！</h3>

          <div className={styles.progressBar}>
            <div
              className={styles.progressValue}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className={styles.progressText}>
            <span className={styles.redText}>{stampCount}回</span>
            <span> / {MAX_STAMP_COUNT}回</span>
          </p>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.rowBetween}>
          <div>
            <p className={styles.label}>BONUS</p>
            <h2 className={styles.mainTitle}>今月の獲得ポイント</h2>
          </div>

          <span className={styles.pointBadge}>+{point} pt</span>
        </div>

        <p className={styles.description}>
          来室スタンプやミッション達成によって、ポイントが加算されます。
        </p>
      </section>
    </>
  );
}