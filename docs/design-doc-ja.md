# Design Document: React Terraform

## 1. 設計方針
- 最終成果物は単一の `main.tf`
- 出力順は React コンポーネントツリー評価順（記述順）を保持
- JSX属性記法と innerText HCL 記法のハイブリッド
- Terraform 互換性を優先（`Resource` と `DataSource` の同名許可）
- ツール責務は変換まで。`terraform validate` 実行はユーザー責務

## 2. スコープと非スコープ

### 2.1 スコープ
- `.tsx` から `.tf` へのトランスパイル
- `Resource` / `DataSource` / `Output` / `Provider` / `Variable` / `Locals` / `Terraform`
- `useRef` による参照表現
- ビルド時 JS 評価（条件分岐・ループ）

### 2.2 非スコープ
- Terraform 実行（plan/apply）
- Terraform CLI 検証の内包（validate/fmt/init 実行）
- tfstate 管理
- Provider 実装

## 3. コンポーネントモデル

### 3.1 プリミティブ
- `<Resource>` -> `resource`
- `<DataSource>` -> `data`
- `<Output>` -> `output`
- `<Provider>` -> `provider`
- `<Variable>` -> `variable`
- `<Locals>` -> `locals`
- `<Terraform>` -> `terraform`

### 3.2 コンポジット
- カスタムコンポーネントは構造化単位
- 直接出力はされず、内部プリミティブ展開結果を出力
- 論理的グルーピングは `main.tf` 配置順に反映
- props は通常の React コンポーネントと同じ（パラメータ化による再利用が可能）
- 内部リソースの ref を親に公開したい場合は、ref を props として受け取る（`forwardRef` は使用しない）

### 3.3 Hooks 制約
- サポート: `useRef` のみ
- 非サポート: `useState`, `useEffect`, `useMemo`, `useCallback` など

## 4. 記法仕様

### 4.1 JSX属性記法
- 標準の基本記法
- 型補完・型チェックを効かせやすい

### 4.2 innerText HCL記法
- 複雑なネストブロック、`dynamic`、既存HCL移植に使用
- `type` と `name` 以外の属性指定は禁止（TypeScript の型定義で検出する）
- JSテンプレート式を評価後、HCLとして出力
- children は文字列または文字列を返す関数（`() => string`）を指定可能
- innerText 内で `useRef` の参照を使う場合は関数で包む必要がある（`{() => \`...\${ref.id}...\`}`）。テンプレートリテラルの即時評価による ref 未解決を防ぐため
- ref を関数で包まずにテンプレートリテラルで使用した場合、ランタイムエラーが発生し、関数の使用を促すメッセージが表示される

### 4.3 JS式評価スコープ
- JavaScript の通常のレキシカルスコープ規則に従う
- props / ローカル変数 / `useRef` / モジュールスコープを参照可能
- 追加の独自制限は設けない

### 4.4 `tf` ヘルパー
- `useRef` ではカバーできない Terraform 式（変数・ローカル値）を JSX 属性内で表現するためのヘルパー
- `tf.var("name")` → `var.name` として出力
- `tf.local("name")` → `local.name` として出力

### 4.5 エスケープ
- `${expr}`: JS 式評価
- `\${expr}`: Terraform 式をそのまま残す（`${expr}` として出力）。JS テンプレートリテラルの標準エスケープ

## 5. 参照解決と衝突ルール

### 5.1 `useRef` 解決
- `ref.id` 等を Terraform 参照へ変換
- 未解決参照はビルドエラー
- `useRef` はリソース参照の syntax sugar として扱う
- `ref.<attr>` は対象ブロックの属性参照へ変換する（例: `vpcRef.id` -> `aws_vpc.main.id`）
- `terraform_remote_state` では `ref.outputs.<name>` 参照をサポートする
- HCL上で参照であるものは `useRef` で表現する（文字列ではなく参照として出力）
  - `provider` 属性: `useRef` で `<Provider>` を参照 → `provider = aws.virginia` として出力
  - `depends_on` 属性: `useRef` の配列で参照 → `depends_on = [aws_vpc.main]` として出力

### 5.2 衝突検出
- `<Resource>` 同士の同一 `type + label` はエラー
- `<DataSource>` 同士の同一 `type + name` はエラー
- `<Resource>(type + label)` と `<DataSource>(type + name)` の組み合わせは許可
- `<Variable>` は同名定義をエラー
- 複数の `<Locals>` はそれぞれ独立した `locals {}` ブロックとして出力
- `<Output>` は同名定義をエラー
- `<Provider>` は同一 `type` を許可（Terraformのエイリアス運用を許容）。ただし同一 `type` かつ同一 `alias` はエラー
- `<Terraform>` は設定起点を1つに保つため複数定義をエラー

