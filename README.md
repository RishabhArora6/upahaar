UPAHAAR — Unified Permanent Account for Healthcare Access & Authorization Registry

A secure digital medical identity and healthcare record management platform designed to connect citizens and doctors through a unified, consent-driven medical record system. UPAHAAR is a full-stack healthcare platform that allows citizens to maintain their digital medical identity, upload and manage prescriptions, track health vitals, view vaccination schedules, find nearby pharmacies, and securely share medical information with authorized doctors. Doctors can access patient records using a patient's UPAHAAR ID, QR code, or face scan, subject to access controls and patient consent.

**To RUN The Project**

You need the following things installed:
- Node.js 18+
- npm
- Python 3.9+
- Git

Open 3 individual CMD windows. Now run the following commands on the first CMD window:
```bash
git clone https://github.com/RishabhArora6/upahaar.git
cd upahaar
(echo PORT=5000 & echo JWT_SECRET=your_secure_jwt_secret & echo GEMINI_API_KEY=your_gemini_api_key & echo GOOGLE_MAPS_API_KEY=your_google_maps_api_key & echo DATABASE_URL=your_postgresql_connection_string) > .env
```

**Note:** 
- Replace `your_secure_jwt_secret`, `your_gemini_api_key`, `your_google_maps_api_key`, `your_postgresql_connection_string` with your own real keys.
- DATABASE_URL is optional. If you leave it out, the project uses the local SQLite database.
     
```bash
npm run dev
```


Now switch to the second CMD window and run the following commands:
```bash
cd upahaar
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:5000 > .env.local
npm run dev
```


Now switch to the third CMD window and run the following commands:
```bash
cd upahaar
cd ai-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```


Let all 3 windows running simultaneously and open http://localhost:3000 on your browser.
The project should run perfectly.
