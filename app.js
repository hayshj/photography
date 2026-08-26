const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const path = require("path");

// Load env variables early
dotenv.config();

const app = express();

// ✅ Connect Database
connectDB();

// ✅ Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Static image folder
app.use('/galleries', express.static('galleries', {
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
}));

// ✅ API Routes
const galleryRouter = require('./routes/api/gallery');
const imageRouter = require('./routes/api/image');
const adminRouter = require('./routes/api/admin');
app.use('/api/gallery', galleryRouter);
app.use('/api/image', imageRouter);
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
app.use(express.static(frontendPath));

// ✅ Frontend fallback (only for non-API routes)
app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ✅ Start the server
const port = process.env.PORT || 3000;
console.log("🚀 Server is starting on port:", port);
app.listen(port, () => console.log(`✅ Server running on port ${port}`));
