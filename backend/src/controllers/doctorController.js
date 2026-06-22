import { db } from '../db/sqliteSetup.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const scanPatientQr = (req, res) => {
    const doctorId = req.user.id;
    const { upahaar_id } = req.params;

    if (!upahaar_id) {
        return res.status(400).json({ message: 'UPAHAAR ID is required' });
    }

    // 1. Find the citizen's profile
    db.get(`SELECT u.id, u.full_name, u.email, u.phone, u.upahaar_id, m.* 
            FROM users u 
            LEFT JOIN medical_profiles m ON u.id = m.user_id 
            WHERE u.upahaar_id = ? AND u.role = 'CITIZEN'`, 
    [upahaar_id], (err, patient) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (!patient) return res.status(404).json({ message: 'Patient not found or invalid QR' });

        // 2. Fetch the citizen's timeline (prescriptions)
        db.all(`SELECT * FROM prescriptions WHERE citizen_id = ? ORDER BY created_at DESC`, [patient.id], (err, prescriptions) => {
            if (err) return res.status(500).json({ message: 'Error fetching patient timeline' });

            res.json({
                patient,
                timeline: prescriptions
            });
        });
    });
};

export const searchPatientHistoryAI = async (req, res) => {
    const { upahaar_id } = req.params;
    const { query } = req.body;

    if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ message: 'AI processing is disabled (No API Key)' });
    }

    db.get(`SELECT id, full_name FROM users WHERE upahaar_id = ? AND role = 'CITIZEN'`, [upahaar_id], (err, patient) => {
        if (err || !patient) return res.status(404).json({ message: 'Patient not found' });

        db.all(`SELECT created_at, ai_extracted_data, medicines, raw_ocr_text FROM prescriptions WHERE citizen_id = ? ORDER BY created_at ASC`, [patient.id], async (err, prescriptions) => {
            if (err) return res.status(500).json({ message: 'Error fetching history' });
            
            if (prescriptions.length === 0) {
                return res.json({ summary: "This patient has no uploaded medical records to search through." });
            }

            // Compile history into a prompt string
            let historyText = `Patient Name: ${patient.full_name}\n\n`;
            prescriptions.forEach((p, index) => {
                historyText += `--- Record ${index + 1} (Date: ${new Date(p.created_at).toLocaleDateString()}) ---\n`;
                historyText += `AI Summary: ${p.ai_extracted_data || 'N/A'}\n`;
                historyText += `Medicines: ${p.medicines || 'N/A'}\n`;
                historyText += `Original Text: ${p.raw_ocr_text || 'N/A'}\n\n`;
            });

            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
                
                const prompt = `You are an expert medical AI assistant.
A doctor is searching this patient's medical history for the following condition/disease: "${query}"

Here is the patient's entire documented medical history (chronological order):
${historyText}

Based ONLY on the provided history:
1. Has the patient ever had anything related to the disease "${query}"?
2. If so, provide a concise summary of when it happened, what the diagnosis was, and what specific medications were given for it.
3. If there is NO mention or relation to "${query}" in the history, clearly state that there is no record of it.

Do not invent any information. Be direct and professional.`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                
                res.json({ summary: response.text().trim() });

            } catch (error) {
                console.error("Gemini AI Search Error:", error);
                res.status(500).json({ message: 'Failed to process AI search' });
            }
        });
    });
};
