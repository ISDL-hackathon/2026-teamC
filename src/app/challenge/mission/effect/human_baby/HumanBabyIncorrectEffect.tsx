"use client";

import {
  useEffect,
  useState,
} from "react";
import styles from "./HumanBabyIncorrectEffect.module.css";

const INCORRECT_IMAGES = [
  "/animal_image/human_baby/incorrect/one.png",
  "/animal_image/human_baby/incorrect/two.png",
  "/animal_image/human_baby/incorrect/three.png",
] as const;

type HumanBabyIncorrectEffectProps = {
  frameIntervalMs?: number;
};

export default function HumanBabyIncorrectEffect({
  frameIntervalMs = 500,
}: HumanBabyIncorrectEffectProps) {
  const [
    currentFrameIndex,
    setCurrentFrameIndex,
  ] = useState(0);

  useEffect(() => {
    // 必ずone.pngから開始
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
                  ? "泣いている赤ちゃん"
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