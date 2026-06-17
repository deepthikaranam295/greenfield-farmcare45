"""Run with: python seed.py"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal
from app.models.user import User, UserRole
from app.models.farm import Farm, FarmStatus, SubscriptionPlan
from app.models.task import Task, TaskType, TaskStatus
from app.core.security import hash_password
from datetime import date

db = SessionLocal()

try:
    if db.query(User).filter(User.email == "admin@greenfield.com").first():
        print("Seed data already exists, skipping.")
        sys.exit(0)

    admin = User(name="Admin User", email="admin@greenfield.com", password_hash=hash_password("Admin@123"), role=UserRole.admin, phone="9999900000")
    field1 = User(name="Ramu Field Staff", email="ramu@greenfield.com", password_hash=hash_password("Field@123"), role=UserRole.field_team, phone="9876500001")
    customer1 = User(name="Venkat Farmer", email="venkat@example.com", password_hash=hash_password("Customer@123"), role=UserRole.customer, phone="9876500002")
    customer2 = User(name="Lakshmi Devi", email="lakshmi@example.com", password_hash=hash_password("Customer@123"), role=UserRole.customer, phone="9876500003")

    db.add_all([admin, field1, customer1, customer2])
    db.flush()

    farm1 = Farm(customer_id=customer1.id, name="Venkat Farm A", village="Kothapalli", mandal="Tadipatri", district="Anantapur", size_acres=12.5, gps_lat=14.9, gps_lng=78.0, status=FarmStatus.active, subscription_plan=SubscriptionPlan.standard)
    farm2 = Farm(customer_id=customer1.id, name="Venkat Farm B", village="Gorantla", mandal="Gorantla", district="Anantapur", size_acres=8.0, status=FarmStatus.active, subscription_plan=SubscriptionPlan.basic)
    farm3 = Farm(customer_id=customer2.id, name="Lakshmi Fields", village="Hindupur", mandal="Hindupur", district="Anantapur", size_acres=20.0, status=FarmStatus.active, subscription_plan=SubscriptionPlan.premium)

    db.add_all([farm1, farm2, farm3])
    db.flush()

    task1 = Task(farm_id=farm1.id, assigned_to=field1.id, task_type=TaskType.inspection, status=TaskStatus.pending, scheduled_date=date.today(), notes="Monthly inspection")
    task2 = Task(farm_id=farm1.id, assigned_to=field1.id, task_type=TaskType.irrigation, status=TaskStatus.completed, scheduled_date=date(2026, 6, 10), completed_date=date(2026, 6, 10))
    task3 = Task(farm_id=farm3.id, assigned_to=field1.id, task_type=TaskType.pest_control, status=TaskStatus.in_progress, scheduled_date=date.today())

    db.add_all([task1, task2, task3])
    db.commit()

    print("Seed data inserted:")
    print("  Admin:    admin@greenfield.com / Admin@123")
    print("  Field:    ramu@greenfield.com  / Field@123")
    print("  Customer: venkat@example.com   / Customer@123")
    print("  Customer: lakshmi@example.com  / Customer@123")
    print(f"  Farms: {[farm1.name, farm2.name, farm3.name]}")
    print(f"  Tasks: {[str(t.task_type) for t in [task1, task2, task3]]}")

except Exception as e:
    db.rollback()
    print(f"Seed failed: {e}")
    raise
finally:
    db.close()
