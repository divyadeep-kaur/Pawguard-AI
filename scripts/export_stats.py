#!/usr/bin/env python3
"""
PawGuard AI Live Analytics Sync & Telemetry Exporter
Enables direct local statistics logging, CSV backup creation, 
and real-time command-line analytical telemetry tracking.
"""

import os
import json
import csv
import urllib.request
from datetime import datetime

# API endpoints of PawGuard AI
API_URL_REPORTS = "http://localhost:3000/api/rescue-reports"
API_URL_ANALYTICS = "http://localhost:3000/api/analytics"
API_URL_HEALTH = "http://localhost:3000/api/health"

CSV_OUTPUT_FILE = "pawguard_rescue_telemetry.csv"


def check_server_status():
    """Verify that the PawGuard Express-Firestore API server is active."""
    try:
        req = urllib.request.Request(API_URL_HEALTH, headers={'User-Agent': 'PawGuard-Python-Client/1.0'})
        with urllib.request.urlopen(req, timeout=3) as response:
            data = json.loads(response.read().decode())
            print(f"🛰 [ONLINE] Linked with Web API Server (Database: {data.get('databaseConnection')})")
            return True
    except Exception as e:
        print("💡 [OFFLINE] Live Express server is currently unreachable locally.")
        print("Make sure your Development Dev Server is running on port 3000 prior to syncing.")
        return False


def get_live_stats():
    """Fetch live data from the database endpoints and output analytical summaries."""
    print("\n" + "=" * 60)
    print("      🐾 PAWGUARD AI - LOCAL DATABASE & STATS EXPORTER 🐾      ")
    print("=" * 60)
    
    server_online = check_server_status()
    if not server_online:
        print("\nUsing static offline fallback stats framework for demo:")
        print("Total Registered reports: 125 | Live Recovered: 101 | Critical status cases: 5")
        return

    try:
        # 1. Fetch live rescue reports
        print("🔄 Extracting live rescue reports from Firestore...")
        req = urllib.request.Request(API_URL_REPORTS, headers={'User-Agent': 'PawGuard-Python-Client/1.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            reports = json.loads(response.read().decode())
        
        # 2. Fetch live metrics
        req_metrics = urllib.request.Request(API_URL_ANALYTICS, headers={'User-Agent': 'PawGuard-Python-Client/1.0'})
        with urllib.request.urlopen(req_metrics, timeout=5) as response_metrics:
            metrics = json.loads(response_metrics.read().decode())

        total_reports = len(reports)
        print(f"✅ Successfully retrieved {total_reports} active incidents from Google Firestore!")

        # Calculate local categorizations
        severity_counts = {"critical": 0, "moderate": 0, "low": 0}
        type_counts = {}
        status_counts = {}

        for r in reports:
            sev = r.get("severity", "low").lower()
            severity_counts[sev] = severity_counts.get(sev, 0) + 1
            
            atype = r.get("animalType", "Other")
            type_counts[atype] = type_counts.get(atype, 0) + 1
            
            st = r.get("status", "Reported")
            status_counts[st] = status_counts.get(st, 0) + 1

        print("\n--- 📊 INTEGRATED INCIDENT STATISTICS ---")
        print(f"Total Live Logs Registered : {total_reports}")
        print("Severity Distribution:")
        for sev, qty in severity_counts.items():
            pct = (qty / total_reports * 100) if total_reports > 0 else 0
            bar = "🟥" if sev == "critical" else "🟧" if sev == "moderate" else "🟩"
            print(f"  {bar} {sev.upper():<8} : {qty:<3} ({pct:.1f}%)")

        print("\nSpecies Frequency Chart:")
        for sp, qty in type_counts.items():
            bar_graph = "■" * qty
            print(f"  🐕 {sp:<10} : {qty:<3} {bar_graph}")
            
        print("\nOperational Status:")
        for status, qty in status_counts.items():
            print(f"  ⚡ {status:<12} : {qty}")

        # 3. Export to CSV file
        print(f"\n💾 Generating local CSV database backup: '{CSV_OUTPUT_FILE}'...")
        with open(CSV_OUTPUT_FILE, mode='w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(["TicketNumber", "AnimalType", "Description", "Location", "Severity", "Reporter", "Contact", "Status", "Timestamp"])
            for r in reports:
                writer.writerow([
                    r.get("ticketNumber", ""),
                    r.get("animalType", ""),
                    r.get("description", ""),
                    r.get("location", ""),
                    r.get("severity", ""),
                    r.get("reporterName", ""),
                    r.get("reporterContact", ""),
                    r.get("status", ""),
                    r.get("timestamp", "")
                ])
        
        print(f"🎉 Backup successfully updated at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)

    except Exception as e:
        print(f"⚠️ Error establishing database stats parse: {e}")


if __name__ == "__main__":
    get_live_stats()
