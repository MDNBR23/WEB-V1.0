const SESSION_SECRET = process.env.SESSION_SECRET || 'medtoolshub-secret-key-change-in-production-2025';

const sessionConfig = {
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
};

module.exports = sessionConfig;
