"""Script to initialize database and load loan data"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.database import init_db, SessionLocal
from app.services.database_service import DatabaseService

def main():
    """Initialize database and load loan data"""
    print("🔧 Database Integration Setup")
    print("=" * 60)
    
    # Initialize database
    print("\n📊 1️⃣  Initializing database...")
    try:
        init_db()
        print("   ✓ Database tables created")
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return False
    
    # Load data
    print("\n📥 2️⃣  Loading loan reference data...")
    db = SessionLocal()
    try:
        results = DatabaseService.load_all_data(db, "data")
        
        successes = {k: v for k, v in results.items() if not k.endswith("_error")}
        errors = {k: v for k, v in results.items() if k.endswith("_error")}
        
        for key, count in successes.items():
            if isinstance(count, int):
                print(f"   ✓ {key.replace('_', ' ').title()}: {count} records")
        
        if errors:
            print("\n   ⚠️  Errors encountered:")
            for key, error in errors.items():
                print(f"   ✗ {key}: {error}")
        
        total = sum(v for v in successes.values() if isinstance(v, int))
        print(f"\n   ✅ Total records loaded: {total}")
    except Exception as e:
        print(f"   ✗ Error: {e}")
        db.close()
        return False
    finally:
        db.close()
    
    print("\n" + "=" * 60)
    print("✅ Database integration complete!")
    print("\nAPI Endpoints Available:")
    print("  • GET /api/v1/loan-products")
    print("  • GET /api/v1/loan-products/{product_id}")
    print("  • GET /api/v1/loan-rates")
    print("  • GET /api/v1/loan-rates/{product_id}")
    print("  • GET /api/v1/loan-terms/{product_id}")
    print("  • GET /api/v1/loan-fees/{product_id}")
    print("  • GET /api/v1/loan-requirements/{product_id}")
    print("  • POST /api/v1/admin/load-loan-data")
    print("  • GET /api/v1/admin/stats")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
