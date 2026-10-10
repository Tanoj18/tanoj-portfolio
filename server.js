/**
 * ==============================================================================
 * TANOJ PERSONAL PORTFOLIO - LOCAL SERVER
 * Serves portfolio files on port 4173 for local preview & development.
 * Note: Contact form email delivery is handled client-side via EmailJS.
 * ==============================================================================
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4173;

// Helper to provide consolidated EmailJS config script to frontend
function sendEmailJSConfig(req, res) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');

    // Read values from process.env (loaded from root .env)
    const envPubKey = (process.env.VITE_EMAILJS_PUBLIC_KEY || '').trim();
    const envServiceId = (process.env.VITE_EMAILJS_SERVICE_ID || '').trim();
    const envTemplateId = (process.env.VITE_EMAILJS_TEMPLATE_ID || '').trim();
    const envAckId = (process.env.VITE_EMAILJS_ACK_TEMPLATE_ID || '').trim();

    // Read static disk configuration if available
    let diskPubKey = '', diskServiceId = '', diskTemplateId = '', diskAckId = '';
    try {
        const filePath = path.join(__dirname, 'emailjs-config.js');
        if (fs.existsSync(filePath)) {
            const diskContent = fs.readFileSync(filePath, 'utf8');
            const pubMatch = diskContent.match(/VITE_EMAILJS_PUBLIC_KEY:\s*["']([^"']*)["']/);
            const srvMatch = diskContent.match(/VITE_EMAILJS_SERVICE_ID:\s*["']([^"']*)["']/);
            const tmplMatch = diskContent.match(/VITE_EMAILJS_TEMPLATE_ID:\s*["']([^"']*)["']/);
            const ackMatch = diskContent.match(/VITE_EMAILJS_ACK_TEMPLATE_ID:\s*["']([^"']*)["']/);
            if (pubMatch) diskPubKey = pubMatch[1].trim();
            if (srvMatch) diskServiceId = srvMatch[1].trim();
            if (tmplMatch) diskTemplateId = tmplMatch[1].trim();
            if (ackMatch) diskAckId = ackMatch[1].trim();
        }
    } catch (e) {}

    const pubKey = envPubKey || diskPubKey || '';
    const srvId = envServiceId || diskServiceId || '';
    const tmplId = envTemplateId || diskTemplateId || '';
    const ackId = envAckId || diskAckId || '';

    res.send(`/**
 * Dynamically consolidated EmailJS configuration
 * Sourced from .env and emailjs-config.js
 */
window.EMAILJS_CONFIG = {
    VITE_EMAILJS_PUBLIC_KEY: ${JSON.stringify(pubKey)},
    VITE_EMAILJS_SERVICE_ID: ${JSON.stringify(srvId)},
    VITE_EMAILJS_TEMPLATE_ID: ${JSON.stringify(tmplId)},
    VITE_EMAILJS_ACK_TEMPLATE_ID: ${JSON.stringify(ackId)}
};
`);
}

// Serve config endpoint for both emailjs-config.js and emails-config.js
app.get('/emailjs-config.js', sendEmailJSConfig);
app.get('/emails-config.js', sendEmailJSConfig);

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// Fallback to index.html for SPA routing
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`Tanoj Portfolio Server running at http://localhost:${PORT}`);
    console.log(`EmailJS configuration synced with .env and emailjs-config.js`);
    console.log(`====================================================`);
});
