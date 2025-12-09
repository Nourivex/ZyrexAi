import sqlite3

# Update database with correct model name
conn = sqlite3.connect('data/zyrex.db')
cursor = conn.cursor()

# Update Coder character's model preference
cursor.execute('UPDATE characters SET model_preference = ? WHERE id = 2', ('qwen2.5-coder:14b-instruct',))
conn.commit()

# Verify the update
cursor.execute('SELECT id, name, model_preference FROM characters')
results = cursor.fetchall()

print("Character Model Preferences:")
for row in results:
    print(f"  ID: {row[0]}, Name: {row[1]}, Model: {row[2]}")

conn.close()
print("\nDatabase updated successfully!")
