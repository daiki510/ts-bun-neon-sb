declare global {
  var items: string[];
}

globalThis.items ??= []; // itemsが未定義の場合、空の配列で初期化

const server = Bun.serve({
  port: 3000,
  fetch(req) {
    // リクエストごとに配列にアイテムを追加
    globalThis.items.push(`Item ${globalThis.items.length + 1}`);
    // 配列の内容をレスポンスとして返す
    return new Response(`Items: ${globalThis.items.join(", ")}`);
  },
});

console.log(`Listening on http://localhost:${server.port} ..`);
