"use client";

import {
  useEffect,
  useState,
  useTransition,
} from "react";
import { submitMissionAnswer } from "./actions";

import GorillaCorrectEffect from "./effect/gorilla/GorillaCorrectEffect";
import GorillaIncorrectEffect from "./effect/gorilla/GorillaIncorrectEffect";

import RedPandaCorrectEffect from "./effect/red_panda/RedPandaCorrectEffect";
import RedPandaIncorrectEffect from "./effect/red_panda/RedPandaIncorrectEffect";

import HumanBabyCorrectEffect from "./effect/human_baby/HumanBabyCorrectEffect";
import HumanBabyIncorrectEffect from "./effect/human_baby/HumanBabyIncorrectEffect";

import CatCorrectEffect from "./effect/cat/CatCorrectEffect";
import CatIncorrectEffect from "./effect/cat/CatIncorrectEffect";

import AlpacaCorrectEffect from "./effect/alpaca/AlpacaCorrectEffect";
import AlpacaIncorrectEffect from "./effect/alpaca/AlpacaIncorrectEffect";

import styles from "./page.module.css";

type QuestionType =
  | "favorite_subject"
  | "favorite_color";

type EffectAnimal =
  | "gorilla"
  | "redPanda"
  | "humanBaby"
  | "cat"
  | "alpaca";

