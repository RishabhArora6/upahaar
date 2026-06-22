import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDB } from './src/db/sqliteSetup.js';
import authRoutes from './src/routes/authRoutes.js';
import patientRoutes from './src/routes/patientRoutes.js';
import doctorRoutes from './src/routes/doctorRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve uploads statically (for prototyping)
app.use('/uploads', express.static('uploads'));

// Initialize Database
initializeDB();

// Temporary migration script
import { db } from './src/db/sqliteSetup.js';
db.run("ALTER TABLE prescriptions ADD COLUMN medicines TEXT", (err) => {
    if (err) console.log("Migration skipped (medicines column may already exist):", err.message);
    else console.log("Migration successful: added medicines column to prescriptions.");
});
db.run("ALTER TABLE prescriptions ADD COLUMN raw_ocr_text TEXT", (err) => {
    if (err) console.log("Migration skipped (raw_ocr_text column may already exist):", err.message);
    else console.log("Migration successful: added raw_ocr_text column to prescriptions.");
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'UPAHAAR Backend is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
