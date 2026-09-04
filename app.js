const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

// Compression improves transfer performance, but it should never keep the
// application offline if a server restarts before dependencies are installed.
let compression;
try {
  compression = require("compression");
} catch (error) {
  console.warn("Compression middleware is unavailable; run `npm ci` on the server.");
}

// Load env variables early
dotenv.config();

const app = express();

// ✅ Connect Database
connectDB();

// ✅ Middleware
app.use(cors({ origin: true, credentials: true }));
if (compression) {
  app.use(compression());
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ API Routes
const galleryRouter = require('./routes/api/gallery');
const adminRouter = require('./routes/api/admin');
app.use('/api/gallery', galleryRouter);
app.use('/api/admin', adminRouter);

// ✅ Contact Form Email Route
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.mail.me.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      replyTo: email,
      subject: `New Contact Form Submission from ${name}`,
      text: `You received a new message:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully!' });

  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ message: 'Failed to send message. Try again later.' });
  }
});

// ✅ Serve frontend last (Vite uses 'dist'; CRA uses 'build')
const frontendPath = path.join(__dirname, 'frontend', 'dist');
const frontendIndexPath = path.join(frontendPath, 'index.html');

if (!fs.existsSync(frontendIndexPath)) {
  console.error('Frontend build is missing. Run `npm run build` before starting the server.');
}

app.use('/assets', express.static(path.join(frontendPath, 'assets'), {
  maxAge: '1y',
  immutable: true
}));
app.use(express.static(frontendPath, {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (path.extname(filePath) === '.html') {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// ✅ Frontend fallback (only for non-API routes)
app.get(/^\/(?!api\/).*/, (req, res) => {
  if (!fs.existsSync(frontendIndexPath)) {
    return res.status(503).send('The site is being prepared. Please try again shortly.');
  }

  res.sendFile(frontendIndexPath, {
    headers: { 'Cache-Control': 'no-cache' }
  });
});

// ✅ Start the server
const port = process.env.PORT || 3000;
console.log("🚀 Server is starting on port:", port);
app.listen(port, () => console.log(`✅ Server running on port ${port}`));
