// ============================================
// BASE DE DATOS LOCAL (SQLite)
// Equivalente a la tabla parametros_prestashop en MySQL del n8n
// Almacena color_key -> id_imagen para evitar re-subir imágenes
// ============================================

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data.db');
let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.exec(`
      CREATE TABLE IF NOT EXISTS color_keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        color_key TEXT UNIQUE NOT NULL,
        id_imagen TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
  return db;
}

function findColorKey(colorKey) {
  const db = getDb();
  return db.prepare('SELECT * FROM color_keys WHERE color_key = ?').get(colorKey);
}

function insertColorKey(colorKey, idImagen) {
  const db = getDb();
  try {
    db.prepare('INSERT INTO color_keys (color_key, id_imagen) VALUES (?, ?)').run(colorKey, idImagen);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      // Ya existe, actualizar
      db.prepare('UPDATE color_keys SET id_imagen = ? WHERE color_key = ?').run(idImagen, colorKey);
    } else {
      throw err;
    }
  }
}

function close() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { findColorKey, insertColorKey, close };
