import { db } from '../db/sqliteSetup.js';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

export const getProfile = (req, res) => {
    const userId = req.user.id;
    
    db.get(`SELECT u.full_name, u.email, u.phone, u.upahaar_id, m.* 
            FROM users u 
            JOIN medical_profiles m ON u.id = m.user_id 
            WHERE u.id = ?`, [userId], (err, profile) => {
        if (err || !profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.json(profile);
    });
};

export const updateProfile = (req, res) => {
    const userId = req.user.id;
    const { 
        dob, gender, blood_group, height_cm, weight_kg, chest_size_cm, 
        vision_left, vision_right, hearing_status, allergies, 
        family_history, mental_health, respiratory_disorders, 
        heart_problems, nervous_disorders, identifying_features 
    } = req.body;

    const fields = [
        dob, gender, blood_group, height_cm, weight_kg, chest_size_cm,
        vision_left, vision_right, hearing_status, 
        allergies ? JSON.stringify(allergies) : null,
        family_history ? JSON.stringify(family_history) : null,
        mental_health ? JSON.stringify(mental_health) : null,
        respiratory_disorders ? JSON.stringify(respiratory_disorders) : null,
        heart_problems ? JSON.stringify(heart_problems) : null,
        nervous_disorders ? JSON.stringify(nervous_disorders) : null,
        identifying_features, userId
    ];

    db.run(
        `UPDATE medical_profiles SET 
            dob = COALESCE(?, dob), gender = COALESCE(?, gender), blood_group = ?, height_cm = ?, weight_kg = ?, chest_size_cm = ?, 
            vision_left = ?, vision_right = ?, hearing_status = ?, allergies = ?, 
            family_history = ?, mental_health = ?, respiratory_disorders = ?, 
            heart_problems = ?, nervous_disorders = ?, identifying_features = ?
         WHERE user_id = ?`,
        fields,
        function (err) {
            if (err) {
                return res.status(500).json({ message: 'Error updating profile', error: err.message });
            }
            res.json({ message: 'Profile updated successfully' });
        }
    );
};

export const uploadPrescription = async (req, res) => {
    const citizenId = req.user.id;
    const doctorId = req.user.role === 'DOCTOR' ? req.user.id : null; 
    
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // Convert memory buffer to Base64 data URI
    const ext = req.file.originalname.split('.').pop().toLowerCase();
    const mimeType = ext === 'pdf' ? 'application/pdf' : `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    const base64Image = req.file.buffer.toString('base64');
    const fileUrl = `data:${mimeType};base64,${base64Image}`;
    
    const id = uuidv4();
    let aiSummary = "AI Processing skipped (No API Key)";
    let medicinesJson = null;
    let rawOcrText = null;

    try {
        if (process.env.GEMINI_API_KEY) {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            
            if (mimeType.startsWith('image/') || mimeType === 'application/pdf') {
                const prompt = `You are a medical AI assistant. Extract the patient diagnosis, doctor's name, and prescribed medicines from this prescription. 
You MUST return your answer as a raw, valid JSON object (without markdown wrappers like \`\`\`json) with exactly three fields:
1. "summary": A short, professional text string summarizing the diagnosis and doctor name.
2. "medicines": An array of objects, where each object has "name" (e.g. Paracetamol 500mg), "frequency" (e.g. Morning & Night), and "duration" (e.g. 5 Days).
3. "raw_text": A complete, verbatim OCR transcription of ALL text on the prescription exactly as written. Preserve line breaks with \\n.`;
                
                const filePart = {
                    inlineData: {
                        data: base64Image,
                        mimeType
                    }
                };
                
                const result = await model.generateContent([prompt, filePart]);
                const response = await result.response;
                let text = response.text().trim();
                
                // Attempt to parse JSON safely (in case it added markdown block)
                if (text.startsWith('```json')) text = text.replace(/```json/g, '').replace(/```/g, '').trim();
                
                try {
                    const parsed = JSON.parse(text);
                    aiSummary = parsed.summary || "Summary extracted but missing from JSON.";
                    medicinesJson = JSON.stringify(parsed.medicines || []);
                    rawOcrText = parsed.raw_text || text;
                } catch (e) {
                    // Fallback if AI fails to return JSON
                    aiSummary = text;
                    medicinesJson = "[]";
                    rawOcrText = text;
                }
            } else {
                aiSummary = "Document uploaded. (File type not supported by Gemini Vision)";
            }
        }
    } catch (error) {
        console.error("Gemini API Error:", error);
        aiSummary = "AI Processing failed: " + error.message;
    }

    db.run(
        `INSERT INTO prescriptions (id, citizen_id, doctor_id, file_url, ai_extracted_data, medicines, raw_ocr_text) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, citizenId, doctorId, fileUrl, aiSummary, medicinesJson, rawOcrText],
        function(err) {
            if (err) {
                return res.status(500).json({ message: 'Database error while saving prescription' });
            }
            res.status(201).json({ 
                message: 'Prescription uploaded successfully', 
                prescription_id: id,
                file_url: fileUrl,
                ai_summary: aiSummary,
                medicines: medicinesJson,
                raw_ocr_text: rawOcrText
            });
        }
    );
};

export const getTimeline = (req, res) => {
    const citizenId = req.user.id; // Could also check params if Doctor accesses patient

    db.all(`SELECT * FROM prescriptions WHERE citizen_id = ? ORDER BY created_at DESC`, [citizenId], (err, prescriptions) => {
        if (err) return res.status(500).json({ message: 'Error fetching timeline' });
        res.json({ timeline: prescriptions });
    });
};

export const deletePrescription = (req, res) => {
    const citizenId = req.user.id;
    const { id } = req.params;

    db.get(`SELECT file_url FROM prescriptions WHERE id = ? AND citizen_id = ?`, [id, citizenId], (err, row) => {
        if (err || !row) return res.status(404).json({ message: 'Prescription not found' });

        // Optionally delete the physical file here if needed:
        // const filePath = path.join(__dirname, '..', '..', '..', row.file_url);
        // if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        db.run(`DELETE FROM prescriptions WHERE id = ? AND citizen_id = ?`, [id, citizenId], function(err) {
            if (err) return res.status(500).json({ message: 'Failed to delete record' });
            res.json({ message: 'Prescription deleted successfully' });
        });
    });
};

export const getNearbyPharmacies = async (req, res) => {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ message: 'Google Maps API key is missing' });
    }

    try {
        const url = 'https://places.googleapis.com/v1/places:searchNearby';
        
        const requestBody = {
            includedTypes: ["pharmacy"],
            maxResultCount: 20,
            locationRestriction: {
                circle: {
                    center: {
                        latitude: parseFloat(lat),
                        longitude: parseFloat(lng)
                    },
                    radius: 5000.0
                }
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': apiKey,
                'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.regularOpeningHours.openNow'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Google Maps API Error:', data);
            return res.status(500).json({ message: 'Failed to fetch from Google Maps' });
        }

        // Map New API response to match what the frontend expects
        const mappedPharmacies = (data.places || []).map(place => ({
            place_id: place.id,
            name: place.displayName?.text || 'Unknown Pharmacy',
            vicinity: place.formattedAddress || '',
            rating: place.rating || null,
            user_ratings_total: place.userRatingCount || 0,
            opening_hours: place.regularOpeningHours ? { open_now: place.regularOpeningHours.openNow } : undefined
        }));

        res.json({ pharmacies: mappedPharmacies });
    } catch (error) {
        console.error('Error fetching pharmacies:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getNotifications = (req, res) => {
    const citizenId = req.user.id;
    db.all(`
        SELECT a.id, a.method, a.status, a.created_at, u.full_name as doctor_name
        FROM access_logs a
        JOIN users u ON a.doctor_id = u.id
        WHERE a.citizen_id = ?
        ORDER BY a.created_at DESC
    `, [citizenId], (err, logs) => {
        if (err) return res.status(500).json({ message: 'Error fetching notifications' });
        res.json({ notifications: logs });
    });
};

export const acknowledgeNotification = (req, res) => {
    const citizenId = req.user.id;
    const logId = req.params.id;
    db.run(`UPDATE access_logs SET status = 'ACKNOWLEDGED' WHERE id = ? AND citizen_id = ?`, [logId, citizenId], function(err) {
        if (err) return res.status(500).json({ message: 'Error updating notification' });
        res.json({ message: 'Notification acknowledged' });
    });
};

export const revokeNotificationAccess = (req, res) => {
    const citizenId = req.user.id;
    const logId = req.params.id;
    
    db.get(`SELECT doctor_id FROM access_logs WHERE id = ? AND citizen_id = ?`, [logId, citizenId], (err, log) => {
        if (err || !log) return res.status(404).json({ message: 'Notification not found' });
        
        db.run(`INSERT OR IGNORE INTO revoked_access (citizen_id, doctor_id) VALUES (?, ?)`, [citizenId, log.doctor_id], (err2) => {
            if (err2) return res.status(500).json({ message: 'Error revoking access' });
            
            db.run(`UPDATE access_logs SET status = 'REVOKED' WHERE id = ?`, [logId], (err3) => {
                if (err3) console.error("Error updating log status", err3);
                res.json({ message: 'Access revoked successfully' });
            });
        });
    });
};

export const addVitals = (req, res) => {
    const userId = req.user.id;
    const { heart_rate, sugar_level, bp_systolic, bp_diastolic } = req.body;
    const id = uuidv4();

    db.run(
        `INSERT INTO vitals (id, user_id, heart_rate, sugar_level, bp_systolic, bp_diastolic) VALUES (?, ?, ?, ?, ?, ?)`,
        [id, userId, heart_rate || null, sugar_level || null, bp_systolic || null, bp_diastolic || null],
        (err) => {
            if (err) {
                console.error("Error adding vitals:", err);
                return res.status(500).json({ message: 'Failed to record vitals' });
            }
            res.status(201).json({ message: 'Vitals recorded successfully' });
        }
    );
};

export const getVitals = (req, res) => {
    const userId = req.user.id;

    db.all(`SELECT * FROM vitals WHERE user_id = ? ORDER BY recorded_at ASC`, [userId], (err, vitals) => {
        if (err) {
            console.error("Error fetching vitals:", err);
            return res.status(500).json({ message: 'Error fetching vitals' });
        }
        res.json({ vitals });
    });
};
