import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

const BANNER_KEY = "banner";

app.post("/banner", async (req, res) => {
    await redis.set(BANNER_KEY, req.body.message || "Hello this is a default banner message");
    res.json({ message: "Banner message set successfully", success: true });
});

app.get("/banner", async (req, res) => {
    const message = await redis.get(BANNER_KEY);
    res.json({ message: message || "No banner message set", success: true });
});

app.delete("/banner", async (req, res) => {
    await redis.del(BANNER_KEY);
    res.json({ message: "Banner message deleted successfully", success: true });
});

app.get("/banner/exists", async (req, res) => {
    const exists = await redis.exists(BANNER_KEY);
    res.json({ exists: exists === 1, success: true });
});

app.listen(5000, () => {
    console.log("Banner service is running on port 5000");
});