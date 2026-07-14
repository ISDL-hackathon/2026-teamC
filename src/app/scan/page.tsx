"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  addStamp,
  getTodayString,
  loadStampData,
  MAX_STAMP_COUNT,
} from "@/lib/stamp";
import Header from "../Header/Header";
import BottomNav from "../BottomNav/BottomNav";
import { enterLab } from "./actions";
import "./scan.css";

type ResultStatus = "waiting" | "success" | "error";

type CameraStatus =
  | "idle"
  | "starting"
  | "active"
  | "error";

type ScanResult = {
  status: ResultStatus;
  title: string;
  description: string;
};

type CameraDevice = {
  id: string;
  label: string;
};

type Html5QrcodeInstance = {
  start: (
    cameraConfig:
      | string
      | {
          facingMode: {
            ideal: string;
          };
        },
    configuration: {
      fps: number;
      qrbox: {
        width: number;
        height: number;
      };
      aspectRatio?: number;
    },
    qrCodeSuccessCallback: (
      decodedText: string,
    ) => void,
    qrCodeErrorCallback?: () => void,
  ) => Promise<null>;

  stop: () => Promise<void>;
  clear: () => void;
  pause: (shouldPauseVideo?: boolean) => void;

  getRunningTrackCapabilities?: () =>
    MediaTrackCapabilities & {
      torch?: boolean;
    };

  applyVideoConstraints?: (
    constraints: MediaTrackConstraints,
  ) => Promise<void>;
};

type Html5QrcodeConstructor = {
  new (
    elementId: string,
  ): Html5QrcodeInstance;

  getCameras: () => Promise<CameraDevice[]>;
};

type TorchConstraint =
  MediaTrackConstraintSet & {
    torch?: boolean;
  };

const QR_READER_ID = "qr-reader";
const VALID_QR_CODE = "ISDL_CHECKIN";

const SCAN_GUIDE_STORAGE_KEY =
  "hasSeenScanGuide";

const WAITING_RESULT: ScanResult = {
  status: "waiting",
  title: "読み取り結果がここに表示されます",
  description:
    "QRコードをカメラの枠内に合わせてください。",
};

function isValidQrCode(
  decodedText: string,
): boolean {
  const normalizedText =
    decodedText.trim();

  return (
    normalizedText === VALID_QR_CODE ||
    normalizedText.startsWith(
      `${VALID_QR_CODE}:`,
    )
  );
}

function getCameraErrorDescription(
  error: unknown,
): string {
  const errorMessage =
    error instanceof Error
      ? error.message
      : String(error);

  if (
    errorMessage.includes(
      "NotAllowedError",
    ) ||
    errorMessage.includes("Permission")
  ) {
    return "ブラウザまたはWindowsの設定でカメラの使用を許可してください。";
  }

  if (
    errorMessage.includes(
      "NotFoundError",
    ) ||
    errorMessage.includes(
      "DevicesNotFoundError",
    ) ||
    errorMessage.includes(
      "使用できるカメラ",
    )
  ) {
    return "使用できるカメラが見つかりませんでした。";
  }

  if (
    errorMessage.includes(
      "NotReadableError",
    ) ||
    errorMessage.includes(
      "TrackStartError",
    ) ||
    errorMessage.includes(
      "Could not start video source",
    )
  ) {
    return "ほかのアプリがカメラを使用していないか確認してください。";
  }

  if (
    errorMessage.includes(
      "NotSupportedError",
    ) ||
    errorMessage.includes(
      "Only secure origins are allowed",
    )
  ) {
    return "カメラ機能はlocalhostまたはHTTPSのページでのみ使用できます。";
  }

  return "カメラの状態を確認して、もう一度お試しください。";
}

function FlashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M13.4 2 5.7 13h5.4L10 22l8.4-12h-5.7L13.4 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ReloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M19.4 8.2A8 8 0 1 0 20 15"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />

      <path
        d="M19.5 3.5v5.2h-5.2"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function ScanPage() {
  const scannerRef =
    useRef<Html5QrcodeInstance | null>(
      null,
    );

  const scannerVersionRef = useRef(0);

  const hasHandledResultRef =
    useRef(false);

  const [showGuide, setShowGuide] =
    useState(false);

  const [
    isGuideChecked,
    setIsGuideChecked,
  ] = useState(false);

  const [
    cameraStatus,
    setCameraStatus,
  ] =
    useState<CameraStatus>("idle");

  const [result, setResult] =
    useState<ScanResult>(
      WAITING_RESULT,
    );

  const [
    scannedText,
    setScannedText,
  ] = useState("");

  const [
    torchSupported,
    setTorchSupported,
  ] = useState(false);

  const [
    torchEnabled,
    setTorchEnabled,
  ] = useState(false);

  const [
    isRestarting,
    setIsRestarting,
  ] = useState(false);

  const stopScanner =
    useCallback(async () => {
      scannerVersionRef.current += 1;

      const scanner =
        scannerRef.current;

      scannerRef.current = null;

      setTorchEnabled(false);
      setTorchSupported(false);

      if (scanner) {
        try {
          await scanner.stop();
        } catch {
          // カメラ開始前、または停止済みの場合は何もしない
        }

        try {
          scanner.clear();
        } catch {
          // 表示領域がすでに空の場合は何もしない
        }
      }

      const readerElement =
        document.getElementById(
          QR_READER_ID,
        );

      readerElement?.replaceChildren();
    }, []);

  const startScanner =
    useCallback(async () => {
      const currentStampData =
        loadStampData();

      const today =
        getTodayString();

      /*
       * すでに本日のスタンプを取得している場合は、
       * カメラを起動しない。
       */
      if (
        currentStampData.lastStampedDate ===
        today
      ) {
        setCameraStatus("idle");
        setScannedText("");

        setResult({
          status: "success",
          title:
            "本日はスキャン済みです",
          description: `今月の来室スタンプは${currentStampData.stampCount}個です。明日またスキャンできます。`,
        });

        return;
      }

      /*
       * 今月のスタンプ数が上限に達している場合も、
       * カメラを起動しない。
       */
      if (
        currentStampData.stampCount >=
        MAX_STAMP_COUNT
      ) {
        setCameraStatus("idle");
        setScannedText("");

        setResult({
          status: "success",
          title:
            "今月のスタンプ上限に達しています",
          description:
            "今月は15スタンプまで獲得できます。来月になると新しいカードになります。",
        });

        return;
      }

      const currentVersion =
        scannerVersionRef.current + 1;

      scannerVersionRef.current =
        currentVersion;

      hasHandledResultRef.current =
        false;

      setCameraStatus("starting");
      setResult(WAITING_RESULT);
      setScannedText("");
      setTorchEnabled(false);
      setTorchSupported(false);

      try {
        const html5QrcodeModule =
          await import(
            "html5-qrcode"
          );

        const Html5Qrcode =
          html5QrcodeModule.Html5Qrcode as unknown as Html5QrcodeConstructor;

        if (
          currentVersion !==
          scannerVersionRef.current
        ) {
          return;
        }

        const readerElement =
          document.getElementById(
            QR_READER_ID,
          );

        if (!readerElement) {
          throw new Error(
            "QRコード読み取り領域が見つかりません。",
          );
        }

        readerElement.replaceChildren();

        const cameras =
          await Html5Qrcode.getCameras();

        if (
          cameras.length === 0
        ) {
          throw new Error(
            "使用できるカメラが見つかりませんでした。",
          );
        }

        const selectedCamera =
          cameras.find(
            (camera) => {
              const cameraLabel =
                camera.label.toLowerCase();

              return (
                cameraLabel.includes(
                  "back",
                ) ||
                cameraLabel.includes(
                  "rear",
                ) ||
                cameraLabel.includes(
                  "environment",
                )
              );
            },
          ) ?? cameras[0];

        const scanner =
          new Html5Qrcode(
            QR_READER_ID,
          );

        scannerRef.current =
          scanner;

        await scanner.start(
          selectedCamera.id,
          {
            fps: 10,
            qrbox: {
              width: 230,
              height: 230,
            },
            aspectRatio: 1,
          },
          (
            decodedText: string,
          ) => {
            if (
              currentVersion !==
                scannerVersionRef.current ||
              hasHandledResultRef.current
            ) {
              return;
            }

            hasHandledResultRef.current =
              true;

            setScannedText(
              decodedText,
            );

            try {
              scanner.pause(true);
            } catch {
              // pauseできない場合は何もしない
            }

            /*
             * 研究室用の正しいQRコードの場合
             */
            if (
              isValidQrCode(
                decodedText,
              )
            ) {
              void enterLab().then(
                async (
                  attendanceResult,
                ) => {
                  if (
                    !attendanceResult.success
                  ) {
                    setResult({
                      status: "error",
                      title:
                        "入室登録できませんでした",
                      description:
                        attendanceResult.message,
                    });

                    setCameraStatus(
                      "idle",
                    );

                    await stopScanner();

                    return;
                  }

                  const stampResult =
                    addStamp();

                  if (
                    stampResult.success
                  ) {
                    setResult({
                      status:
                        "success",
                      title:
                        "チェックイン完了！",
                      description: `研究室への入室を記録しました。今月の来室スタンプは${stampResult.stampData.stampCount}個目です。`,
                    });
                  } else {
                    setResult({
                      status:
                        "success",
                      title:
                        "入室を記録しました",
                      description:
                        stampResult.message,
                    });
                  }

                  setCameraStatus(
                    "idle",
                  );

                  await stopScanner();
                },
              );

              return;
            }

            /*
             * 研究室用ではないQRコードの場合
             */
            setResult({
              status: "error",
              title:
                "読み取りに失敗しました",
              description:
                "このQRコードはチェックイン用ではありません。再読み込みして、正しいQRコードを読み取ってください。",
            });

            setCameraStatus("idle");

            void stopScanner();
          },
          () => {
            // QRコードが映っていないだけの場合は失敗扱いにしない
          },
        );

        if (
          currentVersion !==
          scannerVersionRef.current
        ) {
          await stopScanner();

          return;
        }

        setCameraStatus("active");

        try {
          const capabilities =
            scanner.getRunningTrackCapabilities?.();

          setTorchSupported(
            capabilities?.torch ===
              true,
          );
        } catch {
          setTorchSupported(false);
        }
      } catch (error) {
        console.error(
          "Camera start error:",
          error,
        );

        if (
          currentVersion !==
          scannerVersionRef.current
        ) {
          return;
        }

        scannerRef.current = null;

        setCameraStatus("error");

        setResult({
          status: "error",
          title:
            "カメラを起動できませんでした",
          description:
            getCameraErrorDescription(
              error,
            ),
        });
      }
    }, [stopScanner]);

  useEffect(() => {
    const hasSeenGuide =
      window.localStorage.getItem(
        SCAN_GUIDE_STORAGE_KEY,
      ) === "true";

    setShowGuide(
      !hasSeenGuide,
    );

    setIsGuideChecked(true);
  }, []);

  useEffect(() => {
    if (
      !isGuideChecked ||
      showGuide
    ) {
      return;
    }

    void startScanner();

    return () => {
      void stopScanner();
    };
  }, [
    isGuideChecked,
    showGuide,
    startScanner,
    stopScanner,
  ]);

  const handleStartFromGuide =
    () => {
      window.localStorage.setItem(
        SCAN_GUIDE_STORAGE_KEY,
        "true",
      );

      setShowGuide(false);
    };

  const handleRestart =
    async () => {
      if (isRestarting) {
        return;
      }

      setIsRestarting(true);

      try {
        await stopScanner();
        await startScanner();
      } finally {
        setIsRestarting(false);
      }
    };

  const handleTorch =
    async () => {
      const scanner =
        scannerRef.current;

      if (
        !scanner ||
        !torchSupported ||
        !scanner.applyVideoConstraints
      ) {
        return;
      }

      const nextTorchState =
        !torchEnabled;

      try {
        const torchConstraint: TorchConstraint =
          {
            torch:
              nextTorchState,
          };

        await scanner.applyVideoConstraints(
          {
            advanced: [
              torchConstraint,
            ],
          },
        );

        setTorchEnabled(
          nextTorchState,
        );
      } catch {
        setResult({
          status: "error",
          title:
            "フラッシュを切り替えられませんでした",
          description:
            "この端末ではフラッシュを使用できない可能性があります。",
        });
      }
    };

  const resultEmoji =
    result.status === "success"
      ? "😊"
      : result.status === "error"
        ? "😭"
        : "📷";

  const scannerGuideText =
    result.status === "success"
      ? "読み取りが完了しました"
      : result.status === "error"
        ? "再読み込みボタンを押してください"
        : "QRコードを枠の中央に合わせてください";

  const cameraStatusTitle =
    result.status === "success" &&
    cameraStatus === "idle"
      ? "本日の読み取りは完了しています"
      : cameraStatus === "active"
        ? "カメラを使用しています"
        : cameraStatus === "error"
          ? "カメラを使用できません"
          : cameraStatus ===
              "idle"
            ? "カメラを開始していません"
            : "カメラを起動しています";

  const cameraStatusDescription =
    result.status === "success" &&
    cameraStatus === "idle"
      ? "スタンプの獲得状況を確認してください"
      : cameraStatus === "active"
        ? "QRコードを自動で読み取ります"
        : cameraStatus === "error"
          ? "カメラの権限と接続状態を確認してください"
          : cameraStatus ===
              "idle"
            ? "再読み込みボタンから読み取りを開始できます"
            : "カメラの使用許可を確認しています";

  return (
    <div className="scan-page">
      <Header />

      <main className="scan-main">
        <section className="scan-title-section">
          <p className="english-label">
            QR SCANNER
          </p>

          <h1>
            QRコードを読み取る
          </h1>

          <p className="scan-description">
            研究室に設置されたQRコードを
            <br />
            カメラの枠内に合わせてください。
          </p>
        </section>

        <section className="scanner-card">
          <div className="scanner-preview">
            <div
              id={QR_READER_ID}
              className="qr-reader"
            />

            {(showGuide ||
              cameraStatus ===
                "starting" ||
              cameraStatus ===
                "error") && (
              <div className="camera-overlay-message">
                {cameraStatus !==
                  "error" && (
                  <span
                    className="camera-overlay-spinner"
                    aria-hidden="true"
                  />
                )}

                <p>
                  {showGuide
                    ? "カメラを使う前に確認してください"
                    : cameraStatusTitle}
                </p>
              </div>
            )}

            <div
              className={`scan-line ${
                result.status ===
                  "waiting" &&
                cameraStatus ===
                  "active"
                  ? "scan-line-active"
                  : ""
              }`}
            />

            <span className="scan-corner top-left" />
            <span className="scan-corner top-right" />
            <span className="scan-corner bottom-left" />
            <span className="scan-corner bottom-right" />

            <p className="scanner-guide">
              {scannerGuideText}
            </p>

            <div className="scanner-button-area">
              <button
                type="button"
                className={`scanner-circle-button flash-button ${
                  torchEnabled
                    ? "scanner-circle-button-active"
                    : ""
                }`}
                aria-label={
                  torchEnabled
                    ? "フラッシュを消す"
                    : "フラッシュをつける"
                }
                disabled={
                  !torchSupported ||
                  cameraStatus !==
                    "active"
                }
                onClick={() => {
                  void handleTorch();
                }}
              >
                <FlashIcon />
              </button>

              <button
                type="button"
                className="scanner-circle-button"
                aria-label="読み取りをやり直す"
                disabled={
                  isRestarting ||
                  showGuide
                }
                onClick={() => {
                  void handleRestart();
                }}
              >
                <ReloadIcon />
              </button>
            </div>
          </div>

          <div
            className={`camera-status camera-status-${cameraStatus}`}
          >
            <span className="camera-status-mark" />

            <div>
              <p className="camera-status-title">
                {
                  cameraStatusTitle
                }
              </p>

              <p className="camera-status-description">
                {
                  cameraStatusDescription
                }
              </p>
            </div>
          </div>
        </section>

        {showGuide && (
          <section className="camera-guide-card">
            <p className="english-label guide-label">
              FIRST TIME GUIDE
            </p>

            <h2>
              カメラの使用を許可してください
            </h2>

            <p className="guide-description">
              QRコードを読み取るためにカメラを使用します。
              次のボタンを押すと、ブラウザにカメラの使用許可が表示されます。
            </p>

            <div className="guide-check-list">
              <p>
                1.
                表示された確認画面で「許可」を押してください。
              </p>

              <p>
                2.
                起動しない場合は、Windowsの「設定
                →
                プライバシーとセキュリティ
                →
                カメラ」を確認してください。
              </p>

              <p>
                3.
                「カメラへのアクセス」と「デスクトップ
                アプリにカメラへのアクセスを許可する」をオンにしてください。
              </p>
            </div>

            <button
              type="button"
              className="start-camera-button"
              onClick={
                handleStartFromGuide
              }
            >
              カメラを起動する
            </button>
          </section>
        )}

        <section
          className={`scan-result-card scan-result-${result.status}`}
          aria-live="polite"
        >
          <div
            className={`result-face result-face-${result.status}`}
            aria-hidden="true"
          >
            {resultEmoji}
          </div>

          <div className="result-content">
            <p className="english-label result-label">
              SCAN RESULT
            </p>

            <h2>
              {result.title}
            </h2>

            <p className="result-description">
              {result.description}
            </p>

            {scannedText && (
              <p className="scanned-text">
                読み取り内容：
                <span>
                  {scannedText}
                </span>
              </p>
            )}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}