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
    res.send(`My secret is another update : ${mySecret}`);
});

// New test2 route to write to the Google Sheets
app.get("/test2", async (req, res) => {
    try {
        // Get the next available row in column A
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'A:A', // Get column A
        });

        const rows = response.data.values || [];
        const nextRow = rows.length + 1; // The next available row in column A

        // Prepare the data to be written
        const values = [
            [`Fired!`],  // New value to be added in the next available row
        ];

        // Update the spreadsheet with the new value
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `A${nextRow}`,
            valueInputOption: 'RAW',
            resource: {
                values,
            },
        });

        res.status(200).json({ success: true, message: "Fired! added to the spreadsheet" });
    } catch (err) {
        console.error('Error writing to spreadsheet:', err);
        res.status(500).json({ error: 'Error writing to spreadsheet' });
    }
});

// Health check route for AWS Elastic Beanstalk
app.get("/", (req, res) => {
    res.status(200).send("OK - works bitch");
});

// Node.js version route
app.get("/node-version", (req, res) => {
    res.send(`Running Node.js version: ${process.version}`);
});

// Endpoint to serve package.json
app.get("/package.json", (req, res) => {
    const packageJsonPath = path.join(__dirname, "package.json");

    // Read the package.json file
    fs.readFile(packageJsonPath, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Unable to read package.json" });
        }

        // Send the contents of package.json
        res.setHeader("Content-Type", "application/json");
        res.send(data);
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
