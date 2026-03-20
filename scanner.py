import psycopg2

db_config = {
    "host": "localhost",
    "database": "postgres",
    "user": "postgres",
    "password": "Joelkazadi@1"
}

try:
    conn = psycopg2.connect(**db_config)
    cursor = conn.cursor()
    
    # This is the "Backend" sending data to the "Vault"
    sql = "INSERT INTO security_logs (port_number, status, description) VALUES (%s, %s, %s)"
    data = (80, "VULNERABLE", "Port 80 is open and unencrypted.")
    
    cursor.execute(sql, data)
    conn.commit() # This "saves" the data
    
    print("BACKEND STATUS: Security alert successfully logged to the database!")
    
    cursor.close()
    conn.close()

except Exception as e:
    print(f"CRITICAL ERROR: {e}")