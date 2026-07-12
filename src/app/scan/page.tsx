import Link from "next/link";
import "./scan.css";

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="header-svg-icon"
    >
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
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="header-svg-icon"
    >
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

function QrCodeIllustration() {
  return (
    <svg
      viewBox="0 0 180 180"
      aria-hidden="true"
      className="qr-code-illustration"
    >
      <rect x="8" y="8" width="164" height="164" rx="14" fill="#f4f4f4" />

      <rect x="25" y="25" width="42" height="42" fill="#242424" />
      <rect x="34" y="34" width="24" height="24" fill="#f4f4f4" />
      <rect x="41" y="41" width="10" height="10" fill="#242424" />

      <rect x="113" y="25" width="42" height="42" fill="#242424" />
      <rect x="122" y="34" width="24" height="24" fill="#f4f4f4" />
      <rect x="129" y="41" width="10" height="10" fill="#242424" />

      <rect x="25" y="113" width="42" height="42" fill="#242424" />
      <rect x="34" y="122" width="24" height="24" fill="#f4f4f4" />
      <rect x="41" y="129" width="10" height="10" fill="#242424" />

      <rect x="91" y="106" width="12" height="12" fill="#242424" />
      <rect x="108" y="123" width="12" height="12" fill="#242424" />
      <rect x="125" y="106" width="12" height="12" fill="#242424" />
      <rect x="142" y="106" width="12" height="12" fill="#242424" />
      <rect x="91" y="140" width="12" height="12" fill="#242424" />
      <rect x="108" y="140" width="12" height="12" fill="#242424" />
      <rect x="125" y="123" width="12" height="12" fill="#242424" />
      <rect x="142" y="140" width="12" height="12" fill="#242424" />
    </svg>
  );
}

export default function ScanPage() {
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
            <div className="scanner-light" />

            <span className="scanner-corner corner-top-left" />
            <span className="scanner-corner corner-top-right" />
            <span className="scanner-corner corner-bottom-left" />
            <span className="scanner-corner corner-bottom-right" />

            <div className="qr-code-wrapper">
              <QrCodeIllustration />
            </div>

            <p className="scanner-message">
              QRコードを枠の中央に合わせてください
            </p>

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
              >
                <ReloadIcon />
              </button>
            </div>
          </div>

          <div className="camera-status">
            <span className="camera-status-icon" />

            <div>
              <p className="camera-status-title">
                カメラを使用しています
              </p>

              <p className="camera-status-description">
                QRコードを自動で読み取ります
              </p>
            </div>
          </div>
        </section>

        <section className="scan-result-card">
          <div className="result-icon" aria-hidden="true">
            <span>✓</span>
          </div>

          <div className="result-content">
            <p className="result-label">SCAN RESULT</p>

            <h2>読み取り結果がここに表示されます</h2>

            <p className="result-description">
              読み取りに成功すると、チェックインや
              ポイント獲得の内容を確認できます。
            </p>
          </div>
        </section>
      </main>

      <nav className="bottom-navigation" aria-label="メインナビゲーション">
        <Link href="/" className="navigation-item">
          <HomeIcon />
          <span>ホーム</span>
        </Link>

        <Link
          href="/challenge"
          className="navigation-item navigation-item-active"
        >
          <ChallengeIcon />
          <span>チャレンジ</span>
        </Link>

        <Link href="/scan" className="navigation-item">
          <ScanIcon />
          <span>スキャン</span>
        </Link>
      </nav>
    </div>
  );
}