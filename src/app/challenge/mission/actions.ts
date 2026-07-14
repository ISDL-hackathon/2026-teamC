"use server";

import { createClient } from "@/lib/supabase/server";

const TOTAL_STAMP_COUNT = 10;

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

type MissionPageDataResult = {
  data?: {
    quiz: MissionQuiz;
    attempt: MissionAttempt | null;
    correctAnswer: string | null;
    stampCount: number;
  };
  error?: string;
};

type SubmitMissionAnswerResult = {
  data?: {
    isCorrect: boolean;
    correctAnswer: string;
    stampCount: number;
  };
  error?: string;
};

type MissionProfileRow = {
  user_id: string;
  favorite_subject: string;
  favorite_color: string;
};

type ProfileRow = {
  id: string;
  nickname: string | null;
  selected_icon: string | null;
  avatar_url: string | null;
};

/**
 * 日本時間の今日をYYYY-MM-DDで取得する
 */
function getJapanDateKey() {
  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  ).format(new Date());
}

/**
 * 日本時間の今月の開始日と翌月開始日を取得する
 */
function getJapanMonthRange() {
  const parts =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "numeric",
      },
    ).formatToParts(new Date());

  const year = Number(
    parts.find(
      (part) => part.type === "year",
    )?.value,
  );

  const month = Number(
    parts.find(
      (part) => part.type === "month",
    )?.value,
  );

  const startDate =
    `${year}-${String(month).padStart(2, "0")}-01`;

  const nextMonthDate = new Date(
    Date.UTC(year, month, 1),
  );

  const nextYear =
    nextMonthDate.getUTCFullYear();

  const nextMonth =
    nextMonthDate.getUTCMonth() + 1;

  const endDate =
    `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

  return {
    startDate,
    endDate,
  };
}

/**
 * 文字列から固定の数値を作る
 */
function createSeed(value: string) {
  let seed = 0;

  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    seed =
      (seed * 31 +
        value.charCodeAt(index)) >>>
      0;
  }

  return seed;
}

/**
 * 日付とユーザーが同じなら
 * 同じ並びになるようにシャッフルする
 */
function shuffleWithSeed<T>(
  values: T[],
  seedText: string,
) {
  const shuffled = [...values];
  let seed = createSeed(seedText);

  for (
    let index = shuffled.length - 1;
    index > 0;
    index -= 1
  ) {
    seed =
      (seed * 1664525 + 1013904223) >>>
      0;

    const randomIndex =
      seed % (index + 1);

    [
      shuffled[index],
      shuffled[randomIndex],
    ] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

function getFallbackOptions(
  questionType: QuestionType,
) {
  if (
    questionType === "favorite_subject"
  ) {
    return [
      "数学",
      "英語",
      "国語",
      "体育",
      "理科",
      "社会",
      "情報",
      "音楽",
    ];
  }

  return [
    "赤",
    "青",
    "緑",
    "黒",
    "白",
    "黄色",
    "紫",
    "ピンク",
  ];
}

function getQuestionText(
  nickname: string,
  questionType: QuestionType,
) {
  if (
    questionType === "favorite_subject"
  ) {
    return `${nickname}の好きな教科は？`;
  }

  return `${nickname}の好きな色は？`;
}

function getProfileIcon(
  profile: ProfileRow | undefined,
) {
  if (profile?.avatar_url) {
    return profile.avatar_url;
  }

  return profile?.selected_icon ?? "👤";
}

/**
 * クイズの選択肢を4つ作る
 */
function createQuizOptions(
  missionProfiles: MissionProfileRow[],
  targetProfile: MissionProfileRow,
  questionType: QuestionType,
  seedText: string,
) {
  const correctAnswer =
    questionType === "favorite_subject"
      ? targetProfile.favorite_subject
      : targetProfile.favorite_color;

  const answersFromMembers =
    missionProfiles.map((profile) =>
      questionType === "favorite_subject"
        ? profile.favorite_subject
        : profile.favorite_color,
    );

  const candidateOptions = [
    ...answersFromMembers,
    ...getFallbackOptions(questionType),
  ]
    .map((option) => option.trim())
    .filter(Boolean);

  const uniqueOptions = Array.from(
    new Set(candidateOptions),
  ).filter(
    (option) => option !== correctAnswer,
  );

  const shuffledWrongOptions =
    shuffleWithSeed(
      uniqueOptions,
      `${seedText}-wrong-options`,
    );

  const options = [
    correctAnswer,
    ...shuffledWrongOptions.slice(0, 3),
  ];

  return shuffleWithSeed(
    options,
    `${seedText}-option-order`,
  );
}

/**
 * 今月の正解数を取得する
 */
async function getMonthlyStampCount(
  userId: string,
) {
  const supabase = await createClient();

  const {
    startDate,
    endDate,
  } = getJapanMonthRange();

  const {
    count,
    error,
  } = await supabase
    .from("mission_quiz_attempts")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("user_id", userId)
    .eq("is_correct", true)
    .gte("quiz_date", startDate)
    .lt("quiz_date", endDate);

  if (error) {
    console.error(
      "ミッションスタンプ取得エラー:",
      error,
    );

    throw new Error(
      "スタンプ数を取得できませんでした。",
    );
  }

  return Math.min(
    count ?? 0,
    TOTAL_STAMP_COUNT,
  );
}

/**
 * ミッション画面の初期データを取得する
 */
export async function getMissionPageData():
Promise<MissionPageDataResult> {
  const supabase = await createClient();

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

  const todayKey = getJapanDateKey();

  const {
    data: missionProfiles,
    error: missionProfilesError,
  } = await supabase
    .from("mission_profiles")
    .select(`
      user_id,
      favorite_subject,
      favorite_color
    `)
    .neq("user_id", user.id)
    .order("user_id");

  if (missionProfilesError) {
    console.error(
      "ミッションプロフィール取得エラー:",
      missionProfilesError,
    );

    return {
      error:
        "クイズ情報を取得できませんでした。",
    };
  }

  if (
    !missionProfiles ||
    missionProfiles.length === 0
  ) {
    return {
      error:
        "クイズを作成できるメンバーがまだいません。",
    };
  }

  const typedMissionProfiles =
    missionProfiles as MissionProfileRow[];

  const {
    data: todayAttempt,
    error: attemptError,
  } = await supabase
    .from("mission_quiz_attempts")
    .select(`
      target_user_id,
      question_type,
      selected_answer,
      is_correct
    `)
    .eq("user_id", user.id)
    .eq("quiz_date", todayKey)
    .maybeSingle();

  if (attemptError) {
    console.error(
      "本日の回答取得エラー:",
      attemptError,
    );

    return {
      error:
        "今日の回答状況を取得できませんでした。",
    };
  }

  let targetProfile:
    | MissionProfileRow
    | undefined;

  let questionType: QuestionType;

  if (todayAttempt) {
    targetProfile =
      typedMissionProfiles.find(
        (profile) =>
          profile.user_id ===
          todayAttempt.target_user_id,
      );

    questionType =
      todayAttempt
        .question_type as QuestionType;
  } else {
    const targetIndex =
      createSeed(
        `${user.id}-${todayKey}-target`,
      ) %
      typedMissionProfiles.length;

    targetProfile =
      typedMissionProfiles[targetIndex];

    const questionSeed =
      createSeed(
        `${user.id}-${todayKey}-question`,
      );

    questionType =
      questionSeed % 2 === 0
        ? "favorite_subject"
        : "favorite_color";
  }

  if (!targetProfile) {
    return {
      error:
        "クイズ対象のプロフィールが見つかりませんでした。",
    };
  }

  const {
    data: targetUserProfile,
    error: targetUserProfileError,
  } = await supabase
    .from("profiles")
    .select(`
      id,
      nickname,
      selected_icon,
      avatar_url
    `)
    .eq("id", targetProfile.user_id)
    .maybeSingle();

  if (targetUserProfileError) {
    console.error(
      "対象プロフィール取得エラー:",
      targetUserProfileError,
    );

    return {
      error:
        "クイズ対象の情報を取得できませんでした。",
    };
  }

  const profile =
    targetUserProfile as ProfileRow | null;

  const targetNickname =
    profile?.nickname?.trim() ||
    "研究室メンバー";

  const correctAnswer =
    questionType === "favorite_subject"
      ? targetProfile.favorite_subject
      : targetProfile.favorite_color;

  const options =
    createQuizOptions(
      typedMissionProfiles,
      targetProfile,
      questionType,
      `${user.id}-${todayKey}-${targetProfile.user_id}-${questionType}`,
    );

  let stampCount = 0;

  try {
    stampCount =
      await getMonthlyStampCount(
        user.id,
      );
  } catch (error) {
    console.error(error);

    return {
      error:
        "スタンプ数を取得できませんでした。",
    };
  }

  return {
    data: {
      quiz: {
        targetUserId:
          targetProfile.user_id,
        targetNickname,
        targetIcon:
          getProfileIcon(
            profile ?? undefined,
          ),
        questionType,
        question:
          getQuestionText(
            targetNickname,
            questionType,
          ),
        options,
      },
      attempt: todayAttempt
        ? {
            selectedAnswer:
              todayAttempt
                .selected_answer,
            isCorrect:
              todayAttempt.is_correct,
          }
        : null,
      correctAnswer: todayAttempt
        ? correctAnswer
        : null,
      stampCount,
    },
  };
}

/**
 * クイズの回答を保存する
 */
export async function submitMissionAnswer(
  targetUserId: string,
  questionType: QuestionType,
  selectedAnswer: string,
): Promise<SubmitMissionAnswerResult> {
  const supabase = await createClient();

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

  if (
    !selectedAnswer.trim()
  ) {
    return {
      error:
        "回答を選択してください。",
    };
  }

  if (targetUserId === user.id) {
    return {
      error:
        "自分自身のクイズには回答できません。",
    };
  }

  if (
    questionType !==
      "favorite_subject" &&
    questionType !==
      "favorite_color"
  ) {
    return {
      error:
        "問題の種類が正しくありません。",
    };
  }

  const todayKey = getJapanDateKey();

  const {
    data: existingAttempt,
    error: existingAttemptError,
  } = await supabase
    .from("mission_quiz_attempts")
    .select("id")
    .eq("user_id", user.id)
    .eq("quiz_date", todayKey)
    .maybeSingle();

  if (existingAttemptError) {
    console.error(
      "回答済み確認エラー:",
      existingAttemptError,
    );

    return {
      error:
        "回答状況を確認できませんでした。",
    };
  }

  if (existingAttempt) {
    return {
      error:
        "今日のクイズにはすでに回答済みです。",
    };
  }

  const {
    data: targetProfile,
    error: targetProfileError,
  } = await supabase
    .from("mission_profiles")
    .select(`
      favorite_subject,
      favorite_color
    `)
    .eq("user_id", targetUserId)
    .maybeSingle();

  if (
    targetProfileError ||
    !targetProfile
  ) {
    console.error(
      "正解取得エラー:",
      targetProfileError,
    );

    return {
      error:
        "クイズの正解を確認できませんでした。",
    };
  }

  const correctAnswer =
    questionType === "favorite_subject"
      ? targetProfile.favorite_subject
      : targetProfile.favorite_color;

  const isCorrect =
    selectedAnswer.trim() ===
    correctAnswer.trim();

  const { error: insertError } =
    await supabase
      .from("mission_quiz_attempts")
      .insert({
        user_id: user.id,
        target_user_id:
          targetUserId,
        quiz_date: todayKey,
        question_type:
          questionType,
        selected_answer:
          selectedAnswer.trim(),
        is_correct: isCorrect,
      });

  if (insertError) {
    console.error(
      "クイズ回答保存エラー:",
      insertError,
    );

    if (
      insertError.code === "23505"
    ) {
      return {
        error:
          "今日のクイズにはすでに回答済みです。",
      };
    }

    return {
      error:
        "クイズの回答を保存できませんでした。",
    };
  }

  let stampCount = 0;

  try {
    stampCount =
      await getMonthlyStampCount(
        user.id,
      );
  } catch (error) {
    console.error(error);

    return {
      error:
        "回答は保存されましたが、スタンプ数を取得できませんでした。",
    };
  }

  return {
    data: {
      isCorrect,
      correctAnswer,
      stampCount,
    },
  };
}