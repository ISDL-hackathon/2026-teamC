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

const STORAGE_KEY_PREFIX = "labVisitStampData";

export function getTodayString() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${date}`;
}

export function getCurrentMonthKey() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

export function getCurrentMonthText() {
  const now = new Date();

  return `${now.getMonth() + 1}月の記録`;
}

function getStorageKey(monthKey: string) {
  return `${STORAGE_KEY_PREFIX}:${monthKey}`;
}

function createInitialStampData(monthKey: string): StampData {
  return {
    monthKey,
    stampCount: 0,
    lastStampedDate: null,
  };
}

export function loadStampData(): StampData {
  const currentMonthKey = getCurrentMonthKey();

  if (typeof window === "undefined") {
    return createInitialStampData(currentMonthKey);
  }

  const storageKey = getStorageKey(currentMonthKey);
  const savedData = localStorage.getItem(storageKey);

  if (!savedData) {
    return createInitialStampData(currentMonthKey);
  }

  try {
    const parsedData = JSON.parse(savedData) as StampData;

    if (parsedData.monthKey !== currentMonthKey) {
      return createInitialStampData(currentMonthKey);
    }

    return parsedData;
  } catch {
    return createInitialStampData(currentMonthKey);
  }
}

export function saveStampData(stampData: StampData) {
  if (typeof window === "undefined") {
    return;
  }

  const storageKey = getStorageKey(stampData.monthKey);
  localStorage.setItem(storageKey, JSON.stringify(stampData));
}

export function addStamp(): AddStampResult {
  const today = getTodayString();
  const currentStampData = loadStampData();

  if (currentStampData.lastStampedDate === today) {
    return {
      success: false,
      message: "今日はすでにスタンプを獲得しています",
      stampData: currentStampData,
    };
  }

  if (currentStampData.stampCount >= MAX_STAMP_COUNT) {
    return {
      success: false,
      message: "今月のスタンプ上限に達しています",
      stampData: currentStampData,
    };
  }

  const nextStampData: StampData = {
    monthKey: currentStampData.monthKey,
    stampCount: currentStampData.stampCount + 1,
    lastStampedDate: today,
  };

  saveStampData(nextStampData);

  return {
    success: true,
    message: "スタンプを1つ獲得しました！",
    stampData: nextStampData,
  };
}