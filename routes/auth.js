const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const router = express.Router();
require("dotenv").config();

// Replace with your actual Google Client ID
const CLIENT_ID = process.env.CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

router.post("/google", async (req, res) => {
    const { id_token } = req.body;

    if (!id_token) {
        return res.status(400).json({ message: "ID token is required" });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: id_token,
            audience: CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub, email, name, picture } = payload;

        return res.status(200).json({
            userId: sub,
            email,
            name,
            picture,
            message: "Authentication successful",
        });
    } catch (error) {
        console.error("Error verifying ID token:", error);
        return res.status(401).json({ message: "Invalid ID token" });
    }
});

module.exports = router;
