const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const apiRoutes = require('./routes/apiRoutes');
const { ensureDemoData } = require('./services/seed');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dhaestatepro';
// Pin the database name explicitly. When the connection string has no database
// path segment, the MongoDB driver silently falls back to the "test" database,
// which makes the app query a different database than the one holding the real
// listings (and shows "No Properties Found"). The programmatic dbName option
// takes precedence over any database segment present in the URI.
const DB_NAME = process.env.DB_NAME || 'dhaestatepro';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Base Route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'DHA Estate Pro Karachi SaaS Backend Service',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve locally uploaded property images (see uploadController).
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount Master Routes
app.use('/api', apiRoutes);

// Catch-all 404 Route
app.use((req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.url}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connect to MongoDB & Start Server
console.log('Attempting connection to MongoDB Atlas or Local instance...');
mongoose
  .connect(MONGODB_URI, { dbName: DB_NAME })
  .then(async () => {
    console.log(`Successfully connected to MongoDB (database: "${mongoose.connection.name}")!`);

    // Wait for non-destructive category recovery before serving listing requests.
    try {
      await ensureDemoData(false);
    } catch (dbCheckError) {
      console.error('Failed to run auto-recovery checks:', dbCheckError);
      process.exit(1);
    }

    // Start listening
    app.listen(PORT, () => {
      // Never print MONGODB_URI here: it contains database credentials.
      console.log(`====================================================`);
      console.log(` DHA Estate Pro Server listening on port ${PORT}`);
      console.log(` API Endpoint: http://localhost:${PORT}/api`);
      console.log(` Database: "${mongoose.connection.name}"`);
      console.log(`====================================================`);
    });
  })
  .catch((err) => {
    console.error('Critical database connection failure. Failed to start Express service:', err);
    process.exit(1);
  });
