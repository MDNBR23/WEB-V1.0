const fs = require('fs').promises;
const path = require('path');
const { pool } = require('../config/database');
const { readJSON, writeJSON } = require('../services/fileService');

const BACKUP_DIR = path.join(__dirname, '../../backups');

exports.exportBackup = async (req, res) => {
  try {
    const backup = {
      version: '1.1',
      timestamp: new Date().toISOString(),
      jsonFiles: {},
      database: {}
    };
    
    const jsonFiles = ['users.json', 'anuncios_global.json', 'guias_global.json', 'medications.json', 'sugerencias.json', 'maintenance.json'];
    
    for (const file of jsonFiles) {
      backup.jsonFiles[file] = await readJSON(file, []);
    }
    
    const plantillasResult = await pool.query('SELECT * FROM plantillas ORDER BY created_at DESC');
    backup.database.plantillas = plantillasResult.rows;
    
    const shiftsResult = await pool.query('SELECT * FROM shifts ORDER BY shift_date DESC');
    backup.database.shifts = shiftsResult.rows;
    
    const shiftConfigResult = await pool.query('SELECT * FROM shift_config ORDER BY id');
    backup.database.shift_config = shiftConfigResult.rows;
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="medtools-backup-${new Date().toISOString().slice(0,10)}.json"`);
    res.json(backup);
  } catch (err) {
    console.error('Error creating backup:', err);
    res.status(500).json({error: 'Error al crear backup'});
  }
};

exports.importBackup = async (req, res) => {
  try {
    const backup = req.body;
    
    if (!backup || !backup.version || !backup.jsonFiles) {
      return res.status(400).json({error: 'Formato de backup inválido'});
    }
    
    for (const [filename, data] of Object.entries(backup.jsonFiles)) {
      await writeJSON(filename, data);
    }
    
    if (backup.database && backup.database.plantillas) {
      await pool.query('DELETE FROM plantillas');
      
      for (const plantilla of backup.database.plantillas) {
        const query = `
          INSERT INTO plantillas (id, nombre, categoria, contenido, fecha, tamanio, global, creador, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO UPDATE SET
            nombre = EXCLUDED.nombre,
            categoria = EXCLUDED.categoria,
            contenido = EXCLUDED.contenido,
            fecha = EXCLUDED.fecha,
            tamanio = EXCLUDED.tamanio,
            global = EXCLUDED.global,
            creador = EXCLUDED.creador,
            updated_at = EXCLUDED.updated_at
        `;
        await pool.query(query, [
          plantilla.id,
          plantilla.nombre,
          plantilla.categoria,
          plantilla.contenido,
          plantilla.fecha || null,
          plantilla.tamanio,
          plantilla.global,
          plantilla.creador,
          plantilla.created_at,
          plantilla.updated_at || plantilla.created_at
        ]);
      }
    }
    
    if (backup.database && backup.database.shifts) {
      await pool.query('DELETE FROM shifts');
      
      for (const shift of backup.database.shifts) {
        const query = `
          INSERT INTO shifts (id, user_id, entity_name, shift_date, shift_type, hours, hourly_rate, notes, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO UPDATE SET
            user_id = EXCLUDED.user_id,
            entity_name = EXCLUDED.entity_name,
            shift_date = EXCLUDED.shift_date,
            shift_type = EXCLUDED.shift_type,
            hours = EXCLUDED.hours,
            hourly_rate = EXCLUDED.hourly_rate,
            notes = EXCLUDED.notes,
            updated_at = EXCLUDED.updated_at
        `;
        await pool.query(query, [
          shift.id,
          shift.user_id,
          shift.entity_name,
          shift.shift_date,
          shift.shift_type,
          shift.hours || 0,
          shift.hourly_rate || 0,
          shift.notes || '',
          shift.created_at,
          shift.updated_at || shift.created_at
        ]);
      }
    }
    
    if (backup.database && backup.database.shift_config) {
      await pool.query('DELETE FROM shift_config');
      
      for (const config of backup.database.shift_config) {
        const query = `
          INSERT INTO shift_config (id, user_id, ops_entity_name, ops_frequency_days, ops_hours, ops_hourly_rate, last_ops_date, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (user_id) DO UPDATE SET
            ops_entity_name = EXCLUDED.ops_entity_name,
            ops_frequency_days = EXCLUDED.ops_frequency_days,
            ops_hours = EXCLUDED.ops_hours,
            ops_hourly_rate = EXCLUDED.ops_hourly_rate,
            last_ops_date = EXCLUDED.last_ops_date,
            updated_at = EXCLUDED.updated_at
        `;
        await pool.query(query, [
          config.id,
          config.user_id,
          config.ops_entity_name || null,
          config.ops_frequency_days || 6,
          config.ops_hours || 12,
          config.ops_hourly_rate || 0,
          config.last_ops_date || null,
          config.created_at,
          config.updated_at || config.created_at
        ]);
      }
    }
    
    res.json({success: true, message: 'Backup importado exitosamente'});
  } catch (err) {
    console.error('Error importing backup:', err);
    res.status(500).json({error: 'Error al importar backup: ' + err.message});
  }
};

exports.createBackup = async (req, res) => {
  try {
    const backup = {
      version: '1.1',
      timestamp: new Date().toISOString(),
      jsonFiles: {},
      database: {}
    };
    
    const jsonFiles = ['users.json', 'anuncios_global.json', 'guias_global.json', 'medications.json', 'sugerencias.json', 'maintenance.json', 'tools_status.json'];
    
    for (const file of jsonFiles) {
      backup.jsonFiles[file] = await readJSON(file, []);
    }
    
    const plantillasResult = await pool.query('SELECT * FROM plantillas ORDER BY created_at DESC');
    backup.database.plantillas = plantillasResult.rows;
    
    const shiftsResult = await pool.query('SELECT * FROM shifts ORDER BY shift_date DESC');
    backup.database.shifts = shiftsResult.rows;
    
    const shiftConfigResult = await pool.query('SELECT * FROM shift_config ORDER BY id');
    backup.database.shift_config = shiftConfigResult.rows;
    
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `medtools-backup-${timestamp}.json`;
    const filepath = path.join(BACKUP_DIR, filename);
    
    await fs.writeFile(filepath, JSON.stringify(backup, null, 2), 'utf8');
    
    const stats = await fs.stat(filepath);
    
    res.json({
      success: true,
      message: 'Backup creado exitosamente',
      backup: {
        filename,
        size: stats.size,
        created: stats.mtime.toISOString(),
        sizeKB: (stats.size / 1024).toFixed(2)
      }
    });
  } catch (err) {
    console.error('Error creating backup on server:', err);
    res.status(500).json({error: 'Error al crear backup en el servidor'});
  }
};

exports.listBackups = async (req, res) => {
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    const files = await fs.readdir(BACKUP_DIR);
    const backupFiles = files
      .filter(f => f.startsWith('medtools-backup-') && f.endsWith('.json'));
    
    const backupsWithInfo = await Promise.all(
      backupFiles.map(async (filename) => {
        const filepath = path.join(BACKUP_DIR, filename);
        const stats = await fs.stat(filepath);
        return {
          filename,
          size: stats.size,
          created: stats.mtime.toISOString(),
          sizeKB: (stats.size / 1024).toFixed(2)
        };
      })
    );
    
    backupsWithInfo.sort((a, b) => new Date(b.created) - new Date(a.created));
    res.json(backupsWithInfo);
  } catch (err) {
    console.error('Error listing backups:', err);
    res.status(500).json({error: 'Error al listar backups'});
  }
};

exports.downloadBackup = async (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!filename.startsWith('medtools-backup-') || !filename.endsWith('.json')) {
      return res.status(400).json({error: 'Nombre de archivo inválido'});
    }
    
    const filepath = path.join(BACKUP_DIR, filename);
    
    try {
      await fs.access(filepath);
    } catch {
      return res.status(404).json({error: 'Backup no encontrado'});
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(filepath);
  } catch (err) {
    console.error('Error downloading backup:', err);
    res.status(500).json({error: 'Error al descargar backup'});
  }
};

exports.deleteBackup = async (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!filename.startsWith('medtools-backup-') || !filename.endsWith('.json')) {
      return res.status(400).json({error: 'Nombre de archivo inválido'});
    }
    
    const filepath = path.join(BACKUP_DIR, filename);
    
    try {
      await fs.unlink(filepath);
      res.json({success: true, message: 'Backup eliminado correctamente'});
    } catch {
      return res.status(404).json({error: 'Backup no encontrado'});
    }
  } catch (err) {
    console.error('Error deleting backup:', err);
    res.status(500).json({error: 'Error al eliminar backup'});
  }
};

module.exports = exports;
