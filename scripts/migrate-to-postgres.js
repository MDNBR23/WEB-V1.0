require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { pool, query, initializeDatabase } = require('../src/services/dbService');

const DATA_DIR = path.join(__dirname, '../data');

async function readJSON(filename) {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, filename), 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.log(`No ${filename} found or empty, skipping...`);
    return [];
  }
}

async function migrateUsers() {
  console.log('\n--- Migrating Users ---');
  const users = await readJSON('users.json');
  
  if (!Array.isArray(users) || users.length === 0) {
    console.log('No users to migrate');
    return {};
  }

  const userIdMap = {};
  let migrated = 0;
  let skipped = 0;

  for (const user of users) {
    try {
      const existing = await query('SELECT id FROM users WHERE username = $1', [user.username]);
      
      if (existing.rows.length > 0) {
        userIdMap[user.username] = existing.rows[0].id;
        skipped++;
        continue;
      }

      const result = await query(`
        INSERT INTO users (
          username, name, first_name, last_name, password, email, phone,
          institucion, role, status, cat, avatar, email_verified,
          is_online, last_login, last_heartbeat, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING id
      `, [
        user.username,
        user.name || null,
        user.firstName || null,
        user.lastName || null,
        user.password,
        user.email || null,
        user.phone || null,
        user.institucion || null,
        user.role || 'user',
        user.status || 'pendiente',
        user.cat || null,
        user.avatar || null,
        user.emailVerified || false,
        user.isOnline || false,
        user.lastLogin ? new Date(user.lastLogin) : null,
        user.lastHeartbeat ? new Date(user.lastHeartbeat) : null,
        user.createdAt ? new Date(user.createdAt) : new Date()
      ]);

      userIdMap[user.username] = result.rows[0].id;

      if (user.credentials && Array.isArray(user.credentials)) {
        for (const cred of user.credentials) {
          await query(`
            INSERT INTO webauthn_credentials (
              user_id, credential_id, public_key, counter, device_type, backed_up, transports
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (credential_id) DO NOTHING
          `, [
            result.rows[0].id,
            cred.id || cred.credentialId,
            cred.publicKey,
            cred.counter || 0,
            cred.deviceType || null,
            cred.backedUp || false,
            cred.transports || null
          ]);
        }
      }

      migrated++;
    } catch (err) {
      console.error(`Error migrating user ${user.username}:`, err.message);
    }
  }

  console.log(`Users: ${migrated} migrated, ${skipped} skipped (already exist)`);
  return userIdMap;
}

async function migrateShifts(userIdMap) {
  console.log('\n--- Migrating Shifts ---');
  const shifts = await readJSON('shifts.json');
  
  if (!Array.isArray(shifts) || shifts.length === 0) {
    console.log('No shifts to migrate');
    return;
  }

  let migrated = 0;

  for (const shift of shifts) {
    try {
      const shiftDate = shift.shift_date || shift.date || shift.start || shift.startDate;
      if (!shiftDate) {
        console.log('Skipping shift without date:', shift);
        continue;
      }
      
      await query(`
        INSERT INTO shifts (
          username, entity_name, shift_date, shift_type, hours, hourly_rate, notes, currency
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        shift.username || shift.user_id || 'unknown',
        shift.entity_name || shift.title || shift.location || null,
        new Date(shiftDate),
        shift.shift_type || shift.shiftType || shift.type || null,
        shift.hours || 0,
        shift.hourly_rate || 0,
        shift.notes || null,
        shift.currency || 'COP'
      ]);
      migrated++;
    } catch (err) {
      console.error(`Error migrating shift:`, err.message);
    }
  }

  console.log(`Shifts: ${migrated} migrated`);
}

async function migrateMedications() {
  console.log('\n--- Migrating Medications ---');
  const medications = await readJSON('medications.json');
  
  if (!Array.isArray(medications) || medications.length === 0) {
    console.log('No medications to migrate');
    return;
  }

  let migrated = 0;

  for (const med of medications) {
    try {
      await query(`
        INSERT INTO medications (
          name, category, dosage, indications, contraindications, side_effects, notes, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        med.name || med.nombre,
        med.category || med.categoria || null,
        med.dosage || med.dosis || null,
        med.indications || med.indicaciones || null,
        med.contraindications || med.contraindicaciones || null,
        med.sideEffects || med.efectosSecundarios || null,
        med.notes || med.notas || null,
        med.createdBy || null
      ]);
      migrated++;
    } catch (err) {
      console.error(`Error migrating medication ${med.name}:`, err.message);
    }
  }

  console.log(`Medications: ${migrated} migrated`);
}

