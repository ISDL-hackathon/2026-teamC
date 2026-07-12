"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

type Quiz = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
};

type DailyQuizState = {
  date: string;
  quizId: number;
  optionOrder: string[];
  selectedAnswer: string | null;
  answered: boolean;
  isCorrect: boolean | null;
};

type StampState = {
  month: string;
  count: number;
};

const quizzes: Quiz[] = [
  {
    id: 1,
    question: "田中先輩の好きな教科は？",
    options: ["数学", "英語", "国語", "体育"],
    correctAnswer: "数学",
  },
  {
    id: 2,
    question: "田中先輩の好きな色は？",
    options: ["赤", "青", "緑", "黒"],
    correctAnswer: "赤",
  },
];

const QUIZ_STORAGE_KEY = "mission-daily-quiz";
const STAMP_STORAGE_KEY = "mission-stamp-count";

const totalStampCount = 10;

/**
 * 端末の日付を「YYYY-MM-DD」の形式で取得します。
 */
function getTodayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const date = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${date}`;
}

/**
 * 画面に表示する「○月○日」を作成します。
 */
function getFormattedDate() {
  const today = new Date();

  return `${today.getMonth() + 1}月${today.getDate()}日`;
}

/**
 * 現在の年月を「YYYY-MM」の形式で取得します。
 */
function getCurrentMonthKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

/**
 * クイズ一覧から1問をランダムに選びます。
 */
function getRandomQuiz() {
  const randomIndex = Math.floor(Math.random() * quizzes.length);

  return quizzes[randomIndex];
}

/**
 * 配列の内容をランダムな順番に並べ替えます。
 * 元の配列は変更しません。
 */
function shuffleOptions(options: string[]) {
  const shuffledOptions = [...options];

  for (let index = shuffledOptions.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [shuffledOptions[index], shuffledOptions[randomIndex]] = [
      shuffledOptions[randomIndex],
      shuffledOptions[index],
    ];
  }

  return shuffledOptions;
}

/**
 * localStorageから読み込んだスタンプ数を
 * 0〜10の範囲に収めます。
 */
function normalizeStampCount(value: number) {
  return Math.min(Math.max(value, 0), totalStampCount);
}

export default function MissionPage() {
  const [dailyQuizState, setDailyQuizState] =
    useState<DailyQuizState | null>(null);

  const [formattedDate, setFormattedDate] = useState("");
  const [isReady, setIsReady] = useState(false);

  const [earnedStampCount, setEarnedStampCount] = useState(0);

  const [showCelebration, setShowCelebration] = useState(false);
  const [showStampComplete, setShowStampComplete] = useState(false);

  const currentMonth = new Date().getMonth() + 1;

  useEffect(() => {
    const todayKey = getTodayKey();
    const todayLabel = getFormattedDate();

    setFormattedDate(todayLabel);

    /*
     * 保存済みのスタンプ数を読み込みます。
     * 保存データがなければ0個から開始します。
     */
    try {
     const savedStampData = localStorage.getItem(STAMP_STORAGE_KEY);

const currentMonth = getCurrentMonthKey();

if (savedStampData) {
  const parsedStampData = JSON.parse(savedStampData) as StampState;

  if (parsedStampData.month === currentMonth) {
    setEarnedStampCount(
      normalizeStampCount(parsedStampData.count),
    );
  } else {
    const newStampState: StampState = {
      month: currentMonth,
      count: 0,
    };

    localStorage.setItem(
      STAMP_STORAGE_KEY,
      JSON.stringify(newStampState),
    );

    setEarnedStampCount(0);
  }
}
    } catch (error) {
      console.error("スタンプ情報を読み込めませんでした。", error);
    }

    /*
     * 今日のクイズ情報を読み込みます。
     */
    try {
      const savedData = localStorage.getItem(QUIZ_STORAGE_KEY);

      if (savedData) {
        const parsedData = JSON.parse(savedData) as Partial<DailyQuizState>;

        const savedQuiz = quizzes.find(
          (quiz) => quiz.id === parsedData.quizId,
        );

        if (parsedData.date === todayKey && savedQuiz) {
          /*
           * optionOrderが保存されていない古いデータの場合は、
           * ここで選択肢をシャッフルして保存し直します。
           */
          const optionOrder =
            parsedData.optionOrder &&
            parsedData.optionOrder.length === savedQuiz.options.length
              ? parsedData.optionOrder
              : shuffleOptions(savedQuiz.options);

          const restoredState: DailyQuizState = {
            date: todayKey,
            quizId: savedQuiz.id,
            optionOrder,
            selectedAnswer: parsedData.selectedAnswer ?? null,
            answered: parsedData.answered ?? false,
            isCorrect: parsedData.isCorrect ?? null,
          };

          localStorage.setItem(
            QUIZ_STORAGE_KEY,
            JSON.stringify(restoredState),
          );

          setDailyQuizState(restoredState);
          setIsReady(true);
          return;
        }
      }
    } catch (error) {
      console.error("保存されたクイズ情報を読み込めませんでした。", error);
    }

    /*
     * 今日のクイズがまだない場合は、
     * 新しく問題と選択肢の順番を決めます。
     */
    const selectedQuiz = getRandomQuiz();

    const newDailyQuizState: DailyQuizState = {
      date: todayKey,
      quizId: selectedQuiz.id,
      optionOrder: shuffleOptions(selectedQuiz.options),
      selectedAnswer: null,
      answered: false,
      isCorrect: null,
    };

    localStorage.setItem(
      QUIZ_STORAGE_KEY,
      JSON.stringify(newDailyQuizState),
    );

    setDailyQuizState(newDailyQuizState);
    setIsReady(true);
  }, []);

  const currentQuiz = quizzes.find(
    (quiz) => quiz.id === dailyQuizState?.quizId,
  );

  const handleSelectAnswer = (answer: string) => {
    if (!dailyQuizState || dailyQuizState.answered) {
      return;
    }

    const updatedState: DailyQuizState = {
      ...dailyQuizState,
      selectedAnswer: answer,
    };

    setDailyQuizState(updatedState);
  };

  const handleSubmitAnswer = () => {
    if (
      !dailyQuizState ||
      !currentQuiz ||
      !dailyQuizState.selectedAnswer ||
      dailyQuizState.answered
    ) {
      return;
    }

    const isCorrect =
      dailyQuizState.selectedAnswer === currentQuiz.correctAnswer;

    const updatedQuizState: DailyQuizState = {
      ...dailyQuizState,
      answered: true,
      isCorrect,
    };

    setDailyQuizState(updatedQuizState);

    localStorage.setItem(
      QUIZ_STORAGE_KEY,
      JSON.stringify(updatedQuizState),
    );

    /*
     * 正解した場合だけスタンプを1個増やします。
     */
   if (isCorrect) {
  const nextStampCount = normalizeStampCount(
    earnedStampCount + 1,
  );

  setEarnedStampCount(nextStampCount);

 const stampState: StampState = {
  month: getCurrentMonthKey(),
  count: nextStampCount,
};

localStorage.setItem(
  STAMP_STORAGE_KEY,
  JSON.stringify(stampState),
);

  // まず通常の正解演出を表示
  setShowCelebration(true);

  window.setTimeout(() => {
    setShowCelebration(false);

    // 正解演出が終わったあと、
    // 10個達成ならコンプリート演出
    if (
      earnedStampCount < totalStampCount &&
      nextStampCount === totalStampCount
    ) {
      setShowStampComplete(true);

      window.setTimeout(() => {
        setShowStampComplete(false);
      }, 3500);
    }
  }, 2500);
}
  };

  /**
   * 開発用：
   * 今日のクイズだけをリセットします。
   * スタンプ数は変更しません。
   */
  const handleResetQuiz = () => {
    localStorage.removeItem(QUIZ_STORAGE_KEY);
    window.location.reload();
  };

  /**
   * 開発用：
   * 10個達成の確認ができるように、
   * スタンプ数を9個にします。
   */
  const handleSetNineStamps = () => {
    setEarnedStampCount(9);
    localStorage.setItem(
  STAMP_STORAGE_KEY,
  JSON.stringify({
    month: getCurrentMonthKey(),
    count: 9,
  }),
);
  };

  /**
   * 開発用：
   * スタンプを0個に戻します。
   */
  const handleResetStamps = () => {
    setEarnedStampCount(0);
    localStorage.setItem(
  STAMP_STORAGE_KEY,
  JSON.stringify({
    month: getCurrentMonthKey(),
    count: 0,
                    }),
    );
         };

         /**
 * 開発用：
 * 保存されている月を翌月に変更し、
 * 月が変わった状態を再現します。
 */
const handleNextMonth = () => {
  const today = new Date();

  const nextMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    1,
  );

  const monthKey = `${nextMonth.getFullYear()}-${String(
    nextMonth.getMonth() + 1,
  ).padStart(2, "0")}`;

  localStorage.setItem(
    STAMP_STORAGE_KEY,
    JSON.stringify({
      month: monthKey,
      count: earnedStampCount,
    }),
  );

  window.location.reload();
};

  const getOptionClassName = (option: string) => {
    if (!dailyQuizState || !currentQuiz) {
      return styles.optionButton;
    }

    const classNames = [styles.optionButton];

    if (
      !dailyQuizState.answered &&
      dailyQuizState.selectedAnswer === option
    ) {
      classNames.push(styles.selectedOption);
    }

    if (dailyQuizState.answered) {
      if (option === currentQuiz.correctAnswer) {
        classNames.push(styles.correctOption);
      } else if (
        option === dailyQuizState.selectedAnswer &&
        dailyQuizState.isCorrect === false
      ) {
        classNames.push(styles.incorrectOption);
      } else {
        classNames.push(styles.disabledOption);
      }
    }

    return classNames.join(" ");
  };

  if (!isReady || !dailyQuizState || !currentQuiz) {
    return (
      <section className={styles.loadingCard}>
        <p>クイズを準備しています...</p>
      </section>
    );
  }

  return (
    <>
      {showCelebration && (
        <div
          className={styles.celebrationOverlay}
          role="status"
          aria-live="polite"
        >
          <div className={styles.confettiLayer} aria-hidden="true">
            <span>🎉</span>
            <span>✨</span>
            <span>🎊</span>
            <span>⭐</span>
            <span>👏</span>
            <span>✨</span>
            <span>🎉</span>
            <span>🎊</span>
          </div>

          <div className={styles.celebrationContent}>
            <div className={styles.bigEmoji}>🎉 👏 🎉</div>
            <h1>正解！</h1>
            <p>スタンプを1個獲得しました！</p>
            <div className={styles.sparkles}>✨ Congratulations! ✨</div>
          </div>
        </div>
      )}

      {showStampComplete && (
        <div
          className={styles.completeOverlay}
          role="status"
          aria-live="polite"
        >
          <div className={styles.completeConfetti} aria-hidden="true">
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

          <div className={styles.completeContent}>
            <p className={styles.completeLabel}>MISSION COMPLETE</p>

            <div className={styles.trophyEmoji}>🏆</div>

            <h1>10個達成！</h1>

            <p>
              ミッションスタンプを
              <br />
              すべて集めました！
            </p>

            <div className={styles.completeMessage}>
              🎉 コンプリートおめでとう！ 🎉
            </div>
          </div>
        </div>
      )}

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
            <h3>{currentQuiz.question}</h3>
          </div>

          <div className={styles.optionGrid}>
            {dailyQuizState.optionOrder.map((option, index) => (
              <button
                key={option}
                type="button"
                className={getOptionClassName(option)}
                onClick={() => handleSelectAnswer(option)}
                disabled={dailyQuizState.answered}
                aria-pressed={dailyQuizState.selectedAnswer === option}
              >
                <span className={styles.optionNumber}>{index + 1}</span>
                <span className={styles.optionText}>{option}</span>
              </button>
            ))}
          </div>

          {dailyQuizState.answered && dailyQuizState.isCorrect && (
            <div className={`${styles.resultBox} ${styles.correctResult}`}>
              <div className={styles.celebration}>👏 🎉</div>

              <strong>正解です！</strong>

              <p>スタンプを1個獲得しました！</p>

              <p className={styles.tomorrowMessage}>
                また明日のクイズにも挑戦してね！
              </p>
            </div>
          )}

          {dailyQuizState.answered &&
            dailyQuizState.isCorrect === false && (
              <div className={`${styles.resultBox} ${styles.incorrectResult}`}>
                <strong>残念、不正解です</strong>

                <p>
                  正解は
                  <span>「{currentQuiz.correctAnswer}」</span>
                  です。
                </p>

                <p className={styles.tomorrowMessage}>
                  また明日のクイズにも挑戦してね！
                </p>
              </div>
            )}

          <button
            type="button"
            className={styles.answerButton}
            onClick={handleSubmitAnswer}
            disabled={
              !dailyQuizState.selectedAnswer || dailyQuizState.answered
            }
          >
            {dailyQuizState.answered
              ? "今日のクイズは終了！"
              : "回答する"}
          </button>

          <button
            type="button"
            className={styles.resetButton}
            onClick={handleResetQuiz}
          >
            開発用：今日のクイズをリセット
          </button>
        </div>
      </section>

      <section className={styles.stampCard}>
        <div className={styles.stampHeader}>
          <div>
            <p className={styles.label}>MISSION STAMP</p>
            <h2 className={styles.stampTitle}>ミッションスタンプ</h2>
            <p className={styles.stampMonth}>
                    {currentMonth}月のスタンプカード
                </p>
          </div>

        
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

            let stampClassName = `${styles.stamp} ${
              isEarned ? styles.earnedStamp : styles.unearnedStamp
            }`;

            if (isReward && isEarned) {
              stampClassName += ` ${styles.rewardStamp}`;
            }

            if (isReward && !isEarned) {
              stampClassName += ` ${styles.rewardStampLocked}`;
            }

            return (
              <div
                key={stampNumber}
                className={stampClassName}
              >
                <span>{stampNumber}</span>

                {isReward && (
                  <small>{isEarned ? "達成" : "特典"}</small>
                )}
              </div>
            );
          })}
        </div>

        <p className={styles.stampNote}>
          クイズに正解するたびにスタンプが1つたまります
        </p>

        <div className={styles.stampDevelopmentTools}>
  <button
    type="button"
    onClick={handleSetNineStamps}
  >
    開発用：9個にする
  </button>

  <button
    type="button"
    onClick={handleResetStamps}
  >
    開発用：0個に戻す
  </button>

  <button
    type="button"
    onClick={handleNextMonth}
  >
    開発用：翌月にする
  </button>
</div>
      </section>
    </>
  );
}