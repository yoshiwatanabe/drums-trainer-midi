# Rhythm Forge Drills

ドラム練習用アプリケーション。様々なリズムパターンやフィルインをMIDI再生しながら練習できます。

![スクリーンショット](public/images/app-screenshot.png)

## 機能

*   **多彩な練習パターン**: 8ビート、16ビート、フィルイン、ジャンル別スタイルなど、多数の練習パターンを収録。
*   **MIDI再生**: 各パターンをMIDIで再生し、テンポ（BPM）を自由に調整可能。
*   **ループ再生**: 苦手なフレーズを繰り返し練習できるループ機能。
*   **楽譜表示**: 練習パターンのドラム譜を表示。

## 開発環境のセットアップ

### 前提条件

*   Node.js (推奨: 最新のLTSバージョン)
*   npm

### インストール

プロジェクトのディレクトリで以下のコマンドを実行して、依存関係をインストールします。

```bash
npm install
```

## 実行方法

### 開発モード (Webブラウザ)

Webブラウザで動作確認を行う場合：

```bash
npm run dev
```

### 開発モード (Electron)

Electronアプリとして動作確認を行う場合：

```bash
npm run dev:electron
```

## ビルド方法

Windows向けのインストーラー（または実行ファイル）を作成するには、以下のコマンドを実行します。

```bash
npm run build:electron
```

ビルドが完了すると、`dist_electron` フォルダ内に生成物が保存されます。
*   **実行ファイル (Unpacked)**: `dist_electron/win-unpacked/Rhythm Forge Drills.exe`

## トラブルシューティング

### ビルド時のネットワークエラー

ビルド時に `winCodeSign` などのツールダウンロードでエラーが発生する場合、プロジェクト内の `.cache` フォルダを使用するように設定されています。

```bash
# キャッシュを使用してビルド
npm run build:electron
```
