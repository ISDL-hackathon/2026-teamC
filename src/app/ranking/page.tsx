import styles from "./page.module.css";

type RankingUser = {
  rank: number;
  name: string;
  icon: string;
  point: number;
  department: string;
  isCurrentUser?: boolean;
};

const rankingUsers: RankingUser[] = [
  {
    rank: 1,
    name: "田中先輩",
    icon: "👨‍💻",
    point: 1520,
    department: "大学院2年",
  },
  {
    rank: 2,
    name: "佐藤先輩",
    icon: "👩‍💻",
    point: 1340,
    department: "大学院1年",
  },
  {
    rank: 3,
    name: "山田さん",
    icon: "🐱",
    point: 1180,
    department: "学部4年",
  },
  {
    rank: 4,
    name: "鈴木さん",
    icon: "🐶",
    point: 980,
    department: "学部4年",
  },
  {
    rank: 5,
    name: "あなた",
    icon: "🤖",
    point: 860,
    department: "学部3年",
    isCurrentUser: true,
  },
  {
    rank: 6,
    name: "高橋さん",
    icon: "👨‍🦱",
    point: 720,
    department: "学部4年",
  },
  {
    rank: 7,
    name: "伊藤さん",
    icon: "👱‍♀️",
    point: 650,
    department: "学部3年",
  },
  {
    rank: 8,
    name: "中村さん",
    icon: "🐥",
    point: 590,
    department: "学部3年",
  },
];

export default function RankingPage() {
  const topThreeUsers = rankingUsers.slice(0, 3);
  const otherUsers = rankingUsers.slice(3);

  const firstPlaceUser = topThreeUsers[0];
  const secondPlaceUser = topThreeUsers[1];
  const thirdPlaceUser = topThreeUsers[2];

  return (
    <main className={styles.page}>
      <section className={styles.content}>
        <div className={styles.heading}>
          <p className={styles.label}>RANKING</p>

          <div className={styles.headingRow}>
            <div>
              <h1>みんなのランキング</h1>

              <p className={styles.description}>
                研究室で集めたポイントのランキングです
              </p>
            </div>

            <div
              className={styles.trophyIcon}
              aria-hidden="true"
            >
              🏆
            </div>
          </div>
        </div>

        <div
          className={styles.periodTabs}
          aria-label="ランキング期間"
        >
          <button
            type="button"
            className={styles.activeTab}
          >
            週間
          </button>

          <button type="button">
            月間
          </button>

          <button type="button">
            総合
          </button>
        </div>

        <section className={styles.podiumCard}>
          <div className={styles.podiumHeader}>
            <div>
              <p className={styles.podiumLabel}>
                WEEKLY TOP 3
              </p>

              <h2>今週のトップメンバー</h2>
            </div>

            <span className={styles.updatedText}>
              7月15日更新
            </span>
          </div>

          <div className={styles.podium}>
            <PodiumUser
              user={secondPlaceUser}
              placeClassName={styles.secondPlace}
            />

            <PodiumUser
              user={firstPlaceUser}
              placeClassName={styles.firstPlace}
            />

            <PodiumUser
              user={thirdPlaceUser}
              placeClassName={styles.thirdPlace}
            />
          </div>
        </section>

        <section className={styles.rankingSection}>
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.sectionLabel}>
                ALL MEMBERS
              </p>

              <h2>ランキング一覧</h2>
            </div>

            <span className={styles.memberCount}>
              {rankingUsers.length}人
            </span>
          </div>

          <div className={styles.rankingList}>
            {otherUsers.map((user) => (
              <article
                key={user.rank}
                className={`${styles.rankingItem} ${
                  user.isCurrentUser
                    ? styles.currentUserItem
                    : ""
                }`}
              >
                <div className={styles.rankNumber}>
                  {user.rank}
                </div>

                <div className={styles.avatar}>
                  <span>{user.icon}</span>
                </div>

                <div className={styles.userInformation}>
                  <div className={styles.nameRow}>
                    <h3>{user.name}</h3>

                    {user.isCurrentUser && (
                      <span className={styles.youBadge}>
                        YOU
                      </span>
                    )}
                  </div>

                  <p>{user.department}</p>
                </div>

                <div className={styles.pointArea}>
                  <strong>
                    {user.point.toLocaleString()}
                  </strong>

                  <span>pt</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.myRankCard}>
          <div className={styles.myRankIcon}>
            ⭐
          </div>

          <div className={styles.myRankText}>
            <p>あなたの現在順位</p>

            <h2>
              <span>5位</span> / {rankingUsers.length}人
            </h2>
          </div>

          <div className={styles.myRankPoint}>
            <strong>860</strong>
            <span>pt</span>
          </div>
        </section>
      </section>
    </main>
  );
}

type PodiumUserProps = {
  user: RankingUser;
  placeClassName: string;
};

function PodiumUser({
  user,
  placeClassName,
}: PodiumUserProps) {
  const rankMark = {
    1: "🥇",
    2: "🥈",
    3: "🥉",
  }[user.rank];

  return (
    <article
      className={`${styles.podiumUser} ${placeClassName}`}
    >
      <div className={styles.medal}>
        {rankMark}
      </div>

      <div className={styles.podiumAvatar}>
        <span>{user.icon}</span>
      </div>

      <h3>{user.name}</h3>

      <p>{user.department}</p>

      <div className={styles.podiumPoint}>
        <strong>
          {user.point.toLocaleString()}
        </strong>

        <span>pt</span>
      </div>

      <div className={styles.podiumBase}>
        <span>{user.rank}</span>
      </div>
    </article>
  );
}