import { requireMonthlyAnswer } from "@/lib/petit-question/checkMonthlyAnswer";
import MissionPageClient from "./MissionPageClient";
import { getMissionPageData } from "./actions";
import styles from "./page.module.css";

export default async function MissionPage() {
  await requireMonthlyAnswer();

  const result =
    await getMissionPageData();

  if (
    result.error ||
    !result.data
  ) {
    return (
      <section
        className={
          styles.quizCard
        }
      >
        <div
          className={
            styles.questionBox
          }
        >
          <p>
            {result.error ??
              "クイズ情報を読み込めませんでした。"}
          </p>
        </div>
      </section>
    );
  }

  return (
    <MissionPageClient
      initialQuiz={
        result.data.quiz
      }
      initialAttempt={
        result.data.attempt
      }
      initialCorrectAnswer={
        result.data
          .correctAnswer
      }
      initialStampCount={
        result.data.stampCount
      }
      rewardQuestionText={
        result.data
          .rewardQuestionText
      }
    />
  );
}