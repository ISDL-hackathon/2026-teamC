"use client";

import { useState } from "react";
import styles from "./page.module.css";

type Tab = "point" | "mission" | "team";

export default function ChallengePage() {
  const [tab, setTab] = useState<Tab>("point");

  return (
    <main className={styles.wrapper}>
      <div className={styles.page}>
        <header className={styles.header}>
          <span className={styles.menu}>☰</span>
          <h1>ISDL</h1>
          <span className={styles.bell}>🔔</span>
        </header>

        <section className={styles.content}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${tab === "point" ? styles.active : ""}`}
              onClick={() => setTab("point")}
            >
              ポイント
            </button>
            <button
              className={`${styles.tab} ${tab === "mission" ? styles.active : ""}`}
              onClick={() => setTab("mission")}
            >
              ミッション
            </button>
            <button
              className={`${styles.tab} ${tab === "team" ? styles.active : ""}`}
              onClick={() => setTab("team")}
            >
              チーム
            </button>
          </div>

          {tab === "point" && <PointScreen />}
          {tab === "mission" && <MissionScreen />}
          {tab === "team" && <TeamScreen />}
        </section>

        <BottomNav />
      </div>
    </main>
  );
}

function PointScreen() {
  return (
    <>
      <div className={styles.card}>
        <p className={styles.label}>MONTHLY POINTS</p>
        <h2>今月の来室スタンプ</h2>
        <h3>7月の記録</h3>

        <p className={styles.centerText}>
          今月は <span className={styles.redText}>11回</span> 研究室に来ています
        </p>

        <div className={styles.stampGrid}>
          {Array.from({ length: 15 }, (_, i) => {
            const num = i + 1;
            const active = num <= 11;
            const special = num === 15;

            return (
              <div
                key={num}
                className={`${styles.stamp} ${
                  active ? styles.stampActive : styles.stampInactive
                } ${special ? styles.stampSpecial : ""}`}
              >
                {num}
                {special && <small>特典</small>}
              </div>
            );
          })}
        </div>

        <p className={styles.note}>研究室に来るたびにスタンプが1つたまります</p>
      </div>

      <div className={styles.smallCard}>
        <div className={styles.trophy}>🏆</div>
        <div className={styles.grow}>
          <h3>次は15回達成を目指そう！</h3>
          <div className={styles.progressBar}>
            <div style={{ width: "73%" }} />
          </div>
          <p>
            <span className={styles.redText}>11回</span> / 15回
          </p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.rowBetween}>
          <div>
            <p className={styles.label}>BONUS</p>
            <h2>今月の獲得ポイント</h2>
          </div>
          <div className={styles.pointBadge}>+220 pt</div>
        </div>
        <p className={styles.description}>
          来室スタンプやミッション達成によって、ポイントが加算されます。
        </p>
      </div>
    </>
  );
}

function MissionScreen() {
  const missions = [
    ["好きな食べ物を聞いてみよう", true],
    ["最近ハマっていることを聞こう", true],
    ["休日の過ごし方を聞いてみよう", false],
    ["好きな音楽を聞いてみよう", false],
    ["研究室のおすすめを聞こう", false],
  ];

  return (
    <>
      <div className={styles.card}>
        <div className={styles.question}>?</div>
        <p className={styles.label}>TWO WEEK CHALLENGE</p>
        <h2 className={styles.challengeTitle}>2週間チャレンジ</h2>
        <h1 className={styles.dateTitle}>7/1 - 7/14</h1>

        <div className={styles.missionBanner}>
          先輩に質問してスタンプをGET！
        </div>

        <div className={styles.pinkBox}>
          <p>先輩のことをもっと知って</p>
          <h2>
            研究室での会話を
            <br />
            増やそう！
          </h2>
          <span>💬</span>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.rowBetween}>
          <div>
            <p className={styles.label}>PROGRESS</p>
            <h3>現在の達成状況</h3>
          </div>
          <h2 className={styles.redText}>2 / 5</h2>
        </div>
        <div className={styles.progressBar}>
          <div style={{ width: "40%" }} />
        </div>
        <p className={styles.note}>あと3つ達成するとスタンプを獲得できます</p>
      </div>

      <p className={styles.label}>QUESTION MISSION</p>
      <div className={styles.rowBetween}>
        <h2>先輩に聞いてみよう</h2>
        <span className={styles.timeBadge}>残り3問</span>
      </div>

      <div className={styles.missionList}>
        {missions.map(([title, clear], index) => (
          <div key={String(title)} className={styles.missionItem}>
            <div className={`${styles.number} ${clear ? styles.clearNum : ""}`}>
              {index + 1}
            </div>

            <div className={styles.grow}>
              <span className={clear ? styles.clearLabel : styles.notClearLabel}>
                {clear ? "達成済み" : "未達成"}
              </span>
              <h3>{title}</h3>
              <p>先輩の好きなことについて話してみよう。</p>
            </div>

            <div className={clear ? styles.check : styles.arrow}>
              {clear ? "✓" : "›"}
              {clear && <small>CLEAR</small>}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function TeamScreen() {
  return (
    <>
      <p className={styles.label}>TEAM BOARD</p>

      <div className={styles.rowBetween}>
        <div>
          <h2>みんなに声をかけよう</h2>
          <p className={styles.description}>
            ごはんや休憩、作業のお誘いを気軽に投稿できます。
          </p>
        </div>
        <button className={styles.postButton}>＋ 投稿する</button>
      </div>

      <div className={styles.filterRow}>
        <button className={styles.filterActive}>すべて</button>
        <button>今日</button>
        <button>募集中</button>
        <button>参加予定</button>
      </div>

      <TeamCard
        icon="田"
        name="田中先輩"
        tag="飲み会"
        title="今日、飲みに行ける人！"
        text="研究終わりに駅前で軽く飲みに行きませんか？"
        color="red"
      />

      <TeamCard
        icon="佐"
        name="佐藤先輩"
        tag="ごはん"
        title="お昼、ラーメン食べに行きませんか？"
        text="12時半くらいに研究室を出る予定です。"
        color="blue"
      />

      <button className={styles.floatingButton}>＋</button>
    </>
  );
}

function TeamCard(props: {
  icon: string;
  name: string;
  tag: string;
  title: string;
  text: string;
  color: "red" | "blue";
}) {
  return (
    <div className={styles.teamCard}>
      <div className={styles.row}>
        <div className={`${styles.avatar} ${styles[props.color]}`}>
          {props.icon}
        </div>
        <div className={styles.grow}>
          <h3>{props.name}</h3>
          <p>10分前</p>
        </div>
        <span className={styles.recruit}>募集中</span>
      </div>

      <span className={styles.tag}>🍜 {props.tag}</span>
      <h2>{props.title}</h2>
      <p className={styles.description}>{props.text}</p>

      <div className={styles.infoGrid}>
        <div>🕘<br />今日 19:00</div>
        <div>📍<br />大学近く</div>
        <div>👥<br />4人</div>
      </div>

      <div className={styles.teamButtons}>
        <button className={styles.joinButton}>✓ 参加する</button>
        <button className={styles.noButton}>× 不参加</button>
      </div>
    </div>
  );
}

function BottomNav() {
  return (
    <nav className={styles.bottomNav}>
      <span>⌂<br />ホーム</span>
      <span className={styles.navActive}>★<br />チャレンジ</span>
      <span>⌁<br />スキャン</span>
    </nav>
  );
}