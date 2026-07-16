import Link from "next/link";
import { signup } from "./actions";
import styles from "./signup.module.css";

type SignupPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const ERROR_MESSAGES: Record<string, string> = {
  invalid_input:
    "入力内容を確認してください。",
  email_required:
    "メールアドレスを入力してください。",
  password_too_short:
    "パスワードは8文字以上で入力してください。",
  password_mismatch:
    "確認用パスワードが一致していません。",
  favorite_subject_required:
    "好きな教科を入力してください。",
  favorite_color_required:
    "好きな色を入力してください。",
  quiz_answer_too_long:
    "好きな教科と好きな色は20文字以内で入力してください。",
  signup_failed:
    "アカウントを作成できませんでした。",
};

export default async function SignupPage({
  searchParams,
}: SignupPageProps) {
  const params = await searchParams;

  const errorMessage = params.error
    ? ERROR_MESSAGES[params.error]
    : null;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={styles.brandArea}>
          <div
            className={styles.logoMark}
            aria-hidden="true"
          >
            I
          </div>

          <h1 className={styles.logo}>
            ISDL
          </h1>

          <p className={styles.tagline}>
            研究室での時間を、
            <br />
            もっと楽しく、もっと身近に。
          </p>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.cardLabel}>
              CREATE ACCOUNT
            </p>

            <h2 className={styles.heading}>
              アカウント作成
            </h2>

            <p className={styles.description}>
              必要な情報を入力して、
              <br />
              ISDLをはじめましょう。
            </p>
          </div>

          <form
            action={signup}
            className={styles.form}
          >
            <div className={styles.formSection}>
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

              <div className={styles.field}>
                <label
                  htmlFor="email"
                  className={styles.label}
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
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label
                  htmlFor="password"
                  className={styles.label}
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
                    className={styles.input}
                    required
                  />
                </div>

                <p className={styles.helpText}>
                  8文字以上で設定してください
                </p>
              </div>

              <div className={styles.field}>
                <label
                  htmlFor="passwordConfirm"
                  className={styles.label}
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
                    className={styles.input}
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
              <strong>PROFILE QUIZ</strong>
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

                  <h3>クイズ用プロフィール</h3>
                </div>
              </div>

              <p
                className={
                  styles.quizDescription
                }
              >
                入力した内容は、研究室メンバーを知るための
                「先輩クイズ」に使用されます。
              </p>

              <div className={styles.field}>
                <label
                  htmlFor="favoriteSubject"
                  className={styles.label}
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
                    className={styles.input}
                    required
                  />
                </div>

                <p className={styles.helpText}>
                  先輩クイズの問題に使用されます
                </p>
              </div>

              <div className={styles.field}>
                <label
                  htmlFor="favoriteColor"
                  className={styles.label}
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
                    className={styles.input}
                    required
                  />
                </div>

                <p className={styles.helpText}>
                  先輩クイズの問題に使用されます
                </p>
              </div>
            </div>

            {errorMessage && (
              <div
                className={styles.errorMessage}
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
            >
              <span>
                アカウントを作成
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

          <div className={styles.signinArea}>
            <p>
              すでにアカウントをお持ちですか？
            </p>

            <Link
              href="/login"
              className={styles.signinLink}
            >
              ログインする
            </Link>
          </div>
        </section>

        <p className={styles.footer}>
          ISDL Laboratory Communication App
        </p>
      </div>
    </main>
  );
}