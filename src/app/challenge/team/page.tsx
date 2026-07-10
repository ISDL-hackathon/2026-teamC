import styles from "./page.module.css";

type TeamPost = {
  icon: string;
  name: string;
  postedAt: string;
  categoryIcon: string;
  category: string;
  title: string;
  description: string;
  eventTime: string;
  location: string;
  participants: string;
  color: "red" | "blue";
};

const posts: TeamPost[] = [
  {
    icon: "田",
    name: "田中先輩",
    postedAt: "10分前",
    categoryIcon: "🍺",
    category: "飲み会",
    title: "今日、飲みに行ける人！",
    description:
      "研究終わりに駅前で軽く飲みに行きませんか？19時ごろ出発予定です！",
    eventTime: "今日 19:00",
    location: "大学近く",
    participants: "4人",
    color: "red",
  },
  {
    icon: "佐",
    name: "佐藤先輩",
    postedAt: "35分前",
    categoryIcon: "🍜",
    category: "ごはん",
    title: "お昼、ラーメン食べに行きませんか？",
    description:
      "12時半くらいに研究室を出る予定です。一緒に行ける人がいたらぜひ！",
    eventTime: "今日 12:30",
    location: "大学近く",
    participants: "3人",
    color: "blue",
  },
];

export default function TeamPage() {
  return (
    <>
      <p className={styles.label}>TEAM BOARD</p>

      <div className={styles.teamHeading}>
        <div>
          <h2>みんなに声をかけよう</h2>

          <p>
            ごはんや休憩、作業のお誘いを
            <br />
            気軽に投稿できます。
          </p>
        </div>

        <button type="button" className={styles.postButton}>
          ＋ 投稿する
        </button>
      </div>

      <div className={styles.filterRow}>
        <button type="button" className={styles.activeFilter}>
          すべて
        </button>
        <button type="button">今日</button>
        <button type="button">募集中</button>
        <button type="button">参加予定</button>
      </div>

      {posts.map((post) => (
        <TeamPostCard
          key={`${post.name}-${post.title}`}
          post={post}
        />
      ))}

      <button
        type="button"
        className={styles.floatingButton}
        aria-label="新しい投稿を追加する"
      >
        ＋
      </button>
    </>
  );
}

function TeamPostCard({ post }: { post: TeamPost }) {
  return (
    <article className={styles.teamCard}>
      <div className={styles.userRow}>
        <div
          className={`${styles.avatar} ${
            post.color === "red" ? styles.redAvatar : styles.blueAvatar
          }`}
        >
          {post.icon}
        </div>

        <div className={styles.userInformation}>
          <h3>{post.name}</h3>
          <p>{post.postedAt}</p>
        </div>

        <span className={styles.recruitingBadge}>募集中</span>
      </div>

      <span className={styles.categoryTag}>
        {post.categoryIcon} {post.category}
      </span>

      <h2 className={styles.postTitle}>{post.title}</h2>

      <p className={styles.description}>{post.description}</p>

      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <span className={styles.infoIcon}>🕘</span>
          <small>時間</small>
          <strong>{post.eventTime}</strong>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.infoIcon}>📍</span>
          <small>場所</small>
          <strong>{post.location}</strong>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.infoIcon}>👥</span>
          <small>参加者</small>
          <strong>{post.participants}</strong>
        </div>
      </div>

      <div className={styles.actionButtons}>
        <button type="button" className={styles.joinButton}>
          ✓ 参加する
        </button>

        <button type="button" className={styles.declineButton}>
          × 不参加
        </button>
      </div>
    </article>
  );
}