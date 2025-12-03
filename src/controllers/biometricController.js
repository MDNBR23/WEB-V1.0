const { pool } = require('../config/database');
const { readJSON, writeJSON } = require('../services/fileService');
const crypto = require('crypto');
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server');

const RP_NAME = 'Med Tools Hub';

// Get RP_ID: Configuration for different environments
// RP_ID MUST be a valid domain suffix that matches the origin
// - Hostinger production: Use domain directly (e.g., "medtoolshub.cloud")
// - Replit dev: Extract apex domain from full domain (e.g., "kirk.replit.dev")
// - Local development: Use "localhost"
function getRP_ID() {
  // Hostinger production - explicit RP_ID environment variable
  if (process.env.RP_ID) {
    console.log(`[WebAuthn] Using explicit RP_ID: ${process.env.RP_ID}`);
    return process.env.RP_ID;
  }
  
  // Replit development - extract apex domain
  if (process.env.REPLIT_DEV_DOMAIN) {
    const parts = process.env.REPLIT_DEV_DOMAIN.split('.');
    if (parts.length >= 2) {
      const rpId = parts.slice(-2).join('.');
      console.log(`[WebAuthn] Extracted RP_ID from Replit domain: ${rpId}`);
      return rpId;
    }
    console.log(`[WebAuthn] Using full Replit domain as RP_ID: ${process.env.REPLIT_DEV_DOMAIN}`);
    return process.env.REPLIT_DEV_DOMAIN;
  }
  
  // Local fallback
  console.log(`[WebAuthn] Using localhost for RP_ID (development)`);
  return 'localhost';
}

const RP_ID = getRP_ID();

// Get ORIGIN: Full URL for the application
// ORIGIN must be https:// in production, can be http:// in development
function getORIGIN() {
  // Production override
  if (process.env.APP_ORIGIN) {
    console.log(`[WebAuthn] Using explicit APP_ORIGIN: ${process.env.APP_ORIGIN}`);
    return process.env.APP_ORIGIN;
  }
  
  // Replit development
  if (process.env.REPLIT_DEV_DOMAIN) {
    const origin = `https://${process.env.REPLIT_DEV_DOMAIN}`;
    console.log(`[WebAuthn] Using Replit origin: ${origin}`);
    return origin;
  }
  
  // Local fallback
  console.log(`[WebAuthn] Using localhost origin`);
  return 'http://localhost:5000';
}

const ORIGIN = getORIGIN();

// Log WebAuthn configuration on startup
console.log(`
╔════════════════════════════════════════╗
║     WebAuthn Configuration Loaded      ║
╠════════════════════════════════════════╣
║ RP_NAME:  ${RP_NAME.padEnd(32)}║
║ RP_ID:    ${RP_ID.padEnd(32)}║
║ ORIGIN:   ${ORIGIN.padEnd(32)}║
╚════════════════════════════════════════╝
`);

exports.registerOptions = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Username required' });

    const users = await readJSON('users.json', []);
    const user = users.find(u => u.username === username);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userID: Buffer.from(username),
      userName: username,
      userDisplayName: user.name || username,
      timeout: 60000,
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'required',
        authenticatorAttachment: 'platform',
      },
      supportedAlgorithmIDs: [-7, -257],
    });

    const challenge = options.challenge;
    await pool.query(
      'INSERT INTO biometric_challenges (challenge, username, challenge_type, expires_at) VALUES ($1, $2, $3, NOW() + INTERVAL \'10 minutes\')',
      [challenge, username, 'registration']
    );

    res.json(options);
  } catch (err) {
    console.error('Error generating registration options:', err);
    res.status(500).json({ error: 'Failed to generate options' });
  }
};

