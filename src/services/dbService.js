const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set. Did you forget to provision a database?');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.log('Slow query:', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (err) {
    console.error('Database query error:', err.message);
    throw err;
  }
}

async function getClient() {
  const client = await pool.connect();
  return client;
}

async function initializeDatabase() {
  console.log('Initializing database tables...');
  
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255),
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        institucion VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        status VARCHAR(50) DEFAULT 'pendiente',
        cat VARCHAR(100),
        avatar TEXT,
        email_verified BOOLEAN DEFAULT false,
        verification_token VARCHAR(255),
        reset_token VARCHAR(50),
        reset_expiry TIMESTAMP WITH TIME ZONE,
        is_online BOOLEAN DEFAULT false,
        last_login TIMESTAMP WITH TIME ZONE,
        last_heartbeat TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS webauthn_credentials (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        credential_id TEXT UNIQUE NOT NULL,
        public_key TEXT NOT NULL,
        counter BIGINT DEFAULT 0,
        device_type VARCHAR(50),
        backed_up BOOLEAN DEFAULT false,
        transports TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS shifts (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        entity_name VARCHAR(255),
        shift_date DATE NOT NULL,
        shift_type VARCHAR(100),
        hours DECIMAL(10,2) DEFAULT 0,
        hourly_rate DECIMAL(10,2) DEFAULT 0,
        notes TEXT,
        currency VARCHAR(10) DEFAULT 'COP',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS shift_config (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        ops_enabled BOOLEAN DEFAULT false,
        ops_frequency_days INTEGER DEFAULT 7,
        ops_entity_name VARCHAR(255),
        ops_hours DECIMAL(10,2) DEFAULT 12,
        ops_hourly_rate DECIMAL(10,2) DEFAULT 0,
        last_ops_date DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS infusion_medications (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        dosis TEXT,
        unidad VARCHAR(50),
        grupo VARCHAR(100),
        comentarios TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS medication_presentations (
        id SERIAL PRIMARY KEY,
        medication_id INTEGER REFERENCES infusion_medications(id) ON DELETE CASCADE,
        descripcion VARCHAR(255),
        concentracion DECIMAL(10,4),
        diluciones TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS medications (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        dosage TEXT,
        indications TEXT,
        contraindications TEXT,
        side_effects TEXT,
        notes TEXT,
        created_by VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS anuncios (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        type VARCHAR(50),
        priority INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true,
        start_date TIMESTAMP WITH TIME ZONE,
        end_date TIMESTAMP WITH TIME ZONE,
        created_by VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS guias (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        content TEXT,
        file_url TEXT,
        active BOOLEAN DEFAULT true,
        created_by VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS sugerencias (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        username VARCHAR(100),
        title VARCHAR(255),
        content TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pendiente',
        response TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS feature_updates (
        id SERIAL PRIMARY KEY,
        version VARCHAR(50),
        title VARCHAR(255),
        description TEXT,
        features JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS maintenance (
        id SERIAL PRIMARY KEY,
        is_active BOOLEAN DEFAULT false,
        message TEXT,
        start_time TIMESTAMP WITH TIME ZONE,
        end_time TIMESTAMP WITH TIME ZONE,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS tools_status (
        id SERIAL PRIMARY KEY,
        tool_name VARCHAR(100) UNIQUE NOT NULL,
        is_enabled BOOLEAN DEFAULT true,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS biometric_credentials (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        credential_id TEXT UNIQUE NOT NULL,
        public_key BYTEA NOT NULL,
        counter BIGINT DEFAULT 0,
        device_type VARCHAR(50),
        transports TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS biometric_challenges (
        id SERIAL PRIMARY KEY,
        challenge TEXT NOT NULL,
        username VARCHAR(100),
        challenge_type VARCHAR(50) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_shifts_username ON shifts(username)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_shifts_date ON shifts(shift_date)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_webauthn_user_id ON webauthn_credentials(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_webauthn_credential_id ON webauthn_credentials(credential_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_biometric_username ON biometric_credentials(username)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_biometric_credential_id ON biometric_credentials(credential_id)`);

    console.log('Database tables initialized successfully');
    return true;
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  }
}

module.exports = {
  pool,
  query,
  getClient,
  initializeDatabase
};
