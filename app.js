require('dotenv').config();  // Load environment variables

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON body
app.use(bodyParser.json());

// Placeholder function for Bybit API call
function fire_bybit() {
    console.log("fire_bybit");
}

// Endpoint to receive TradingView webhooks
app.post("/webhook", (req, res) => {
    console.log("Received webhook:", req.body);
    
    // Call Bybit function (for now just logs a message)
    fire_bybit();
    
    res.status(200).json({ success: true, message: "Webhook received" });
});

// Test endpoint (sending a value from .env)
app.get("/test", (req, res) => {
    // Fetch the value from .env (for example, "MY_SECRET")
    const mySecret = process.env.MY_SECRET || "No secret found";

    // Send the value of MY_SECRET from the .env file
    res.send(`My secret is: ${mySecret}`);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
