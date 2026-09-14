import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadEnv() {
  const file = path.join(root, ".env");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !(match[1] in process.env)) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

loadEnv();

const config = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "cms",
};

async function run() {
  const conn = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    multipleStatements: true,
  });

  console.log(`[migrate] Conectado a MySQL en ${config.host}:${config.port}`);

  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await conn.query(`USE \`${config.database}\``);

  await conn.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    filename VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);

  const [rows] = await conn.query("SELECT filename FROM schema_migrations");
  const applied = new Set(rows.map((r) => r.filename));

  const files = fs
    .readdirSync(path.join(root, "migrations"))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  let count = 0;
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`[migrate] - ${file} (ya aplicada)`);
      continue;
    }
    const sql = fs.readFileSync(path.join(root, "migrations", file), "utf8");
    await conn.query(sql);
    await conn.query("INSERT INTO schema_migrations (filename) VALUES (?)", [file]);
    console.log(`[migrate] + ${file} aplicada`);
    count++;
  }

  console.log(count === 0 ? "[migrate] Nada nuevo que aplicar." : `[migrate] ${count} migracion(es) aplicada(s).`);
  await conn.end();
}

run().catch((err) => {
  console.error("[migrate] Error:", err.message);
  process.exit(1);
});
