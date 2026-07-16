"use client";

import {
  FormEvent,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { login } from "./actions";
import styles from "./login.module.css";

export default function LoginForm() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [isPending, startTransition] =
    useTransition();

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setErrorMessage("");

    startTransition(async () => {
      const result = await login(
        email,
        password,
      );

      if (result?.error) {
        setErrorMessage(result.error);
      }
    });
  };

  return (
    <>
      {errorMessage && (
        <div
          className={
            styles.errorMessage
          }
          role="alert"
        >
          <span
            className={
              styles.errorIcon
            }
            aria-hidden="true"
          >
            !
          </span>

          <p>{errorMessage}</p>
        </div>
      )}

      <form
        className={styles.form}
        onSubmit={handleSubmit}
      >
        <div
          className={styles.field}
        >
          <label
            className={styles.label}
            htmlFor="email"
          >
            メールアドレス
          </label>

          <input
            className={styles.input}
            id="email"
            name="email"
            type="email"
            placeholder="example@isdl.jp"
            autoComplete="email"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value,
              )
            }
            required
          />
        </div>

        <div
          className={styles.field}
        >
          <label
            className={styles.label}
            htmlFor="password"
          >
            パスワード
          </label>

          <input
            className={styles.input}
            id="password"
            name="password"
            type="password"
            placeholder="パスワードを入力"
            autoComplete="current-password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value,
              )
            }
            required
          />
        </div>

        <button
          className={styles.button}
          type="submit"
          disabled={isPending}
        >
          {isPending
            ? "確認中..."
            : "Sign in"}
        </button>
      </form>

      <p
        className={
          styles.signupText
        }
      >
        アカウントを持っていない方は
        <Link
          className={
            styles.signupLink
          }
          href="/signup"
        >
          Sign up
        </Link>
      </p>
    </>
  );
}