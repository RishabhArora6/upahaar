def generate_medical_summary(history: list):
    """
    Mock function representing ChatGPT API generating a timeline/summary.
    """
    print("Calling ChatGPT API for summarization...")
    if not history:
        return "No significant medical history found."
    
    return "Patient has a history of respiratory issues, recently diagnosed with Acute Bronchitis. Currently on Amoxicillin."
