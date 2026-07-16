"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type MonthlyQuestionData = {
  monthlyQuestionId: number;
  questionText: string;
  targetMonth: string;
  existingAnswer: string | null;
};

export type MonthlyQuestionResult = {
  data: MonthlyQuestionData | null;
  error: string | null;
};

export type SubmitAnswerState = {
  error: string | null;
};

type MonthlyQuestionRow = {
  id: number;
  target_month: string;
  question_id: number;
  question:
    | {
        question_text: string;
      }
    | {
        question_text: string;
      }[]
    | null;
};

type QuestionRow = {
  id: number;
  question_text: string;
};

function createSupabaseAdmin() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Supabaseの管理者用環境変数が設定されていません。",
    );
  }

  return createAdminClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

/**
 * 日本時間を基準に今月の1日を返す。
 *
 * 例：
 * 2026年7月 → 2026-07-01
 */
function getCurrentMonthKey() {
  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      },
    )
      .format(new Date())
      .split("-");

  const year = parts[0];
  const month = parts[1];

  return `${year}-${month}-01`;
}

function getQuestionText(
  question:
    | {
        question_text: string;
      }
    | {
        question_text: string;
      }[]
    | null,
) {
  if (Array.isArray(question)) {
    return (
      question[0]?.question_text ??
      "質問を取得できませんでした。"
    );
  }

  return (
    question?.question_text ??
    "質問を取得できませんでした。"
  );
}

/**
 * 今月の質問を取得する。
 *
 * 今月の質問がまだ存在しない場合は、
 * 有効な質問候補からランダムに1つ選んで登録する。
 */
async function getOrCreateMonthlyQuestion() {
  const admin = createSupabaseAdmin();
  const targetMonth =
    getCurrentMonthKey();

  const {
    data: existingMonthlyQuestion,
    error: existingQuestionError,
  } = await admin
    .from("monthly_petit_questions")
    .select(`
      id,
      target_month,
      question_id,
      question:petit_questions!question_id (
        question_text
      )
    `)
    .eq("target_month", targetMonth)
    .maybeSingle();

  if (existingQuestionError) {
    console.error(
      "今月の質問取得エラー:",
      existingQuestionError,
    );

    throw new Error(
      "今月の質問を取得できませんでした。",
    );
  }

  if (existingMonthlyQuestion) {
    return existingMonthlyQuestion as MonthlyQuestionRow;
  }

  const {
    data: questionCandidates,
    error: candidateError,
  } = await admin
    .from("petit_questions")
    .select(`
      id,
      question_text
    `)
    .eq("is_active", true);

  if (candidateError) {
    console.error(
      "質問候補取得エラー:",
      candidateError,
    );

    throw new Error(
      "質問候補を取得できませんでした。",
    );
  }

  const candidates =
    (questionCandidates ??
      []) as QuestionRow[];

  if (candidates.length === 0) {
    throw new Error(
      "利用できる質問が登録されていません。",
    );
  }

  const randomIndex =
    Math.floor(
      Math.random() *
        candidates.length,
    );

  const selectedQuestion =
    candidates[randomIndex];

  const {
    data: createdMonthlyQuestion,
    error: insertError,
  } = await admin
    .from("monthly_petit_questions")
    .insert({
      target_month: targetMonth,
      question_id:
        selectedQuestion.id,
    })
    .select(`
      id,
      target_month,
      question_id,
      question:petit_questions!question_id (
        question_text
      )
    `)
    .maybeSingle();

  if (!insertError && createdMonthlyQuestion) {
    return createdMonthlyQuestion as MonthlyQuestionRow;
  }

  /*
   * 複数人が同時に初回アクセスした場合、
   * target_monthのunique制約により
   * 後からinsertした方が失敗する場合がある。
   *
   * その場合は、すでに作成された質問を再取得する。
   */
  const {
    data: retriedMonthlyQuestion,
    error: retryError,
  } = await admin
    .from("monthly_petit_questions")
    .select(`
      id,
      target_month,
      question_id,
      question:petit_questions!question_id (
        question_text
      )
    `)
    .eq("target_month", targetMonth)
    .maybeSingle();

  if (
    retryError ||
    !retriedMonthlyQuestion
  ) {
    console.error(
      "今月の質問登録エラー:",
      insertError,
    );

    throw new Error(
      "今月の質問を登録できませんでした。",
    );
  }

  return retriedMonthlyQuestion as MonthlyQuestionRow;
}

