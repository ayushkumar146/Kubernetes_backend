import express from "express";
import pg from "pg";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const pool = new pg.Pool({
  // EXPLANATION OF THIS URL:
  // 1. "db"      -> This is the NAME of the K8s Service (from ops/db/manifest.yml).
  // 2. "default" -> This is the K8s NAMESPACE where the service is running.
  // 3. "svc"     -> Indicates that this resource is a Service.
  // 4. "cluster.local" -> The default base domain for all resources in a K8s cluster.
  //
  // K8s runs its own DNS server (CoreDNS) which automatically creates this long name
  // so that your app can find the database stable internal IP!
  connectionString: "postgres://postgres:postgres@db.default.svc.cluster.local:5432/postgres",
});

app.get("/users", async (req, res) => {
  const result = await pool.query("SELECT * FROM users");
  res.json(result.rows);
});

app.post("/users", async (req, res) => {
  const result = await pool.query("INSERT INTO users (name) VALUES ($1) RETURNING *", [req.body.name]);
  res.json(result.rows[0]);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

async function initDb() {
  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
  )`);
}

initDb();