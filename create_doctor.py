
import asyncio
import getpass
from datetime import datetime, timezone

from database import db
from utils import hash_password


async def main():
    name = input("Doctor full name: ").strip()
    email = input("Doctor email: ").strip().lower()
    specialization = input("Specialization: ").strip()
    password = getpass.getpass("Set doctor password: ")

    if not name or not email or not specialization:
        print("Name, email, and specialization are required.")
        return

    if len(password) < 8:
        print("Use a password with at least 8 characters.")
        return

    existing = await db.users.find_one({"email": email})
    if existing:
        print("This email already exists. No account was created.")
        return

    result = await db.users.insert_one({
        "name": name,
        "email": email,
        "password_hash": hash_password(password),
        "role": "doctor",
        "specialization": specialization,
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
    })

    print("Doctor account created successfully.")
    print("Doctor ID:", str(result.inserted_id))


if __name__ == "__main__":
    asyncio.run(main())
