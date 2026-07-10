import Link from "next/link";
import { signup } from "./actions";

export default function SignupPage() {
  return (
    <main>
      <h1>Sign up</h1>

      <form action={signup}>
        <div>
          <label htmlFor="email">メールアドレス</label>

          <input
            id="email"
            name="email"
            type="email"
            required
          />
        </div>

        <div>
          <label htmlFor="password">パスワード</label>

          <input
            id="password"
            name="password"
            type="password"
            minLength={8}
            required
          />
        </div>

        <div>
          <label htmlFor="passwordConfirm">
            パスワード確認
          </label>

          <input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            minLength={8}
            required
          />
        </div>

        <button type="submit">
          Sign up
        </button>
      </form>

      <p>
        すでにアカウントを持っている方は
        <Link href="/login">Sign in</Link>
      </p>
    </main>
  );
}