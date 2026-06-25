from sqlalchemy import create_engine,text
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv


load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"]

print("DATABASE_URL =", repr(DATABASE_URL))

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)

with engine.connect() as conn:
    print("Connected!")
    print(conn.execute(text("SELECT 1")).scalar())


SessionLocal= sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
Base= declarative_base()

def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()


