"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import {
  addStamp,
  getTodayString,
  loadStampData,
  MAX_STAMP_COUNT,
} from "@/lib/stamp";
import "./scan.css";

const VALID_QR_TEXT = "ISDL_CHECKIN";

type ScanResultStatus = "idle" | "success" | "error";

async function stopQrReader(qrReader: Html5Qrcode | null) {
  if (!qrReader) {
    return;
  }

  try {
    const state = qrReader.getState();

    if (
      state === Html5QrcodeScannerState.SCANNING ||
      state === Html5QrcodeScannerState.PAUSED
    ) {
      await qrReader.stop();
    }
  } catch {
    // すでに停止している場合は何もしない
  }

  try {
    qrReader.clear();
  } catch {
    // clearできない状態の場合も何もしない
  }
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="header-svg-icon">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="header-svg-icon">
      <path
        d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8.5h18C21 16 18 16 18 9Z"
        fill="currentColor"
      />
      <path
        d="M9.5 20a2.8 2.8 0 0 0 5 0"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function FlashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M13.2 2 5.5 13h5.4L9.8 22l8.7-12h-5.8L13.2 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ReloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M19.6 8.2A8 8 0 1 0 20 15"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M19.7 3.5v5.2h-5.2"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m4 11 8-7 8 7v9h-6v-6h-4v6H4v-9Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function ChallengeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m12 2 2.8 6.3 6.8.7-5.1 4.6 1.5 6.7-6-3.4-6 3.4 1.5-6.7L2.4 9l6.8-.7L12 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ScanIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8 4H4v4M16 4h4v4M8 20H4v-4M16 20h4v-4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M7 12h10"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function ScanPage() {
  const [scannerMessage, setScannerMessage] = useState(
    "QRコードを枠の中央に合わせてください"
  );
  const [resultTitle, setResultTitle] = useState(
    "読み取り結果がここに表示されます"
  );
  const [resultDescription, setResultDescription] = useState(
    "読み取りに成功すると、チェックインやポイント獲得の内容を確認できます。"
  );
  const [resultIcon, setResultIcon] = useState("📷");
  const [resultStatus, setResultStatus] = useState<ScanResultStatus>("idle");
  const [isCameraActive, setIsCameraActive] = useState(true);

  const qrReaderRef = useRef<Html5Qrcode | null>(null);
  const isScannedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const currentStampData = loadStampData();
    const today = getTodayString();

    if (currentStampData.lastStampedDate === today) {
      setScannerMessage("本日はスキャン済みです");
      setResultTitle("本日はスキャン済みです");
      setResultDescription(
        `今月の来室スタンプは${currentStampData.stampCount}個です。明日またスキャンできます。`
      );
      setResultIcon("😊");
      setResultStatus("success");
      setIsCameraActive(false);
      return;
    }

    if (currentStampData.stampCount >= MAX_STAMP_COUNT) {
      setScannerMessage("今月の上限に達しています");
      setResultTitle("今月のスタンプ上限に達しています");
      setResultDescription(
        "今月は15スタンプまで獲得できます。来月になると新しいカードになります。"
      );
      setResultIcon("😊");
      setResultStatus("success");
      setIsCameraActive(false);
      return;
    }

    const qrReader = new Html5Qrcode("qr-reader");
    qrReaderRef.current = qrReader;

    qrReader
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: {
            width: 230,
            height: 230,
          },
        },
        async (decodedText) => {
          if (isScannedRef.current) {
            return;
          }

          isScannedRef.current = true;

          if (decodedText !== VALID_QR_TEXT) {
            if (!isMounted) {
              return;
            }

            setScannerMessage("無効なQRコードです");
            setResultTitle("研究室のQRコードではありません");
            setResultDescription(
              "研究室に設置された正しいQRコードを読み取ってください。"
            );
            setResultIcon("😭");
            setResultStatus("error");
            setIsCameraActive(false);

            await stopQrReader(qrReader);
            qrReaderRef.current = null;

            return;
          }

          const stampResult = addStamp();

          if (!isMounted) {
            return;
          }

          setScannerMessage(stampResult.message);
          setResultTitle(stampResult.message);

          if (stampResult.success) {
            setResultDescription(
              `今月の来室スタンプは${stampResult.stampData.stampCount}個目です。`
            );
            setResultIcon("😊");
            setResultStatus("success");
          } else {
            setResultDescription(
              "1日1スタンプ、1か月15スタンプまで獲得できます。"
            );
            setResultIcon("😭");
            setResultStatus("error");
          }

          setIsCameraActive(false);

          await stopQrReader(qrReader);
          qrReaderRef.current = null;
        },
        () => {
          // QRを読み取れていない間は何もしない
        }
      )
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setScannerMessage("カメラを起動できませんでした");
        setResultTitle("カメラの使用を許可してください");
        setResultDescription(
          "ブラウザまたは端末の設定から、カメラの使用を許可してください。"
        );
        setResultIcon("😭");
        setResultStatus("error");
        setIsCameraActive(false);
      });

    return () => {
      isMounted = false;

      const currentQrReader = qrReaderRef.current;
      qrReaderRef.current = null;

      void stopQrReader(currentQrReader);
    };
  }, []);

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="scan-page">
      <header className="scan-header">
        <button
          type="button"
          className="header-icon-button"
          aria-label="メニューを開く"
        >
          <MenuIcon />
        </button>

        <p className="scan-logo">ISDL</p>

        <button
          type="button"
          className="header-icon-button notification-button"
          aria-label="通知を確認する"
        >
          <BellIcon />
        </button>
      </header>

      <main className="scan-main">
        <section className="scan-heading">
          <p className="section-label">QR SCANNER</p>

          <h1>QRコードを読み取る</h1>

          <p className="scan-description">
            研究室に設置されたQRコードを
            <br />
            カメラの枠内に合わせてください。
          </p>
        </section>

        <section className="scanner-container">
          <div className="scanner-preview">
            {isCameraActive && <div className="scanner-light" />}

            <span className="scanner-corner corner-top-left" />
            <span className="scanner-corner corner-top-right" />
            <span className="scanner-corner corner-bottom-left" />
            <span className="scanner-corner corner-bottom-right" />

            <div id="qr-reader" />

            <p className="scanner-message">{scannerMessage}</p>

            <div className="scanner-buttons">
              <button
                type="button"
                className="scanner-action-button flash-button"
                aria-label="フラッシュを切り替える"
              >
                <FlashIcon />
              </button>

              <button
                type="button"
                className="scanner-action-button"
                aria-label="読み取りをやり直す"
                onClick={handleReload}
              >
                <ReloadIcon />
              </button>
            </div>
          </div>

          <div className="camera-status">
            <span className="camera-status-icon" />

            <div>
              <p className="camera-status-title">
                {isCameraActive
                  ? "カメラを使用しています"
                  : "読み取りを終了しました"}
              </p>

              <p className="camera-status-description">
                {isCameraActive
                  ? "QRコードを自動で読み取ります"
                  : "もう一度読み取る場合は再読み込みしてください"}
              </p>
            </div>
          </div>
        </section>

        <section className="scan-result-card">
          <div
            className={`result-icon result-icon-${resultStatus}`}
            aria-hidden="true"
          >
            <span>{resultIcon}</span>
          </div>

          <div className="result-content">
            <p className="result-label">SCAN RESULT</p>

            <h2>{resultTitle}</h2>

            <p className="result-description">{resultDescription}</p>
          </div>
        </section>
      </main>

      <nav className="bottom-navigation" aria-label="メインナビゲーション">
        <Link href="/" className="navigation-item">
          <HomeIcon />
          <span>ホーム</span>
        </Link>

        <Link href="/challenge/point" className="navigation-item">
          <ChallengeIcon />
          <span>チャレンジ</span>
        </Link>

        <Link href="/scan" className="navigation-item navigation-item-active">
          <ScanIcon />
          <span>スキャン</span>
        </Link>
      </nav>
    </div>
  );
}