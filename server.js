const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));


// Serve prototype.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'prototype4.html'));
});

// API routes
const quizRoutes = require('./routes/quizRoutes');
const courseRoutes = require('./routes/courseRoutes');
app.use('/api', quizRoutes);
app.use('/api', courseRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
