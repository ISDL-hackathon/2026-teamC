"use client";

import {
  FormEvent,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { signup } from "./actions";
import styles from "./signup.module.css";

export default function SignupForm() {
  const [realName, setRealName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    passwordConfirm,
    setPasswordConfirm,
  ] = useState("");

  const [
    favoriteSubject,
    setFavoriteSubject,
  ] = useState("");

  const [
    favoriteColor,
    setFavoriteColor,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [isPending, startTransition] =
    useTransition();

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setErrorMessage("");

    startTransition(async () => {
      const result = await signup({
        realName,
        email,
        password,
        passwordConfirm,
        favoriteSubject,
        favoriteColor,
      });

      if (result?.error) {
        setErrorMessage(
          result.error,
        );
      }
    });
  };

  return (
    <>
      <form
        className={styles.form}
        onSubmit={handleSubmit}
      >
        <div
          className={
            styles.formSection
          }
        >
          <div
            className={
              styles.sectionHeading
            }
          >
            <span
              className={
                styles.sectionIcon
              }
              aria-hidden="true"
            >
              ✉
            </span>

            <div>
              <p
                className={
                  styles.sectionLabel
                }
              >
                ACCOUNT
              </p>

              <h3>ログイン情報</h3>
            </div>
          </div>

          <div
            className={styles.field}
          >
            <label
              htmlFor="realName"
              className={
                styles.label
              }
            >
              本名
            </label>

            <div
              className={
                styles.inputWrapper
              }
            >
              <span
                className={
                  styles.inputIcon
                }
                aria-hidden="true"
              >
                👤
              </span>

              <input
                id="realName"
                name="realName"
                type="text"
                autoComplete="name"
                maxLength={50}
                placeholder="例：山田 太郎"
                className={
                  styles.input
                }
                value={realName}
                onChange={(event) =>
                  setRealName(
                    event.target
                      .value,
                  )
                }
                required
              />
            </div>

            <p
              className={
                styles.helpText
              }
            >
              研究室メンバーの表示に使用されます
            </p>
          </div>

          <div
            className={styles.field}
          >
            <label
              htmlFor="email"
              className={
                styles.label
              }
            >
              メールアドレス
            </label>

            <div
              className={
                styles.inputWrapper
              }
            >
              <span
                className={
                  styles.inputIcon
                }
                aria-hidden="true"
              >
                ✉
              </span>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="example@isdl.jp"
                className={
                  styles.input
                }
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target
                      .value,
                  )
                }
                required
              />
            </div>
          </div>

          <div
            className={styles.field}
          >
            <label
              htmlFor="password"
              className={
                styles.label
              }
            >
              パスワード
            </label>

            <div
              className={
                styles.inputWrapper
              }
            >
              <span
                className={
                  styles.inputIcon
                }
                aria-hidden="true"
              >
                🔒
              </span>

              <input
                id="password"
                name="password"
                type="password"
                minLength={8}
                autoComplete="new-password"
                placeholder="8文字以上で入力"
                className={
                  styles.input
                }
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target
                      .value,
                  )
                }
                required
              />
            </div>

            <p
              className={
                styles.helpText
              }
            >
              8文字以上で設定してください
            </p>
          </div>

          <div
            className={styles.field}
          >
            <label
              htmlFor="passwordConfirm"
              className={
                styles.label
              }
            >
              パスワード確認
            </label>

            <div
              className={
                styles.inputWrapper
              }
            >
              <span
                className={
                  styles.inputIcon
                }
                aria-hidden="true"
              >
                ✓
              </span>

              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                minLength={8}
                autoComplete="new-password"
                placeholder="もう一度入力"
                className={
                  styles.input
                }
                value={
                  passwordConfirm
                }
                onChange={(event) =>
                  setPasswordConfirm(
                    event.target
                      .value,
                  )
                }
                required
              />
            </div>
          </div>
        </div>

        <div
          className={styles.divider}
          aria-hidden="true"
        >
          <span />
          <strong>
            PROFILE QUIZ
          </strong>
          <span />
        </div>

        <div
          className={`${styles.formSection} ${styles.quizSection}`}
        >
          <div
            className={
              styles.sectionHeading
            }
          >
            <span
              className={`${styles.sectionIcon} ${styles.quizIcon}`}
              aria-hidden="true"
            >
              ?
            </span>

            <div>
              <p
                className={
                  styles.sectionLabel
                }
              >
                PROFILE
              </p>

              <h3>
                クイズ用プロフィール
              </h3>
            </div>
          </div>

          <p
            className={
              styles.quizDescription
            }
          >
            入力した内容は、研究室メンバーを知るための
            「クイズ」に使用されます。
          </p>

          <div
            className={styles.field}
          >
            <label
              htmlFor="favoriteSubject"
              className={
                styles.label
              }
            >
              好きな教科
            </label>

            <div
              className={
                styles.inputWrapper
              }
            >
              <span
                className={
                  styles.inputIcon
                }
                aria-hidden="true"
              >
                📚
              </span>

              <input
                id="favoriteSubject"
                name="favoriteSubject"
                type="text"
                maxLength={20}
                placeholder="例：数学"
                className={
                  styles.input
                }
                value={
                  favoriteSubject
                }
                onChange={(event) =>
                  setFavoriteSubject(
                    event.target
                      .value,
                  )
                }
                required
              />
            </div>

            <p
              className={
                styles.helpText
              }
            >
              クイズの問題に使用されます
            </p>
          </div>

          <div
            className={styles.field}
          >
            <label
              htmlFor="favoriteColor"
              className={
                styles.label
              }
            >
              好きな色
            </label>

            <div
              className={
                styles.inputWrapper
              }
            >
              <span
                className={
                  styles.inputIcon
                }
                aria-hidden="true"
              >
                🎨
              </span>

              <input
                id="favoriteColor"
                name="favoriteColor"
                type="text"
                maxLength={20}
                placeholder="例：青"
                className={
                  styles.input
                }
                value={favoriteColor}
                onChange={(event) =>
                  setFavoriteColor(
                    event.target
                      .value,
                  )
                }
                required
              />
            </div>

            <p
              className={
                styles.helpText
              }
            >
              クイズの問題に使用されます
            </p>
          </div>
        </div>

        {errorMessage && (
          <div
            className={
              styles.errorMessage
            }
            role="alert"
          >
            <span aria-hidden="true">
              !
            </span>

            <p>{errorMessage}</p>
          </div>
        )}

        <button
          type="submit"
          className={styles.button}
          disabled={isPending}
        >
          <span>
            {isPending
              ? "作成中..."
              : "アカウントを作成"}
          </span>

          <span
            className={
              styles.buttonArrow
            }
            aria-hidden="true"
          >
            →
          </span>
        </button>
      </form>

      <div
        className={
          styles.signinArea
        }
      >
        <p>
          すでにアカウントをお持ちですか？
        </p>

        <Link
          href="/login"
          className={
            styles.signinLink
          }
        >
          ログインする
        </Link>
      </div>
    </>
  );
}