import pg from 'pg';

const pool = new pg.Pool({
    connectionString: "postgresql://postgres:hCrEnBP82N0in2PE@db.iypodtaehchlkemhodkn.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

const convertQuery = (sql) => {
    let index = 1;
    return sql.replace(/\?/g, () => `$${index++}`);
};

async function test() {
    try {
        const sql = `INSERT INTO users (id, upahaar_id, role, full_name, email, phone, password_hash, face_photo_url) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const params = ['test-id', 'UPHR-12345', 'CITIZEN', 'Test Name', 'test@test.com', '1234567890', 'hash', null];
        
        await pool.query(convertQuery(sql), params);
        console.log("Insert successful!");
    } catch (e) {
        console.error("Error:", e);
    } finally {
        pool.end();
    }
}

test();