exports.registerVerify = async (req, res) => {
  try {
    const { username, credential } = req.body;
    if (!username || !credential) return res.status(400).json({ error: 'Missing data' });

    const challengeRow = await pool.query(
      'SELECT challenge FROM biometric_challenges WHERE username = $1 AND challenge_type = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [username, 'registration']
    );

    if (challengeRow.rows.length === 0) {
      return res.status(400).json({ error: 'Challenge expired or not found' });
    }

    const expectedChallenge = challengeRow.rows[0].challenge;

    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      requireUserVerification: true,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return res.status(400).json({ error: 'Verification failed' });
    }

    const { registrationInfo } = verification;
    const credentialID = Buffer.from(registrationInfo.credentialID).toString('base64');
    const publicKey = Buffer.from(registrationInfo.credentialPublicKey);

    await pool.query(
      'INSERT INTO biometric_credentials (username, credential_id, public_key, counter, device_type, transports) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        username,
        credentialID,
        publicKey,
        registrationInfo.counter,
        registrationInfo.credentialDeviceType,
        JSON.stringify(credential.response.transports || []),
      ]
    );

    await pool.query('DELETE FROM biometric_challenges WHERE username = $1 AND challenge_type = $2', [username, 'registration']);

    res.json({ verified: true, message: 'Biometric registered successfully' });
  } catch (err) {
    console.error('Error verifying registration:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
};

exports.loginOptions = async (req, res) => {
  try {
    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      timeout: 60000,
      userVerification: 'required',
    });

    const challenge = options.challenge;
    await pool.query(
      'INSERT INTO biometric_challenges (challenge, challenge_type, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'10 minutes\')',
      [challenge, 'authentication']
    );

    res.json(options);
  } catch (err) {
    console.error('Error generating login options:', err);
    res.status(500).json({ error: 'Failed to generate options' });
  }
};

exports.loginVerify = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Credential required' });

    const challengeRow = await pool.query(
      'SELECT challenge FROM biometric_challenges WHERE challenge_type = $1 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      ['authentication']
    );

    if (challengeRow.rows.length === 0) {
      return res.status(400).json({ error: 'Challenge expired' });
    }

    const expectedChallenge = challengeRow.rows[0].challenge;
    const credentialID = Buffer.from(credential.id, 'base64').toString('base64');

    const credRow = await pool.query(
      'SELECT username, public_key, counter, transports FROM biometric_credentials WHERE credential_id = $1',
      [credentialID]
    );

    if (credRow.rows.length === 0) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    const { username, public_key, counter, transports } = credRow.rows[0];

    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      authenticator: {
        credentialID: Buffer.from(credential.id, 'base64'),
        credentialPublicKey: public_key,
        counter: counter,
        transports: JSON.parse(transports || '[]'),
      },
      requireUserVerification: true,
    });

    if (!verification.verified) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    await pool.query(
      'UPDATE biometric_credentials SET counter = $1 WHERE credential_id = $2',
      [verification.authenticationInfo.newCounter, credentialID]
    );

    await pool.query('DELETE FROM biometric_challenges WHERE challenge_type = $1', ['authentication']);

    const users = await readJSON('users.json', []);
    const user = users.find(u => u.username === username);

    if (!user) return res.status(404).json({ error: 'User not found' });

    const now = new Date().toISOString();
    user.lastLogin = now;
    user.lastHeartbeat = now;
    user.isOnline = true;
    await writeJSON('users.json', users);

    req.session.userId = username;
    req.session.user = {
      username: user.username,
      role: user.role,
      name: user.name,
      cat: user.cat,
      status: user.status,
    };

    res.json({ verified: true, user: { username: user.username, name: user.name, role: user.role } });
  } catch (err) {
    console.error('Error verifying authentication:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

exports.getCredentials = async (req, res) => {
  try {
    const username = req.session.user?.username;
    if (!username) return res.status(401).json({ error: 'Not authenticated' });

    const result = await pool.query(
      'SELECT id, credential_id, device_type, created_at FROM biometric_credentials WHERE username = $1 ORDER BY created_at DESC',
      [username]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching credentials:', err);
    res.status(500).json({ error: 'Failed to fetch credentials' });
  }
};

exports.deleteCredential = async (req, res) => {
  try {
    const username = req.session.user?.username;
    const { credentialId } = req.params;

    if (!username) return res.status(401).json({ error: 'Not authenticated' });

    const result = await pool.query(
      'DELETE FROM biometric_credentials WHERE id = $1 AND username = $2 RETURNING id',
      [credentialId, username]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    res.json({ success: true, message: 'Credential deleted' });
  } catch (err) {
    console.error('Error deleting credential:', err);
    res.status(500).json({ error: 'Failed to delete credential' });
  }
};
