import styles from "./page.module.css";

export default function PointPage() {
  return (
    <>
      <section className={styles.card}>
        <p className={styles.label}>MONTHLY POINTS</p>
        <h2 className={styles.mainTitle}>今月の来室スタンプ</h2>
        <h3 className={styles.monthTitle}>7月の記録</h3>

        <p className={styles.centerText}>
          今月は <span className={styles.redText}>11回</span>
          研究室に来ています
        </p>

        <div className={styles.stampGrid}>
          {Array.from({ length: 15 }, (_, index) => {
            const stampNumber = index + 1;
            const isStamped = stampNumber <= 11;
            const isSpecial = stampNumber === 15;

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
            <div className={styles.progressValue} />
          </div>

          <p className={styles.progressText}>
            <span className={styles.redText}>11回</span>
            <span> / 15回</span>
          </p>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.rowBetween}>
          <div>
            <p className={styles.label}>BONUS</p>
            <h2 className={styles.mainTitle}>今月の獲得ポイント</h2>
          </div>

          <span className={styles.pointBadge}>+220 pt</span>
        </div>

        <p className={styles.description}>
          来室スタンプやミッション達成によって、ポイントが加算されます。
        </p>
      </section>
    </>
  );
}