## 6. 出力仕様

### 6.1 ファイル
- 出力先ディレクトリに単一 `main.tf` を生成

### 6.2 出力順序
- React 側記述順を保持（自動ソートしない）
- コンポジットによるグループを維持

### 6.3 innerText と重複チェック
- innerText 使用時は `type/name` 以外の属性が禁止されるため、同一リソース内の「属性 vs innerText」重複チェックは不要
- ただし、名前衝突検出は通常どおり実施

### 6.4 フォーマット
- インデントは最小インデントを基準に自動調整する
- フォーマッターは提供しない（出力の整形はトランスパイラが担保する）

## 7. トランスパイルフロー

### 7.1 JSX属性記法フロー
1. TSX 読み込み
2. JSX/TSX パース
3. コンポーネントツリー評価（`ref` 登録と参照解決を含む。記述順に評価するため、参照先は参照元より先に定義されている必要がある）
4. 属性を HCL へ変換
5. `main.tf` 出力

### 7.2 innerText 記法フロー
1. TSX 読み込み
2. JSX/TSX パース
3. レンダリング時、children が関数であれば呼び出す（遅延評価により ref が解決済みであることを保証）
4. innerText 内 `${}` を評価
5. 評価後文字列を HCL として取り込み
6. `main.tf` 出力

### 7.3 ハイブリッド
- 属性記法と innerText 記法を同一プロジェクトで混在可能

### 7.4 TSX 評価実行モデル
- npm パッケージとして配布し、CLI ツールとして提供する
- `.tsx` をトランスパイル後に評価する
- モジュール方式は ESM のみサポートする
- 実行コンテキストでは `process.env` をそのまま利用可能とする
- 副作用は原則として JavaScript の通常実行範囲を許可する（ユーザー責任）
- プラットフォームは限定しない（Node.js が動作する環境であれば利用可能）

## 8. HCL 生成とバリデーション

### 8.1 HCL 生成
- 属性記法: 独自シリアライズで HCL 文字列化
- innerText: 展開後テキストを取り込み

### 8.2 最低限バリデーション
- innerText は `hcl2-parser`（npm パッケージ）で構文チェック
- JS式評価後のHCLテキストを `hcl2-parser` の `parseToObject()` でパースする
- 詳細な属性妥当性は Terraform CLI（`terraform validate`）に委譲

### 8.3 責務境界
- React Terraform は `terraform validate` を実行しない
- ユーザーが手元で検証（必要なら CI でも実施）

## 9. 型戦略

### 9.1 Phase 1
- 主要リソースを手動キュレーション型でサポート

### 9.2 未サポート型
- 型なしで使用可能（必要時は innerText を併用）

### 9.3 型とバリデーションの方針
- 型は開発支援（補完・タイポ検出）のためであり、出力のゲートではない
- 型定義にない属性はエラーにせず、そのまま HCL に出力する
- 属性の妥当性チェックは `terraform validate` に委譲する
- コンポーネントの props 型にはインデックスシグネチャ（`[key: string]: any`）を持たせ、未知の属性も許可する

### 9.4 Phase 2 以降
- Provider スキーマ由来の型自動生成を検討

## 10. 環境別ビルド戦略
- 環境変数（例: `ENV=prod`）を `.tsx` で評価
- 環境ごとに異なる出力ディレクトリへ `main.tf` を生成
- 生成物に条件分岐ロジックを残さない

## 11. 追加仕様

### 11.1 lifecycle
- `lifecycle` 属性で `prevent_destroy`, `ignore_changes` 等を出力可能

### 11.2 depends_on
- `depends_on` 属性で依存関係を明示可能

### 11.3 Provider エイリアス
- `<Provider>` に `alias` 属性を指定して同一プロバイダーの複数設定を定義
- `<Resource>` / `<DataSource>` から `provider` 属性に `useRef` で参照
- alias なしの `<Provider>` がデフォルトとなり、リソース側で `provider` 省略時に使用される

### 11.4 Terraform ブロック
- `<Terraform>` は innerText 記法と属性記法の両方をサポート
- `required_version`, `required_providers`, `backend` を記述可能

### 11.5 remote state
- `<DataSource type="terraform_remote_state">` をサポート

### 11.6 provisioner
- 非推奨だが属性記法でサポート

## 12. エラーハンドリング

