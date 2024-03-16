import { client, fetchAllTasks, fetchTaskBy, initDB } from "./pgClient";

await client.connect();

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    await initDB();
    const tasks = await fetchAllTasks();
    const task = await fetchTaskBy(1);
    return new Response(
      `task: ${JSON.stringify(task)}\ntasks: ${JSON.stringify(tasks)}`
    );
  },
});

console.log(`Listening on http://localhost:${server.port} ..`);
