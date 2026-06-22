def extract_prescription_data(filename: str):
    """
    Mock function representing integration with August AI for OCR and NLP.
    """
    print(f"Calling August AI API for file: {filename}...")
    return {
        "date": "2023-10-15",
        "doctor_name": "Dr. Smith",
        "hospital": "City General Hospital",
        "diagnosis": "Acute Bronchitis",
        "medicines": [
            {"name": "Amoxicillin", "dosage": "500mg", "duration": "5 days"},
            {"name": "Cough Syrup", "dosage": "10ml", "duration": "5 days"}
        ]
    }