type MissionQuiz = {
  targetUserId: string;
  targetRealName: string;
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

type PetitReward = {
  rewardId: number;
  sourceAnswerId: number;
  sourceUserId: string;
  sourceNickname: string;
  sourceRealName: string;
  sourceSelectedIcon: string | null;
  sourceAvatarUrl: string | null;
  questionText: string;
  answerText: string;
  receivedAt: string;
};

type MissionPageClientProps = {
  initialQuiz: MissionQuiz;
  initialAttempt: MissionAttempt | null;
  initialCorrectAnswer: string | null;
  initialStampCount: number;
  rewardQuestionText: string;
};

const TOTAL_STAMP_COUNT = 10;
const EFFECT_DURATION_MS = 2500;

/*
 * 5種類の動物を同じ確率で選ぶための配列
 */
const EFFECT_ANIMALS: EffectAnimal[] = [
  "gorilla",
  "redPanda",
  "humanBaby",
  "cat",
  "alpaca",
];

/*
 * EFFECT_ANIMALSの中から
 * 1種類を等確率で選択する
 */
function getRandomEffectAnimal(): EffectAnimal {
  const randomIndex = Math.floor(
    Math.random() *
      EFFECT_ANIMALS.length,
  );

  return EFFECT_ANIMALS[
    randomIndex
  ];
}

export default function MissionPageClient({
  initialQuiz,
  initialAttempt,
  initialCorrectAnswer,
  initialStampCount,
  rewardQuestionText,
}: MissionPageClientProps) {
  const [
    formattedDate,
    setFormattedDate,
  ] = useState("");

  const [
    selectedAnswer,
    setSelectedAnswer,
  ] = useState<string | null>(
    initialAttempt?.selectedAnswer ??
      null,
  );

  const [
    isAnswered,
    setIsAnswered,
  ] = useState(
    initialAttempt !== null,
  );

  const [
    isCorrect,
    setIsCorrect,
  ] = useState<boolean | null>(
    initialAttempt?.isCorrect ??
      null,
  );

  const [
    correctAnswer,
    setCorrectAnswer,
  ] = useState<string | null>(
    initialCorrectAnswer,
  );

  const [
    stampCount,
    setStampCount,
  ] = useState(initialStampCount);

  const [
    submitError,
    setSubmitError,
  ] = useState("");

  const [
    showCorrectEffect,
    setShowCorrectEffect,
  ] = useState(false);

  const [
    showIncorrectEffect,
    setShowIncorrectEffect,
  ] = useState(false);

  const [
    selectedEffectAnimal,
    setSelectedEffectAnimal,
  ] = useState<EffectAnimal | null>(
    null,
  );

  const [
    showStampComplete,
    setShowStampComplete,
  ] = useState(false);

  const [
    petitReward,
    setPetitReward,
  ] = useState<PetitReward | null>(
    null,
  );

  const [
    rewardError,
    setRewardError,
  ] = useState<string | null>(
    null,
  );

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
    if (
      isAnswered ||
      isSubmitting
    ) {
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

    startSubmitTransition(
      async () => {
        const previousStampCount =
          stampCount;

        const result =
          await submitMissionAnswer(
            initialQuiz.targetUserId,
            initialQuiz.questionType,
            selectedAnswer,
          );

        if (
          result.error ||
          !result.data
        ) {
          setSubmitError(
            result.error ??
              "回答を保存できませんでした。",
          );

          return;
        }

        const answerData =
          result.data;

        /*
         * 回答ごとに5種類の中から
         * 1種類を等確率で選ぶ
         */
        const randomAnimal =
          getRandomEffectAnimal();

        setSelectedEffectAnimal(
          randomAnimal,
        );

        setIsAnswered(true);

        setIsCorrect(
          answerData.isCorrect,
        );

        setCorrectAnswer(
          answerData.correctAnswer,
        );

        setStampCount(
          answerData.stampCount,
        );

        setPetitReward(
          answerData.petitReward,
        );

        setRewardError(
          answerData.rewardError,
        );

        if (
          answerData.isCorrect
        ) {
          setShowCorrectEffect(true);

          window.setTimeout(() => {
            setShowCorrectEffect(false);

            if (
              previousStampCount <
                TOTAL_STAMP_COUNT &&
              answerData.stampCount ===
                TOTAL_STAMP_COUNT
            ) {
              setShowStampComplete(
                true,
              );
            }
          }, EFFECT_DURATION_MS);
        } else {
          setShowIncorrectEffect(
            true,
          );

          window.setTimeout(() => {
            setShowIncorrectEffect(
              false,
            );
          }, EFFECT_DURATION_MS);
        }
      },
    );
  };

  const handleCloseStampComplete =
    () => {
      setShowStampComplete(false);
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
      if (
        option === correctAnswer
      ) {
        classNames.push(
          styles.correctOption,
        );
      } else if (
        option ===
          selectedAnswer &&
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
      {showCorrectEffect &&
        selectedEffectAnimal ===
          "gorilla" && (
          <GorillaCorrectEffect />
        )}

      {showCorrectEffect &&
        selectedEffectAnimal ===
          "redPanda" && (
          <RedPandaCorrectEffect />
        )}

      {showCorrectEffect &&
        selectedEffectAnimal ===
          "humanBaby" && (
          <HumanBabyCorrectEffect />
        )}

      {showCorrectEffect &&
        selectedEffectAnimal ===
          "cat" && (
          <CatCorrectEffect />
        )}

      {showCorrectEffect &&
        selectedEffectAnimal ===
          "alpaca" && (
          <AlpacaCorrectEffect />
        )}

      {showIncorrectEffect &&
        selectedEffectAnimal ===
          "gorilla" && (
          <GorillaIncorrectEffect />
        )}

      {showIncorrectEffect &&
        selectedEffectAnimal ===
          "redPanda" && (
          <RedPandaIncorrectEffect />
        )}

      {showIncorrectEffect &&
        selectedEffectAnimal ===
          "humanBaby" && (
          <HumanBabyIncorrectEffect />
        )}

      {showIncorrectEffect &&
        selectedEffectAnimal ===
          "cat" && (
          <CatIncorrectEffect />
        )}

      {showIncorrectEffect &&
        selectedEffectAnimal ===
          "alpaca" && (
          <AlpacaIncorrectEffect />
        )}

      {showStampComplete && (
        <div
          className={
            styles.completeOverlay
          }
          role="dialog"
          aria-modal="true"
          aria-labelledby="reward-title"
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

            <h1 id="reward-title">
              10個達成！
            </h1>

            <p>
              ミッションスタンプを
              <br />
              すべて集めました！
            </p>

            {petitReward ? (
              <div
                className={
                  styles.petitRewardCard
                }
              >
                <p
                  className={
                    styles.petitRewardLabel
                  }
                >
                  🎁 プチ情報を獲得！
                </p>

                <p
                  className={
                    styles.petitRewardMember
                  }
                >
                  {
                    petitReward.sourceNickname
                  }
                  さんの回答
                </p>

                <p
                  className={
                    styles.petitRewardQuestion
                  }
                >
                  {
                    petitReward.questionText
                  }
                </p>

                <strong
                  className={
                    styles.petitRewardAnswer
                  }
                >
                  「
                  {
                    petitReward.answerText
                  }
                  」
                </strong>
              </div>
            ) : rewardError ? (
              <div
                className={
                  styles.petitRewardError
                }
              >
                <p>
                  プチ情報を取得できませんでした。
                </p>

                <small>
                  {rewardError}
                </small>
              </div>
            ) : (
              <div
                className={
                  styles.petitRewardError
                }
              >
                <p>
                  回答済みのメンバーがまだいません。
                </p>
              </div>
            )}

            <button
              type="button"
              className={
                styles.completeCloseButton
              }
              onClick={
                handleCloseStampComplete
              }
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      <section
        className={styles.quizCard}
      >
        <div
          className={
            styles.quizHeader
          }
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
                {
                  initialQuiz.targetIcon
                }
              </span>
            )}
          </div>

          <div
            className={
              styles.seniorInfo
            }
          >
            <p>
              {
                initialQuiz.targetRealName
              }
            </p>

            <h3>
              {
                initialQuiz.targetNickname
              }
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
              {
                initialQuiz.question
              }
            </h3>
          </div>

          <div
            className={
              styles.optionGrid
            }
          >
            {initialQuiz.options.map(
              (
                option,
                index,
              ) => (
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
                    「
                    {correctAnswer}
                    」
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
              {currentMonth}
              月のスタンプカード
            </p>
          </div>
        </div>

        <div
          className={
            styles.rewardPreview
          }
        >
          <div
            className={
              styles.rewardPreviewIcon
            }
            aria-hidden="true"
          >
            🎁
          </div>

          <div
            className={
              styles.rewardPreviewText
            }
          >
            <p>
              10個達成でもらえる
              プチ情報
            </p>

            <strong>
              「
              {rewardQuestionText}
              」
            </strong>
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