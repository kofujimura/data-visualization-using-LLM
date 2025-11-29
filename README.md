# LLM embeddingモデルを使用したテキストのグラフ可視化

LLMのembeddingモデルを活用して任意のデータ間の類似度を算出し、ブラウザ上でインタラクティブなネットワークグラフで可視化するWebアプリケーションです。

## 概要

OpenAIのtext-embedding-3-smallモデルを使用して、CSV/XLSXファイルのデータからベクトル表現を生成し、コサイン類似度を計算します。類似度の高いアイテムをネットワークグラフで可視化することで、データ間の関係性を直感的に理解できます。

![食品類似度ネットワーク](foods-similarity.png)

## 使い方

1. `index.html` をブラウザで開く
2. OpenAI APIキーを入力して保存
3. データファイル（CSV/XLSX）をアップロード
4. 「生成して可視化」ボタンをクリック

APIキーはブラウザのLocalStorageに保存されるため、2回目以降は入力不要です。

## デモ

実際の動作を試せるデモサイトを公開しています：

**[https://web.fujimura.com/data-visualization-using-LLM/index.html](https://web.fujimura.com/data-visualization-using-LLM/index.html)**

サンプルデータをダウンロードして試すことができます：

- [foods-text.xlsx](foods-text.xlsx) - 114種類の食品データ（食品名、調理法、主な材料）

## ファイル構成

### Webアプリケーション
- `index.html` - メインのHTMLファイル
- `app.js` - データ処理とAPI連携
- `visualization.js` - D3.jsによるグラフ描画
- `kmeans.js` - K-meansクラスタリング実装
- `styles.css` - スタイルシート

### サンプルデータ
- `foods-text.xlsx` - 114種類の食品データ（食品名、調理法、主な材料）
- `foods-similarity.png` - 結果の可視化画像

### Jupyter Notebook版（参考）
- `foods-visualization-using-LLM.ipynb` - Python版の実装

## 主な機能

1. **データファイル読み込み**: CSV/XLSXファイルの自動パース
2. **ファイルプレビュー**: アップロードしたデータの確認
3. **Embedding生成**: OpenAI APIによるベクトル化
4. **類似度計算**: コサイン類似度による関係性評価
5. **自動クラスタリング**: K-means法によるグループ化（データ数に応じて自動調整）
6. **インタラクティブ可視化**: D3.jsによるネットワークグラフ

## 技術仕様

- **フロントエンド**: Vanilla JavaScript（フレームワーク不要）
- **可視化ライブラリ**: D3.js v4
- **Embeddingモデル**: OpenAI text-embedding-3-small（1536次元）
- **類似度指標**: コサイン類似度
- **クラスタリング**: K-means法（3〜15クラスタ、データ数に応じて自動調整）
- **ネットワーク**: 各ノードの上位5類似アイテムをエッジとして接続

## データフォーマット

CSV/XLSXファイルは以下の形式で準備してください：

- 1行目：ヘッダー（列名）
- 2行目以降：データ

例（食品データの場合）:
```
食品名,調理法,主な材料
鶏のから揚げ,揚げ物,鶏肉・醤油・生姜
カレーライス,煮込み,カレールー・じゃがいも・にんじん
```

全ての列のデータが結合されてembedding生成に使用されます。

## ブラウザ要件

- モダンブラウザ（Chrome、Firefox、Safari、Edge最新版）
- JavaScriptが有効であること
- インターネット接続（OpenAI API呼び出しのため）

## セキュリティに関する注意

- APIキーはブラウザのLocalStorageに保存されます
- APIキーは外部に送信されず、OpenAIのAPIとの通信にのみ使用されます
- 本番環境では適切なAPIキー管理を行ってください

## Jupyter Notebook版について

`foods-visualization-using-LLM.ipynb` でPython版の実装も提供しています。

実行環境:
- Google Colaboratory推奨
- Python 3.x
- 必要ライブラリ: openai, pandas, numpy, openpyxl, scikit-learn, matplotlib

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
