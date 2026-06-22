from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

# Mock services
from services.august_ai_service import extract_prescription_data
from services.chatgpt_service import generate_medical_summary
from services.face_recognition_service import generate_embedding, compare_faces
from services.drug_conflict_service import check_drug_conflicts

app = FastAPI(title="UPAHAAR AI Microservices")

class TimelineRequest(BaseModel):
    patient_history: list

class DrugConflictRequest(BaseModel):
    current_medicines: list
    new_medicines: list
    allergies: list

@app.get("/health")
def health_check():
    return {"status": "AI Microservices running"}

@app.post("/extract-prescription")
async def extract_prescription(file: UploadFile = File(...)):
    """ Uses August AI (Mocked) to read prescription image/pdf and return JSON """
    content = await file.read()
    extracted_data = extract_prescription_data(file.filename)
    return {"status": "success", "data": extracted_data}

@app.post("/generate-summary")
def generate_summary(req: TimelineRequest):
    """ Uses ChatGPT API (Mocked) to summarize medical history """
    summary = generate_medical_summary(req.patient_history)
    return {"status": "success", "summary": summary}

@app.post("/check-conflicts")
def check_conflicts(req: DrugConflictRequest):
    """ Checks if new medicines conflict with existing ones or allergies """
    conflicts = check_drug_conflicts(req.current_medicines, req.new_medicines, req.allergies)
    return {"status": "success", "conflicts": conflicts}

@app.post("/generate-face-embedding")
async def generate_face_embedding(photo: UploadFile = File(...)):
    """ Uses ArcFace/FaceNet (Mocked) to generate embeddings """
    content = await photo.read()
    embedding = generate_embedding(content)
    return {"status": "success", "embedding": embedding}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
