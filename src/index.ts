import { client } from "./pgClient";

await client.connect();

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const databases = await client.query("SELECT datname FROM pg_database");
    const result = databases.rows.map((row) => row.datname);
    return new Response(`databases: ${JSON.stringify(result)}`);
  },
});

console.log(`Listening on http://localhost:${server.port} ..`);
