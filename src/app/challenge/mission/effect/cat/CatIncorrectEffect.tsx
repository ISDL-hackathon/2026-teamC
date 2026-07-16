"use client";

import {
  useEffect,
  useState,
} from "react";
import styles from "./CatIncorrectEffect.module.css";

const INCORRECT_IMAGES = [
  "/animal_image/cat/incorrect/1.png",
  "/animal_image/cat/incorrect/2.png",
  "/animal_image/cat/incorrect/3.png",
  "/animal_image/cat/incorrect/4.png",
] as const;

type CatIncorrectEffectProps = {
  frameIntervalMs?: number;
};

export default function CatIncorrectEffect({
  frameIntervalMs = 400,
}: CatIncorrectEffectProps) {
  const [
    currentFrameIndex,
    setCurrentFrameIndex,
  ] = useState(0);

  useEffect(() => {
    // 必ず1.pngから開始
    setCurrentFrameIndex(0);

    const frameTimers =
      INCORRECT_IMAGES.slice(1).map(
        (_, index) =>
          window.setTimeout(() => {
            setCurrentFrameIndex(
              index + 1,
            );
          }, frameIntervalMs * (index + 1)),
      );

    return () => {
      frameTimers.forEach(
        (timer) => {
          window.clearTimeout(
            timer,
          );
        },
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
              alt={
                index === 0
                  ? "怒ってぷいっとする猫"
                  : ""
              }
              aria-hidden={
                index !== 0
              }
              className={`${styles.effectImage} ${
                currentFrameIndex ===
                index
                  ? styles.activeImage
                  : styles.hiddenImage
              }`}
              loading="eager"
              decoding="sync"
              draggable={false}
            />
          ),
        )}
      </div>
    </div>
  );
}