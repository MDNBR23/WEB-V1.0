const fs = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');

const BACKUP_DIR = path.join(__dirname, 'backups');
const MAX_BACKUPS = 7;
const DATA_DIR = path.join(__dirname, 'data');

const pool = new Pool({
  host: process.env.PGHOST || process.env.DB_HOST,
  port: process.env.PGPORT || process.env.DB_PORT,
  database: process.env.PGDATABASE || process.env.DB_NAME,
  user: process.env.PGUSER || process.env.DB_USER,
  password: process.env.PGPASSWORD || process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false }
});

async function readJSON(filename, defaultValue = []) {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, filename), 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return defaultValue;
  }
}

async function ensureBackupDir() {
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
  } catch (err) {
    console.error('Error creating backup directory:', err);
  }
}

async function cleanOldBackups() {
  try {
    const files = await fs.readdir(BACKUP_DIR);
    const backupFiles = files
      .filter(f => f.startsWith('medtools-backup-') && f.endsWith('.json'))
      .map(f => ({
        name: f,
        path: path.join(BACKUP_DIR, f),
        time: fs.stat(path.join(BACKUP_DIR, f)).then(s => s.mtimeMs)
      }));

    const filesWithTime = await Promise.all(
      backupFiles.map(async f => ({
        name: f.name,
        path: f.path,
        time: await f.time
      }))
    );

    filesWithTime.sort((a, b) => b.time - a.time);

    if (filesWithTime.length > MAX_BACKUPS) {
      const toDelete = filesWithTime.slice(MAX_BACKUPS);
      for (const file of toDelete) {
        await fs.unlink(file.path);
        console.log(`Backup antiguo eliminado: ${file.name}`);
      }
    }
  } catch (err) {
    console.error('Error cleaning old backups:', err);
  }
}

async function createBackup() {
  try {
    console.log('Iniciando backup automático...');
    
    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      jsonFiles: {},
      database: {}
    };

    const jsonFiles = [
      'users.json',
      'anuncios_global.json',
      'guias_global.json',
      'medications.json',
      'sugerencias.json',
      'maintenance.json',
      'tools_status.json'
    ];

    for (const file of jsonFiles) {
      backup.jsonFiles[file] = await readJSON(file, []);
    }

    const plantillasResult = await pool.query('SELECT * FROM plantillas ORDER BY created_at DESC');
    backup.database.plantillas = plantillasResult.rows;

    const shiftsResult = await pool.query('SELECT * FROM shifts ORDER BY created_at DESC');
    backup.database.shifts = shiftsResult.rows;

    const shiftConfigResult = await pool.query('SELECT * FROM shift_config ORDER BY created_at DESC');
    backup.database.shift_config = shiftConfigResult.rows;

    await ensureBackupDir();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `medtools-backup-${timestamp}.json`;
    const filepath = path.join(BACKUP_DIR, filename);

    await fs.writeFile(filepath, JSON.stringify(backup, null, 2), 'utf8');

    console.log(`✓ Backup creado exitosamente: ${filename}`);
    console.log(`  - Archivos JSON: ${Object.keys(backup.jsonFiles).length}`);
    console.log(`  - Plantillas: ${backup.database.plantillas.length}`);
    console.log(`  - Turnos: ${backup.database.shifts.length}`);
    console.log(`  - Configuraciones de turnos: ${backup.database.shift_config.length}`);
    console.log(`  - Tamaño: ${(Buffer.byteLength(JSON.stringify(backup)) / 1024).toFixed(2)} KB`);

    await cleanOldBackups();
    await pool.end();

    process.exit(0);
  } catch (err) {
    console.error('Error creando backup:', err);
    await pool.end();
    process.exit(1);
  }
}

createBackup();
