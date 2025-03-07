require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON body
app.use(bodyParser.json());

// Load Google Credentials from Environment Variable
const credentials = JSON.parse(Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, "base64").toString());
const doc = new GoogleSpreadsheet("1FQLYDEhsIDH5FStD0O5E08M6nhHzI1RYShO_o8b9rVY");

const authClient = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// Function to log data to Google Sheets
async function logToGoogleSheets(data) {
    try {
        await doc.useServiceAccountAuth(authClient);
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0]; // First sheet
        await sheet.addRow({ A: data });
        console.log("Logged to Google Sheets:", data);
    } catch (err) {
        console.error("Google Sheets error:", err);
    }
}

// Bybit API placeholder function
function fire_bybit() {
    console.log("fire_bybit executed");
}

// Webhook endpoint
app.post("/webhook", async (req, res) => {
    console.log("Received webhook:", req.body);

    // Validate secret key
    const receivedKey = req.body.secret;
    if (receivedKey !== process.env.TRADINGVIEW_SECRET) {
        console.log("Unauthorized webhook attempt!");
        return res.status(403).json({ success: false, message: "Forbidden" });
    }

    // Call Bybit function
    fire_bybit();

    // Log the webhook event to Google Sheets
    await logToGoogleSheets("Webhook received & Bybit triggered");

    res.status(200).json({ success: true, message: "Webhook processed" });
});

// Health check route
app.get("/", (req, res) => {
    res.status(200).send("OK - works bitch");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
