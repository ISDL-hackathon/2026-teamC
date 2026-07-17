"use client";

import Link from "next/link";
import {
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  deleteEvent,
  updateParticipation,
} from "./actions";
import styles from "./page.module.css";

type Profile = {
  id: string;
  nickname: string;
  avatar_url: string | null;
  selected_icon: string | null;
};

type EventParticipant = {
  id: number;
  user_id: string;
  status: "joined" | "declined";
  profile: Profile | Profile[] | null;
};

export type TeamEvent = {
  id: number;
  creator_id: string;
  title: string;
  comment: string | null;

  location: string;
  location_address: string | null;
  location_place_id: string | null;
  location_latitude: number | null;
  location_longitude: number | null;

  event_at: string;
  recruitment_deadline: string;
  capacity: number;
  created_at: string;
  creator: Profile | Profile[] | null;
  participants: EventParticipant[] | null;
};

type TeamPageClientProps = {
  initialEvents: TeamEvent[];
  currentUserId: string;
};

type TeamTab =
  | "recruiting"
  | "closed"
  | "joined";


function createOpenStreetMapUrl(
  latitude: number,
  longitude: number,
) {
  const zoom = 17;

  return (
    "https://www.openstreetmap.org/" +
    `?mlat=${latitude}` +
    `&mlon=${longitude}` +
    `#map=${zoom}/${latitude}/${longitude}`
  );
}

export default function TeamPageClient({
  initialEvents,
  currentUserId,
}: TeamPageClientProps) {
  const [activeTab, setActiveTab] =
    useState<TeamTab>("recruiting");

  const visibleEvents = useMemo(() => {
    return initialEvents.filter((event) => {
      const participants =
        event.participants ?? [];

      const joinedParticipants =
        participants.filter(
          (participant) =>
            participant.status === "joined",
        );

      const now = new Date();
      const eventAt = new Date(event.event_at);
      const deadline = new Date(
        event.recruitment_deadline,
      );

      const isEventFinished =
        eventAt <= now;

      const isFull =
        joinedParticipants.length >=
        event.capacity;

      const isDeadlinePassed =
        deadline <= now;

      const isRecruiting =
        !isEventFinished &&
        !isDeadlinePassed &&
        !isFull;

      const isClosed =
        !isEventFinished &&
        (isDeadlinePassed || isFull);

      const isJoined = participants.some(
        (participant) =>
          participant.user_id ===
            currentUserId &&
          participant.status === "joined",
      );

      if (activeTab === "recruiting") {
        return isRecruiting;
      }

      if (activeTab === "closed") {
        return isClosed;
      }

      return !isEventFinished && isJoined;
    });
  }, [
    activeTab,
    currentUserId,
    initialEvents,
  ]);

  const emptyMessage = {
    recruiting:
      "現在、募集中のイベントはありません。",
    closed:
      "現在、募集済みのイベントはありません。",
    joined:
      "現在、参加予定のイベントはありません。",
  }[activeTab];

  return (
    <>
      <p className={styles.label}>
        TEAM BOARD
      </p>

      <div className={styles.teamHeading}>
        <div>
          <h2>みんなに声をかけよう</h2>

          <p>
            ごはんや休憩、作業のお誘いを
            <br />
            気軽に投稿できます。
          </p>
        </div>

        <Link
          href="/challenge/team/new"
          className={styles.postButton}
        >
          ＋ 投稿する
        </Link>
      </div>

      <div
        className={styles.filterRow}
        aria-label="イベントの絞り込み"
      >
        <button
          type="button"
          className={
            activeTab === "recruiting"
              ? styles.activeFilter
              : ""
          }
          onClick={() =>
            setActiveTab("recruiting")
          }
        >
          募集中
        </button>

        <button
          type="button"
          className={
            activeTab === "closed"
              ? styles.activeFilter
              : ""
          }
          onClick={() =>
            setActiveTab("closed")
          }
        >
          募集済み
        </button>

        <button
          type="button"
          className={
            activeTab === "joined"
              ? styles.activeFilter
              : ""
          }
          onClick={() =>
            setActiveTab("joined")
          }
        >
          参加予定
        </button>
      </div>

      {visibleEvents.length === 0 ? (
        <section
          className={styles.messageCard}
        >
          <p>{emptyMessage}</p>
        </section>
      ) : (
        visibleEvents.map((event) => (
          <TeamPostCard
            key={event.id}
            event={event}
            currentUserId={currentUserId}
          />
        ))
      )}
    </>
  );
}

