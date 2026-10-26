const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const app = express();

// CORS middleware at the very top
app.use(cors({
  origin: true, // Allow all origins
  credentials: true
}));

const apiKeyMiddleware = require('./middleware/apiKey');

// Health check route (public, no API key required)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'GrocyGo backend is running!' });
});

// API Key authentication for all other API routes
app.use('/api', (req, res, next) => {
  try {
    apiKeyMiddleware(req, res, next);
  } catch (err) {
    console.error('[API Key Middleware Error]', err);
    next(err);
  }
});
const inventoryRoutes = require('./routes/inventory');
const recipesRoutes = require('./routes/recipes');
const mealPlansRoutes = require('./routes/mealPlans');
const shoppingRoutes = require('./routes/shopping');
const notificationsRoutes = require('./routes/notifications');

const analyticsRoutes = require('./routes/analytics');
const aiRoutes = require('./routes/ai');


// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Hide x-powered-by
app.disable('x-powered-by');

app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'GrocyGo backend is running!' });
});

app.get('/api/test-log', (req, res) => {
  console.log('Test log endpoint hit');
  res.json({ status: 'ok' });
});

app.use((req, res, next) => {
  console.log(`[API Request] ${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api/inventory', inventoryRoutes);
app.use('/api/recipes', recipesRoutes);
app.use('/api/meal-plans', mealPlansRoutes);
// Unified AI endpoints
app.use('/api/ai', aiRoutes);
app.use('/api/shopping', shoppingRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/analytics', analyticsRoutes);



module.exports = app;
