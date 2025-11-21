const session = require('express-session');
const FileStore = require('session-file-store')(session);
const path = require('path');

const SESSION_SECRET = process.env.SESSION_SECRET || 'medtoolshub-secret-key-change-in-production-2025';

const sessionConfig = {
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new FileStore({
    path: path.join(process.cwd(), 'data', 'sessions'),
    ttl: 24 * 60 * 60,
    retries: 0,
    reapInterval: 3600
  }),
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
};

module.exports = sessionConfig;
