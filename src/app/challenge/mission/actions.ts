"use server";

import { createClient } from "@/lib/supabase/server";

const TOTAL_STAMP_COUNT = 10;

type QuestionType =
  | "favorite_subject"
  | "favorite_color";

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

type MissionPageDataResult = {
  data?: {
    quiz: MissionQuiz;
    attempt: MissionAttempt | null;
    correctAnswer: string | null;
    stampCount: number;
    rewardQuestionText: string;
  };
  error?: string;
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

type SubmitMissionAnswerResult = {
  data?: {
    isCorrect: boolean;
    correctAnswer: string;
    stampCount: number;
    awardedPoints: number;
    petitReward: PetitReward | null;
    rewardError: string | null;
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
  real_name: string | null;
  nickname: string | null;
  selected_icon: string | null;
  avatar_url: string | null;
};

type MonthlyPetitQuestionRow = {
  id: number;
  target_month: string;
  question:
  | {
    question_text: string;
  }
  | {
    question_text: string;
  }[]
  | null;
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
 * 日本時間の今月の開始日と
 * 翌月開始日を取得する
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
      (part) =>
        part.type === "year",
    )?.value,
  );

  const month = Number(
    parts.find(
      (part) =>
        part.type === "month",
    )?.value,
  );

  const startDate =
    `${year}-${String(month).padStart(
      2,
      "0",
    )}-01`;

  const nextMonthDate =
    new Date(
      Date.UTC(
        year,
        month,
        1,
      ),
    );

  const nextYear =
    nextMonthDate.getUTCFullYear();

  const nextMonth =
    nextMonthDate.getUTCMonth() + 1;

  const endDate =
    `${nextYear}-${String(
      nextMonth,
    ).padStart(2, "0")}-01`;

  return {
    startDate,
    endDate,
  };
}

/**
 * 文字列から固定の数値を作る
 */
function createSeed(
  value: string,
) {
  let seed = 0;

  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    seed =
      (
        seed * 31 +
        value.charCodeAt(index)
      ) >>>
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

  let seed =
    createSeed(seedText);

  for (
    let index =
      shuffled.length - 1;
    index > 0;
    index -= 1
  ) {
    seed =
      (
        seed * 1664525 +
        1013904223
      ) >>>
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
    questionType ===
    "favorite_subject"
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
    questionType ===
    "favorite_subject"
  ) {
    return `${nickname}の好きな教科は？`;
  }

  return `${nickname}の好きな色は？`;
}

function getProfileIcon(
  profile:
    | ProfileRow
    | undefined,
) {
  if (profile?.avatar_url) {
    return profile.avatar_url;
  }

  return (
    profile?.selected_icon ??
    "👤"
  );
}

/**
 * 今月のプチ質問の文字列を取得する
 */
function getMonthlyPetitQuestionText(
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
      "今月のプチ情報"
    );
  }

  return (
    question?.question_text ??
    "今月のプチ情報"
  );
}

/**
 * クイズの選択肢を4つ作る
 */
