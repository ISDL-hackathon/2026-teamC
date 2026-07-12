# チームC

研究室向けWebアプリをNext.jsで開発しています。

---

## 環境構築方法

### 前提

以下がインストールされていることを確認してください。

- Node.js
- npm

バージョンは、次のコマンドで確認できます。

```bash
node --version
npm --version
```

### セットアップ

リポジトリを取得したあと、プロジェクト直下で依存パッケージをインストールします。

```bash
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

起動後、ブラウザで以下にアクセスします。

```text
http://localhost:3000
```

### ビルド

本番ビルドを確認する場合は、以下を実行します。

```bash
npm run build
```

### Lint

コードの静的チェックを行う場合は、以下を実行します。

```bash
npm run lint
```

---

## ブランチ運用

### ブランチ名

ブランチ名は、以下の形式で作成します。

```text
種類/名前の頭文字-画面名
```

例：

```text
feature/d-team
feature/a-mission
feature/c-scan
fix/d-home
hotfix/a-login
```

### ブランチの種類

| 種類 | 用途 |
|---|---|
| `feature` | 新しい機能や画面の開発 |
| `fix` | 通常の不具合修正 |
| `hotfix` | 緊急の不具合修正 |

### 名前の頭文字

| メンバー | 頭文字 |
|---|---|
| 和田 | `d` |
| 坂本 | `a` |
| 隅廣 | `c` |

---

## 作業開始時の手順

### 最新のdevから新しいブランチを作成する場合

作業を始める前に、ローカルの`dev`を最新の状態にします。

```bash
git switch dev
git fetch
git pull origin dev
```

そのあと、自分の作業ブランチを作成します。

```bash
git switch -c feature/名前の頭文字-画面名
```

例：

```bash
git switch -c feature/d-team
```

### 作成済みの自分のブランチに最新のdevを取り込む場合

まず、自分の作業ブランチに移動します。

```bash
git switch 自分のブランチ名
```

GitHub上の最新情報を取得します。

```bash
git fetch
```

現在いる自分のブランチに、GitHub上の最新の`dev`を取り込みます。

```bash
git pull origin dev
```

例：

```bash
git switch feature/d-team
git fetch
git pull origin dev
```

`git pull origin dev`は、現在いるブランチにGitHub上の最新の`dev`を取り込むコマンドです。

実行前に、必ず自分の作業ブランチにいることを確認してください。

```bash
git branch --show-current
```

---

## コミットメッセージ

コミットメッセージは、以下の形式で記述します。

```text
<type>(名前の頭文字): <変更内容>
```

例：

```text
feat(a): ログイン画面を作成
fix(d): チーム画面の表示崩れを修正
docs(c): READMEに開発手順を追加
```

### typeの種類

| type | 用途 |
|---|---|
| `delete` | ファイルや機能の削除 |
| `docs` | READMEなどのドキュメント更新 |
| `feat` | ユーザー向けの機能追加・変更 |
| `fix` | ユーザー向けの不具合修正 |
| `refactor` | 動作を変えずにコードを整理 |
| `style` | フォーマットや見た目に関する修正 |
| `test` | テストコードの追加・修正 |
| `other` | その他の変更 |

`refactor`は、機能自体は変えずにコードを読みやすくしたり、重複を減らしたりした場合に使用します。

---

## 変更の保存とPush

変更内容を確認します。

```bash
git status
```

変更したファイルを登録します。

```bash
git add .
```

コミットします。

```bash
git commit -m "feat(d): チーム画面を作成"
```

### 初めてブランチをPushする場合

```bash
git push -u origin ブランチ名
```

例：

```bash
git push -u origin feature/d-team
```

`-u`を付けることで、ローカルブランチとGitHub上のブランチが紐づけられます。

一度`-u`を付けてPushしたあとは、次回から以下だけで送れます。

```bash
git push
```

---

## Pull Requestの作成

GitHubへPushしたあと、Pull Requestを作成します。

基本的には、以下の向きで作成します。

```text
自分の作業ブランチ → dev
```

例：

```text
feature/d-team → dev
```

Pull Requestを作成するときは、変更内容と動作確認を記載してください。

### Pull Requestの記載例

```md
## 変更内容

- Supabase Authを導入
- ログイン画面を追加
- 未ログイン時に `/login` へリダイレクト
- ログイン済みの場合は `/` へリダイレクト
- ログイン画面のデザインを変更

## 動作確認

- 未ログイン状態で `/` を開くと `/login` に移動する
- 登録済みアカウントでログインできる
- ログイン後にホーム画面が表示される
- ログイン済みで `/login` を開くとホームへ移動する

## 補足

- `.env.local` はGit管理の対象外です
```

---

## Pull Requestを出す前の確認

Pull Requestを作成する前に、以下を確認してください。

```bash
npm run build
npm run lint
```

また、ブラウザで担当画面を開き、次の内容も確認します。

- 画面が正しく表示される
- ボタンが動作する
- ページ遷移が正しい
- 既存の画面が崩れていない
- エラーがコンソールに表示されていない

---

## 担当画面

### 和田

- 共通部分
- ホーム画面
- チーム画面

### 坂本

- ミッション画面
- ポイント画面

現在、チャレンジ画面内の以下の3項目のUIを作成中です。

- ポイント
- ミッション
- チーム

### 隅廣

#### 1. 設定画面

- 変更保存ボタン
- 保存機能
- アップロード画像のサイズ・表示範囲調整

#### 2. 通知画面

- 通知画面のUI

#### 3. スキャン画面

- スキャン画面のUI
- QRコードの作成
- QRコード読み取り機能
- カメラ起動
- 読み取り成功画面
- 読み取り失敗画面
- 読み取り結果のポイント画面への反映

スキャン画面は、作業を以下のように分けてPushします。

- UI完成時にPush
- 読み取り機能完成時にPush

#### 4. ポイント画面へのスタンプ反映

以下のファイルを編集します。

```text
src/app/challenge/point/page.tsx
src/app/challenge/point内のCSSファイル
```

---

## チャレンジ画面のフォルダ構成

チャレンジ画面のUIが`dev`にマージされると、`src/app`の下に`challenge`フォルダが追加されます。

```text
src/app/challenge/
├─ mission/
│  ├─ page.tsx
│  └─ CSSファイル
├─ point/
│  ├─ page.tsx
│  └─ CSSファイル
└─ team/
   ├─ page.tsx
   └─ CSSファイル
```

担当画面を編集するときは、自分の担当フォルダ内の`page.tsx`とCSSファイルを編集してください。

---

## 注意事項

以下のコマンドは、他のメンバーに相談せず実行しないでください。

```bash
git reset --hard
git rebase
git push --force
git clean -fd
```


また、以下のファイルはGitHubへPushしません。

```text
.env.local
```

SupabaseのURLやAPIキーなどの環境変数は、各自の`.env.local`に設定してください。