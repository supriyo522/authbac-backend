const express = require("express");
const Url = require("../models/Url");

const router = express.Router();

// Get URL Analytics
router.get("/:alias", async (req, res) => {
    const { alias } = req.params;
    const url = await Url.findOne({ shortUrl: alias });

    if (!url) {
        return res.status(404).json({ message: "Short URL not found" });
    }

    const totalClicks = url.clicks.length;
    const uniqueClicks = new Set(url.clicks.map((click) => click.ip)).size;

    // Clicks by Date
    const clicksByDate = url.clicks.reduce((acc, click) => {
        const date = click.timestamp.toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    // OS Type Analytics
    const osAnalytics = {};
    url.clicks.forEach((click) => {
        const osName = click.userAgent.match(/\b(Windows|Mac|Linux|Android|iOS)\b/)?.[0] || "Unknown";
        if (!osAnalytics[osName]) {
            osAnalytics[osName] = { uniqueClicks: 0, uniqueUsers: new Set() };
        }
        osAnalytics[osName].uniqueClicks += 1;
        osAnalytics[osName].uniqueUsers.add(click.ip);
    });

    const osType = Object.keys(osAnalytics).map((osName) => ({
        osName,
        uniqueClicks: osAnalytics[osName].uniqueClicks,
        uniqueUsers: osAnalytics[osName].uniqueUsers.size,
    }));

    res.json({
        totalClicks,
        uniqueClicks,
        clicksByDate,
        osType,
    });
});

module.exports = router;
