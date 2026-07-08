チームC

## 環境構築方法

### 前提

- Node.js がインストールされていること
- npm がインストールされていること

動作確認時のバージョン:

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

本番ビルドを確認する場合は以下を実行します。

```bash
npm run build
```

### Lint

コードの静的チェックを行う場合は以下を実行します。

```bash
npm run lint
```
