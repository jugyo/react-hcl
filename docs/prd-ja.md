# Product Requirements Document (Minimized): React Terraform

## 1. プロダクト概要

### 1.1 目的
React（JSX/TSX）の記法でTerraform設定を記述し、標準的な `.tf` ファイルに変換するトランスパイラを提供する。  
最終成果物は Terraform CLI でそのまま扱える `main.tf` とし、既存ワークフローへの統合を重視する。

### 1.2 コンセプト
- ビルド時（`.tsx -> .tf`）にJS側の条件分岐・ループを解決する
- 生成物は可読なHCLで、デプロイ内容を事前把握しやすくする
- このツールは「変換」に責務を限定し、Terraform実行責務は持たない

### 1.3 スコープ
**含む**
- `.tsx` から `.tf` へのトランスパイル
- `Resource` / `DataSource` / `Output` / `Provider` / `Variable` / `Locals` / `Terraform` の表現
- JSX属性記法とinnerText HCL記法のハイブリッド運用
- `useRef` による参照表現
- TypeScriptによる開発支援（初期は主要リソース中心）

**含まない**
- Terraform実行（`plan` / `apply`）
- Terraform CLI検証コマンドの実行（`terraform validate` 等）
- `tfstate` 管理
- Terraformプロバイダー実装
- Terragruntのような高度な依存管理・オーケストレーション

### 1.4 対象ユーザー
- ReactとTerraformの基礎を持つ開発者
- Terraformの可読性・再利用性・レビュー容易性を改善したいチーム

## 2. プロダクト要件

### 2.1 出力要件
- 最終成果物は単一の `main.tf`
- `main.tf` には `resource` / `data` / `output` / `provider` / `variable` / `locals` / `terraform` ブロックを出力可能
- 出力順序は Reactコンポーネントツリーの評価順（`.tsx` 記述順）を保持する
- コンポジットコンポーネントによる論理グルーピングを `main.tf` の配置に反映する

### 2.2 記法要件（ハイブリッド）
- シンプルなケースは JSX属性記法を推奨
- 複雑なネスト/動的構文は innerText HCL記法を許可
- innerText 使用時は `type` と `name` 以外の属性指定を禁止する
- innerText の children は文字列（`{\`...\`}`）または文字列を返す関数（`{() => \`...\`}`）を指定可能
- innerText 内で `useRef` の参照を使う場合は関数で包む必要がある。関数で包まずにテンプレートリテラルで ref を使用した場合、ランタイムエラーが発生し関数の使用を促す
- innerText内のJS式評価スコープは JavaScript の通常仕様（レキシカルスコープ）に従う
- innerText内の `${expr}` は JS式として評価、`\${expr}` は Terraform式としてそのまま出力する（JS標準のエスケープ）
- JSX属性名は Terraform のフィールド名（snake_case）をそのまま使用する

### 2.3 Provider エイリアス
- `<Provider>` の `alias` 属性でエイリアスを定義可能
- `<Resource>` / `<DataSource>` から `provider` 属性に `useRef` で参照する

### 2.4 参照・衝突ルール
- `useRef` を参照表現としてサポートする（リソース属性参照、`provider`、`depends_on`）
- HCL上で参照であるものは `useRef` で、文字列であるものは文字列で表現する
- リソース名衝突判定は Terraform互換で実施する
  - `<Resource>` 同士で同一 `type + label` はエラー
  - `<DataSource>` 同士で同一 `type + label` はエラー
  - `<Resource>(type + label)` と `<DataSource>(type + label)` の組み合わせは許可
- `<Variable>` 同名定義はエラー

### 2.5 環境分離
- 環境差分は `.tsx` 側（環境変数や設定オブジェクト）で分岐する
- 環境ごとに別ディレクトリへ `main.tf` を生成する運用を想定する

### 2.6 検証責務
- React Terraformは `terraform validate` を実行しない
- 生成物の検証はユーザーが手元環境で実施する（必要に応じてCIで実施可能）

## 3. 制約・前提

### 3.1 制約
- Terraform 1.0以上を想定
- 変換対象は単一エントリポイントの `.tsx`（そこからの import は許可）
- React Hooksは `useRef` のみサポート

### 3.2 前提
- ユーザーはReact/Terraformの基本概念を理解している
- Node.js 実行環境がある
- 生成された `main.tf` は通常の Terraform CLI で実行する

## 4. 成功指標（PoC）

### 4.1 機能面
- 主要リソース定義が `.tsx -> main.tf` に変換できる
- 参照（`useRef`）が正しくHCL参照へ変換される
- 生成物が `terraform validate` を通過する
- 生成物が有効なHCLであり、`terraform plan` で確認できる

### 4.2 開発者体験
- Terraformネイティブ記法より保守しやすいと評価される
- コンポーネント再利用で重複が削減できる
- TypeScript補完が実用に耐える

### 4.3 検証仮説
- JSX記法は可読性を向上させるか
- ビルド時確定アプローチは運用上わかりやすいか
- ハイブリッド記法（属性/innerText）の使い分けは実務で機能するか
- CDKTFとの差別化（HCL出力・既存Terraformワークフロー統合）を実感できるか
