# 楽天ROOM V66 — AI文章生成バックエンド

GitHub Pages は静的配信なので、OpenAI API キーを画面内や GitHub に書くのは厳禁です。この Cloudflare Worker が秘密鍵を安全に保管して OpenAI API の呼び出しを担当します。

## 最短手順（Cloudflare ダッシュボード）
1. Cloudflare > Workers & Pages で Worker を新規作成。
2. [src/index.js](./src/index.js) のコードで Worker を置き換えてデプロイ。
3. Settings > Variables and Secrets の **Secret** に以下を登録：
   - `OPENAI_API_KEY`：OpenAI API の秘密鍵（GitHub に保存しない）
   - `ROOM_ACCESS_TOKEN`：自分だけが知る32文字以上のランダムな合言葉
4. 表示された `https://<name>.<subdomain>.workers.dev` を V66 の Worker URL 欄に貼る。
5. V66 の「Worker専用パスコード」欄に合言葉を入力し、接続確認。

CLIを使う場合は、このディレクトリで：
```bash
npx wrangler deploy
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put ROOM_ACCESS_TOKEN
```

## セキュリティ・仕様
- CORS は https://swen55swen-stack.github.io のみに許可。
- それとは別に X-Room-Token と Secret を照合。CORS だけを認証代わりにしていません。
- OpenAI キーは Cloudflare Secret から読み込み、ブラウザへ返しません。
- 入力は楽天の商品情報（タイトル・説明・価格・レビュー等）のみ。楽天の Application ID、Access Key は送信しません。
- 商品 URL のホストは楽天市場・Rakuten Fashion に限定。サーバーは任意 URL にアクセスしません。
- OpenAI Responses API の Structured Outputs を利用。**商品特定・根拠抽出 → ROOM文作成 → 独立校閲**の三段階です（1商品につき原則3回のAI呼び出し）。
- 文章はハッシュタグ含め最大500文字に制限。推測・購入体験の捏造を禁止するプロンプトです。
- OpenAI API は ChatGPT のサブスクリプションと別料金です。従量課金の上限を設定してください。
- AI が絶対に間違わない保証はないため、必ず投稿前に原文・価格を確認してください。

## テスト
V66で正式情報が照合できた商品を選び「✨ AIで商品専用の文章を生成」を押す。未照合の商品はAI生成を停止し、間違った商品の紹介を防ぎます。URL取込時の自動生成も設定可能です。