function TeamPostCard({
  event,
  currentUserId,
}: {
  event: TeamEvent;
  currentUserId: string;
}) {
  const router = useRouter();

  const [
    isParticipationPending,
    startParticipationTransition,
  ] = useTransition();

  const [
    isDeletePending,
    startDeleteTransition,
  ] = useTransition();

  const [errorMessage, setErrorMessage] =
    useState("");

  const [
    isParticipantsModalOpen,
    setIsParticipantsModalOpen,
  ] = useState(false);

  const creator = getSingleProfile(
    event.creator,
  );

  const participants =
    event.participants ?? [];

  const joinedParticipants =
    participants.filter(
      (participant) =>
        participant.status === "joined",
    );

  const myParticipation =
    participants.find(
      (participant) =>
        participant.user_id ===
        currentUserId,
    );

  const isJoined =
    myParticipation?.status === "joined";

  const isDeclined =
    myParticipation?.status ===
    "declined";

  const isOwner =
    event.creator_id === currentUserId;

  const now = new Date();
  const eventAt = new Date(event.event_at);

  const deadline = new Date(
    event.recruitment_deadline,
  );

  const isFull =
    joinedParticipants.length >=
    event.capacity;

  const isDeadlinePassed =
    deadline <= now;

  const isEventFinished =
    eventAt <= now;

  const isRecruiting =
    !isEventFinished &&
    !isDeadlinePassed &&
    !isFull;

  const isClosed =
    !isEventFinished &&
    (isDeadlinePassed || isFull);

  const remainingCapacity = Math.max(
    event.capacity -
      joinedParticipants.length,
    0,
  );

  const formattedEventDate =
    new Intl.DateTimeFormat("ja-JP", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(eventAt);

  const postedDate =
    new Intl.DateTimeFormat("ja-JP", {
      month: "numeric",
      day: "numeric",
    }).format(
      new Date(event.created_at),
    );

  const creatorIcon =
    creator?.selected_icon ??
    creator?.nickname?.slice(0, 1) ??
    "👤";

  const handleParticipation = (
    status: "joined" | "declined",
  ) => {
    if (
      status === "declined" &&
      isJoined &&
      isClosed
    ) {
      const shouldDecline =
        window.confirm(
          "募集終了後に不参加へ変更すると、再び参加することはできません。\n不参加に変更しますか？",
        );

      if (!shouldDecline) {
        return;
      }
    }

    setErrorMessage("");

    startParticipationTransition(
      async () => {
        try {
          await updateParticipation(
            event.id,
            status,
          );

          router.refresh();
        } catch (error) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "参加状態を変更できませんでした。",
          );
        }
      },
    );
  };

  const handleDelete = () => {
    const shouldDelete =
      window.confirm(
        `「${event.title}」を削除しますか？`,
      );

    if (!shouldDelete) {
      return;
    }

    setErrorMessage("");

    startDeleteTransition(async () => {
      try {
        await deleteEvent(event.id);
        router.refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "イベントを削除できませんでした。",
        );
      }
    });
  };

  return (
    <>
      <article className={styles.teamCard}>
        <div className={styles.userRow}>
          <div
            className={`${styles.avatar} ${styles.redAvatar}`}
          >
            {creator?.avatar_url ? (
              <img
                src={creator.avatar_url}
                alt={creator.nickname}
              />
            ) : (
              creatorIcon
            )}
          </div>

          <div
            className={
              styles.userInformation
            }
          >
            <h3>
              {creator?.nickname ??
                "ユーザー"}
            </h3>

            <p>{postedDate}に投稿</p>
          </div>

          <span
            className={
              isRecruiting
                ? styles.recruitingBadge
                : styles.closedBadge
            }
          >
            {isRecruiting
              ? "募集中"
              : "募集済み"}
          </span>
        </div>

        {isOwner && (
          <div
            className={
              styles.ownerActions
            }
          >
            <Link
              href={`/challenge/team/${event.id}/edit`}
              className={
                styles.editButton
              }
            >
              編集
            </Link>

            <button
              type="button"
              className={
                styles.deleteButton
              }
              onClick={handleDelete}
              disabled={isDeletePending}
            >
              {isDeletePending
                ? "削除中..."
                : "削除"}
            </button>
          </div>
        )}

        <h2 className={styles.postTitle}>
          {event.title}
        </h2>

        {event.comment && (
          <p
            className={
              styles.description
            }
          >
            {event.comment}
          </p>
        )}

        <div className={styles.infoGrid}>
          <div
            className={styles.infoItem}
          >
            <span
              className={
                styles.infoIcon
              }
            >
              🕘
            </span>

            <small>時間</small>

            <strong>
              {formattedEventDate}
            </strong>
          </div>

          <div className={styles.infoItem}>
  <span className={styles.infoIcon}>
    📍
  </span>

  <small>場所</small>

  <strong>
    {event.location}
  </strong>

  {event.location_address && (
    <span className={styles.locationAddress}>
      {event.location_address}
    </span>
  )}

  {event.location_latitude !== null &&
    event.location_longitude !== null && (
      <a
        href={createOpenStreetMapUrl(
          event.location_latitude,
          event.location_longitude,
        )}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.mapLink}
      >
        地図を見る
      </a>
    )}
