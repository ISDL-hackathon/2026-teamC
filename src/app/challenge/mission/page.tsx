import styles from "./page.module.css";

const quizOptions = [
  {
    id: 1,
    text: "カレー",
  },
  {
    id: 2,
    text: "ラーメン",
  },
  {
    id: 3,
    text: "寿司",
  },
  {
    id: 4,
    text: "オムライス",
  },
];

const earnedStampCount = 4;
const totalStampCount = 10;

export default function MissionPage() {
    const today = new Date();
    const formattedDate = `${today.getMonth() + 1}月${today.getDate()}日`;
  return (
    <>
      <section className={styles.quizCard}>
        <div className={styles.quizHeader}>
          <div>
            <p className={styles.label}>TODAY&apos;S QUIZ</p>
            <h2 className={styles.mainTitle}>今日の先輩クイズ</h2>
          </div>

          <span className={styles.dateBadge}>{formattedDate}</span>
        </div>

        <div className={styles.seniorProfile}>
          <div className={styles.seniorIcon}>田</div>

          <div className={styles.seniorInfo}>
            <p>大学院2年</p>
            <h3>田中先輩</h3>
          </div>

          
        </div>

        <p className={styles.quizDescription}>
          この先輩についての4択クイズに挑戦しよう！
        </p>

        <div className={styles.questionBox}>
          <div className={styles.questionTitle}>
            <span className={styles.questionMark}>Q.</span>
            <h3>田中先輩の好きな食べ物は？</h3>
          </div>

          <div className={styles.optionGrid}>
            {quizOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={styles.optionButton}
              >
                <span className={styles.optionNumber}>{option.id}</span>
                <span>{option.text}</span>
              </button>
            ))}
          </div>

          <button type="button" className={styles.answerButton}>
            回答する
          </button>
        </div>
      </section>

      <section className={styles.stampCard}>
        <div className={styles.stampHeader}>
          <div>
            <p className={styles.label}>MISSION STAMP</p>
            <h2 className={styles.stampTitle}>ミッションスタンプ</h2>
          </div>

          <button
            type="button"
            className={styles.helpButton}
            aria-label="ミッションスタンプの説明"
          >
            ?
          </button>
        </div>

        <div className={styles.progressArea}>
          <p>現在の達成数</p>

          <div className={styles.progressCount}>
            <strong>{earnedStampCount}</strong>
            <span>/ {totalStampCount}</span>
          </div>
        </div>

        <div className={styles.stampGrid}>
          {Array.from({ length: totalStampCount }, (_, index) => {
            const stampNumber = index + 1;
            const isEarned = stampNumber <= earnedStampCount;
            const isReward = stampNumber === totalStampCount;

            return (
              <div
                key={stampNumber}
                className={`${styles.stamp} ${
                  isEarned ? styles.earnedStamp : styles.unearnedStamp
                } ${isReward ? styles.rewardStamp : ""}`}
              >
                <span>{stampNumber}</span>

                {isReward && <small>特典</small>}
              </div>
            );
          })}
        </div>

        <p className={styles.stampNote}>
          クイズに正解するたびにスタンプが1つたまります
        </p>
      </section>
    </>
  );
}