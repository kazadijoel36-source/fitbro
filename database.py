import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Load variables from the .env file
load_dotenv()

def get_db_conn():
    # If we are on Render, it provides a 'DATABASE_URL' automatically
    # If we are local, it uses the individual variables from your .env
    db_url = os.getenv("DATABASE_URL")
    
    try:
        if db_url:
            # Production Mode (Render/Cloud)
            return psycopg2.connect(db_url, sslmode='require')
        else:
            # Development Mode (Local ProBook)
            return psycopg2.connect(
                host=os.getenv("DB_HOST"),
                database=os.getenv("DB_NAME"),
                user=os.getenv("DB_USER"),
                password=os.getenv("DB_PASS"),
                port=os.getenv("DB_PORT")
            )
    except Exception as e:
        print(f"DATABASE_CONNECTION_ERROR: {e}")
        return None