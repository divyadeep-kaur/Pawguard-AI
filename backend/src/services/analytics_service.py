from collections import Counter, OrderedDict
from datetime import datetime

from .firestore_service import FirestoreService

DONE = ("Recovered",)
ACTIVE = ("Dispatched", "In-Rescue")


def _month_key(ts: str):
    try:
        return datetime.fromisoformat(ts.replace("Z", "+00:00"))
    except Exception:
        return None


class AnalyticsService:
    """All figures are computed from the stored reports - nothing is padded or invented."""

    @staticmethod
    def get_analytics_data():
        reports = FirestoreService.get_documents("rescueReports")
        adoptions = FirestoreService.get_documents("adoptionRequests")

        by_status = Counter(r.get("status", "Reported") for r in reports)
        by_severity = Counter(str(r.get("severity", "low")).lower() for r in reports)
        by_species = Counter(r.get("animalType", "Other") for r in reports)
        by_condition = Counter(r.get("healthStatus", "Unknown") for r in reports)

        months = OrderedDict()
        for r in sorted(reports, key=lambda r: r.get("timestamp", "")):
            dt = _month_key(r.get("timestamp", ""))
            if not dt:
                continue
            key = dt.strftime("%Y-%m")
            m = months.setdefault(key, {"month": dt.strftime("%b"), "reports": 0, "recovered": 0})
            m["reports"] += 1
            if r.get("status") in DONE:
                m["recovered"] += 1

        return {
            "totalReports": len(reports),
            "recovered": by_status.get("Recovered", 0),
            "activeCases": sum(by_status.get(s, 0) for s in ACTIVE),
            "awaitingResponse": by_status.get("Reported", 0),
            "criticalCases": by_severity.get("critical", 0),
            "adoptionRequests": len(adoptions),
            "byStatus": dict(by_status),
            "bySeverity": dict(by_severity),
            "species": [{"type": k, "count": v} for k, v in by_species.most_common()],
            "conditions": [{"name": k, "value": v} for k, v in by_condition.most_common(6)],
            "monthlyTrends": list(months.values()),
        }
