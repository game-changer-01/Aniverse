const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const os = require('os');

// Load environment variables
dotenv.config();

// Security: Require JWT secret in production
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('[CONFIG] Missing JWT_SECRET in production environment. Exiting.');
  process.exit(1);
}
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.warn('[CONFIG] JWT_SECRET is short; use a strong random string (>= 32 chars).');
}

const app = express();

// --- Connection logging helpers ---
function log(stage, info) {
  const ts = new Date().toISOString();
  console.log(`[DB:${stage}] ${ts} :: ${info}`);
}

// Middleware
app.use(cors());
// Mount webhook BEFORE JSON parsing to preserve raw body for signature verification
const stripeWebhook = require('./routes/stripeWebhook');
app.use('/api/stripe/webhook', stripeWebhook);
// JSON parsers for the rest
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/anime', require('./routes/anime'));
app.use('/api/auth', require('./routes/auth'));
// Removed streaming features: stream/watch endpoints disabled
// app.use('/api/stream', require('./routes/stream'));
app.use('/api/recommend', require('./routes/recommend'));
// app.use('/api/watch', require('./routes/watch'));
app.use('/api/images', require('./routes/images'));
app.use('/api/identity', require('./routes/identity'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/jikan', require('./routes/jikan'));
app.use('/api/anilist', require('./routes/anilist'));
app.use('/api/news', require('./routes/news'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// DB health
app.get('/api/health/db', (req, res) => {
  const states = ['disconnected','connected','connecting','disconnecting'];
  res.json({
    state: states[mongoose.connection.readyState] || 'unknown',
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    models: Object.keys(mongoose.connection.models),
    pid: process.pid,
    started: process.uptime().toFixed(1)
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Database connection with detailed logging + fallback
const primaryUri = process.env.MONGODB_URI;
if (!primaryUri) {
  console.error('[DB:config] Missing MONGODB_URI in environment.');
  process.exit(1);
}

const localFallbackUri = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/aniverse';
let attemptedFallback = false;

// Mask credentials for logging
function maskUri(uri) {
  if (!uri) return '';
  return uri.replace(/(mongodb(?:\+srv)?:\/\/)([^:@]+):([^@]+)@/, (_, p, u) => `${p}${u}:****@`);
}

log('init', `Attempting connection to primary database. Hostname: ${os.hostname()} URI=${maskUri(primaryUri)}`);
let started = Date.now();

mongoose.connection.on('connected', () => {
  log(attemptedFallback ? 'connected-fallback' : 'connected', `Mongoose connected in ${Date.now() - started}ms`);
});
mongoose.connection.on('error', (err) => {
  log('error', err.message);
});
mongoose.connection.on('disconnected', () => {
  log('disconnected', 'Mongoose disconnected');
});

let DEGRADED_MODE = false; // if true we run with static fallbacks only

async function connect(uri, label, attempt = 1) {
  started = Date.now();
  log('connecting', `Using ${label} URI (attempt ${attempt})`);
  try {
    const isSrv = uri.startsWith('mongodb+srv://');
    const isLocal = /mongodb:\/\/(127\.0\.0\.1|localhost)/.test(uri);
    const connectOpts = {
      serverSelectionTimeoutMS: 12000,
      connectTimeoutMS: 12000,
      socketTimeoutMS: 20000,
      maxPoolSize: 10,
      heartbeatFrequencyMS: 8000,
      retryWrites: true,
      // Prefer IPv4 on Windows/corporate networks to avoid IPv6 DNS issues
      family: 4,
    };
    // For non-SRV Atlas seedlist URIs, enable TLS; for local dev, do not enable TLS
    if (!isSrv && !isLocal) {
      connectOpts.tls = true;
    }
    await mongoose.connect(uri, connectOpts);
    log('ready', `Connection established (${label})`);
  } catch (err) {
    const msg = err.message || '';
    log(label === 'primary' ? 'primary-failed' : 'fatal', msg.includes('tlsv1 alert') ? `TLS negotiation issue: ${msg}` : msg);
    if (label === 'primary' && !attemptedFallback) {
      if (attempt < 2) {
        log('retry', 'Retrying primary in 2s...');
        return setTimeout(() => connect(uri, label, attempt + 1), 2000);
      }
      attemptedFallback = true;
      log('fallback', 'Attempting local MongoDB fallback...');
      return connect(localFallbackUri, 'fallback');
    }
    // If we reach here primary + fallback failed. Enter degraded mode (no DB) but keep server alive.
    DEGRADED_MODE = true;
    log('degraded', 'Running without database. Static fallback data will be served.');
    console.error('\nNext Steps: Ensure Atlas IP whitelist & regenerate SRV; verify credentials; disable corporate/antivirus SSL interception if present.');
  }
}

connect(primaryUri, 'primary');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}${DEGRADED_MODE ? ' (DEGRADED MODE - no DB connection)' : ''}`);
});