</div>

          <div
            className={styles.infoItem}
          >
            <span
              className={
                styles.infoIcon
              }
            >
              👥
            </span>

            <small>参加者</small>

            <strong>
              {joinedParticipants.length} /{" "}
              {event.capacity}人
            </strong>
          </div>
        </div>

        <div
          className={
            styles.participantArea
          }
        >
          <button
            type="button"
            className={
              styles.participantListButton
            }
            onClick={() =>
              setIsParticipantsModalOpen(
                true,
              )
            }
            aria-label="参加者一覧を表示する"
          >
            <div
              className={
                styles.participantIcons
              }
            >
              {joinedParticipants
                .slice(0, 3)
                .map(
                  (
                    participant,
                    index,
                  ) => {
                    const profile =
                      getSingleProfile(
                        participant.profile,
                      );

                    const participantIcon =
                      profile?.selected_icon ??
                      profile?.nickname?.slice(
                        0,
                        1,
                      ) ??
                      "👤";

                    return (
                      <div
                        key={
                          participant.id
                        }
                        className={`${styles.participantAvatar} ${
                          index === 0
                            ? styles.participantAvatarRed
                            : index === 1
                              ? styles.participantAvatarBlue
                              : styles.participantAvatarGreen
                        }`}
                      >
                        {profile?.avatar_url ? (
                          <img
                            src={
                              profile.avatar_url
                            }
                            alt={
                              profile.nickname
                            }
                          />
                        ) : (
                          participantIcon
                        )}
                      </div>
                    );
                  },
                )}

              {joinedParticipants.length >
                3 && (
                <div
                  className={`${styles.participantAvatar} ${styles.moreAvatar}`}
                >
                  +
                  {joinedParticipants.length -
                    3}
                </div>
              )}

              {joinedParticipants.length ===
                0 && (
                <span
                  className={
                    styles.noParticipants
                  }
                >
                  まだ参加者はいません
                </span>
              )}
            </div>
          </button>

          <p
            className={
              styles.remainingText
            }
          >
            {isEventFinished
              ? "イベントは終了しました"
              : isClosed
                ? "募集は終了しました"
                : `あと${remainingCapacity}人まで参加できます`}
          </p>
        </div>

        {errorMessage && (
          <p
            className={
              styles.errorMessage
            }
          >
            {errorMessage}
          </p>
        )}

        {!isOwner && isRecruiting && (
          <div
            className={
              styles.actionButtons
            }
          >
            <button
              type="button"
              className={`${styles.joinButton} ${
                isJoined
                  ? styles.joinButtonActive
                  : ""
              }`}
              onClick={() =>
                handleParticipation(
                  "joined",
                )
              }
              disabled={
                isParticipationPending
              }
            >
              {isParticipationPending
                ? "更新中..."
                : isJoined
                  ? "✓ 参加中"
                  : "✓ 参加する"}
            </button>

            <button
              type="button"
              className={`${styles.declineButton} ${
                isDeclined
                  ? styles.declineButtonActive
                  : ""
              }`}
              onClick={() =>
                handleParticipation(
                  "declined",
                )
              }
              disabled={
                isParticipationPending
              }
            >
              {isParticipationPending
                ? "更新中..."
                : isDeclined
                  ? "× 不参加"
                  : "× 不参加にする"}
            </button>
          </div>
        )}

        {!isOwner &&
          isClosed &&
          isJoined && (
            <div
              className={
                styles.closedActionArea
              }
            >
              <p>
                募集終了後は、不参加への変更のみできます。
              </p>

              <button
                type="button"
                className={
                  styles.closedDeclineButton
                }
                onClick={() =>
                  handleParticipation(
                    "declined",
                  )
                }
                disabled={
                  isParticipationPending
                }
              >
                {isParticipationPending
                  ? "更新中..."
                  : "× 不参加に変更する"}
              </button>
            </div>
          )}
      </article>

      {isParticipantsModalOpen && (
        <div
          className={
            styles.modalBackdrop
          }
          onClick={() =>
            setIsParticipantsModalOpen(
              false,
            )
          }
        >
          <div
            className={
              styles.participantsModal
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby={`participants-title-${event.id}`}
            onClick={(clickEvent) =>
              clickEvent.stopPropagation()
            }
          >
            <div
              className={
                styles.modalHeader
              }
            >
              <div>
                <p
                  className={
                    styles.modalLabel
                  }
                >
                  PARTICIPANTS
                </p>

                <h2
                  id={`participants-title-${event.id}`}
                >
                  参加者一覧
                </h2>
              </div>

              <button
                type="button"
                className={
                  styles.modalCloseButton
                }
                onClick={() =>
                  setIsParticipantsModalOpen(
                    false,
                  )
                }
                aria-label="参加者一覧を閉じる"
              >
                ×
              </button>
            </div>

            <p
              className={
                styles.modalCount
              }
            >
              {joinedParticipants.length} /{" "}
              {event.capacity}人が参加予定です
            </p>

            <div
              className={
                styles.participantList
              }
            >
              {joinedParticipants.length ===
              0 ? (
                <p
                  className={
                    styles.emptyParticipantList
                  }
                >
                  まだ参加者はいません。
                </p>
              ) : (
                joinedParticipants.map(
                  (participant) => {
                    const profile =
                      getSingleProfile(
                        participant.profile,
                      );

                    const participantIcon =
                      profile?.selected_icon ??
                      profile?.nickname?.slice(
                        0,
                        1,
                      ) ??
                      "👤";

                    return (
                      <div
                        key={
                          participant.id
                        }
                        className={
                          styles.participantListItem
                        }
                      >
                        <div
                          className={
                            styles.modalParticipantAvatar
                          }
                        >
                          {profile?.avatar_url ? (
                            <img
                              src={
                                profile.avatar_url
                              }
                              alt={
                                profile.nickname
                              }
                            />
                          ) : (
                            participantIcon
                          )}
                        </div>

                        <span>
                          {profile?.nickname ??
                            "参加者"}
                        </span>

                        {participant.user_id ===
                          event.creator_id && (
                          <small>
                            主催者
                          </small>
                        )}
                      </div>
                    );
                  },
                )
              )}
            </div>

            <button
              type="button"
              className={
                styles.modalBottomButton
              }
              onClick={() =>
                setIsParticipantsModalOpen(
                  false,
                )
              }
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function getSingleProfile(
  profile:
    | Profile
    | Profile[]
    | null,
) {
  if (Array.isArray(profile)) {
    return profile[0] ?? null;
  }

  return profile;
}