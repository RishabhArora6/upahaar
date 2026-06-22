import pg from 'pg';

const pool = new pg.Pool({
    connectionString: "postgresql://postgres:hCrEnBP82N0in2PE@db.iypodtaehchlkemhodkn.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

async function test() {
    try {
        await pool.query('SELECT NOW()');
        console.log("Connection successful!");
        
        const sql = `CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            upahaar_id TEXT UNIQUE,
            role TEXT CHECK (role IN ('CITIZEN', 'DOCTOR', 'SUPER_ADMIN')),
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            face_photo_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;
        await pool.query(sql);
        console.log("Table created successfully!");
    } catch (e) {
        console.error("Error:", e);
    } finally {
        pool.end();
    }
}

test();
