import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getCurrentMonthKey() {
  const parts = new Intl.DateTimeFormat(
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

type MonthlyQuestionRow = {
  id: number;
};

export async function requireMonthlyAnswer() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const currentMonth = getCurrentMonthKey();

  const {
    data: monthlyQuestion,
    error: monthlyQuestionError,
  } = await supabase
    .from("monthly_petit_questions")
    .select("id")
    .eq("target_month", currentMonth)
    .maybeSingle();

  if (monthlyQuestionError) {
    console.error(
      "今月の質問確認エラー:",
      monthlyQuestionError,
    );

    redirect("/monthly-question");
  }

  if (!monthlyQuestion) {
    redirect("/monthly-question");
  }

  const typedMonthlyQuestion =
    monthlyQuestion as MonthlyQuestionRow;

  const {
    data: answer,
    error: answerError,
  } = await supabase
    .from("petit_answers")
    .select("id")
    .eq("user_id", user.id)
    .eq(
      "monthly_question_id",
      typedMonthlyQuestion.id,
    )
    .maybeSingle();

  if (answerError) {
    console.error(
      "今月の回答確認エラー:",
      answerError,
    );

    redirect("/monthly-question");
  }

  if (!answer) {
    redirect("/monthly-question");
  }

  return user;
}