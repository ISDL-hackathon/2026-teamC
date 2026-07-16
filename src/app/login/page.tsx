import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { login } from "./actions";
import styles from "./login.module.css";

export default async function LoginPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // すでにログイン済みならホームへ移動
  if (user) {
    redirect("/");
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={styles.brandArea}>
          <div className={styles.logoMark}>I</div>

          <h1 className={styles.logo}>ISDL</h1>

          <p className={styles.tagline}>
            研究室での毎日を、
            <br />
            もっと楽しく、もっとつながる。
          </p>
        </section>

        <section className={styles.card}>
          <h2 className={styles.heading}>Sign in</h2>

          <p className={styles.description}>
            登録したメールアドレスとパスワードを入力してください
          </p>

          <form action={login} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">
                メールアドレス
              </label>

              <input
                className={styles.input}
                id="email"
                name="email"
                type="email"
                placeholder="example@isdl.jp"
                autoComplete="email"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">
                パスワード
              </label>

              <input
                className={styles.input}
                id="password"
                name="password"
                type="password"
                placeholder="パスワードを入力"
                autoComplete="current-password"
                required
              />
            </div>

            <button className={styles.button} type="submit">
              Sign in
            </button>
          </form>

          <p className={styles.signupText}>
            アカウントを持っていない方は
            <Link className={styles.signupLink} href="/signup">
              Sign up
            </Link>
          </p>
        </section>

        <p className={styles.footer}>
          ISDL Laboratory Communication App
        </p>
      </div>
    </main>
  );
}