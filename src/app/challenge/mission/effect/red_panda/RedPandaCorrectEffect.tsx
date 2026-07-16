"use client";

import {
  useEffect,
  useState,
} from "react";
import styles from "./RedPandaCorrectEffect.module.css";

const CORRECT_IMAGES = [
  "/animal_image/red_panda/correct/open.png",
  "/animal_image/red_panda/correct/close.png",
] as const;

type RedPandaCorrectEffectProps = {
  frameIntervalMs?: number;
};

export default function RedPandaCorrectEffect({
  frameIntervalMs = 380,
}: RedPandaCorrectEffectProps) {
  const [
    currentFrameIndex,
    setCurrentFrameIndex,
  ] = useState(0);

  useEffect(() => {
    // 必ずopen.pngから開始
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
                  ? "拍手して喜ぶレッサーパンダ"
                  : "拍手して喜ぶレッサーパンダ"
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