# WebAuthn / Biometric Authentication Setup

## Overview
Med Tools Hub uses WebAuthn (FIDO2) for biometric authentication, supporting Face ID and fingerprint on iOS and Android devices.

## RP_ID Configuration

The Relying Party ID (RP_ID) is crucial for WebAuthn to work correctly. It must match the domain of your application.

### Production (Hostinger)
Set the following environment variable:
```bash
RP_ID=medtoolshub.cloud
APP_ORIGIN=https://medtoolshub.cloud
```

### Development (Replit)
The RP_ID is automatically extracted from `REPLIT_DEV_DOMAIN`:
- Full domain: `2676e6fa-b70a-47d2-97f6-78346cdb4259-00-1jf3xhenzus7z.kirk.replit.dev`
- Extracted RP_ID: `kirk.replit.dev`

### Local Development
Defaults to `localhost` automatically.

## How It Works

1. **Registration Flow**:
   - User clicks "Registrar Huella/Face ID"
   - Browser shows native biometric prompt
   - Device stores credential with your RP_ID
   - Public key stored in PostgreSQL

2. **Authentication Flow**:
   - User clicks "Ingresar con Huella/Face ID"
   - Browser shows native biometric prompt
   - Signature verified server-side
   - Session created if valid

## Troubleshooting

**"WebAuthn not supported"**: 
- Requires HTTPS (except localhost)
- Device must support WebAuthn (most modern phones do)
- Test on iOS 14+ or Android 7+

**"RP_ID mismatch"**:
- Ensure origin domain matches RP_ID
- Check environment variable configuration
- Restart server after changes

**"Credential not found"**:
- User hasn't registered biometric yet
- Database migration may be needed
- Check biometric_credentials table exists

## Environment Variables

```bash
# Required for production
RP_ID=your.domain.com
APP_ORIGIN=https://your.domain.com

# Used automatically on Replit
REPLIT_DEV_DOMAIN=<auto-set>

# Database must have these tables
- users
- biometric_credentials
- biometric_challenges
```
