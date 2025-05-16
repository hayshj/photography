const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const galleryRouter = require('./routes/api/gallery');
const adminRouter = require('./routes/api/admin');

dotenv.config(); // Load environment variables

const app = express();

// Enable CORS
app.use(cors({ origin: true, credentials: true }));

// Parse request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Serve static images from public/galleries
app.use('/galleries', express.static('galleries'));

// API routes
app.use('/api/gallery', galleryRouter);
app.use('/api/admin', adminRouter);

// ✅ Connect Database
connectDB();

// ✅ Contact form email route
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const transporter = nodemailer.createTransport({
        host: 'smtp.mail.me.com',
        port: 587,
        secure: false, // STARTTLS
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
    });
      

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_TO || process.env.EMAIL_USER,
        replyTo: email, // ✅ allows you to reply to user directly
        subject: `New Contact Form Submission from ${name}`,
        text: `You received a new message:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ message: 'Failed to send message. Try again later.' });
  }
});

// Basic test route
app.get("/", (req, res) => res.send("Hello world!"));

const port = process.env.PORT || 8082;
app.listen(port, () => console.log(`Server running on port ${port}`));
