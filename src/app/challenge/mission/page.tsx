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

const STORAGE_KEY = "mission-daily-quiz";

const earnedStampCount = 4;
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

export default function MissionPage() {
  const [dailyQuizState, setDailyQuizState] =
    useState<DailyQuizState | null>(null);

  const [formattedDate, setFormattedDate] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const todayKey = getTodayKey();
    const todayLabel = getFormattedDate();

    setFormattedDate(todayLabel);

    try {
      const savedData = localStorage.getItem(STORAGE_KEY);

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
            STORAGE_KEY,
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
      STORAGE_KEY,
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

    const updatedState: DailyQuizState = {
      ...dailyQuizState,
      answered: true,
      isCorrect,
    };

    setDailyQuizState(updatedState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));

    if (isCorrect) {
      setShowCelebration(true);

      window.setTimeout(() => {
        setShowCelebration(false);
      }, 2500);
    }
  };

  const handleResetQuiz = () => {
    localStorage.removeItem(STORAGE_KEY);
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
            <p>田中先輩について詳しくなりました！</p>
            <div className={styles.sparkles}>✨ Congratulations! ✨</div>
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
              <p>田中先輩について、また1つ詳しくなりました！</p>

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