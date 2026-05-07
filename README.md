# guest-rose-eta

HAVEN 関連の静的ページ（特定商取引法に基づく表記など）。

- `public/tokushoho.html` … 特商法表記（本番ソース）
- ルートの `tokushoho.html` / `index.html` は静的ホストのルート配信向けに `public/` と同一内容

Vercel などで **Root Directory を `public` に設定**している場合は、`public/` 配下のみがデプロイ対象になります。