async function migrateAnuncios() {
  console.log('\n--- Migrating Anuncios ---');
  const anuncios = await readJSON('anuncios_global.json');
  
  if (!Array.isArray(anuncios) || anuncios.length === 0) {
    console.log('No anuncios to migrate');
    return;
  }

  let migrated = 0;

  for (const anuncio of anuncios) {
    try {
      await query(`
        INSERT INTO anuncios (
          title, content, type, priority, active, start_date, end_date, created_by, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        anuncio.title || anuncio.titulo,
        anuncio.content || anuncio.contenido || null,
        anuncio.type || anuncio.tipo || null,
        anuncio.priority || anuncio.prioridad || 0,
        anuncio.active !== undefined ? anuncio.active : true,
        anuncio.startDate ? new Date(anuncio.startDate) : null,
        anuncio.endDate ? new Date(anuncio.endDate) : null,
        anuncio.createdBy || null,
        anuncio.createdAt ? new Date(anuncio.createdAt) : new Date()
      ]);
      migrated++;
    } catch (err) {
      console.error(`Error migrating anuncio:`, err.message);
    }
  }

  console.log(`Anuncios: ${migrated} migrated`);
}

async function migrateGuias() {
  console.log('\n--- Migrating Guias ---');
  const guias = await readJSON('guias_global.json');
  
  if (!Array.isArray(guias) || guias.length === 0) {
    console.log('No guias to migrate');
    return;
  }

  let migrated = 0;

  for (const guia of guias) {
    try {
      await query(`
        INSERT INTO guias (
          title, category, content, file_url, active, created_by, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        guia.title || guia.titulo,
        guia.category || guia.categoria || null,
        guia.content || guia.contenido || null,
        guia.fileUrl || guia.url || null,
        guia.active !== undefined ? guia.active : true,
        guia.createdBy || null,
        guia.createdAt ? new Date(guia.createdAt) : new Date()
      ]);
      migrated++;
    } catch (err) {
      console.error(`Error migrating guia:`, err.message);
    }
  }

  console.log(`Guias: ${migrated} migrated`);
}

