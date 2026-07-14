import Link from "next/link";
import { signup } from "./actions";

type SignupPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const ERROR_MESSAGES: Record<
  string,
  string
> = {
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

  const errorMessage =
    params.error
      ? ERROR_MESSAGES[params.error]
      : null;

  return (
    <main>
      <h1>Sign up</h1>

      <form action={signup}>
        <div>
          <label htmlFor="email">
            メールアドレス
          </label>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label htmlFor="password">
            パスワード
          </label>

          <input
            id="password"
            name="password"
            type="password"
            minLength={8}
            autoComplete="new-password"
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
            autoComplete="new-password"
            required
          />
        </div>

        <div>
          <label htmlFor="favoriteSubject">
            好きな教科
          </label>

          <input
            id="favoriteSubject"
            name="favoriteSubject"
            type="text"
            maxLength={20}
            placeholder="例：数学"
            required
          />

          <p>
            先輩クイズの問題に使用されます
          </p>
        </div>

        <div>
          <label htmlFor="favoriteColor">
            好きな色
          </label>

          <input
            id="favoriteColor"
            name="favoriteColor"
            type="text"
            maxLength={20}
            placeholder="例：青"
            required
          />

          <p>
            先輩クイズの問題に使用されます
          </p>
        </div>

        {errorMessage && (
          <p role="alert">
            {errorMessage}
          </p>
        )}

        <button type="submit">
          Sign up
        </button>
      </form>

      <p>
        すでにアカウントを持っている方は
        <Link href="/login">
          Sign in
        </Link>
      </p>
    </main>
  );
}