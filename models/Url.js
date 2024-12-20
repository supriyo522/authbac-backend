const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
    longUrl: String,
    shortUrl: String,
    customAlias: String,
    topic: String,
    createdAt: { type: Date, default: Date.now },
    clicks: [
        {
            timestamp: Date,
            ip: String,
            userAgent: String,
            geolocation: Object,
        },
    ],
});

module.exports = mongoose.model("Url", urlSchema);
