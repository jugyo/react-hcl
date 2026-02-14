# React Terraform 実装計画

## Context
設計ドキュメント (`docs/design-doc.md`) に基づき、TSX から Terraform の `.tf` ファイルへのトランスパイラを実装する。グリーンフィールドプロジェクト。最小単位でテストを書きながら積み上げていく。

## 技術選定
- **開発時ランタイム/パッケージマネージャー/テスト**: bun (bun:test)
- **TSX トランスパイル**: esbuild（CLI 内部でプログラマティックに使用）
- **配布**: npm パッケージ (`npx react-terraform`)
- **JSX**: カスタム JSX ランタイム（React は使わない。独自の jsx() で軽量に実装）

## ステップ

### Step 1: プロジェクト初期化
- `bun init`、`tsconfig.json`（JSX設定含む）
- esbuild を依存に追加
- ディレクトリ構成: `src/`, `tests/`
- `bun test` が動くことを確認する最小テスト

### Step 2: CLI パイプライン PoC（esbuild + JSX ランタイム）
**最も重要なステップ。アーキテクチャの実現可能性を早期に検証する。**
- 最小のカスタム JSX ランタイム (`src/jsx-runtime.ts`): `jsx()`, `jsxs()`, `Fragment`
- 最小の CLI (`src/cli.ts`): esbuild でユーザー TSX をトランスパイル → 評価 → 標準出力
- ダミーの `Resource` コンポーネント（文字列を返すだけ）
- テスト用 fixture TSX ファイルを用意し、CLI 経由で実行して期待する出力が得られることを確認
- **検証ポイント**: esbuild の `jsxImportSource` 設定でカスタム JSX ランタイムが呼ばれること

### Step 3: HCL シリアライザ
JS オブジェクトを HCL 文字列に変換する。
- `src/hcl-serializer.ts`
- 文字列 → `key = "value"`
- 数値 → `key = 123`
- 真偽値 → `key = true`
- 配列 → `key = ["a", "b"]`
- ネストオブジェクト → `key { ... }` ブロック
- `RawHCL` 型（リファレンス等をクォートせずに出力）
- テスト: `tests/hcl-serializer.test.ts`

### Step 4: ブロックモデルと TF ファイル生成
HCL ブロックの中間表現を定義し、main.tf 文字列を生成する。
- `src/blocks.ts` - ブロックの型定義
- `src/generator.ts` - ブロック配列 → main.tf 文字列
- テスト: `tests/generator.test.ts`

### Step 5: レンダラー（JSX → Block 収集）
JSX ランタイムの評価結果から Block 配列を収集する仕組み。
- `src/renderer.ts` - コンポーネントツリーを評価して Block[] を返す
- Step 2 で作った最小 JSX ランタイムを拡張
- テスト: `tests/renderer.test.ts`

### Step 6: Resource コンポーネント + E2E パイプライン
最初の実コンポーネント。CLI 経由での完全な TSX → main.tf 変換を確認。
- `src/components/resource.ts`
- `<Resource type="aws_vpc" name="main" cidr_block="10.0.0.0/16" />`
  → `resource "aws_vpc" "main" { cidr_block = "10.0.0.0/16" }`
- テスト: コンポーネント単体テスト + CLI E2E テスト（fixture TSX → main.tf スナップショット）

### Step 7: 残りのプリミティブコンポーネント
DataSource, Output, Variable, Locals, Provider, Terraform を追加。
- `src/components/{data-source,output,variable,locals,provider,terraform}.ts`
- 各コンポーネントのテスト

### Step 8: useRef 実装
リソース間の参照を解決する。
- `src/hooks/use-ref.ts`
- `ref` 属性でリファレンスを登録
- `ref.id` 等で `aws_vpc.main.id` に変換
- `provider` / `depends_on` 属性での useRef 参照
- テスト: 参照解決、未解決参照エラー

### Step 9: tf ヘルパー
- `src/helpers/tf.ts`
- `tf.var("name")` → `var.name`
- `tf.local("name")` → `local.name`
- テスト: 各ヘルパーの出力

### Step 10: innerText HCL サポート
- JSX の children として HCL 文字列を直接記述（`string` または `() => string`）
- `useRef` の参照を innerText 内で使う場合は関数で包む（`{() => \`...\${ref.id}...\`}`）
- ref を関数で包まずに使用した場合はランタイムエラーで関数の使用を促す
- `hcl2-parser` で構文チェック
- インデント自動調整
- テスト: innerText → HCL 出力、構文エラー検出、ref エラーガード

### Step 11: コンフリクト検出
- 同一 `type + name` の Resource/DataSource 重複エラー
- Variable / Output の名前重複エラー
- Provider の同 type + 同 alias エラー
- Terraform の複数定義エラー
- テスト: 各パターンのエラー/許可ケース

### Step 12: コンポジットコンポーネント（カスタムコンポーネント）
- 関数コンポーネントが正しく展開されることを確認
- props の受け渡し、ref を props として渡すパターン
- テスト: カスタムコンポーネントの展開

### Step 13: インテグレーションテスト
- 設計ドキュメントの全サンプルコード (15.1〜15.8) をテストケースとして実装
- 決定論性テスト（同一入力 → 同一出力）

## ディレクトリ構成（最終形）
```
src/
  cli.ts
  jsx-runtime.ts
  renderer.ts
  hcl-serializer.ts
  blocks.ts
  generator.ts
  components/
    resource.ts
    data-source.ts
    output.ts
    variable.ts
    locals.ts
    provider.ts
    terraform.ts
    index.ts
  hooks/
    use-ref.ts
  helpers/
    tf.ts
tests/
  hcl-serializer.test.ts
  generator.test.ts
  renderer.test.ts
  use-ref.test.ts
  tf.test.ts
  conflict.test.ts
  components/
    resource.test.ts
    ...
  e2e/
    cli.test.ts
  integration/
    samples.test.ts
  fixtures/
    basic.tsx
    ...
```

## コーディング規約

### コメント方針
各モジュール（`src/` 以下の `.ts` ファイル）には、あとから仕様を思い出せるよう詳細なコメントを記述する。

- **ファイル先頭**: モジュールの役割、パイプライン内での位置づけ、他モジュールとの関係を JSDoc コメントで記述
- **型定義**: 各型が対応する HCL 出力形式、フィールドの意味・制約、使用例を記述
- **関数**: 入出力の仕様、変換ルール、分岐条件、エッジケースの挙動を記述
- **言語**: コメントは英語で記述する（CLAUDE.md の規約に準拠）

## 検証方法
- 各ステップで `bun test` が通ること
- Step 2: esbuild + カスタム JSX ランタイムのパイプラインが動くこと（最重要）
- Step 6 以降: fixture TSX → main.tf の E2E スナップショットテスト
- 最終的に生成された main.tf が `terraform validate` を通ること（手動確認）
