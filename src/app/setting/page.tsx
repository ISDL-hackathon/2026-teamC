"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  deleteAccount,
  getProfileSettings,
  saveProfileSettings,
} from "./actions";
import styles from "./settings.module.css";

const DEFAULT_ICONS = [
  "👩‍💻",
  "👨‍💻",
  "👱‍♀️",
  "👨‍🦱",
  "🐱",
  "🐶",
  "🐥",
  "🤖",
];

type NotificationState = {
  notice: boolean;
  challenge: boolean;
};

type CropBox = {
  x: number;
  y: number;
  size: number;
};

type CropCorner =
  | "topLeft"
  | "topRight"
  | "bottomLeft"
  | "bottomRight";

type DragState =
  | {
      type: "move";
      startPointerX: number;
      startPointerY: number;
      startX: number;
      startY: number;
      startSize: number;
    }
  | {
      type: "resize";
      corner: CropCorner;
      startPointerX: number;
      startPointerY: number;
      startX: number;
      startY: number;
      startSize: number;
    };

export default function SettingsPage() {
  const router = useRouter();

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const previewRef =
    useRef<HTMLDivElement | null>(null);

  const cropImageRef =
    useRef<HTMLImageElement | null>(null);

  const cropCanvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const [nickname, setNickname] =
    useState("");

  const [avatar, setAvatar] = useState(
    DEFAULT_ICONS[0],
  );

  const [
    notifications,
    setNotifications,
  ] = useState<NotificationState>({
    notice: true,
    challenge: true,
  });

  const [isSaved, setIsSaved] =
    useState(false);

  const [isLoaded, setIsLoaded] =
    useState(false);

  const [saveError, setSaveError] =
    useState("");

  const [
    isSavePending,
    startSaveTransition,
  ] = useTransition();

  const [cropImage, setCropImage] =
    useState<string | null>(null);

  const [cropBox, setCropBox] =
    useState<CropBox>({
      x: 60,
      y: 60,
      size: 180,
    });

  const [dragState, setDragState] =
    useState<DragState | null>(null);

  const [
    isWithdrawalModalOpen,
    setIsWithdrawalModalOpen,
  ] = useState(false);

  const [
    withdrawalError,
    setWithdrawalError,
  ] = useState("");

  const [
    isWithdrawalPending,
    startWithdrawalTransition,
  ] = useTransition();

  useEffect(() => {
    const loadProfileSettings =
      async () => {
        const result =
          await getProfileSettings();

        if (
          result.error ||
          !result.data
        ) {
          setSaveError(
            result.error ??
              "プロフィールを読み込めませんでした。",
          );

          setIsLoaded(true);
          return;
        }

        setNickname(
          result.data.nickname,
        );

        if (result.data.avatarUrl) {
          setAvatar(
            result.data.avatarUrl,
          );
        } else {
          setAvatar(
            result.data.selectedIcon ||
              DEFAULT_ICONS[0],
          );
        }

        setNotifications({
          notice:
            result.data.noticeEnabled,
          challenge:
            result.data
              .challengeNoticeEnabled,
        });

        setIsLoaded(true);
      };

    void loadProfileSettings();
  }, []);

  useEffect(() => {
    const handlePointerMove = (
      event: PointerEvent,
    ) => {
      if (
        !dragState ||
        !previewRef.current
      ) {
        return;
      }

      const previewRect =
        previewRef.current.getBoundingClientRect();

      const previewWidth =
        previewRect.width;

      const previewHeight =
        previewRect.height;

      const dx =
        event.clientX -
        dragState.startPointerX;

      const dy =
        event.clientY -
        dragState.startPointerY;

      if (dragState.type === "move") {
        const nextX = clamp(
          dragState.startX + dx,
          0,
          previewWidth -
            dragState.startSize,
        );

        const nextY = clamp(
          dragState.startY + dy,
          0,
          previewHeight -
            dragState.startSize,
        );

        setCropBox({
          x: nextX,
          y: nextY,
          size: dragState.startSize,
        });

        return;
      }

      const minSize = 70;

      const maxSize = Math.min(
        previewWidth,
        previewHeight,
      );

      let nextX = dragState.startX;
      let nextY = dragState.startY;
      let nextSize =
        dragState.startSize;

      if (
        dragState.corner ===
        "bottomRight"
      ) {
        const amount = Math.max(
          dx,
          dy,
        );

        nextSize = clamp(
          dragState.startSize +
            amount,
          minSize,
          maxSize,
        );

        nextX = dragState.startX;
        nextY = dragState.startY;
      }

      if (
        dragState.corner ===
        "bottomLeft"
      ) {
        const amount = Math.max(
          -dx,
          dy,
        );

        nextSize = clamp(
          dragState.startSize +
            amount,
          minSize,
          maxSize,
        );

        nextX =
          dragState.startX +
          dragState.startSize -
          nextSize;

        nextY = dragState.startY;
      }

      if (
        dragState.corner ===
        "topRight"
      ) {
        const amount = Math.max(
          dx,
          -dy,
        );

        nextSize = clamp(
          dragState.startSize +
            amount,
          minSize,
          maxSize,
        );

        nextX = dragState.startX;

        nextY =
          dragState.startY +
          dragState.startSize -
          nextSize;
      }

      if (
        dragState.corner ===
        "topLeft"
      ) {
        const amount = Math.max(
          -dx,
          -dy,
        );

        nextSize = clamp(
          dragState.startSize +
            amount,
          minSize,
          maxSize,
        );

        nextX =
          dragState.startX +
          dragState.startSize -
          nextSize;

        nextY =
          dragState.startY +
          dragState.startSize -
          nextSize;
      }

      if (nextX < 0) {
        nextSize += nextX;
        nextX = 0;
      }

      if (nextY < 0) {
        nextSize += nextY;
        nextY = 0;
      }

      if (
        nextX + nextSize >
        previewWidth
      ) {
        nextSize =
          previewWidth - nextX;
      }

      if (
        nextY + nextSize >
        previewHeight
      ) {
        nextSize =
          previewHeight - nextY;
      }

      nextSize = Math.max(
        minSize,
        nextSize,
      );

      setCropBox({
        x: nextX,
        y: nextY,
        size: nextSize,
      });
    };

    const handlePointerUp = () => {
      setDragState(null);
    };

    window.addEventListener(
      "pointermove",
      handlePointerMove,
    );

    window.addEventListener(
      "pointerup",
      handlePointerUp,
    );

    return () => {
      window.removeEventListener(
        "pointermove",
        handlePointerMove,
      );

      window.removeEventListener(
        "pointerup",
        handlePointerUp,
      );
    };
  }, [dragState]);

  const handleNicknameChange = (
    value: string,
  ) => {
    if (value.length > 12) {
      return;
    }

    setNickname(value);
    setIsSaved(false);
    setSaveError("");
  };

  const handleSelectIcon = (
    icon: string,
  ) => {
    setAvatar(icon);
    setIsSaved(false);
    setSaveError("");
  };

  const handleUploadImage = (
    file: File | undefined,
  ) => {
    if (!file) {
      return;
    }

    if (
      !file.type.startsWith("image/")
    ) {
      setSaveError(
        "画像ファイルを選択してください。",
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (
        typeof reader.result ===
        "string"
      ) {
        setCropImage(reader.result);

        setCropBox({
          x: 60,
          y: 60,
          size: 180,
        });
      }
    };

    reader.readAsDataURL(file);
  };

  const toggleNotification = (
    key: keyof NotificationState,
  ) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    setIsSaved(false);
    setSaveError("");
  };

  const isImageAvatar =
    avatar.startsWith("data:image") ||
    avatar.startsWith("http://") ||
    avatar.startsWith("https://");

  const handleSave = () => {
    setSaveError("");
    setIsSaved(false);

    if (isImageAvatar) {
      setSaveError(
        "画像アイコンの保存はまだ準備中です。絵文字アイコンを選択してください。",
      );

      return;
    }

    startSaveTransition(
      async () => {
        const result =
          await saveProfileSettings(
            nickname,
            avatar,
            notifications.notice,
            notifications.challenge,
          );

        if (result.error) {
          setSaveError(
            result.error,
          );
          return;
        }

        setNickname(
          nickname.trim(),
        );

        setIsSaved(true);

        setTimeout(() => {
          setIsSaved(false);
        }, 1800);
      },
    );
  };

  const handleCropImageLoad = () => {
    if (!previewRef.current) {
      return;
    }

    const previewRect =
      previewRef.current.getBoundingClientRect();

    const initialSize =
      Math.min(
        previewRect.width,
        previewRect.height,
      ) * 0.62;

    setCropBox({
      x:
        (previewRect.width -
          initialSize) /
        2,
      y:
        (previewRect.height -
          initialSize) /
        2,
      size: initialSize,
    });
  };

  const handleStartMove = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();

    setDragState({
      type: "move",
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startX: cropBox.x,
      startY: cropBox.y,
      startSize: cropBox.size,
    });
  };

  const handleStartResize = (
    event: React.PointerEvent<HTMLButtonElement>,
    corner: CropCorner,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setDragState({
      type: "resize",
      corner,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startX: cropBox.x,
      startY: cropBox.y,
      startSize: cropBox.size,
    });
  };

  const handleApplyCrop = () => {
    if (
      !cropImage ||
      !previewRef.current ||
      !cropImageRef.current
    ) {
      return;
    }

    const previewRect =
      previewRef.current.getBoundingClientRect();

    const imageRect =
      cropImageRef.current.getBoundingClientRect();

    const image = new Image();

    image.onload = () => {
      const canvas =
        cropCanvasRef.current;

      if (!canvas) {
        return;
      }

      const context =
        canvas.getContext("2d");

      if (!context) {
        return;
      }

      const scaleX =
        image.naturalWidth /
        imageRect.width;

      const scaleY =
        image.naturalHeight /
        imageRect.height;

      const cropLeftInPreview =
        cropBox.x;

      const cropTopInPreview =
        cropBox.y;

      const imageLeftInPreview =
        imageRect.left -
        previewRect.left;

      const imageTopInPreview =
        imageRect.top -
        previewRect.top;

      const sourceX = Math.max(
        0,
        (cropLeftInPreview -
          imageLeftInPreview) *
          scaleX,
      );

      const sourceY = Math.max(
        0,
        (cropTopInPreview -
          imageTopInPreview) *
          scaleY,
      );

      const sourceSize = Math.min(
        cropBox.size * scaleX,
        cropBox.size * scaleY,
        image.naturalWidth - sourceX,
        image.naturalHeight - sourceY,
      );

      const outputSize = 300;

      canvas.width = outputSize;
      canvas.height = outputSize;

      context.clearRect(
        0,
        0,
        outputSize,
        outputSize,
      );

      context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceSize,
        sourceSize,
        0,
        0,
        outputSize,
        outputSize,
      );

      const croppedImage =
        canvas.toDataURL("image/png");

      setAvatar(croppedImage);
      setCropImage(null);
      setIsSaved(false);
      setSaveError("");

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }
    };

    image.src = cropImage;
  };

  const handleCancelCrop = () => {
    setCropImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleWithdrawal = () => {
    setWithdrawalError("");

    startWithdrawalTransition(
      async () => {
        try {
          const result =
            await deleteAccount();

          if (result?.error) {
            setWithdrawalError(
              result.error,
            );
          }
        } catch (error) {
          console.error(
            "退会処理エラー:",
            error,
          );

          setWithdrawalError(
            "退会処理中にエラーが発生しました。",
          );
        }
      },
    );
  };

  if (!isLoaded) {
    return (
      <main className={styles.page}>
        <p className={styles.loadingText}>
          読み込み中...
        </p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => router.back()}
          aria-label="前の画面へ戻る"
        >
          ‹
        </button>

        <h1>アプリ設定</h1>
      </header>

      <section className={styles.section}>
        <p className={styles.label}>
          PROFILE
        </p>

        <h2 className={styles.sectionTitle}>
          プロフィール設定
        </h2>

        <div className={styles.card}>
          <div
            className={
              styles.currentProfile
            }
          >
            <div
              className={styles.avatarBox}
            >
              {isImageAvatar ? (
                <img
                  src={avatar}
                  alt="プロフィール画像"
                />
              ) : (
                <span>{avatar}</span>
              )}
            </div>

            <div>
              <p className={styles.subText}>
                現在のプロフィール
              </p>

              <p
                className={`${styles.profileName} ${
                  !nickname
                    ? styles.placeholderName
                    : ""
                }`}
              >
                {nickname || "Name"}
              </p>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.formBlock}>
            <label
              className={styles.inputLabel}
              htmlFor="nickname"
            >
              ニックネーム
            </label>

            <div className={styles.inputWrap}>
              <input
                id="nickname"
                value={nickname}
                maxLength={12}
                onChange={(event) =>
                  handleNicknameChange(
                    event.target.value,
                  )
                }
                placeholder="Name"
              />

              <span>
                {nickname.length} / 12
              </span>
            </div>

            <p className={styles.helpText}>
              研究室のメンバーに表示される名前です
            </p>
          </div>

          <div className={styles.divider} />

          <div className={styles.iconHeader}>
            <h3>アイコン</h3>

            <p>
              選択中：
              <span>
                {isImageAvatar
                  ? "画像"
                  : avatar}
              </span>
            </p>
          </div>

          <div className={styles.iconGrid}>
            {DEFAULT_ICONS.map(
              (icon) => (
                <button
                  key={icon}
                  type="button"
                  className={`${styles.iconItem} ${
                    avatar === icon
                      ? styles.selected
                      : ""
                  }`}
                  onClick={() =>
                    handleSelectIcon(icon)
                  }
                >
                  <span>{icon}</span>
                </button>
              ),
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className={styles.hiddenInput}
            onChange={(event) =>
              handleUploadImage(
                event.target.files?.[0],
              )
            }
          />

          <button
            type="button"
            className={styles.uploadButton}
            onClick={() =>
              fileInputRef.current?.click()
            }
          >
            ＋ 画像をアップロード
          </button>
        </div>

        <button
          type="button"
          className={styles.saveButton}
          onClick={handleSave}
          disabled={isSavePending}
        >
          {isSavePending
            ? "保存中..."
            : "変更を保存"}
        </button>

        {saveError && (
          <p className={styles.saveError}>
            {saveError}
          </p>
        )}

        {isSaved && (
          <p className={styles.savedMessage}>
            保存しました
          </p>
        )}
      </section>

      <section className={styles.section}>
        <p className={styles.label}>
          NOTIFICATION
        </p>

        <h2 className={styles.sectionTitle}>
          通知の設定
        </h2>

        <div className={styles.card}>
          <NotificationRow
            icon="🔔"
            title="お知らせ通知"
            text="研究室からのお知らせを受け取ります"
            checked={
              notifications.notice
            }
            onClick={() =>
              toggleNotification("notice")
            }
          />

          <div className={styles.rowDivider} />

          <NotificationRow
            icon="⭐"
            title="チャレンジ通知"
            text="新しいミッションや達成状況を通知します"
            checked={
              notifications.challenge
            }
            onClick={() =>
              toggleNotification(
                "challenge",
              )
            }
          />
        </div>
      </section>

      <section className={styles.section}>
        <p className={styles.label}>
          ACCOUNT
        </p>

        <h2 className={styles.sectionTitle}>
          アカウント設定
        </h2>

        <div
          className={
            styles.withdrawalCard
          }
        >
          <div
            className={
              styles.withdrawalText
            }
          >
            <h3>
              サービスから退会する
            </h3>

            <p>
              退会すると、プロフィールやこれまでの記録が削除されます。
            </p>
          </div>

          <button
            type="button"
            className={
              styles.withdrawalButton
            }
            onClick={() => {
              setWithdrawalError("");
              setIsWithdrawalModalOpen(
                true,
              );
            }}
          >
            退会する
          </button>
        </div>
      </section>

      {isWithdrawalModalOpen && (
        <div
          className={
            styles.withdrawalOverlay
          }
          onClick={() => {
            if (
              !isWithdrawalPending
            ) {
              setIsWithdrawalModalOpen(
                false,
              );
            }
          }}
        >
          <div
            className={
              styles.withdrawalModal
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="withdrawal-title"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div
              className={
                styles.withdrawalWarningIcon
              }
            >
              ⚠️
            </div>

            <h2 id="withdrawal-title">
              本当に退会しますか？
            </h2>

            <p>
              退会すると、プロフィール、イベント、参加情報などのデータがすべて削除されます。
            </p>

            <p
              className={
                styles.withdrawalImportantText
              }
            >
              この操作は元に戻せません。
            </p>

            {withdrawalError && (
              <p
                className={
                  styles.withdrawalError
                }
              >
                {withdrawalError}
              </p>
            )}

            <div
              className={
                styles.withdrawalModalButtons
              }
            >
              <button
                type="button"
                className={
                  styles.keepAccountButton
                }
                disabled={
                  isWithdrawalPending
                }
                onClick={() =>
                  setIsWithdrawalModalOpen(
                    false,
                  )
                }
              >
                キャンセル
              </button>

              <button
                type="button"
                className={
                  styles.confirmWithdrawalButton
                }
                disabled={
                  isWithdrawalPending
                }
                onClick={handleWithdrawal}
              >
                {isWithdrawalPending
                  ? "退会処理中..."
                  : "退会する"}
              </button>
            </div>
          </div>
        </div>
      )}

      {cropImage && (
        <div className={styles.cropOverlay}>
          <div className={styles.cropModal}>
            <h2>画像を調整</h2>

            <p>
              四角い枠を動かして、アイコンに表示する範囲を選択してください。
              角を動かすと1:1のままサイズ変更できます。
            </p>

            <div
              ref={previewRef}
              className={
                styles.cropPreview
              }
            >
              <img
                ref={cropImageRef}
                src={cropImage}
                alt="調整中の画像"
                onLoad={
                  handleCropImageLoad
                }
                draggable={false}
              />

              <div
                className={styles.cropBox}
                style={{
                  left: `${cropBox.x}px`,
                  top: `${cropBox.y}px`,
                  width: `${cropBox.size}px`,
                  height: `${cropBox.size}px`,
                }}
                onPointerDown={
                  handleStartMove
                }
              >
                <button
                  type="button"
                  className={`${styles.cropHandle} ${styles.topLeft}`}
                  onPointerDown={(
                    event,
                  ) =>
                    handleStartResize(
                      event,
                      "topLeft",
                    )
                  }
                  aria-label="左上を調整"
                />

                <button
                  type="button"
                  className={`${styles.cropHandle} ${styles.topRight}`}
                  onPointerDown={(
                    event,
                  ) =>
                    handleStartResize(
                      event,
                      "topRight",
                    )
                  }
                  aria-label="右上を調整"
                />

                <button
                  type="button"
                  className={`${styles.cropHandle} ${styles.bottomLeft}`}
                  onPointerDown={(
                    event,
                  ) =>
                    handleStartResize(
                      event,
                      "bottomLeft",
                    )
                  }
                  aria-label="左下を調整"
                />

                <button
                  type="button"
                  className={`${styles.cropHandle} ${styles.bottomRight}`}
                  onPointerDown={(
                    event,
                  ) =>
                    handleStartResize(
                      event,
                      "bottomRight",
                    )
                  }
                  aria-label="右下を調整"
                />
              </div>
            </div>

            <div
              className={
                styles.cropButtons
              }
            >
              <button
                type="button"
                className={
                  styles.cancelCropButton
                }
                onClick={
                  handleCancelCrop
                }
              >
                キャンセル
              </button>

              <button
                type="button"
                className={
                  styles.applyCropButton
                }
                onClick={
                  handleApplyCrop
                }
              >
                この画像にする
              </button>
            </div>

            <canvas
              ref={cropCanvasRef}
              className={
                styles.hiddenCanvas
              }
            />
          </div>
        </div>
      )}
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
    <div
      className={
        styles.notificationRow
      }
    >
      <div
        className={
          styles.notificationLeft
        }
      >
        <div
          className={
            styles.notificationIcon
          }
        >
          {icon}
        </div>

        <div>
          <p
            className={
              styles.notificationTitle
            }
          >
            {title}
          </p>

          <p
            className={
              styles.notificationText
            }
          >
            {text}
          </p>
        </div>
      </div>

      <button
        type="button"
        className={`${styles.switch} ${
          checked
            ? styles.switchOn
            : ""
        }`}
        onClick={onClick}
        aria-label={`${title}を切り替える`}
        aria-pressed={checked}
      >
        <span />
      </button>
    </div>
  );
}

function clamp(
  value: number,
  min: number,
  max: number,
) {
  return Math.min(
    Math.max(value, min),
    max,
  );
}