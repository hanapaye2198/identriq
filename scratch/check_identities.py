import sqlite3

con = sqlite3.connect('database/database.sqlite')
cursor = con.cursor()

print("Identity records:")
for row in cursor.execute("""
    SELECT i.id, i.registrant_id, i.biosure_id_number, i.status, d.full_name, r.mobile
    FROM identities i
    JOIN registrants r ON r.id = i.registrant_id
    JOIN demographics d ON d.registrant_id = r.id
"""):
    print(row)
