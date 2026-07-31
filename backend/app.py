import os
import sys
import json
import traceback
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

# Ensure python loader can locate local sources relative to this directory
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from src.services.firestore_service import FirestoreService
from src.services.rescue_service import RescueService
from src.services.adoption_service import AdoptionService
from src.services.analytics_service import AnalyticsService
from src.services.ai_service import AiService

MIME_TYPES = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".txt": "text/plain",
}

class PawGuardHTTPHandler(BaseHTTPRequestHandler):
    def send_json(self, status_code, data):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def send_static(self, file_path, content_type):
        try:
            with open(file_path, "rb") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(content)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_error(500, f"Error reading static file: {e}")

    def do_OPTIONS(self):
        # Handle CORS preflight requests
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        path = self.path.split("?")[0]
        
        # 1. API Route Dispatches
        if path == "/api/health":
            self.send_json(200, {
                "status": "ok", 
                "engine": "Python http.server Protocol", 
                "uptime": "active"
            })
            return
            
        elif path == "/api/rescue-reports":
            try:
                reports = RescueService.get_all_reports()
                self.send_json(200, reports)
            except Exception as e:
                traceback.print_exc()
                self.send_json(500, {"error": str(e)})
            return
            
        elif path.startswith("/api/rescue-reports/"):
            ticket_id = path[len("/api/rescue-reports/"):]
            try:
                report = RescueService.get_report_by_ticket(ticket_id)
                if report:
                    self.send_json(200, report)
                else:
                    self.send_json(404, {"error": f"Ticket {ticket_id} not found"})
            except Exception as e:
                traceback.print_exc()
                self.send_json(500, {"error": str(e)})
            return
            
        elif path == "/api/analytics":
            try:
                analytics = AnalyticsService.get_analytics_data()
                self.send_json(200, analytics)
            except Exception as e:
                traceback.print_exc()
                self.send_json(500, {"error": str(e)})
            return

        # 2. Static Files Serving (Client SPA routing support)
        # Determine whether to serve from the production dist/ folder or development/fallback root
        base_dir = "./dist" if os.path.isdir("./dist") else "."
        
        rel_path = path.lstrip("/")
        if not rel_path:
            rel_path = "index.html"
            
        target_file = os.path.abspath(os.path.join(base_dir, rel_path))
        base_abs = os.path.abspath(base_dir)
        
        # Escape guard
        if not target_file.startswith(base_abs):
            self.send_json(403, {"error": "Access Denied"})
            return
            
        if os.path.exists(target_file) and os.path.isfile(target_file):
            ext = os.path.splitext(target_file)[1].lower()
            mime = MIME_TYPES.get(ext, "application/octet-stream")
            self.send_static(target_file, mime)
        else:
            # Fallback to index.html in the correct active directory (SPA client route fallback)
            fallback_file = os.path.abspath(os.path.join(base_dir, "index.html"))
            if os.path.exists(fallback_file):
                self.send_static(fallback_file, "text/html")
            else:
                self.send_json(404, {"error": f"Static resource not found: {path}"})

    def read_json_body(self):
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length == 0:
            return {}
        raw_body = self.rfile.read(content_length).decode("utf-8")
        try:
            return json.loads(raw_body)
        except json.JSONDecodeError:
            return {}

    def do_POST(self):
        path = self.path.split("?")[0]
        
        if path == "/api/rescue-reports":
            payload = self.read_json_body()
            try:
                new_report = RescueService.create_report(payload)
                self.send_json(201, new_report)
            except ValueError as ve:
                self.send_json(400, {"error": str(ve)})
            except Exception as e:
                traceback.print_exc()
                self.send_json(500, {"error": str(e)})
            return
            
        elif path == "/api/adoption/requests":
            payload = self.read_json_body()
            try:
                new_request = AdoptionService.create_request(payload)
                self.send_json(201, new_request)
            except ValueError as ve:
                self.send_json(400, {"error": str(ve)})
            except Exception as e:
                traceback.print_exc()
                self.send_json(500, {"error": str(e)})
            return
            
        elif path == "/api/scan-animal":
            payload = self.read_json_body()
            image_b64 = payload.get("imageBase64", "")
            try:
                analysis = AiService.scan_animal(image_b64)
                self.send_json(200, analysis)
            except Exception as e:
                traceback.print_exc()
                self.send_json(500, {"error": str(e)})
            return
            
        elif path == "/api/chat":
            payload = self.read_json_body()
            messages = payload.get("messages", [])
            try:
                reply = AiService.chat_reply(messages)
                self.send_json(200, reply)
            except Exception as e:
                traceback.print_exc()
                self.send_json(500, {"error": str(e)})
            return
            
        else:
            self.send_json(404, {"error": f"POST endpoint {path} not found"})
            
    def do_PUT(self):
        path = self.path.split("?")[0]
        
        if path.startswith("/api/rescue-reports/"):
            ticket_id = path[len("/api/rescue-reports/"):]
            payload = self.read_json_body()
            new_status = payload.get("status")
            if not new_status:
                self.send_json(400, {"error": "Missing status parameter"})
                return
            try:
                success = RescueService.update_report_status(ticket_id, new_status)
                if success:
                    self.send_json(200, {"success": True, "ticket": ticket_id, "status": new_status})
                else:
                    self.send_json(404, {"error": f"Ticket {ticket_id} status update failed"})
            except Exception as e:
                traceback.print_exc()
                self.send_json(500, {"error": str(e)})
            return
        else:
            self.send_json(404, {"error": f"PUT endpoint {path} not found"})

if __name__ == "__main__":
    PORT = 3000
    print("================== PAWGUARD AI http.server INGESTION ==================")
    print("Database seeding verification initialization...")
    try:
        FirestoreService.seed_initial_database()
        print("Database seeding verification check successful.")
    except Exception as e:
        print(f"Seeding warning at server boot: {e}")
        
    print(f"Starting Threaded Python 3 HTTP Server running on http://0.0.0.0:{PORT}")
    try:
        server = ThreadingHTTPServer(("0.0.0.0", PORT), PawGuardHTTPHandler)
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Python server...")
        sys.exit(0)
