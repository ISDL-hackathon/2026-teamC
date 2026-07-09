import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Team C</p>

        <h1>Next.js の環境構築が完了しました</h1>

        <p className="lead">
          このプロジェクトは App Router、TypeScript、ESLint を使う構成です。
        </p>

        <p>ログイン中：{user.email}</p>
      </section>
    </main>
  );
}