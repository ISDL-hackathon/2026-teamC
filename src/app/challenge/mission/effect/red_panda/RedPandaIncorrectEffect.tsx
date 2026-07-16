"use client";

import {
  useEffect,
  useState,
} from "react";
import styles from "./RedPandaIncorrectEffect.module.css";

const INCORRECT_IMAGES = [
  "/animal_image/red_panda/incorrect/up.png",
  "/animal_image/red_panda/incorrect/down.png",
] as const;

type RedPandaIncorrectEffectProps = {
  frameIntervalMs?: number;
};

export default function RedPandaIncorrectEffect({
  frameIntervalMs = 420,
}: RedPandaIncorrectEffectProps) {
  const [
    currentFrameIndex,
    setCurrentFrameIndex,
  ] = useState(0);

  useEffect(() => {
    // 必ずup.pngから開始
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
      aria-label="不正解演出"
    >
      <div
        className={
          styles.imageContainer
        }
      >
        {INCORRECT_IMAGES.map(
          (imagePath, index) => (
            <img
              key={imagePath}
              src={imagePath}
              alt={`威嚇するレッサーパンダ ${
                index + 1
              }`}
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