import styles from "./page.module.css";

const seniors = [
  {
    icon: "佐",
    name: "佐藤先輩",
    detail: "音楽・旅行",
  },
  {
    icon: "山",
    name: "山田先輩",
    detail: "筋トレ・ゲーム",
  },
  {
    icon: "鈴",
    name: "鈴木先輩",
    detail: "カフェ・読書",
  },
];

export default function MissionPage() {
  return (
    <>
      <div className={styles.carouselControl}>
        <button type="button" aria-label="前のミッション">
          ‹
        </button>

        <div className={styles.dots}>
          <span className={styles.activeDot} />
          <span />
          <span />
        </div>

        <button type="button" aria-label="次のミッション">
          ›
        </button>
      </div>

      <section className={styles.todayCard}>
        <div className={styles.rowBetween}>
          <div>
            <p className={styles.label}>TODAY&apos;S MISSION</p>
            <h2 className={styles.mainTitle}>今日の交流ミッション</h2>
          </div>

          <span className={styles.pointBadge}>+30 pt</span>
        </div>

        <div className={styles.todayMissionBox}>
          <div className={styles.missionIcon}>👋</div>

          <div className={styles.missionText}>
            <h3>田中先輩に話しかけてみよう</h3>

            <p>
              今日の先輩カードを参考に、気になることを1つ聞いてみよう。
            </p>
          </div>
        </div>

        <button type="button" className={styles.talkButton}>
          話しかけた！
        </button>
      </section>

      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.label}>COMMON POINTS</p>
          <h2>あなたとの共通点</h2>
        </div>

        <span className={styles.pinkBadge}>2つ発見</span>
      </div>

      <section className={styles.commonCard}>
        <div className={styles.commonIcon}>🎬</div>

        <div>
          <h3>映画が好き</h3>
          <p>おすすめの作品について話してみよう</p>
        </div>
      </section>

      <section className={styles.commonCard}>
        <div className={styles.commonIcon}>🍛</div>

        <div>
          <h3>辛い食べ物が好き</h3>
          <p>好きなお店やメニューを聞いてみよう</p>
        </div>
      </section>

      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.label}>THIS WEEK</p>
          <h2>今週知った先輩</h2>
        </div>

        <span className={styles.pinkBadge}>3人</span>
      </div>

      <div className={styles.seniorGrid}>
        {seniors.map((senior) => (
          <article key={senior.name} className={styles.seniorCard}>
            <div className={styles.seniorIcon}>{senior.icon}</div>
            <h3>{senior.name}</h3>
            <p>{senior.detail}</p>
          </article>
        ))}
      </div>
    </>
  );
}