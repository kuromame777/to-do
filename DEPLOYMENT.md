# 🚀 デプロイメントガイド

このTodo List ManagerアプリをGitHubにアップロードして、GitHub Pagesで公開する方法を説明します。

## 📋 前提条件

- GitHubアカウント
- このプロジェクトのファイル一式

## 🎯 方法1: GitHub Web UIを使用（推奨）

### 1. GitHubでリポジトリを作成

1. [GitHub.com](https://github.com) にログイン
2. 「New repository」をクリック
3. リポジトリ名を入力（例：`todo-list-manager`）
4. 「Public」を選択
5. 「Add a README file」のチェックを外す
6. 「Create repository」をクリック

### 2. ファイルをアップロード

1. 作成したリポジトリのページで「uploading an existing file」をクリック
2. 以下のファイルをドラッグ&ドロップでアップロード：
   - `src/` フォルダ全体
   - `public/` フォルダ全体
   - `package.json`
   - `package-lock.json`
   - `vite.config.js`
   - `tailwind.config.js`
   - `postcss.config.js`
   - `index.html`
   - `manifest.json`
   - `.gitignore`
   - `README.md`
   - `.github/workflows/deploy.yml`

3. コミットメッセージを入力（例：「Initial commit: Todo List Manager app」）
4. 「Commit changes」をクリック

### 3. GitHub Pagesを有効化

1. リポジトリの「Settings」タブをクリック
2. 左サイドバーの「Pages」をクリック
3. 「Source」で「GitHub Actions」を選択
4. 自動的にGitHub Actionsが実行され、数分後にサイトが公開されます

## 🎯 方法2: Gitコマンドを使用

### 1. Gitをインストール

Windowsの場合：
```bash
# wingetを使用
winget install Git.Git

# または Chocolateyを使用
choco install git
```

### 2. リポジトリを初期化

```bash
# プロジェクトディレクトリで実行
git init
git add .
git commit -m "Initial commit: Todo List Manager app"
```

### 3. GitHubリポジトリと連携

```bash
# リモートリポジトリを追加（URLは実際のリポジトリURLに変更）
git remote add origin https://github.com/あなたのユーザー名/todo-list-manager.git
git branch -M main
git push -u origin main
```

## 🌐 アクセス方法

デプロイが完了すると、以下のURLでアクセスできます：
```
https://あなたのユーザー名.github.io/todo-list-manager/
```

## 🔧 ローカル開発

```bash
# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev

# 本番ビルド
npm run build

# プレビュー
npm run preview
```

## 📱 PWA機能

このアプリはPWA（Progressive Web App）として動作します：

1. スマートフォンのブラウザでアクセス
2. 「ホーム画面に追加」をタップ
3. アプリのように使用可能

## 🛠 カスタマイズ

- **アプリ名**: `manifest.json` と `index.html` のタイトルを変更
- **テーマカラー**: `manifest.json` の `theme_color` を変更
- **アイコン**: `public/` フォルダのアイコンファイルを置き換え

## ❓ トラブルシューティング

### ビルドエラーが発生する場合
```bash
# 依存関係を再インストール
rm -rf node_modules package-lock.json
npm install
```

### GitHub Pagesが更新されない場合
1. リポジトリの「Actions」タブでワークフローの実行状況を確認
2. エラーがある場合は、ログを確認して修正

### 通知が動作しない場合
- HTTPS環境でのみ通知機能が動作します
- GitHub Pagesは自動的にHTTPSで提供されるため問題ありません

## 📄 ライセンス

MIT License