/**
 * 回答画面に表示する情報を取得する。
 */
export async function getMonthlyQuestionData(): Promise<MonthlyQuestionResult> {
  const supabase =
    await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      data: null,
      error:
        "ログイン情報を確認できませんでした。",
    };
  }

  try {
    const monthlyQuestion =
      await getOrCreateMonthlyQuestion();

    const {
      data: existingAnswer,
      error: answerError,
    } = await supabase
      .from("petit_answers")
      .select("answer_text")
      .eq("user_id", user.id)
      .eq(
        "monthly_question_id",
        monthlyQuestion.id,
      )
      .maybeSingle();

    if (answerError) {
      console.error(
        "今月の回答取得エラー:",
        answerError,
      );

      return {
        data: null,
        error:
          "今月の回答状況を取得できませんでした。",
      };
    }

    return {
      data: {
        monthlyQuestionId:
          monthlyQuestion.id,

        questionText:
          getQuestionText(
            monthlyQuestion.question,
          ),

        targetMonth:
          monthlyQuestion.target_month,

        existingAnswer:
          existingAnswer?.answer_text ??
          null,
      },

      error: null,
    };
  } catch (error) {
    console.error(
      "月間質問準備エラー:",
      error,
    );

    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "今月の質問を準備できませんでした。",
    };
  }
}

/**
 * 今月の回答を登録する。
 */
export async function submitMonthlyAnswer(
  _previousState: SubmitAnswerState,
  formData: FormData,
): Promise<SubmitAnswerState> {
  const supabase =
    await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error:
        "ログイン情報を確認できませんでした。",
    };
  }

  const monthlyQuestionIdValue =
    formData.get(
      "monthlyQuestionId",
    );

  const answerValue =
    formData.get("answer");

  const monthlyQuestionId =
    Number(monthlyQuestionIdValue);

  if (
    !Number.isInteger(
      monthlyQuestionId,
    ) ||
    monthlyQuestionId <= 0
  ) {
    return {
      error:
        "質問情報が正しくありません。",
    };
  }

  if (
    typeof answerValue !== "string"
  ) {
    return {
      error:
        "回答を入力してください。",
    };
  }

  const answer =
    answerValue.trim();

  if (answer.length === 0) {
    return {
      error:
        "回答を入力してください。",
    };
  }

  if (answer.length > 200) {
    return {
      error:
        "回答は200文字以内で入力してください。",
    };
  }

  /*
   * 存在する今月の質問であることを確認する。
   * フォーム上のIDを書き換えられた場合の対策。
   */
  let monthlyQuestion: MonthlyQuestionRow;

  try {
    monthlyQuestion =
      await getOrCreateMonthlyQuestion();
  } catch (error) {
    console.error(
      "回答登録時の質問確認エラー:",
      error,
    );

    return {
      error:
        "今月の質問を確認できませんでした。",
    };
  }

  if (
    monthlyQuestion.id !==
    monthlyQuestionId
  ) {
    return {
      error:
        "現在の質問と回答先が一致しません。ページを再読み込みしてください。",
    };
  }

  const {
    data: existingAnswer,
    error: existingAnswerError,
  } = await supabase
    .from("petit_answers")
    .select("id")
    .eq("user_id", user.id)
    .eq(
      "monthly_question_id",
      monthlyQuestionId,
    )
    .maybeSingle();

  if (existingAnswerError) {
    console.error(
      "回答登録状況確認エラー:",
      existingAnswerError,
    );

    return {
      error:
        "回答状況を確認できませんでした。",
    };
  }

  if (existingAnswer) {
    return {
      error:
        "今月の質問にはすでに回答しています。",
    };
  }

  const { error: insertError } =
    await supabase
      .from("petit_answers")
      .insert({
        user_id: user.id,
        monthly_question_id:
          monthlyQuestionId,
        answer_text: answer,
      });

  if (insertError) {
    console.error(
      "月間質問回答登録エラー:",
      insertError,
    );

    return {
      error:
        "回答を登録できませんでした。",
    };
  }

  revalidatePath(
    "/monthly-question",
  );

  revalidatePath("/home");
  revalidatePath("/challenge");

  redirect("/home");
}