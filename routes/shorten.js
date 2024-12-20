const express = require("express");
const rateLimit = require("express-rate-limit");
// const { nanoid } = require("nanoid");
const Url = require("../models/Url");

const router = express.Router();

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each user to 10 requests per windowMs
    message: "Too many requests, please try again later.",
});

// Create Short URL
router.post("/", limiter, async (req, res) => {
    const { longUrl, customAlias, topic } = req.body;

    if (!longUrl) {
        return res.status(400).json({ message: "longUrl is required" });
    }
    const { nanoid } = await import("nanoid");
    let shortUrl = customAlias || nanoid(6);
    const existingUrl = await Url.findOne({ shortUrl });
    if (existingUrl) {
        return res.status(400).json({ message: "Custom alias already exists" });
    }

    const newUrl = new Url({
        longUrl,
        shortUrl,
        customAlias,
        topic,
    });

    await newUrl.save();

    res.status(201).json({
        shortUrl: `http://localhost:${process.env.PORT || 3000}/${shortUrl}`,
        createdAt: newUrl.createdAt,
    });
});

// Redirect Short URL
router.get("/:alias", async (req, res) => {
    const { alias } = req.params;
    const url = await Url.findOne({ shortUrl: alias });

    if (!url) {
        return res.status(404).json({ message: "Short URL not found" });
    }

    const ip = req.ip;
    const userAgent = req.headers["user-agent"];
    const geoip = require("geoip-lite");
    const geo = geoip.lookup(ip) || {};

    url.clicks.push({
        timestamp: new Date(),
        ip,
        userAgent,
        geolocation: geo,
    });
    await url.save();

    res.redirect(url.longUrl);
});

module.exports = router;
