/**
 * ==================================================================================
 *                       🐾 PAWGUARD AI - EMBEDDED TELEMETRY ENGINE 🐾
 * ==================================================================================
 * File: data_store.c
 * Purpose: Local structural serialization, binary caching, and high-performance
 *          statistics calculation for patrol transport beacons.
 * 
 * Compiles cleanly with standard GCC/Clang:
 *   gcc -O3 -Wall data_store.c -o data_store
 * ==================================================================================
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#define MAX_TICKETS 100
#define MAX_STR_LEN 64
#define BINARY_DATABASE_FILE "rescue_beacons.bin"

/* High-integrity structure representing local device ticket storage */
typedef struct {
    char ticket_number[16];
    char animal_type[32];
    char severity[12];     /* "Critical", "Moderate", "Low" */
    char location[MAX_STR_LEN];
    double gps_lat;
    double gps_lng;
    time_t logged_at;
    unsigned int status_code; /* 0=Reported, 1=Dispatched, 2=In-Rescue, 3=Recovered */
} RescueTicket;

/* Telemetry Stats Summary */
typedef struct {
    int total_incidents;
    int critical_count;
    int moderate_count;
    int low_count;
    int active_dispatches;
    double avg_latitude;
    double avg_longitude;
} TelemetryStats;

/* Forward Declarations */
void create_mock_database();
void process_telemetry_statistics();
int add_new_incident(const char* type, const char* severity, const char* loc, double lat, double lng, unsigned int code);
void print_header();

int main(int argc, char* argv[]) {
    print_header();

    /* Ensure a local bin datastore is seeded for testing */
    FILE* check_fp = fopen(BINARY_DATABASE_FILE, "rb");
    if (!check_fp) {
        printf("📁 Database '%s' not detected. Building initial local database template...\n", BINARY_DATABASE_FILE);
        create_mock_database();
    } else {
        fclose(check_fp);
    }

    if (argc > 1 && strcmp(argv[1], "--add") == 0) {
        if (argc < 7) {
            printf("❌ Usage error: %s --add <AnimalType> <Severity> <Location> <Lat> <Lng>\n", argv[0]);
            printf("Example: %s --add \"Cat\" \"Critical\" \"Avenue Block 4\" 28.61 77.23\n", argv[0]);
            return 1;
        }
        const char* type = argv[2];
        const char* severity = argv[3];
        const char* loc = argv[4];
        double lat = atof(argv[5]);
        double lng = atof(argv[6]);
        
        if (add_new_incident(type, severity, loc, lat, lng, 0)) {
            printf("🚀 New incident recorded into local telemetry ledger successfully!\n");
        }
    }

    /* Print live analytics of cached records */
    process_telemetry_statistics();

    printf("\n💡 Pro-Tip: To add a raw beacon telemetry record via the CLI, use:\n");
    printf("   %s --add \"Dog\" \"Critical\" \"National Park Sector 4\" 28.532 77.125\n\n", argv[0]);

    return 0;
}

void print_header() {
    printf("========================================================================\n");
    printf("        🛸 PAWGUARD CO-ORDINATE BEACON SYSTEM (OFFLINE LEDGER) 🛸        \n");
    printf("========================================================================\n");
}

/* Save initial mock structures to raw file binary */
void create_mock_database() {
    FILE* fp = fopen(BINARY_DATABASE_FILE, "wb");
    if (!fp) {
        perror("Could not initialize local cache db file");
        return;
    }

    RescueTicket seed_records[3] = {
        {
            .ticket_number = "PWG-MOCK-301",
            .animal_type = "Stray Dog",
            .severity = "Critical",
            .location = "WWF Hub, South Delhi Sector 5",
            .gps_lat = 28.562,
            .gps_lng = 77.209,
            .status_code = 1
        },
        {
            .ticket_number = "PWG-MOCK-302",
            .animal_type = "Injured Cow",
            .severity = "Moderate",
            .location = "Market Street, Sector 12",
            .gps_lat = 28.591,
            .gps_lng = 77.234,
            .status_code = 0
        },
        {
            .ticket_number = "PWG-MOCK-303",
            .animal_type = "Kitten Trio",
            .severity = "Low",
            .location = "Lotus Temple Boulevard Outer",
            .gps_lat = 28.553,
            .gps_lng = 77.258,
            .status_code = 2
        }
    };

    time_t raw_time = time(NULL);
    for (int i = 0; i < 3; i++) {
        seed_records[i].logged_at = raw_time - (i * 3600); // Backdated hours
        fwrite(&seed_records[i], sizeof(RescueTicket), 1, fp);
    }

    fclose(fp);
    printf("🎯 Local database file initialized with 3 default high-triage tickets!\n");
}

