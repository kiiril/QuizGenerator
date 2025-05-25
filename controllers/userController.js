const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');

exports.signup = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  if (userModel.findUserByEmail(email)) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  try {
    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = userModel.addUser({ email, password: hashedPassword });
    res.status(201).json({ message: 'User created', userId: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = userModel.findUserByEmail(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  try {
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    // For now, just respond with user info (no token/session)
    res.json({ message: 'Login successful', userId: user.id, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
};
