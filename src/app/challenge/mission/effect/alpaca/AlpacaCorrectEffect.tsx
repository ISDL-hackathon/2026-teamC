"use client";

import {
  useEffect,
  useState,
} from "react";
import styles from "./AlpacaCorrectEffect.module.css";

const CORRECT_IMAGES = [
  "/animal_image/alpaca/correct/smile_kiss_1.png",
  "/animal_image/alpaca/correct/smile_kiss_2.png",
] as const;

type AlpacaCorrectEffectProps = {
  frameIntervalMs?: number;
};

export default function AlpacaCorrectEffect({
  frameIntervalMs = 380,
}: AlpacaCorrectEffectProps) {
  const [
    currentFrameIndex,
    setCurrentFrameIndex,
  ] = useState(0);

  useEffect(() => {
    setCurrentFrameIndex(0);

    const frameTimer =
      window.setInterval(() => {
        setCurrentFrameIndex(
          (previousIndex) =>
            (previousIndex + 1) %
            CORRECT_IMAGES.length,
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
                  ? "喜んでキスをするアルパカ"
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