import random
import datetime
from .firestore_service import FirestoreService

class RescueService:
    @staticmethod
    def get_all_reports():
        reports = FirestoreService.get_documents("rescueReports")
        # Sort descending by timestamp
        reports.sort(key=lambda r: r.get("timestamp", ""), reverse=True)
        return reports

    @staticmethod
    def get_report_by_ticket(ticket: str):
        return FirestoreService.get_document("rescueReports", ticket)

    @staticmethod
    def create_report(data: dict):
        animal_type = data.get("animalType")
        location = data.get("location")
        description = data.get("description")
        reporter_name = data.get("reporterName")
        reporter_contact = data.get("reporterContact")

        if not animal_type or not location or not description or not reporter_name or not reporter_contact:
            raise ValueError("Missing required fields for reporting")

        severity = str(data.get("severity", "low")).lower()
        if severity not in ("low", "moderate", "critical"):
            severity = "low"
        if len(str(description)) > 1000 or len(str(location)) > 200:
            raise ValueError("Description or location is too long")

        existing = FirestoreService.get_documents("rescueReports")
        next_no = 1 + max(
            [int(str(r.get("ticketNumber", "0")).rsplit("-", 1)[-1] or 0) for r in existing] or [0]
        )
        ticket_number = f"PWG-{datetime.datetime.utcnow().year}-{next_no:03d}"
        gps = data.get("gpsCoordinates")
        if not gps:
            # Random coordinates centered around Delhi
            gps = {
                "lat": 28.535516 + (random.random() - 0.5) * 0.1,
                "lng": 77.391029 + (random.random() - 0.5) * 0.1
            }

        new_report = {
            "ticketNumber": ticket_number,
            "animalType": animal_type,
            "breed": data.get("breed", "Unidentified"),
            "healthStatus": data.get("healthStatus", "Requires Inspection"),
            "severity": severity,
            "description": description,
            "location": location,
            "gpsCoordinates": gps,
            "imageUrl": data.get("imageUrl") or "",
            "reporterName": reporter_name,
            "reporterContact": reporter_contact,
            "status": "Reported",
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        }

        success = FirestoreService.save_document("rescueReports", ticket_number, new_report)
        if not success:
            raise IOError("Failed to persist document to Firestore")

        return new_report

    @staticmethod
    def update_report_status(ticket: str, new_status: str):
        if new_status not in ("Reported", "Dispatched", "In-Rescue", "Recovered"):
            raise ValueError("Invalid status")
        return FirestoreService.update_document("rescueReports", ticket, {"status": new_status})
