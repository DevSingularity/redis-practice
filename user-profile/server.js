import express from "express";
import Redis from "ioredis";

const app = express();
const redis = new Redis( process.env.REDIS_URL || "redis://localhost:6379" );

app.use(express.json());
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/user/:id/json", async (req, res) => {
  await redis.set(`user:${req.params.id}:json`, JSON.stringify(req.body));
  res.json({ status: "success", savedAs: "json" });
});

app.get("/user/:id/json", async (req, res) => {
  const userData = await redis.get(`user:${req.params.id}:json`);
  if (userData) {
    res.json({ status: "success", data: JSON.parse(userData) });
  } else {
    res.status(404).json({ status: "error", message: "User not found" });
  }
});

app.post("/user/:id/hash", async (req, res) => {
  await redis.hset(`user:${req.params.id}:hash`, req.body);
  res.json({ status: "success", savedAs: "hash" });
});

app.get("/user/:id/hash", async (req, res) => {
  const userData = await redis.hgetall(`user:${req.params.id}:hash`);
  if (Object.keys(userData).length > 0) {
    res.json({ status: "success", data: userData });
  } else {
    res.status(404).json({ status: "error", message: "User not found" });
  }
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});