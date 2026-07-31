import random
import datetime
from .firestore_service import FirestoreService

class AdoptionService:
    @staticmethod
    def get_all_requests():
        return FirestoreService.get_documents("adoptionRequests")

    @staticmethod
    def create_request(data: dict):
        animal_id = data.get("animalId")
        applicant_name = data.get("applicantName")
        applicant_email = data.get("applicantEmail")
        applicant_phone = data.get("applicantPhone")

        if not animal_id or not applicant_name or not applicant_email or not applicant_phone:
            raise ValueError("Missing required adoption fields")

        adopt_id = f"ADOPT-{random.randint(100, 999)}"
        visit_date = data.get("visitDate") or datetime.date.today().isoformat()

        new_request = {
            "id": adopt_id,
            "animalId": animal_id,
            "animalName": data.get("animalName", "Rescued Pet"),
            "applicantName": applicant_name,
            "applicantEmail": applicant_email,
            "applicantPhone": applicant_phone,
            "visitDate": visit_date,
            "message": data.get("message", "Keen to foster and support animal welfare."),
            "status": "Pending"
        }

        success = FirestoreService.save_document("adoptionRequests", adopt_id, new_request)
        if not success:
            raise IOError("Failed to save adoption ticket on Firestore")

        return new_request