function createQuizOptions(
  missionProfiles:
    MissionProfileRow[],
  targetProfile:
    MissionProfileRow,
  questionType:
    QuestionType,
  seedText: string,
) {
  const correctAnswer =
    questionType ===
      "favorite_subject"
      ? targetProfile
        .favorite_subject
      : targetProfile
        .favorite_color;

  const answersFromMembers =
    missionProfiles.map(
      (profile) =>
        questionType ===
          "favorite_subject"
          ? profile
            .favorite_subject
          : profile
            .favorite_color,
    );

  const candidateOptions = [
    ...answersFromMembers,
    ...getFallbackOptions(
      questionType,
    ),
  ]
    .map((option) =>
      option.trim(),
    )
    .filter(Boolean);

  const uniqueOptions =
    Array.from(
      new Set(candidateOptions),
    ).filter(
      (option) =>
        option !==
        correctAnswer,
    );

  const shuffledWrongOptions =
    shuffleWithSeed(
      uniqueOptions,
      `${seedText}-wrong-options`,
    );

  const options = [
    correctAnswer,
    ...shuffledWrongOptions.slice(
      0,
      3,
    ),
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
  const supabase =
    await createClient();

  const {
    startDate,
    endDate,
  } = getJapanMonthRange();

  const {
    count,
    error,
  } = await supabase
    .from(
      "mission_quiz_attempts",
    )
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("user_id", userId)
    .eq("is_correct", true)
    .gte(
      "quiz_date",
      startDate,
    )
    .lt(
      "quiz_date",
      endDate,
    );

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

  const todayKey =
    getJapanDateKey();

  /*
   * 今月のプチ質問を取得する
   */
  const {
    startDate:
    currentMonthKey,
  } = getJapanMonthRange();

  const {
    data:
    monthlyPetitQuestionData,
    error:
    monthlyPetitQuestionError,
  } = await supabase
    .from(
      "monthly_petit_questions",
    )
    .select(`
      id,
      target_month,
      question:petit_questions!question_id (
        question_text
      )
    `)
    .eq(
      "target_month",
      currentMonthKey,
    )
    .maybeSingle();

  if (
    monthlyPetitQuestionError
  ) {
    console.error(
      "今月のプチ質問取得エラー:",
      monthlyPetitQuestionError,
    );

    return {
      error:
        "今月のプチ質問を取得できませんでした。",
    };
  }

  if (
    !monthlyPetitQuestionData
  ) {
    return {
      error:
        "今月のプチ質問がまだ設定されていません。",
    };
  }

  const monthlyPetitQuestion =
    monthlyPetitQuestionData as
    MonthlyPetitQuestionRow;

  const rewardQuestionText =
    getMonthlyPetitQuestionText(
      monthlyPetitQuestion.question,
    );

  /*
   * 自分以外のミッション用プロフィールを取得
   */
  const {
    data: missionProfiles,
    error:
    missionProfilesError,
  } = await supabase
    .from("mission_profiles")
    .select(`
      user_id,
      favorite_subject,
      favorite_color
    `)
    .neq(
      "user_id",
      user.id,
    )
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
    missionProfiles as
    MissionProfileRow[];

  /*
   * 今日の回答履歴を確認
   */
  const {
    data: todayAttempt,
    error: attemptError,
  } = await supabase
    .from(
      "mission_quiz_attempts",
    )
    .select(`
      target_user_id,
      question_type,
      selected_answer,
      is_correct
    `)
    .eq(
      "user_id",
      user.id,
    )
    .eq(
      "quiz_date",
      todayKey,
    )
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

  let questionType:
    QuestionType;

  if (todayAttempt) {
    targetProfile =
      typedMissionProfiles.find(
        (profile) =>
          profile.user_id ===
          todayAttempt
            .target_user_id,
      );

    questionType =
      todayAttempt
        .question_type as
      QuestionType;
  } else {
    const targetIndex =
      createSeed(
        `${user.id}-${todayKey}-target`,
      ) %
      typedMissionProfiles.length;

    targetProfile =
      typedMissionProfiles[
      targetIndex
      ];

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

  /*
   * クイズ対象ユーザーの表示情報を取得
   */
  const {
    data:
    targetUserProfile,
    error:
    targetUserProfileError,
  } = await supabase
    .from("profiles")
    .select(`
      id,
      real_name,
      nickname,
      selected_icon,
      avatar_url
    `)
    .eq(
      "id",
      targetProfile.user_id,
    )
    .maybeSingle();

  if (
    targetUserProfileError
  ) {
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
    targetUserProfile as
    ProfileRow | null;

  const targetRealName =
    profile?.real_name
      ?.trim() ||
    "名前未設定";

  const targetNickname =
    profile?.nickname
      ?.trim() ||
    "研究室メンバー";

  const correctAnswer =
    questionType ===
      "favorite_subject"
      ? targetProfile
        .favorite_subject
      : targetProfile
        .favorite_color;

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

        targetRealName,

        targetNickname,

        targetIcon:
          getProfileIcon(
            profile ??
            undefined,
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
            todayAttempt
              .is_correct,
        }
        : null,

      correctAnswer:
        todayAttempt
          ? correctAnswer
          : null,

      stampCount,

      rewardQuestionText,
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

  if (
    !selectedAnswer.trim()
  ) {
    return {
      error:
        "回答を選択してください。",
    };
  }

  if (
    targetUserId === user.id
  ) {
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

  const todayKey =
    getJapanDateKey();

  /*
   * 今日すでに回答済みか確認
   */
  const {
    data: existingAttempt,
    error:
    existingAttemptError,
  } = await supabase
    .from(
      "mission_quiz_attempts",
    )
    .select("id")
    .eq(
      "user_id",
      user.id,
    )
    .eq(
      "quiz_date",
      todayKey,
    )
    .maybeSingle();

  if (
    existingAttemptError
  ) {
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

  /*
   * クイズ対象の正解を取得
   */
  const {
    data: targetProfile,
    error:
    targetProfileError,
  } = await supabase
    .from("mission_profiles")
    .select(`
      favorite_subject,
      favorite_color
    `)
    .eq(
      "user_id",
      targetUserId,
    )
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
    questionType ===
      "favorite_subject"
      ? targetProfile
        .favorite_subject
      : targetProfile
        .favorite_color;

  const isCorrect =
    selectedAnswer.trim() ===
    correctAnswer.trim();

  /*
   * 回答履歴を保存
   */
  const {
    error: insertError,
  } = await supabase
    .from(
      "mission_quiz_attempts",
    )
    .insert({
      user_id:
        user.id,

      target_user_id:
        targetUserId,

      quiz_date:
        todayKey,

      question_type:
        questionType,

      selected_answer:
        selectedAnswer.trim(),

      is_correct:
        isCorrect,
    });

  if (insertError) {
    console.error(
      "クイズ回答保存エラー:",
      insertError,
    );

    if (
      insertError.code ===
      "23505"
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

  let awardedPoints = 0;

  /*
   * 正解時だけポイントを付与
   */
  if (isCorrect) {
    const {
      data: quizPoints,
      error: pointError,
    } = await supabase.rpc(
      "award_quiz_points",
      {
        target_quiz_date:
          todayKey,
      },
    );

    if (pointError) {
      console.error(
        "クイズポイント付与エラー:",
        pointError,
      );
    } else if (
      typeof quizPoints ===
      "number"
    ) {
      awardedPoints =
        quizPoints;
    }
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

  let petitReward: PetitReward | null =
    null;

  let rewardError: string | null =
    null;

  if (
    isCorrect &&
    stampCount === TOTAL_STAMP_COUNT
  ) {
    const {
      data: rewardData,
      error: rewardRpcError,
    } = await supabase.rpc(
      "receive_monthly_petit_reward",
    );

    if (rewardRpcError) {
      console.error(
        "プチ情報報酬獲得エラー:",
        rewardRpcError,
      );

      rewardError =
        rewardRpcError.message ||
        "プチ情報を取得できませんでした。";
    } else if (
      rewardData &&
      rewardData.length > 0
    ) {
      const reward =
        rewardData[0];

      petitReward = {
        rewardId:
          reward.reward_id,

        sourceAnswerId:
          reward.source_answer_id,

        sourceUserId:
          reward.source_user_id,

        sourceNickname:
          reward.source_nickname ??
          "研究室メンバー",

        sourceRealName:
          reward.source_real_name ??
          "名前未設定",

        sourceSelectedIcon:
          reward.source_selected_icon,

        sourceAvatarUrl:
          reward.source_avatar_url,

        questionText:
          reward.question_text,

        answerText:
          reward.answer_text,

        receivedAt:
          reward.received_at,
      };
    }
  }

  return {
    data: {
      isCorrect,
      correctAnswer,
      stampCount,
      awardedPoints,
      petitReward,
      rewardError,
    },
  };
}