/* Append a new telemetry struct to binary database file */
int add_new_incident(const char* type, const char* sev, const char* loc, double lat, double lng, unsigned int code) {
    FILE* fp = fopen(BINARY_DATABASE_FILE, "ab");
    if (!fp) {
        perror("Unable to write binary incident to desk catalog");
        return 0;
    }

    RescueTicket ticket;
    
    /* Generate systematic ID */
    srand((unsigned int)time(NULL));
    sprintf(ticket.ticket_number, "PWG-LOC-%d", rand() % 9000 + 1000);
    
    strncpy(ticket.animal_type, type, sizeof(ticket.animal_type) - 1);
    ticket.animal_type[sizeof(ticket.animal_type) - 1] = '\0';
    
    strncpy(ticket.severity, sev, sizeof(ticket.severity) - 1);
    ticket.severity[sizeof(ticket.severity) - 1] = '\0';
    
    strncpy(ticket.location, loc, sizeof(ticket.location) - 1);
    ticket.location[sizeof(ticket.location) - 1] = '\0';
    
    ticket.gps_lat = lat;
    ticket.gps_lng = lng;
    ticket.logged_at = time(NULL);
    ticket.status_code = code;

    fwrite(&ticket, sizeof(RescueTicket), 1, fp);
    fclose(fp);
    return 1;
}

/* Load structural cache and execute high-speed sorting and metric processing */
void process_telemetry_statistics() {
    FILE* fp = fopen(BINARY_DATABASE_FILE, "rb");
    if (!fp) {
        printf("⚠️ Local file system stats scanner unavailable: database file unallocated.\n");
        return;
    }

    RescueTicket temp;
    TelemetryStats stats = {0, 0, 0, 0, 0, 0.0, 0.0};
    double sum_lat = 0.0;
    double sum_lng = 0.0;

    printf("\n🛰 --- ACTIVE RECONNAISSANCE BEACON ENTRIESTABLE ---\n");
    printf("%-14s | %-12s | %-10s | %-32s | %-5s\n", "TICKET NUMBER", "SPECIES", "SEVERITY", "GENERAL GEOLOCITY", "CODE");
    printf("--------------------------------------------------------------------------------\n");

    while (fread(&temp, sizeof(RescueTicket), 1, fp) == 1) {
        stats.total_incidents++;
        sum_lat += temp.gps_lat;
        sum_lng += temp.gps_lng;

        if (strstr(temp.severity, "Critical") || strstr(temp.severity, "critical")) {
            stats.critical_count++;
        } else if (strstr(temp.severity, "Moderate") || strstr(temp.severity, "moderate")) {
            stats.moderate_count++;
        } else {
            stats.low_count++;
        }

        if (temp.status_code == 1 || temp.status_code == 2) {
            stats.active_dispatches++;
        }

        printf("%-14s | %-12s | %-10s | %-32s | %u\n", 
               temp.ticket_number, 
               temp.animal_type, 
               temp.severity, 
               temp.location,
               temp.status_code);
    }
    fclose(fp);

    if (stats.total_incidents > 0) {
        stats.avg_latitude = sum_lat / stats.total_incidents;
        stats.avg_longitude = sum_lng / stats.total_incidents;
    }

    printf("\n📊 --- EMBEDDED TRIAGE AGGREGATES ---\n");
    printf("• Total Incidents Cached locally : %d\n", stats.total_incidents);
    printf("• Critical Triage Severity Logs  : %d 🔴\n", stats.critical_count);
    printf("• Moderate Severity Logs         : %d 🟡\n", stats.moderate_count);
    printf("• Low Severity Logs              : %d 🟢\n", stats.low_count);
    printf("• Vehicles Active / Dispatched   : %d Status Transits\n", stats.active_dispatches);
    printf("• Median Geo-Center Coordinates  : Lat: %.4f | Lng: %.4f\n", stats.avg_latitude, stats.avg_longitude);
}
