"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./settings.module.css";

const DEFAULT_ICONS = ["👩‍💻", "👨‍💻", "👱‍♀️", "👨‍🦱", "🐱", "🐶", "🐥", "🤖"];

type NotificationState = {
  notice: boolean;
  challenge: boolean;
};

export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [nickname, setNickname] = useState("あやり");
  const [avatar, setAvatar] = useState(DEFAULT_ICONS[0]);
  const [notifications, setNotifications] = useState<NotificationState>({
    notice: true,
    challenge: true,
  });

  useEffect(() => {
    const savedName = localStorage.getItem("nickname");
    const savedAvatar = localStorage.getItem("avatar");
    const savedNotifications = localStorage.getItem("notifications");

    if (savedName) setNickname(savedName);
    if (savedAvatar) setAvatar(savedAvatar);
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
  }, []);

  const handleNicknameChange = (value: string) => {
    if (value.length > 12) return;
    setNickname(value);
    localStorage.setItem("nickname", value);
  };

  const handleSelectIcon = (icon: string) => {
    setAvatar(icon);
    localStorage.setItem("avatar", icon);
  };

  const handleUploadImage = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatar(reader.result);
        localStorage.setItem("avatar", reader.result);
      }
    };

    reader.readAsDataURL(file);
  };

  const toggleNotification = (key: keyof NotificationState) => {
    const next = {
      ...notifications,
      [key]: !notifications[key],
    };

    setNotifications(next);
    localStorage.setItem("notifications", JSON.stringify(next));
  };

  const isImageAvatar = avatar.startsWith("data:image");

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          ‹
        </button>
        <h1>アプリ設定</h1>
      </header>

      <section className={styles.section}>
        <p className={styles.label}>PROFILE</p>
        <h2 className={styles.sectionTitle}>プロフィール設定</h2>

        <div className={styles.card}>
          <div className={styles.currentProfile}>
            <div className={styles.avatarBox}>
              {isImageAvatar ? (
                <img src={avatar} alt="プロフィール画像" />
              ) : (
                <span>{avatar}</span>
              )}
            </div>

            <div>
              <p className={styles.subText}>現在のプロフィール</p>
              <p className={styles.profileName}>{nickname || "未設定"}</p>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.formBlock}>
            <label className={styles.inputLabel}>ニックネーム</label>

            <div className={styles.inputWrap}>
              <input
                value={nickname}
                maxLength={12}
                onChange={(e) => handleNicknameChange(e.target.value)}
                placeholder="ニックネーム"
              />
              <span>{nickname.length} / 12</span>
            </div>

            <p className={styles.helpText}>研究室のメンバーに表示される名前です</p>
          </div>

          <div className={styles.divider} />

          <div className={styles.iconHeader}>
            <h3>アイコン</h3>
            <p>
              選択中：{" "}
              <span>{isImageAvatar ? "画像" : avatar}</span>
            </p>
          </div>

          <div className={styles.iconGrid}>
            {DEFAULT_ICONS.map((icon) => (
              <button
                key={icon}
                className={`${styles.iconItem} ${
                  avatar === icon ? styles.selected : ""
                }`}
                onClick={() => handleSelectIcon(icon)}
              >
                <span>{icon}</span>
              </button>
            ))}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className={styles.hiddenInput}
            onChange={(e) => handleUploadImage(e.target.files?.[0])}
          />

          <button
            className={styles.uploadButton}
            onClick={() => fileInputRef.current?.click()}
          >
            ＋ 画像をアップロード
          </button>
        </div>
      </section>

      <section className={styles.section}>
        <p className={styles.label}>NOTIFICATION</p>
        <h2 className={styles.sectionTitle}>通知の設定</h2>

        <div className={styles.card}>
          <NotificationRow
            icon="🔔"
            title="お知らせ通知"
            text="研究室からのお知らせを受け取ります"
            checked={notifications.notice}
            onClick={() => toggleNotification("notice")}
          />

          <div className={styles.rowDivider} />

          <NotificationRow
            icon="⭐"
            title="チャレンジ通知"
            text="新しいミッションや達成状況を通知します"
            checked={notifications.challenge}
            onClick={() => toggleNotification("challenge")}
          />
        </div>
      </section>
    </main>
  );
}

type NotificationRowProps = {
  icon: string;
  title: string;
  text: string;
  checked: boolean;
  onClick: () => void;
};

function NotificationRow({
  icon,
  title,
  text,
  checked,
  onClick,
}: NotificationRowProps) {
  return (
    <div className={styles.notificationRow}>
      <div className={styles.notificationLeft}>
        <div className={styles.notificationIcon}>{icon}</div>

        <div>
          <p className={styles.notificationTitle}>{title}</p>
          <p className={styles.notificationText}>{text}</p>
        </div>
      </div>

      <button
        className={`${styles.switch} ${checked ? styles.switchOn : ""}`}
        onClick={onClick}
        aria-label={`${title}を切り替える`}
      >
        <span />
      </button>
    </div>
  );
}