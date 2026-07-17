"use client";

import {
  useEffect,
  useState,
} from "react";
import styles from "./GorillaIncorrectEffect.module.css";

const INCORRECT_IMAGES = [
  "/animal_image/gorilla/incorrect/cry1.png",
  "/animal_image/gorilla/incorrect/cry2.png",
  "/animal_image/gorilla/incorrect/cry3.png",
] as const;

type GorillaIncorrectEffectProps = {
  frameIntervalMs?: number;
};

export default function GorillaIncorrectEffect({
  frameIntervalMs = 500,
}: GorillaIncorrectEffectProps) {
  const [
    currentFrameIndex,
    setCurrentFrameIndex,
  ] = useState(0);

  useEffect(() => {
    // 必ずcry1.pngから開始する
    setCurrentFrameIndex(0);

    const frameTimer =
      window.setInterval(() => {
        setCurrentFrameIndex(
          (previousIndex) =>
            (
              previousIndex + 1
            ) %
            INCORRECT_IMAGES.length,
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
              alt={`泣いているゴリラ ${
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