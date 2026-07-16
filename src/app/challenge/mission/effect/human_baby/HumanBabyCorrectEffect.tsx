"use client";

import {
  useEffect,
  useState,
} from "react";
import styles from "./HumanBabyCorrectEffect.module.css";

const CORRECT_IMAGES = [
  "/animal_image/human_baby/correct/garagara_1.png",
  "/animal_image/human_baby/correct/garagara_2.png",
] as const;

type HumanBabyCorrectEffectProps = {
  frameIntervalMs?: number;
};

export default function HumanBabyCorrectEffect({
  frameIntervalMs = 380,
}: HumanBabyCorrectEffectProps) {
  const [
    currentFrameIndex,
    setCurrentFrameIndex,
  ] = useState(0);

  useEffect(() => {
    // 演出開始時は必ず
    // garagara_1.pngから始める
    setCurrentFrameIndex(0);

    const frameTimer =
      window.setInterval(() => {
        setCurrentFrameIndex(
          (previousIndex) =>
            (
              previousIndex + 1
            ) %
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
                  ? "ガラガラを持って喜ぶ赤ちゃん"
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