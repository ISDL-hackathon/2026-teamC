"use client";

import {
  useEffect,
  useState,
} from "react";
import styles from "./GorillaCorrectEffect.module.css";

const CORRECT_IMAGES = [
  "/animal_image/gorilla/correct/open.png",
  "/animal_image/gorilla/correct/close.png",
] as const;

type GorillaCorrectEffectProps = {
  frameIntervalMs?: number;
};

export default function GorillaCorrectEffect({
  frameIntervalMs = 380,
}: GorillaCorrectEffectProps) {
  const [
    currentFrameIndex,
    setCurrentFrameIndex,
  ] = useState(0);

  useEffect(() => {
    // 必ずopen.pngから開始する
    setCurrentFrameIndex(0);

    const frameTimer =
      window.setInterval(() => {
        setCurrentFrameIndex(
          (previousIndex) =>
            previousIndex === 0
              ? 1
              : 0,
        );
      }, frameIntervalMs);

    return () => {
      window.clearInterval(
        frameTimer,
      );
    };
  }, [frameIntervalMs]);

  return (
    <div
      className={styles.overlay}
      role="status"
      aria-live="assertive"
      aria-label="正解演出"
    >
      <div
        className={
          styles.imageContainer
        }
      >
        {CORRECT_IMAGES.map(
          (imagePath, index) => (
            <img
              key={imagePath}
              src={imagePath}
              alt={
                index === 0
                  ? "手を開いて拍手するゴリラ"
                  : "手を閉じて拍手するゴリラ"
              }
              className={`${styles.effectImage} ${
                currentFrameIndex ===
                index
                  ? styles.activeImage
                  : styles.hiddenImage
              }`}
              draggable={false}
            />
          ),
        )}
      </div>
    </div>
  );
}