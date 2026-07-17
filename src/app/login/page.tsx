import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import LoginForm from "./LoginForm";
import styles from "./login.module.css";

export default async function LoginPage() {
  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  // すでにログイン済みならホームへ移動
  if (user) {
    redirect("/");
  }

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
            研究室での毎日を、
            <br />
            もっと楽しく、もっとつながる。
          </p>
        </section>

        <section
          className={styles.card}
        >
          <h2
            className={
              styles.heading
            }
          >
            Sign in
          </h2>

          <p
            className={
              styles.description
            }
          >
            登録したメールアドレスとパスワードを入力してください
          </p>

          <LoginForm />
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