async function migrateSugerencias(userIdMap) {
  console.log('\n--- Migrating Sugerencias ---');
  const sugerencias = await readJSON('sugerencias.json');
  
  if (!Array.isArray(sugerencias) || sugerencias.length === 0) {
    console.log('No sugerencias to migrate');
    return;
  }

  let migrated = 0;

  for (const sug of sugerencias) {
    try {
      const userId = userIdMap[sug.username] || null;
      
      await query(`
        INSERT INTO sugerencias (
          user_id, username, title, content, status, response, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        userId,
        sug.username || null,
        sug.title || sug.titulo || null,
        sug.content || sug.contenido || sug.message || sug.mensaje,
        sug.status || sug.estado || 'pendiente',
        sug.response || sug.respuesta || null,
        sug.createdAt ? new Date(sug.createdAt) : new Date()
      ]);
      migrated++;
    } catch (err) {
      console.error(`Error migrating sugerencia:`, err.message);
    }
  }

  console.log(`Sugerencias: ${migrated} migrated`);
}

async function migrateFeatureUpdates() {
  console.log('\n--- Migrating Feature Updates ---');
  const updates = await readJSON('feature_updates.json');
  
  if (!Array.isArray(updates) || updates.length === 0) {
    console.log('No feature updates to migrate');
    return;
  }

  let migrated = 0;

  for (const update of updates) {
    try {
      await query(`
        INSERT INTO feature_updates (
          version, title, description, features, created_at
        ) VALUES ($1, $2, $3, $4, $5)
      `, [
        update.version || null,
        update.title || update.titulo || null,
        update.description || update.descripcion || null,
        JSON.stringify(update.features || []),
        update.createdAt ? new Date(update.createdAt) : new Date()
      ]);
      migrated++;
    } catch (err) {
      console.error(`Error migrating feature update:`, err.message);
    }
  }

  console.log(`Feature Updates: ${migrated} migrated`);
}

async function migrateMaintenance() {
  console.log('\n--- Migrating Maintenance ---');
  const maintenance = await readJSON('maintenance.json');
  
  if (!maintenance || typeof maintenance !== 'object') {
    console.log('No maintenance settings to migrate');
    return;
  }

  try {
    await query(`
      INSERT INTO maintenance (is_active, message, start_time, end_time)
      VALUES ($1, $2, $3, $4)
    `, [
      maintenance.isActive || maintenance.active || false,
      maintenance.message || maintenance.mensaje || null,
      maintenance.startTime ? new Date(maintenance.startTime) : null,
      maintenance.endTime ? new Date(maintenance.endTime) : null
    ]);
    console.log('Maintenance settings migrated');
  } catch (err) {
    console.error('Error migrating maintenance:', err.message);
  }
}

async function migrateToolsStatus() {
  console.log('\n--- Migrating Tools Status ---');
  const toolsStatus = await readJSON('tools_status.json');
  
  if (!toolsStatus || typeof toolsStatus !== 'object') {
    console.log('No tools status to migrate');
    return;
  }

  let migrated = 0;

  for (const [toolName, value] of Object.entries(toolsStatus)) {
    try {
      const isEnabled = typeof value === 'object' ? value.enabled : value;
      await query(`
        INSERT INTO tools_status (tool_name, is_enabled)
        VALUES ($1, $2)
        ON CONFLICT (tool_name) DO UPDATE SET is_enabled = $2
      `, [toolName, isEnabled]);
      migrated++;
    } catch (err) {
      console.error(`Error migrating tool status ${toolName}:`, err.message);
    }
  }

  console.log(`Tools Status: ${migrated} migrated`);
}

async function runMigration() {
  console.log('=================================');
  console.log('Starting JSON to PostgreSQL Migration');
  console.log('=================================');

  try {
    await initializeDatabase();
    
    const userIdMap = await migrateUsers();
    await migrateShifts(userIdMap);
    await migrateMedications();
    await migrateAnuncios();
    await migrateGuias();
    await migrateSugerencias(userIdMap);
    await migrateFeatureUpdates();
    await migrateMaintenance();
    await migrateToolsStatus();

    console.log('\n=================================');
    console.log('Migration completed successfully!');
    console.log('=================================');

    const counts = await query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM shifts) as shifts,
        (SELECT COUNT(*) FROM medications) as medications,
        (SELECT COUNT(*) FROM anuncios) as anuncios,
        (SELECT COUNT(*) FROM guias) as guias,
        (SELECT COUNT(*) FROM sugerencias) as sugerencias
    `);

    console.log('\nDatabase record counts:');
    console.log('- Users:', counts.rows[0].users);
    console.log('- Shifts:', counts.rows[0].shifts);
    console.log('- Medications:', counts.rows[0].medications);
    console.log('- Anuncios:', counts.rows[0].anuncios);
    console.log('- Guias:', counts.rows[0].guias);
    console.log('- Sugerencias:', counts.rows[0].sugerencias);

  } catch (err) {
    console.error('\nMigration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
