"use client";

import {
  useEffect,
  useState,
  useTransition,
} from "react";
import { submitMissionAnswer } from "./actions";
import styles from "./page.module.css";

type QuestionType =
  | "favorite_subject"
  | "favorite_color";

type MissionQuiz = {
  targetUserId: string;
  targetNickname: string;
  targetIcon: string;
  questionType: QuestionType;
  question: string;
  options: string[];
};

type MissionAttempt = {
  selectedAnswer: string;
  isCorrect: boolean;
};

type MissionPageClientProps = {
  initialQuiz: MissionQuiz;
  initialAttempt: MissionAttempt | null;
  initialCorrectAnswer: string | null;
  initialStampCount: number;
};

const TOTAL_STAMP_COUNT = 10;

export default function MissionPageClient({
  initialQuiz,
  initialAttempt,
  initialCorrectAnswer,
  initialStampCount,
}: MissionPageClientProps) {
  const [formattedDate, setFormattedDate] =
    useState("");

  const [
    selectedAnswer,
    setSelectedAnswer,
  ] = useState<string | null>(
    initialAttempt?.selectedAnswer ?? null,
  );

  const [isAnswered, setIsAnswered] =
    useState(initialAttempt !== null);

  const [isCorrect, setIsCorrect] =
    useState<boolean | null>(
      initialAttempt?.isCorrect ?? null,
    );

  const [
    correctAnswer,
    setCorrectAnswer,
  ] = useState<string | null>(
    initialCorrectAnswer,
  );

  const [stampCount, setStampCount] =
    useState(initialStampCount);

  const [submitError, setSubmitError] =
    useState("");

  const [
    showCelebration,
    setShowCelebration,
  ] = useState(false);

  const [
    showStampComplete,
    setShowStampComplete,
  ] = useState(false);

  const [
    isSubmitting,
    startSubmitTransition,
  ] = useTransition();

  useEffect(() => {
    const today = new Date();

    setFormattedDate(
      `${today.getMonth() + 1}月${today.getDate()}日`,
    );
  }, []);

  const currentMonth =
    new Date().getMonth() + 1;

  const isImageIcon =
    initialQuiz.targetIcon.startsWith(
      "http://",
    ) ||
    initialQuiz.targetIcon.startsWith(
      "https://",
    ) ||
    initialQuiz.targetIcon.startsWith(
      "data:image",
    );

  const handleSelectAnswer = (
    answer: string,
  ) => {
    if (isAnswered || isSubmitting) {
      return;
    }

    setSelectedAnswer(answer);
    setSubmitError("");
  };

  const handleSubmitAnswer = () => {
    if (
      !selectedAnswer ||
      isAnswered ||
      isSubmitting
    ) {
      return;
    }

    setSubmitError("");

    startSubmitTransition(async () => {
      const previousStampCount =
        stampCount;

      const result =
        await submitMissionAnswer(
          initialQuiz.targetUserId,
          initialQuiz.questionType,
          selectedAnswer,
        );

      if (result.error || !result.data) {
        setSubmitError(
          result.error ??
            "回答を保存できませんでした。",
        );

        return;
      }

      setIsAnswered(true);
      setIsCorrect(
        result.data.isCorrect,
      );
      setCorrectAnswer(
        result.data.correctAnswer,
      );
      setStampCount(
        result.data.stampCount,
      );

      if (result.data.isCorrect) {
        setShowCelebration(true);

        window.setTimeout(() => {
          setShowCelebration(false);

          if (
            previousStampCount <
              TOTAL_STAMP_COUNT &&
            result.data.stampCount ===
              TOTAL_STAMP_COUNT
          ) {
            setShowStampComplete(true);

            window.setTimeout(() => {
              setShowStampComplete(false);
            }, 3500);
          }
        }, 2500);
      }
    });
  };

  const getOptionClassName = (
    option: string,
  ) => {
    const classNames = [
      styles.optionButton,
    ];

    if (
      !isAnswered &&
      selectedAnswer === option
    ) {
      classNames.push(
        styles.selectedOption,
      );
    }

    if (isAnswered) {
      if (option === correctAnswer) {
        classNames.push(
          styles.correctOption,
        );
      } else if (
        option === selectedAnswer &&
        isCorrect === false
      ) {
        classNames.push(
          styles.incorrectOption,
        );
      } else {
        classNames.push(
          styles.disabledOption,
        );
      }
    }

    return classNames.join(" ");
  };

  return (
    <>
      {showCelebration && (
        <div
          className={
            styles.celebrationOverlay
          }
          role="status"
          aria-live="polite"
        >
          <div
            className={
              styles.confettiLayer
            }
            aria-hidden="true"
          >
            <span>🎉</span>
            <span>✨</span>
            <span>🎊</span>
            <span>⭐</span>
            <span>👏</span>
            <span>✨</span>
            <span>🎉</span>
            <span>🎊</span>
          </div>

          <div
            className={
              styles.celebrationContent
            }
          >
            <div
              className={
                styles.bigEmoji
              }
            >
              🎉 👏 🎉
            </div>

            <h1>正解！</h1>

            <p>
              スタンプを1個獲得しました！
            </p>

            <div
              className={
                styles.sparkles
              }
            >
              ✨ Congratulations! ✨
            </div>
          </div>
        </div>
      )}

      {showStampComplete && (
        <div
          className={
            styles.completeOverlay
          }
          role="status"
          aria-live="polite"
        >
          <div
            className={
              styles.completeConfetti
            }
            aria-hidden="true"
          >
            <span>🎉</span>
            <span>✨</span>
            <span>🎊</span>
            <span>⭐</span>
            <span>🏆</span>
            <span>🎉</span>
            <span>✨</span>
            <span>🎊</span>
            <span>⭐</span>
            <span>🏆</span>
          </div>

          <div
            className={
              styles.completeContent
            }
          >
            <p
              className={
                styles.completeLabel
              }
            >
              MISSION COMPLETE
            </p>

            <div
              className={
                styles.trophyEmoji
              }
            >
              🏆
            </div>

            <h1>10個達成！</h1>

            <p>
              ミッションスタンプを
              <br />
              すべて集めました！
            </p>

            <div
              className={
                styles.completeMessage
              }
            >
              🎉 コンプリートおめでとう！
              🎉
            </div>
          </div>
        </div>
      )}

      <section
        className={styles.quizCard}
      >
        <div
          className={styles.quizHeader}
        >
          <div>
            <p
              className={styles.label}
            >
              TODAY&apos;S QUIZ
            </p>

            <h2
              className={
                styles.mainTitle
              }
            >
              今日の先輩クイズ
            </h2>
          </div>

          <span
            className={
              styles.dateBadge
            }
          >
            {formattedDate}
          </span>
        </div>

        <div
          className={
            styles.seniorProfile
          }
        >
          <div
            className={
              styles.seniorIcon
            }
          >
            {isImageIcon ? (
              <img
                src={
                  initialQuiz.targetIcon
                }
                alt={`${initialQuiz.targetNickname}のアイコン`}
              />
            ) : (
              <span>
                {initialQuiz.targetIcon}
              </span>
            )}
          </div>

          <div
            className={
              styles.seniorInfo
            }
          >
            <p>研究室メンバー</p>

            <h3>
              {initialQuiz.targetNickname}
            </h3>
          </div>
        </div>

        <p
          className={
            styles.quizDescription
          }
        >
          このメンバーについての4択クイズに挑戦しよう！
        </p>

        <div
          className={
            styles.questionBox
          }
        >
          <div
            className={
              styles.questionTitle
            }
          >
            <span
              className={
                styles.questionMark
              }
            >
              Q.
            </span>

            <h3>
              {initialQuiz.question}
            </h3>
          </div>

          <div
            className={
              styles.optionGrid
            }
          >
            {initialQuiz.options.map(
              (option, index) => (
                <button
                  key={`${option}-${index}`}
                  type="button"
                  className={getOptionClassName(
                    option,
                  )}
                  onClick={() =>
                    handleSelectAnswer(
                      option,
                    )
                  }
                  disabled={
                    isAnswered ||
                    isSubmitting
                  }
                  aria-pressed={
                    selectedAnswer ===
                    option
                  }
                >
                  <span
                    className={
                      styles.optionNumber
                    }
                  >
                    {index + 1}
                  </span>

                  <span
                    className={
                      styles.optionText
                    }
                  >
                    {option}
                  </span>
                </button>
              ),
            )}
          </div>

          {isAnswered &&
            isCorrect === true && (
              <div
                className={`${styles.resultBox} ${styles.correctResult}`}
              >
                <div
                  className={
                    styles.celebration
                  }
                >
                  👏 🎉
                </div>

                <strong>
                  正解です！
                </strong>

                <p>
                  スタンプを1個獲得しました！
                </p>

                <p
                  className={
                    styles.tomorrowMessage
                  }
                >
                  また明日のクイズにも挑戦してね！
                </p>
              </div>
            )}

          {isAnswered &&
            isCorrect === false && (
              <div
                className={`${styles.resultBox} ${styles.incorrectResult}`}
              >
                <strong>
                  残念、不正解です
                </strong>

                <p>
                  正解は
                  <span>
                    「{correctAnswer}」
                  </span>
                  です。
                </p>

                <p
                  className={
                    styles.tomorrowMessage
                  }
                >
                  また明日のクイズにも挑戦してね！
                </p>
              </div>
            )}

          {submitError && (
            <p
              className={
                styles.incorrectResult
              }
            >
              {submitError}
            </p>
          )}

          <button
            type="button"
            className={
              styles.answerButton
            }
            onClick={
              handleSubmitAnswer
            }
            disabled={
              !selectedAnswer ||
              isAnswered ||
              isSubmitting
            }
          >
            {isSubmitting
              ? "回答を保存中..."
              : isAnswered
                ? "今日のクイズは終了！"
                : "回答する"}
          </button>
        </div>
      </section>

      <section
        className={styles.stampCard}
      >
        <div
          className={
            styles.stampHeader
          }
        >
          <div>
            <p
              className={styles.label}
            >
              MISSION STAMP
            </p>

            <h2
              className={
                styles.stampTitle
              }
            >
              ミッションスタンプ
            </h2>

            <p
              className={
                styles.stampMonth
              }
            >
              {currentMonth}月のスタンプカード
            </p>
          </div>
        </div>

        <div
          className={
            styles.progressArea
          }
        >
          <p>現在の達成数</p>

          <div
            className={
              styles.progressCount
            }
          >
            <strong>
              {stampCount}
            </strong>

            <span>
              / {TOTAL_STAMP_COUNT}
            </span>
          </div>
        </div>

        <div
          className={
            styles.stampGrid
          }
        >
          {Array.from(
            {
              length:
                TOTAL_STAMP_COUNT,
            },
            (_, index) => {
              const stampNumber =
                index + 1;

              const isEarned =
                stampNumber <=
                stampCount;

              const isReward =
                stampNumber ===
                TOTAL_STAMP_COUNT;

              let stampClassName =
                `${styles.stamp} ${
                  isEarned
                    ? styles.earnedStamp
                    : styles.unearnedStamp
                }`;

              if (
                isReward &&
                isEarned
              ) {
                stampClassName +=
                  ` ${styles.rewardStamp}`;
              }

              if (
                isReward &&
                !isEarned
              ) {
                stampClassName +=
                  ` ${styles.rewardStampLocked}`;
              }

              return (
                <div
                  key={stampNumber}
                  className={
                    stampClassName
                  }
                >
                  <span>
                    {stampNumber}
                  </span>

                  {isReward && (
                    <small>
                      {isEarned
                        ? "達成"
                        : "特典"}
                    </small>
                  )}
                </div>
              );
            },
          )}
        </div>

        <p
          className={
            styles.stampNote
          }
        >
          クイズに正解するたびにスタンプが1つたまります
        </p>
      </section>
    </>
  );
}