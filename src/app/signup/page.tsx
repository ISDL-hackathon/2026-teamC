import SignupForm from "./SignupForm";
import styles from "./signup.module.css";

export default function SignupPage() {
  return (
    <main
      className={styles.page}
    >
      <div
        className={
          styles.container
        }
      >
        <section
          className={
            styles.brandArea
          }
        >
          <div
            className={
              styles.logoMark
            }
            aria-hidden="true"
          >
            I
          </div>

          <h1
            className={styles.logo}
          >
            ISDL
          </h1>

          <p
            className={
              styles.tagline
            }
          >
            研究室での時間を、
            <br />
            もっと楽しく、もっと身近に。
          </p>
        </section>

        <section
          className={styles.card}
        >
          <div
            className={
              styles.cardHeader
            }
          >
            <p
              className={
                styles.cardLabel
              }
            >
              CREATE ACCOUNT
            </p>

            <h2
              className={
                styles.heading
              }
            >
              アカウント作成
            </h2>

            <p
              className={
                styles.description
              }
            >
              必要な情報を入力して、
              <br />
              ISDLをはじめましょう。
            </p>
          </div>

          <SignupForm />
        </section>

        <p
          className={
            styles.footer
          }
        >
          ISDL Laboratory Communication App
        </p>
      </div>
    </main>
  );
}