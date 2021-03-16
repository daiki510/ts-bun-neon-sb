import { Client } from "pg";
import { load } from "ts-dotenv";

const env = load({
  PGHOST: String,
  PGDATABASE: String,
  PGUSER: String,
  PGPASSWORD: String,
  ENDPOINT_ID: String,
});

const client = new Client({
  user: env.PGUSER,
  password: env.PGPASSWORD,
  host: env.PGHOST,
  database: env.PGDATABASE,
  port: 5432,
  ssl: true,
});

type Task = {
  id: number;
  title: string;
  isCompleted: boolean;
  createdAt: Date;
};

async function createTasksTable() {
  await client.query(
    `CREATE TABLE IF NOT EXISTS tasks 
      ( 
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        is_completed BOOLEAN,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Tokyo')
      )
    `
  );
}

async function dropTasksTable() {
  await client.query("DROP TABLE IF EXISTS tasks");
}

async function insertTasks() {
  const insertValues = [...Array(10).keys()]
    .map((i) => {
      const id = i + 1;
      const title = `'task_${id}'`;
      const isCompleted = id % 2 === 0;
      return `(${id}, ${title}, ${isCompleted})`;
    })
    .join(", ");
  await client.query<Task>(
    `INSERT INTO tasks (id, title, is_completed) VALUES ${insertValues}`
  );
}

async function initDB() {
  await dropTasksTable();
  await createTasksTable();
  await insertTasks();
}

async function fetchAllTasks(): Promise<Task[]> {
  const tasks = await client.query<Task>("SELECT * FROM tasks");
  return tasks.rows;
}

async function fetchTaskBy(id: number): Promise<Task> {
  const tasks = await client.query<Task>(
    `SELECT * FROM tasks WHERE id = ${id}`
  );
  return tasks.rows[0];
}

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

console.log(`Listening on http://localhost:${server.port}...`);
