import os
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

def test_connection():
    # هذا السكربت يقرأ DATABASE_URL من بيئة الإنتاج التي ستضبطها
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("Error: DATABASE_URL environment variable is not set.")
        return

    print(f"Testing connection to: {db_url.split('@')[1] if '@' in db_url else 'configured database'}")
    
    try:
        engine = create_engine(db_url, pool_pre_ping=True, connect_args={"connect_timeout": 10})
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version();"))
            print("Successfully connected to Supabase PostgreSQL!")
            print("Database version:", result.scalar())
    except SQLAlchemyError as e:
        print("Failed to connect to database.")
        print("Error details:", str(e))

if __name__ == "__main__":
    test_connection()
