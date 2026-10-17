import sqlite3

con = sqlite3.connect('database/database.sqlite')
cursor = con.cursor()

tables = [
    'users',
    'registration_centers',
    'registrants',
    'demographics',
    'documents',
    'appointments',
    'identities',
    'auth_events',
    'notifications',
]

for t in tables:
    try:
        count = cursor.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]
        print(f"{t}: {count} rows")
    except Exception as e:
        print(f"{t}: {e}")

print("\nSample Demographics:")
for row in cursor.execute("SELECT id, full_name, dob, gender, province FROM demographics LIMIT 5"):
    print(row)

print("\nSample Users:")
for row in cursor.execute("SELECT id, name, email FROM users"):
    print(row)
