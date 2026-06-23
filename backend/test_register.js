import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const pool = new pg.Pool({
    connectionString: "postgresql://postgres.iypodtaehchlkemhodkn:hCrEnBP82N0in2PE@aws-0-ap-south-1.pooler.supabase.com:6543/postgres",
    ssl: { rejectUnauthorized: false }
});

const convertQuery = (sql) => {
    let index = 1;
    return sql.replace(/\?/g, () => `$${index++}`);
};

async function testRegister() {
    try {
        const id = uuidv4();
        const upahaar_id = 'UPHR-' + Math.floor(1000000000 + Math.random() * 9000000000).toString();
        const role = 'CITIZEN';
        const full_name = 'Test User';
        const email = 'test' + Date.now() + '@example.com';
        const phone = '123' + Date.now().toString().slice(-7);
        const password_hash = await bcrypt.hash('password123', 10);
        const face_photo_url = null;

        const sql = convertQuery(`INSERT INTO users (id, upahaar_id, role, full_name, email, phone, password_hash, face_photo_url) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
             
        await pool.query(sql, [id, upahaar_id, role, full_name, email, phone, password_hash, face_photo_url]);
        
        console.log("Successfully inserted into users table!");
        
        const sql2 = convertQuery(`INSERT INTO medical_profiles (user_id, dob) VALUES (?, ?)`);
        await pool.query(sql2, [id, '1990-01-01']);
        
        console.log("Successfully inserted into medical_profiles!");
        
    } catch (err) {
        console.error("Registration failed with error:", err);
    } finally {
        pool.end();
    }
}

testRegister();
