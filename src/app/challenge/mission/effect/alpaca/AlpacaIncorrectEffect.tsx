"use client";

import {
  useEffect,
  useState,
} from "react";
import styles from "./AlpacaIncorrectEffect.module.css";

const INCORRECT_IMAGES = [
  "/animal_image/alpaca/incorrect/anger1.png",
  "/animal_image/alpaca/incorrect/anger2.png",
  "/animal_image/alpaca/incorrect/anger3.png",
  "/animal_image/alpaca/incorrect/anger4.png",
] as const;

type AlpacaIncorrectEffectProps = {
  frameIntervalMs?: number;
};

export default function AlpacaIncorrectEffect({
  frameIntervalMs = 400,
}: AlpacaIncorrectEffectProps) {
  const [
    currentFrameIndex,
    setCurrentFrameIndex,
  ] = useState(0);

  useEffect(() => {
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
                  ? "怒っているアルパカ"
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