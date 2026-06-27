import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export let db;

// Query converter for PostgreSQL: replaces '?' with '$1', '$2', etc.
const convertQuery = (sql) => {
    let index = 1;
    return sql.replace(/\?/g, () => `$${index++}`);
};

if (process.env.DATABASE_URL) {
    console.log('Connecting to Supabase PostgreSQL...');
    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    db = {
        run: function(sql, params, callback) {
            if (typeof params === 'function') { callback = params; params = []; }
            pool.query(convertQuery(sql), params || [])
                .then(res => { if (callback) callback.call({ lastID: null, changes: res?.rowCount || 0 }, null); })
                .catch(err => { if (callback) callback(err); });
        },
        get: function(sql, params, callback) {
            if (typeof params === 'function') { callback = params; params = []; }
            pool.query(convertQuery(sql), params || [])
                .then(res => { if (callback) callback(null, res.rows[0]); })
                .catch(err => { if (callback) callback(err); });
        },
        all: function(sql, params, callback) {
            if (typeof params === 'function') { callback = params; params = []; }
            pool.query(convertQuery(sql), params || [])
                .then(res => { if (callback) callback(null, res.rows); })
                .catch(err => { if (callback) callback(err); });
        }
    };
} else {
    const dbPath = path.resolve(__dirname, 'upahaar.db');
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening local SQLite database', err.message);
        } else {
            console.log('Connected to local SQLite database.');
        }
    });
}

export const initializeDB = async () => {
    const runCreate = (sql) => {
        return new Promise((resolve, reject) => {
            // Postgres schema adjustments
            if (process.env.DATABASE_URL) {
                sql = sql.replace(/DATETIME DEFAULT CURRENT_TIMESTAMP/g, 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
            }
            db.run(sql, [], (err) => {
                if (err) console.error("Table setup error:", err);
                resolve();
            });
        });
    };

    // Users Table
    await runCreate(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        upahaar_id TEXT UNIQUE,
        role TEXT CHECK (role IN ('CITIZEN', 'DOCTOR', 'SUPER_ADMIN')),
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        face_photo_url TEXT,
        totp_secret TEXT,
        is_totp_enabled INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Medical Profiles Table
    await runCreate(`CREATE TABLE IF NOT EXISTS medical_profiles (
        user_id TEXT PRIMARY KEY,
        dob TEXT,
        gender TEXT,
        blood_group TEXT,
        height_cm REAL,
        weight_kg REAL,
        chest_size_cm REAL,
        vision_left TEXT,
        vision_right TEXT,
        hearing_status TEXT,
        allergies TEXT, 
        family_history TEXT,
        mental_health TEXT,
        respiratory_disorders TEXT,
        heart_problems TEXT,
        nervous_disorders TEXT,
        identifying_features TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    // Prescriptions Table
    await runCreate(`CREATE TABLE IF NOT EXISTS prescriptions (
        id TEXT PRIMARY KEY,
        citizen_id TEXT,
        doctor_id TEXT,
        file_url TEXT NOT NULL,
        ai_extracted_data TEXT, 
        medicines TEXT,
        raw_ocr_text TEXT,
        is_fraudulent INTEGER DEFAULT 0,
        fraud_confidence_score REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (citizen_id) REFERENCES users(id),
        FOREIGN KEY (doctor_id) REFERENCES users(id)
    )`);
    
    // Security Access Logs Table
    await runCreate(`CREATE TABLE IF NOT EXISTS access_logs (
        id TEXT PRIMARY KEY,
        citizen_id TEXT NOT NULL,
        doctor_id TEXT NOT NULL,
        method TEXT NOT NULL,
        status TEXT DEFAULT 'PENDING',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (citizen_id) REFERENCES users(id),
        FOREIGN KEY (doctor_id) REFERENCES users(id)
    )`);

    // Revoked Access (Blocklist) Table
    await runCreate(`CREATE TABLE IF NOT EXISTS revoked_access (
        citizen_id TEXT NOT NULL,
        doctor_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (citizen_id, doctor_id),
        FOREIGN KEY (citizen_id) REFERENCES users(id),
        FOREIGN KEY (doctor_id) REFERENCES users(id)
    )`);
    
    console.log('Database tables verified/created.');
};
