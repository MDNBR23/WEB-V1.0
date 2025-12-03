const { Pool } = require('pg');

const isReplit = !!(process.env.REPL_ID || process.env.REPL_SLUG);
const sslConfig = isReplit ? false : (process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false });

const pool = new Pool({
  host: process.env.PGHOST || process.env.DB_HOST,
  port: process.env.PGPORT || process.env.DB_PORT,
  database: process.env.PGDATABASE || process.env.DB_NAME,
  user: process.env.PGUSER || process.env.DB_USER,
  password: process.env.PGPASSWORD || process.env.DB_PASSWORD,
  ssl: sslConfig
});

console.log('PostgreSQL SSL mode:', sslConfig === false ? 'disabled (Replit or DB_SSL=false)' : 'enabled');

async function initializeDatabase() {
  try {
    const createPlantillasQuery = `
      CREATE TABLE IF NOT EXISTS plantillas (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        categoria VARCHAR(100) NOT NULL,
        contenido TEXT NOT NULL,
        fecha DATE,
        tamanio INTEGER NOT NULL,
        global BOOLEAN DEFAULT false,
        creador VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    const createShiftsQuery = `
      CREATE TABLE IF NOT EXISTS shifts (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        entity_name VARCHAR(255) NOT NULL,
        shift_date DATE NOT NULL,
        shift_type VARCHAR(100) NOT NULL,
        hours DECIMAL(10, 2) DEFAULT 0,
        hourly_rate DECIMAL(10, 2) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    const createShiftConfigQuery = `
      CREATE TABLE IF NOT EXISTS shift_config (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL UNIQUE,
        ops_entity_name VARCHAR(255),
        ops_frequency_days INTEGER DEFAULT 6,
        ops_hours DECIMAL(10, 2) DEFAULT 12,
        ops_hourly_rate DECIMAL(10, 2) DEFAULT 0,
        last_ops_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    const createShiftsIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_shifts_user_id ON shifts(user_id);
      CREATE INDEX IF NOT EXISTS idx_shifts_date ON shifts(shift_date);
    `;
    
    const createShiftConfigIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_shift_config_user_id ON shift_config(user_id);
    `;
    
    await pool.query(createPlantillasQuery);
    console.log('Database table "plantillas" initialized successfully');
    
    await pool.query(createShiftsQuery);
    console.log('Database table "shifts" initialized successfully');
    
    await pool.query(createShiftConfigQuery);
    console.log('Database table "shift_config" initialized successfully');
    
    const createBiometricCredentialsQuery = `
      CREATE TABLE IF NOT EXISTS biometric_credentials (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        credential_id VARCHAR(500) NOT NULL UNIQUE,
        public_key BYTEA NOT NULL,
        counter INTEGER NOT NULL DEFAULT 0,
        device_type VARCHAR(50),
        transports TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    const createBiometricChallengesQuery = `
      CREATE TABLE IF NOT EXISTS biometric_challenges (
        id SERIAL PRIMARY KEY,
        challenge VARCHAR(500) NOT NULL UNIQUE,
        username VARCHAR(100),
        challenge_type VARCHAR(20),
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createAILogsQuery = `
      CREATE TABLE IF NOT EXISTS ai_logs (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        query TEXT NOT NULL,
        response TEXT,
        rating VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createAILogsIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_ai_logs_username ON ai_logs(username);
      CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON ai_logs(created_at);
    `;

    const createInfusionMedicationsQuery = `
      CREATE TABLE IF NOT EXISTS infusion_medications (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL UNIQUE,
        dosis VARCHAR(255),
        unidad VARCHAR(100),
        grupo VARCHAR(100),
        comentarios TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createPresentationsQuery = `
      CREATE TABLE IF NOT EXISTS medication_presentations (
        id SERIAL PRIMARY KEY,
        medication_id INTEGER NOT NULL REFERENCES infusion_medications(id) ON DELETE CASCADE,
        descripcion VARCHAR(255) NOT NULL,
        concentracion DECIMAL(10, 4) NOT NULL DEFAULT 1,
        diluciones TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createPresentationsIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_presentations_medication_id ON medication_presentations(medication_id);
    `;

    await pool.query(createShiftsIndexQuery);
    await pool.query(createShiftConfigIndexQuery);
    await pool.query(createBiometricCredentialsQuery);
    await pool.query(createBiometricChallengesQuery);
    await pool.query(createAILogsQuery);
    await pool.query(createAILogsIndexQuery);
    
    await pool.query(createInfusionMedicationsQuery);
    console.log('Database table "infusion_medications" created successfully');
    
    await pool.query(createPresentationsQuery);
    console.log('Database table "medication_presentations" created successfully');
    
    await pool.query(createPresentationsIndexQuery);
    console.log('Database indexes for presentations created successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

module.exports = { pool, initializeDatabase };
