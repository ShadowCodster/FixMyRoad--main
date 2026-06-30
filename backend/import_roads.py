"""
Run from the backend folder:
  python import_roads.py
"""
import csv
import os
from datetime import datetime

import psycopg2

# ── connection ────────────────────────────────────────────────
conn = psycopg2.connect(
    host="localhost",
    port=5432,
    dbname="roadwatch",
    user="postgres",
    password="1234",
)
cur = conn.cursor()

# ── fetch lookup maps ─────────────────────────────────────────
cur.execute("SELECT id, code FROM road_types")
road_type_map = {code: id_ for id_, code in cur.fetchall()}

cur.execute("SELECT id, name FROM bbmp_divisions")
division_map = {name: id_ for id_, name in cur.fetchall()}

print("Road type map:", road_type_map)
print("Division map:", division_map)

# ── parse dates ───────────────────────────────────────────────
def parse_date(s):
    for fmt in ("%d.%m.%Y", "%Y-%m-%d", "%d/%m/%Y"):
        try:
            return datetime.strptime(s.strip(), fmt).date()
        except ValueError:
            continue
    raise ValueError(f"Cannot parse date: {s!r}")

# ── import rows ───────────────────────────────────────────────
csv_path = os.path.join(os.path.dirname(__file__), "data", "bengaluru_roads_master.csv")

inserted = 0
skipped  = 0

with open(csv_path, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        try:
            road_type_id  = road_type_map[row["road_type"].strip()]
            division_id   = division_map[row["bbmp_division"].strip()]

            cur.execute("""
                INSERT INTO roads (
                    sl_no, road_id, osm_id, road_name,
                    road_type_id, road_ref, length_km, bbmp_division_id,
                    contractor_name, executive_engineer, ee_contact,
                    asst_exec_engineer, aee_contact, asst_engineer, ae_contact,
                    completion_date, dlp_period, dlp_expiry_date,
                    budget_sanctioned, budget_released, budget_spent, budget_unspent,
                    health_score, last_complaint_date, open_complaints, geometry
                ) VALUES (
                    %s,%s,%s,%s,
                    %s,%s,%s,%s,
                    %s,%s,%s,
                    %s,%s,%s,%s,
                    %s,%s,%s,
                    %s,%s,%s,%s,
                    %s,%s,%s,%s
                )
                ON CONFLICT (sl_no) DO NOTHING
            """, (
                int(row["sl_no"]),
                row["road_id"].strip(),
                row["osm_id"].strip() or None,
                row["road_name"].strip(),
                road_type_id,
                row["road_ref"].strip() or None,
                float(row["length_km"]),
                division_id,
                row["contractor_name"].strip(),
                row["executive_engineer"].strip(),
                int(row["ee_contact"]) if row["ee_contact"].strip() else None,
                row["asst_exec_engineer"].strip() or None,
                int(row["aee_contact"]) if row["aee_contact"].strip() else None,
                row["asst_engineer"].strip() or None,
                int(row["ae_contact"]) if row["ae_contact"].strip() else None,
                parse_date(row["completion_date"]),
                row["dlp_period"].strip(),
                parse_date(row["dlp_expiry_date"]),
                int(row["budget_sanctioned"]),
                int(row["budget_released"]),
                int(row["budget_spent"]),
                int(row["budget_unspent"]),
                int(row["health_score"]),
                parse_date(row["last_complaint_date"]),
                int(row["open_complaints"]),
                row["geometry"].strip() or None,
            ))
            inserted += 1
        except Exception as e:
            print(f"  Skipped row {row.get('sl_no')}: {e}")
            skipped += 1

conn.commit()
cur.close()
conn.close()

print(f"\nDone! Inserted: {inserted}, Skipped: {skipped}")