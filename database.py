import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_link():
    return psycopg2.connect(
        host="localhost",
        database="postgres",
        user="postgres",
        password=os.getenv("DB_PASSWORD") # Ensure this is in your .env file
    )