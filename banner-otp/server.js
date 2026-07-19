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

function otpKey(phone) {
    return `otp:${phone}`;
}

app.post("/otp", async (req, res) => {
    const { phone } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    await redis.set(otpKey(phone), otp, "EX", 30); // Store OTP in Redis with a 30-second expiration
    res.json({ message: "OTP generated successfully", otp, success: true }); // sim of sending OTP to the user
});

app.post("/otp/verify", async (req, res) => {
    const {phone, otp} = req.body;
    const storedOtp = await redis.get(otpKey(phone));

    if (!storedOtp) {
        return res.status(400).json({ message: "OTP has expired or does not exist", success: false });
    }
    
    if (storedOtp !== otp) {
        return res.status(400).json({ message: "Invalid OTP", success: false });
    }

    await redis.del(otpKey(phone)); // Delete OTP after successful verification
    res.json({ message: "OTP verified successfully", success: true });
});

app.get("/otp/:phone/ttl", async (req, res) => {
    const { phone } = req.params;
    const ttl = await redis.ttl(otpKey(phone));
    res.json({ ttl, success: true });
});

app.listen(5000, () => {
    console.log("Banner service is running on port 5000");
});