### 12.1 方針
- JSX/TSX の構文エラーはランタイム評価時にエラーとする（通常の React と同じ）
- 未知の属性はバリデーションせず、そのまま HCL に出力する
- トランスパイラ独自のバリデーションは最小限（衝突検出等）に留める

### 12.2 エラー種別
- 型エラー: innerText 使用時の不正な属性指定など（TypeScript の型チェックで検出）
- 構文エラー: TSX 評価時にエラー
- HCL パースエラー: innerText の該当位置と原因を表示
- JS 式評価エラー: 式と例外メッセージを表示
- 衝突エラー: ブロック種別と論理ラベル（`Resource: type + label`、`DataSource: type + name`）を表示
- Variable 不一致: 差分内容を表示

## 13. 運用ガイド
- 生成された `main.tf` は Git 管理を推奨
- シークレット値をビルド時に埋め込まない
- `tf.var("...")` と実行時注入を基本とする
- 必要に応じて Secrets Manager/Vault の data source を使う

## 14. テスト戦略

### 14.1 単体テスト
- 属性 -> HCL 変換
- innerText 展開/検証
- `useRef` 解決
- 衝突検出・Variable マージ

### 14.2 統合テスト
- `.tsx -> main.tf` スナップショット
- 同一入力の再ビルド一致（決定性）

### 14.3 手動検証
- ユーザーが `terraform validate` 実行
- 必要に応じて実環境 apply 検証

## 15. サンプルコード（オリジナルPRDから移管）

### 15.1 基本リソース
```tsx
<Resource
  type="aws_vpc"
  label="main"
  cidr_block="10.0.0.0/16"
  enable_dns_hostnames={true}
/>
```

### 15.2 参照（useRef）
```tsx
const vpcRef = useRef();

<>
  <Resource type="aws_vpc" label="main" ref={vpcRef} cidr_block="10.0.0.0/16" />
  <Resource type="aws_subnet" label="public" vpc_id={vpcRef.id} cidr_block="10.0.1.0/24" />
</>
```

### 15.3 Variable / Locals
```tsx
<>
  <Variable name="environment" type="string" default="dev" />
  <Locals
    common_tags={{ Environment: tf.var("environment") }}
  />
</>
```

### 15.4 innerText
```tsx
<Resource type="aws_security_group" label="example">
  {() => `
    name   = "example"
    vpc_id = ${vpcRef.id}

    dynamic "ingress" {
      for_each = var.additional_ports
      content {
        from_port   = ingress.value
        to_port     = ingress.value
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
      }
    }
  `}
</Resource>
```

> **Note**: innerText 内で `useRef` の参照を使う場合は関数で包む（`{() => \`...\`}`）。ref を使わない静的な innerText は文字列のまま（`{\`...\`}`）で記述可能。


### 15.5 Provider エイリアス
```tsx
const virginiaRef = useRef();

<>
  <Provider type="aws" region="ap-northeast-1" />
  <Provider type="aws" ref={virginiaRef} alias="virginia" region="us-east-1" />

  {/* provider 省略 → デフォルトの aws（東京） */}
  <Resource type="aws_instance" label="tokyo" ami="ami-xxx" instance_type="t3.micro" />

  {/* useRef で provider を参照 → バージニア */}
  <Resource type="aws_instance" label="us" ami="ami-yyy" instance_type="t3.micro" provider={virginiaRef} />
</>
```

### 15.6 depends_on
```tsx
const vpcRef = useRef();

<>
  <Resource type="aws_vpc" label="main" ref={vpcRef} cidr_block="10.0.0.0/16" />
  <Resource type="aws_instance" label="web" ami="ami-xxx" instance_type="t3.micro" depends_on={[vpcRef]} />
</>
```

### 15.7 Terraform block（属性記法）
```tsx
<Terraform
  required_version=">= 1.0"
  required_providers={{
    aws: {
      source: "hashicorp/aws",
      version: "~> 5.0",
    },
  }}
/>
```

### 15.8 Terraform block（innerText記法）
```tsx
<Terraform>
  {`
    required_version = ">= 1.0"

    required_providers {
      aws = {
        source  = "hashicorp/aws"
        version = "~> 5.0"
      }
    }

    backend "s3" {
      bucket = "my-terraform-state"
      key    = "prod/terraform.tfstate"
      region = "ap-northeast-1"
    }
  `}
</Terraform>
```

## 16. 将来拡張（PoC外）
- `<Module>` の導入
- 型定義自動生成
- `.tf -> .tsx` 逆変換
- IDE 補助（innerText HCL 補完、補助診断）
