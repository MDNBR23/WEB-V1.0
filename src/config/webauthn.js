// WebAuthn Configuration Helper
// This file provides utilities for WebAuthn configuration across environments

const getWebAuthnConfig = () => {
  const rpId = getRPId();
  const origin = getOrigin();
  
  return {
    rpName: 'Med Tools Hub',
    rpId,
    origin,
    timeout: 60000,
    userVerification: 'required'
  };
};

const getRPId = () => {
  if (process.env.RP_ID) return process.env.RP_ID;
  if (process.env.REPLIT_DEV_DOMAIN) {
    const parts = process.env.REPLIT_DEV_DOMAIN.split('.');
    return parts.length >= 2 ? parts.slice(-2).join('.') : process.env.REPLIT_DEV_DOMAIN;
  }
  return 'localhost';
};

const getOrigin = () => {
  if (process.env.APP_ORIGIN) return process.env.APP_ORIGIN;
  if (process.env.REPLIT_DEV_DOMAIN) return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  return 'http://localhost:5000';
};

module.exports = { getWebAuthnConfig, getRPId, getOrigin };
