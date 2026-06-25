from dotenv import load_dotenv
import os

load_dotenv()

env_url = os.environ["DATABASE_URL"]

hardcoded = "postgresql://postgres.hprqryvocandmqrkbxbf:MyTestPas123@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"

print(env_url == hardcoded)
print(len(env_url), len(hardcoded))
print(env_url.encode())
print(hardcoded.encode())