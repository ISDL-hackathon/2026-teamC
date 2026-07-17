export type StampData = {
  monthKey: string;
  stampCount: number;
  lastStampedDate: string | null;
};

export type AddStampResult = {
  success: boolean;
  message: string;
  stampData: StampData;
};

export const MAX_STAMP_COUNT = 15;

const STORAGE_KEY_PREFIX =
  "labVisitStampData";

/**
 * 今日の日付をYYYY-MM-DD形式で取得する
 */
export function getTodayString(): string {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1,
  ).padStart(2, "0");

  const date = String(
    now.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${date}`;
}

/**
 * 現在の年月をYYYY-MM形式で取得する
 */
export function getCurrentMonthKey(): string {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1,
  ).padStart(2, "0");

  return `${year}-${month}`;
}

/**
 * ポイント画面に表示する月の文字列
 */
export function getCurrentMonthText(): string {
  const now = new Date();

  return `${now.getMonth() + 1}月の記録`;
}

/**
 * 月ごとのlocalStorageキーを作る
 */
function getStorageKey(
  monthKey: string,
): string {
  return `${STORAGE_KEY_PREFIX}:${monthKey}`;
}

/**
 * 新しい月の初期データを作る
 */
function createInitialStampData(
  monthKey: string,
): StampData {
  return {
    monthKey,
    stampCount: 0,
    lastStampedDate: null,
  };
}

/**
 * 今月のスタンプ情報を読み込む
 */
export function loadStampData(): StampData {
  const currentMonthKey =
    getCurrentMonthKey();

  if (typeof window === "undefined") {
    return createInitialStampData(
      currentMonthKey,
    );
  }

  const storageKey =
    getStorageKey(currentMonthKey);

  const savedData =
    window.localStorage.getItem(
      storageKey,
    );

  if (!savedData) {
    return createInitialStampData(
      currentMonthKey,
    );
  }

  try {
    const parsedData =
      JSON.parse(savedData) as StampData;

    if (
      parsedData.monthKey !==
      currentMonthKey
    ) {
      return createInitialStampData(
        currentMonthKey,
      );
    }

    return {
      monthKey: parsedData.monthKey,
      stampCount:
        typeof parsedData.stampCount ===
        "number"
          ? parsedData.stampCount
          : 0,
      lastStampedDate:
        typeof parsedData.lastStampedDate ===
        "string"
          ? parsedData.lastStampedDate
          : null,
    };
  } catch {
    return createInitialStampData(
      currentMonthKey,
    );
  }
}

/**
 * スタンプ情報をlocalStorageへ保存する
 */
export function saveStampData(
  stampData: StampData,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const storageKey =
    getStorageKey(
      stampData.monthKey,
    );

  window.localStorage.setItem(
    storageKey,
    JSON.stringify(stampData),
  );
}

/**
 * 来室スタンプを1個追加する
 *
 * 同じ日には1回しか追加しない。
 * QRコード自体は何回読み取ってもよい。
 */
export function addStamp(): AddStampResult {
  const today =
    getTodayString();

  const currentStampData =
    loadStampData();

  /*
   * 今日すでにスタンプを取得していたら、
   * stampCountを増やさず現在のデータを返す。
   */
  if (
    currentStampData.lastStampedDate ===
    today
  ) {
    return {
      success: false,
      message:
        "本日の来室スタンプは獲得済みです。",
      stampData: currentStampData,
    };
  }

  /*
   * 月の上限に達していたら追加しない。
   */
  if (
    currentStampData.stampCount >=
    MAX_STAMP_COUNT
  ) {
    return {
      success: false,
      message:
        "今月のスタンプ上限に達しています。",
      stampData: currentStampData,
    };
  }

  /*
   * 今日まだ獲得していない場合だけ、
   * スタンプ数を1個増やす。
   */
  const nextStampData: StampData = {
    monthKey:
      currentStampData.monthKey,
    stampCount:
      currentStampData.stampCount + 1,
    lastStampedDate: today,
  };
  saveStampData(nextStampData);

  return {
    success: true,
    message:
      "来室スタンプを1個獲得しました！",
    stampData: nextStampData,
  };
}