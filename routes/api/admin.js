const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../../models/Admin');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ error: 'Admin not found' });

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, admin: { username: admin.username, email: admin.email } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;