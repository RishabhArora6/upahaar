def check_drug_conflicts(current_medicines: list, new_medicines: list, allergies: list):
    """
    Mock AI engine checking for conflicts.
    """
    print("Running AI Drug Conflict Detection...")
    conflicts = []
    
    new_meds_lower = [m.lower() for m in new_medicines]
    allergies_lower = [a.lower() for a in allergies]
    
    for med in new_meds_lower:
        if med in allergies_lower or any(a in med for a in allergies_lower):
            conflicts.append(f"CRITICAL WARNING: Patient is allergic to {med}.")
            
    if "ibuprofen" in new_meds_lower and "aspirin" in [m.lower() for m in current_medicines]:
        conflicts.append("MODERATE WARNING: Interaction between Ibuprofen and Aspirin.")
        
    return conflicts
