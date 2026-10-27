require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;
app.use(cors({ origin: '*' }));
app.use(express.json());
app.set('trust proxy', true);

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length > 0) {
        const firstIp = forwarded.split(',')[0].trim();
        return firstIp.replace('::ffff:', '');
    }

    if (req.ip) {
        return req.ip.replace('::ffff:', '');
    }

    if (req.socket && req.socket.remoteAddress) {
        return req.socket.remoteAddress.replace('::ffff:', '');
    }

    return null;
}

function normalizeCountryCode(value) {
    if (typeof value !== 'string') return null;
    const normalized = value.trim().toUpperCase();
    return /^[A-Z]{2}$/.test(normalized) ? normalized : null;
}

app.post('/save-user', async (req, res) => {
    console.log("--- New Save-User Request Received! ---");
    console.log("Data:", req.body);
    try {
        const database = client.db("oopsieheroesdatabase");
        const collection = database.collection("oopsieheroesusers");
        const result = await collection.insertOne(req.body);
        console.log("Success! Inserted ID:", result.insertedId);
        res.status(200).send(result);
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).send(error.toString());
    }
});

app.post('/save-events', async (req, res) => {
    console.log("Bridge: Request to /save-events received");
    console.log("Payload:", JSON.stringify(req.body).substring(0, 100) + "...");

    try {
        const database = client.db("oopsieheroesdatabase");
        const collection = database.collection("oopsieheroesleaks");


        const eventsToSave = Array.isArray(req.body) ? req.body : [req.body];

        if (!eventsToSave[0] || !eventsToSave[0].owner_id) {
            console.error("Bridge: Malformed data received");
            return res.status(400).send("Malformed data: owner_id missing");
        }

        const result = await collection.insertMany(eventsToSave);
        console.log("Bridge: Successfully saved ${eventsToSave.length} event(s)");
        res.status(200).send(result);

    } catch (e) {
        console.error("Bridge: Server Crash Details:", e.message);
        res.status(500).send(e.toString());
    }
});

app.get('/detect-country', async (req, res) => {
    try {
        const clientIp = getClientIp(req);

        // ipwho.is works without API keys and returns country_code.
        // If we can't determine the client IP, this still returns a valid payload based on request source.
        const endpoint = clientIp
            ? `https://ipwho.is/${encodeURIComponent(clientIp)}`
            : 'https://ipwho.is/';

        const response = await fetch(endpoint, { method: 'GET' });
        if (!response.ok) {
            return res.status(502).json({ countryCode: null, source: 'ip', error: 'geo_lookup_failed' });
        }

        const payload = await response.json();
        const countryCode = normalizeCountryCode(payload?.country_code);

        if (!countryCode) {
            return res.status(200).json({ countryCode: null, source: 'ip' });
        }

        return res.status(200).json({ countryCode, source: 'ip' });
    } catch (error) {
        console.error('Country detection failed:', error);
        return res.status(500).json({ countryCode: null, source: 'ip', error: 'internal_error' });
    }
});

app.get('/', (req, res) => res.send('Hello World!'))
app.listen(3000, () => console.log('Bridge Server running on port 3000'));