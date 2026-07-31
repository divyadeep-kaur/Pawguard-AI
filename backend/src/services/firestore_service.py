import os
import json

class FirestoreService:
    @staticmethod
    def _get_db_file_path(collection: str) -> str:
        # Resolve path safely in the backend
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        # File is at backend/src/data/{collection}_active.json
        return os.path.join(base_dir, "data", f"{collection}_active.json")

    @staticmethod
    def _get_seed_file_path(collection: str) -> str:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        return os.path.join(base_dir, "data", f"{collection}.json")

    @classmethod
    def _load_local_db(cls, collection: str) -> list:
        active_path = cls._get_db_file_path(collection)
        if os.path.exists(active_path):
            try:
                with open(active_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"[PawGuard DB] Error loading active {collection} DB: {e}")
                return []
        
        # If active doesn't exist, load from seed file
        seed_path = cls._get_seed_file_path(collection)
        if os.path.exists(seed_path):
            try:
                with open(seed_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                # Save as active file for persistent writes
                cls._save_local_db(collection, data)
                print(f"[PawGuard DB] Seeded active database for {collection} from {seed_path}")
                return data
            except Exception as e:
                print(f"[PawGuard DB] Error loading seed for {collection}: {e}")
                return []
        return []

    @classmethod
    def _save_local_db(cls, collection: str, data: list) -> bool:
        active_path = cls._get_db_file_path(collection)
        try:
            os.makedirs(os.path.dirname(active_path), exist_ok=True)
            with open(active_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"[PawGuard DB] Error saving {collection} DB: {e}")
            return False

    @classmethod
    def get_documents(cls, collection: str) -> list:
        return cls._load_local_db(collection)

    @classmethod
    def get_document(cls, collection: str, doc_id: str):
        items = cls._load_local_db(collection)
        key = "ticketNumber" if collection == "rescueReports" else "id"
        for item in items:
            if str(item.get(key)) == str(doc_id):
                return item
        return None

    @classmethod
    def save_document(cls, collection: str, doc_id: str, fields: dict) -> bool:
        items = cls._load_local_db(collection)
        key = "ticketNumber" if collection == "rescueReports" else "id"
        
        updated = False
        for i, item in enumerate(items):
            if str(item.get(key)) == str(doc_id):
                items[i] = fields
                updated = True
                break
        
        if not updated:
            items.append(fields)
            
        return cls._save_local_db(collection, items)

    @classmethod
    def update_document(cls, collection: str, doc_id: str, fields: dict) -> bool:
        items = cls._load_local_db(collection)
        key = "ticketNumber" if collection == "rescueReports" else "id"
        
        updated = False
        for i, item in enumerate(items):
            if str(item.get(key)) == str(doc_id):
                items[i].update(fields)
                updated = True
                break
                
        if updated:
            return cls._save_local_db(collection, items)
        return False

    @classmethod
    def seed_initial_database(cls):
        print("[PawGuard DB] Checking local database status...")
        cls._load_local_db("rescueReports")
        cls._load_local_db("adoptionRequests")
        print("[PawGuard DB] Local database verification complete.")
