import { db } from '../db/sqliteSetup.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';


const generateUpahaarID = () => {
    return 'UPHR-' + Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

export const registerUser = async (req, res) => {
    try {
        const { role, full_name, email, phone, password, face_photo_url, dob } = req.body;

        // Basic validation
        if (!role || !full_name || !email || !phone || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const upahaar_id = generateUpahaarID();
        const id = uuidv4();
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        db.run(
            `INSERT INTO users (id, upahaar_id, role, full_name, email, phone, password_hash, face_photo_url) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, upahaar_id, role, full_name, email, phone, password_hash, face_photo_url],
            function (err) {
                if (err) {
                    console.error("DB Error in citizen register:", err);
                    return res.status(500).json({ message: 'DB Error: ' + err.message });
                }
                
                // Initialize empty medical profile for CITIZEN with DOB if provided
                if (role === 'CITIZEN') {
                    db.run(`INSERT INTO medical_profiles (user_id, dob) VALUES (?, ?)`, [id, dob || null], (err2) => {
                        if (err2) console.error('Error creating medical profile:', err2.message);
                    });
                }
                
                res.status(201).json({ message: 'User registered successfully', upahaar_id, id });
            }
        );
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const loginUser = (req, res) => {
    const { upahaar_id, password, totp_code } = req.body;
    
    if (!upahaar_id || !password) {
        return res.status(400).json({ message: 'UPAHAAR ID and password are required' });
    }

    db.get(`SELECT u.*, m.blood_group FROM users u LEFT JOIN medical_profiles m ON u.id = m.user_id WHERE u.upahaar_id = ?`, [upahaar_id], async (err, user) => {
        if (err || !user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 2FA Check
        if (user.is_totp_enabled) {
            if (!totp_code) {
                return res.status(400).json({ message: '2FA code is required' });
            }
            const verified = speakeasy.totp.verify({
                secret: user.totp_secret,
                encoding: 'base32',
                token: totp_code
            });
            if (!verified) {
                return res.status(400).json({ message: 'Invalid 2FA code' });
            }
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role,
                upahaar_id: user.upahaar_id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                const is_setup_complete = user.blood_group ? true : false;
                res.json({ token, role: user.role, upahaar_id: user.upahaar_id, is_setup_complete });
            }
        );
    });
};

export const generate2FA = async (req, res) => {
    const userId = req.user.id;
    const secret = speakeasy.generateSecret({ name: `UPAHAAR (${req.user.upahaar_id})` });
    
    db.run(`UPDATE users SET totp_secret = ? WHERE id = ?`, [secret.base32, userId], async (err) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        
        try {
            const dataUrl = await qrcode.toDataURL(secret.otpauth_url);
            res.json({ qrCode: dataUrl });
        } catch (qrErr) {
            res.status(500).json({ message: 'Error generating QR code' });
        }
    });
};

export const verifyAndEnable2FA = (req, res) => {
    const userId = req.user.id;
    const { totp_code } = req.body;
    
    if (!totp_code) return res.status(400).json({ message: 'Code is required' });
    
    db.get(`SELECT totp_secret FROM users WHERE id = ?`, [userId], (err, user) => {
        if (err || !user || !user.totp_secret) return res.status(400).json({ message: 'Setup not initiated' });
        
        const verified = speakeasy.totp.verify({
            secret: user.totp_secret,
            encoding: 'base32',
            token: totp_code
        });
        
        if (verified) {
            db.run(`UPDATE users SET is_totp_enabled = 1 WHERE id = ?`, [userId], (updateErr) => {
                if (updateErr) return res.status(500).json({ message: 'Database error' });
                res.json({ message: '2FA successfully enabled!' });
            });
        } else {
            res.status(400).json({ message: 'Invalid code, please try again.' });
        }
    });
};
