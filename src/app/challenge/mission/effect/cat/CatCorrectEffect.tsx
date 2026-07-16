"use client";

import {
  useEffect,
  useState,
} from "react";
import styles from "./CatCorrectEffect.module.css";

const CORRECT_IMAGES = [
  "/animal_image/cat/correct/surisuri_1.png",
  "/animal_image/cat/correct/surisuri_2.png",
] as const;

type CatCorrectEffectProps = {
  frameIntervalMs?: number;
};

export default function CatCorrectEffect({
  frameIntervalMs = 380,
}: CatCorrectEffectProps) {
  const [
    currentFrameIndex,
    setCurrentFrameIndex,
  ] = useState(0);

  useEffect(() => {
    // 必ずsurisuri_1から開始
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
                  ? "人の手にすりすりしている猫"
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