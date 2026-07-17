"use client";

import {
  useEffect,
  useState,
  useTransition,
} from "react";
import Header from "../Header/Header";
import BottomNav from "../BottomNav/BottomNav";
import {
  getRankingData,
  type RankingPeriod,
  type RankingUser,
} from "./actions";
import styles from "./page.module.css";

type RankingPeriodInformation = {
  label: string;
  topLabel: string;
  description: string;
};

const periodInformation: Record<
  RankingPeriod,
  RankingPeriodInformation
> = {
  weekly: {
    label: "週間",
    topLabel: "WEEKLY TOP 3",
    description:
      "今週集めたポイントのランキングです",
  },
  monthly: {
    label: "月間",
    topLabel: "MONTHLY TOP 3",
    description:
      "今月集めたポイントのランキングです",
  },
  overall: {
    label: "総合",
    topLabel: "ALL-TIME TOP 3",
    description:
      "これまでに集めた合計ポイントのランキングです",
  },
};

const periodButtons: {
  key: RankingPeriod;
  label: string;
}[] = [
  {
    key: "weekly",
    label: "週間",
  },
  {
    key: "monthly",
    label: "月間",
  },
  {
    key: "overall",
    label: "総合",
  },
];

export default function RankingPage() {
  const [activePeriod, setActivePeriod] =
    useState<RankingPeriod>("weekly");

  const [rankingUsers, setRankingUsers] =
    useState<RankingUser[]>([]);

  const [updatedText, setUpdatedText] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [isPending, startTransition] =
    useTransition();

  const currentPeriodInformation =
    periodInformation[activePeriod];

  useEffect(() => {
    setErrorMessage("");

    startTransition(async () => {
      const result =
        await getRankingData(
          activePeriod,
        );

      setRankingUsers(result.users);
      setUpdatedText(
        result.updatedText,
      );

      if (result.error) {
        setErrorMessage(
          result.error,
        );
      }
    });
  }, [activePeriod]);

  const topThreeUsers =
    rankingUsers.slice(0, 3);

  const otherUsers =
    rankingUsers.slice(3);

  const firstPlaceUser =
    topThreeUsers[0];

  const secondPlaceUser =
    topThreeUsers[1];

  const thirdPlaceUser =
    topThreeUsers[2];

  const currentUser =
    rankingUsers.find(
      (user) => user.isCurrentUser,
    );

  return (
    <main className={styles.page}>
      <Header />

      <section className={styles.content}>
        <div className={styles.heading}>
          <p className={styles.label}>
            RANKING
          </p>

          <div
            className={styles.headingRow}
          >
            <div>
              <h1>
                みんなのランキング
              </h1>

              <p
                className={
                  styles.description
                }
              >
                {
                  currentPeriodInformation.description
                }
              </p>
            </div>

            <div
              className={
                styles.trophyIcon
              }
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
          {periodButtons.map(
            (period) => (
              <button
                key={period.key}
                type="button"
                className={
                  activePeriod ===
                  period.key
                    ? styles.activeTab
                    : ""
                }
                onClick={() =>
                  setActivePeriod(
                    period.key,
                  )
                }
                aria-pressed={
                  activePeriod ===
                  period.key
                }
                disabled={isPending}
              >
                {period.label}
              </button>
            ),
          )}
        </div>

        {errorMessage && (
          <p
            className={
              styles.errorMessage
            }
            role="alert"
          >
            {errorMessage}
          </p>
        )}

        {isPending ? (
          <section
            className={
              styles.loadingCard
            }
          >
            <p>
              ランキングを読み込んでいます...
            </p>
          </section>
        ) : rankingUsers.length === 0 ? (
          <section
            className={
              styles.loadingCard
            }
          >
            <p>
              ランキングデータがありません。
            </p>
          </section>
        ) : (
          <div
            key={activePeriod}
            className={
              styles.rankingContent
            }
          >
            <section
              className={
                styles.podiumCard
              }
            >
              <div
                className={
                  styles.podiumHeader
                }
              >
                <div>
                  <p
                    className={
                      styles.podiumLabel
                    }
                  >
                    {
                      currentPeriodInformation.topLabel
                    }
                  </p>

                  <h2>
                    {
                      currentPeriodInformation.label
                    }
                    のトップメンバー
                  </h2>
                </div>

                <span
                  className={
                    styles.updatedText
                  }
                >
                  {updatedText}
                </span>
              </div>

              <div
                className={
                  styles.podium
                }
              >
                {secondPlaceUser && (
                  <PodiumUser
                    user={
                      secondPlaceUser
                    }
                    placeClassName={
                      styles.secondPlace
                    }
                  />
                )}

                {firstPlaceUser && (
                  <PodiumUser
                    user={firstPlaceUser}
                    placeClassName={
                      styles.firstPlace
                    }
                  />
                )}

                {thirdPlaceUser && (
                  <PodiumUser
                    user={
                      thirdPlaceUser
                    }
                    placeClassName={
                      styles.thirdPlace
                    }
                  />
                )}
              </div>
            </section>

            <section
              className={
                styles.rankingSection
              }
            >
              <div
                className={
                  styles.sectionHeading
                }
              >
                <div>
                  <p
                    className={
                      styles.sectionLabel
                    }
                  >
                    ALL MEMBERS
                  </p>

                  <h2>
                    ランキング一覧
                  </h2>
                </div>

                <span
                  className={
                    styles.memberCount
                  }
                >
                  {rankingUsers.length}人
                </span>
              </div>

              <div
                className={
                  styles.rankingList
                }
              >
                {otherUsers.map(
                  (user) => (
                    <article
                      key={`${activePeriod}-${user.userId}`}
                      className={`${styles.rankingItem} ${
                        user.isCurrentUser
                          ? styles.currentUserItem
                          : ""
                      }`}
                    >
                      <div
                        className={
                          styles.rankNumber
                        }
                      >
                        {user.rank}
                      </div>

                      <ProfileAvatar
                        user={user}
                        className={
                          styles.avatar
                        }
                      />

                      <div
                        className={
                          styles.userInformation
                        }
                      >
                        <div
                          className={
                            styles.nameRow
                          }
                        >
                          <h3>
                            {user.nickname}
                          </h3>

                          {user.isCurrentUser && (
                            <span
                              className={
                                styles.youBadge
                              }
                            >
                              YOU
                            </span>
                          )}
                        </div>

                        <p>
                          {user.realName}
                        </p>
                      </div>

                      <div
                        className={
                          styles.pointArea
                        }
                      >
                        <strong>
                          {user.point.toLocaleString()}
                        </strong>

                        <span>pt</span>
                      </div>
                    </article>
                  ),
                )}
              </div>
            </section>

            {currentUser && (
              <section
                className={
                  styles.myRankCard
                }
              >
                <div
                  className={
                    styles.myRankIcon
                  }
                >
                  ⭐
                </div>

                <div
                  className={
                    styles.myRankText
                  }
                >
                  <p>
                    あなたの
                    {
                      currentPeriodInformation.label
                    }
                    順位
                  </p>

                  <h2>
                    <span>
                      {currentUser.rank}位
                    </span>{" "}
                    / {rankingUsers.length}
                    人
                  </h2>
                </div>

                <div
                  className={
                    styles.myRankPoint
                  }
                >
                  <strong>
                    {currentUser.point.toLocaleString()}
                  </strong>

                  <span>pt</span>
                </div>
              </section>
            )}
          </div>
        )}
      </section>

      <BottomNav />
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
      <div
        className={styles.medal}
      >
        {rankMark}
      </div>

      <ProfileAvatar
        user={user}
        className={
          styles.podiumAvatar
        }
      />

      <h3>{user.nickname}</h3>

      <p>{user.realName}</p>

      <div
        className={
          styles.podiumPoint
        }
      >
        <strong>
          {user.point.toLocaleString()}
        </strong>

        <span>pt</span>
      </div>

      <div
        className={
          styles.podiumBase
        }
      >
        <span>{user.rank}</span>
      </div>
    </article>
  );
}

type ProfileAvatarProps = {
  user: RankingUser;
  className: string;
};

function ProfileAvatar({
  user,
  className,
}: ProfileAvatarProps) {
  if (user.avatarUrl) {
    return (
      <div className={className}>
        <img
          src={user.avatarUrl}
          alt=""
          className={
            styles.avatarImage
          }
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <span>{user.icon}</span>
    </div>
  );
}