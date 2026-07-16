"use client";

import {
  useActionState,
  useState,
} from "react";
import {
  submitMonthlyAnswer,
  type SubmitAnswerState,
} from "./actions";
import styles from "./page.module.css";

type MonthlyQuestionFormProps = {
  monthlyQuestionId: number;
};

const initialState: SubmitAnswerState = {
  error: null,
};

export default function MonthlyQuestionForm({
  monthlyQuestionId,
}: MonthlyQuestionFormProps) {
  const [answer, setAnswer] =
    useState("");

  const [state, formAction, isPending] =
    useActionState(
      submitMonthlyAnswer,
      initialState,
    );

  return (
    <form
      action={formAction}
      className={styles.form}
    >
      <input
        type="hidden"
        name="monthlyQuestionId"
        value={monthlyQuestionId}
      />

      <div className={styles.field}>
        <div
          className={
            styles.answerHeader
          }
        >
          <label
            htmlFor="answer"
            className={styles.answerLabel}
          >
            あなたの回答
          </label>

          <span
            className={
              styles.characterCount
            }
          >
            {answer.length} / 200
          </span>
        </div>

        <textarea
          id="answer"
          name="answer"
          className={styles.textarea}
          value={answer}
          onChange={(event) =>
            setAnswer(
              event.target.value,
            )
          }
          placeholder="回答を入力してください"
          maxLength={200}
          rows={5}
          required
          disabled={isPending}
        />
      </div>

      {state.error && (
        <p
          className={
            styles.errorMessage
          }
          role="alert"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        className={styles.submitButton}
        disabled={
          isPending ||
          answer.trim().length === 0
        }
      >
        {isPending
          ? "登録しています..."
          : "回答を登録する"}
      </button>
    </form>
  );
}