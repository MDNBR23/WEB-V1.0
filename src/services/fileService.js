const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, {recursive: true});
  } catch (err) {
    console.error('Error creating data directory:', err);
  }
}

async function readJSON(filename, defaultValue = []) {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, filename), 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return defaultValue;
  }
}

async function writeJSON(filename, data) {
  try {
    await fs.writeFile(
      path.join(DATA_DIR, filename),
      JSON.stringify(data, null, 2),
      'utf8'
    );
  } catch (err) {
    console.error(`Error writing ${filename}:`, err);
    throw err;
  }
}

module.exports = { ensureDataDir, readJSON, writeJSON, DATA_DIR };
