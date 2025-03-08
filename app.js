require('dotenv').config();  // Load environment variables
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const { JWT } = require("google-auth-library");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON body
app.use(bodyParser.json());
app.use(express.json()); // Middleware for parsing JSON bodies

// Decode the Google credentials from the environment variable
const GOOGLE_CREDENTIALS = JSON.parse(Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf-8'));

// Authenticate using the service account
const authClient = new JWT({
    email: GOOGLE_CREDENTIALS.client_email,
    key: GOOGLE_CREDENTIALS.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth: authClient });

// Spreadsheet ID (to be used in the test route)
const SPREADSHEET_ID = '1FQLYDEhsIDH5FStD0O5E08M6nhHzI1RYShO_o8b9rVY';

// Placeholder function for Bybit API call
function fire_bybit() {
    console.log("fire_bybit");
}

// TradingView Webhook Route
const TRADINGVIEW_SECRET = process.env.TRADINGVIEW_SECRET;

app.all("/1", (req, res) => {
    const password = req.body["x-secret"]; // Expecting password in custom header
  
    if (password !== TRADINGVIEW_SECRET) {
        console.log("password fail");
        return res.status(403).send("Forbidden");
    }

    // Log the raw request body to console
    console.log("Received Request:", JSON.stringify(req.body, null, 2));

    // Send raw data to the /writeToGoogle endpoint
    // const rawJson = JSON.stringify(req.headers["x-secret"], null, 2);
    const rawJson = JSON.stringify(req.body, null, 2);

    // Send the raw JSON object to Google Sheets
    const writeToGoogleUrl = `http://localhost:${PORT}/writeToGoogle?data=${encodeURIComponent(rawJson)}`;
    
    // Call the /writeToGoogle route with the raw data
    require('http').get(writeToGoogleUrl, (response) => {
        console.log(`Data written to Google Sheets: ${response.statusCode}`);
    });

    res.send("OK1212");
});

// Google Sheets writing route
app.all("/writeToGoogle", async (req, res) => {
    try {
        const inputData = req.query.data || req.body.data || "Default Value";

        // Get the next available row in column A
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "A:A",
        });

        const rows = response.data.values || [];
        const nextRow = rows.length + 1;

        // Write the input data to the next row in column A
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `A${nextRow}`,
            valueInputOption: "RAW",
            resource: { values: [[inputData]] },
        });

        res.status(200).json({ success: true, message: `"${inputData}" added to row ${nextRow}` });
    } catch (err) {
        console.error("Error writing to spreadsheet:", err);
        res.status(500).json({ error: "Failed to write to spreadsheet" });
    }
});

// Health check route for AWS Elastic Beanstalk
app.get("/", (req, res) => {
    res.status(200).send("OK");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
