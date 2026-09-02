require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const layoverRoutes = require('./routes/layoverRoutes');
const simulationRoutes = require('./routes/simulationRoutes');
const aiRoutes = require('./routes/aiRoutes');
const tripRoutes = require('./routes/tripRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database connection (dual-mode)
connectDB();

// Global Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname, '../frontend/public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/layover', layoverRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/trips', tripRoutes);

// Health check endpoint (for CI/CD pipelines & monitoring)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'LayoverIQ API',
    tagline: 'Smart decisions between flights.',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Single Page Application route fallback
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
  }
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// Centralized Error Handling
app.use(errorHandler);

// Start server if executed directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`========================================================`);
    console.log(`✈️  LayoverIQ Server running on http://localhost:${PORT}`);
    console.log(`Tagline: "Smart decisions between flights."`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`========================================================`);
  });
}

module.exports = app;
// backend logic note
