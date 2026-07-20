# Quick Start Guide - Loan Reference Data Platform

## 🚀 Get Started in 5 Minutes

### Step 1: Initialize Database (One-time)
```bash
python scripts/init_db.py
```
**Output:** Initializes database tables and loads 61 reference records

### Step 2: Start the Server
```bash
# Option A: Using VS Code Task
# Run task: "FastAPI Dev Server"

# Option B: Using command line
python -m uvicorn app.main:app --reload
```
**Server starts at:** http://localhost:8000

### Step 3: Access the API
Open in your browser:
- **API Documentation**: http://localhost:8000/docs (Swagger UI)
- **Alternative Docs**: http://localhost:8000/redoc (ReDoc)

### Step 4: Test Endpoints

#### Get All Loan Products
```bash
curl http://localhost:8000/api/v1/loan-products
```

#### Get Specific Product with Full Details
```bash
curl http://localhost:8000/api/v1/loan-products/MORTGAGE_30
```

#### Get Database Statistics
```bash
curl http://localhost:8000/api/v1/admin/stats
```

## 📊 Available Loan Products

| Product ID | Name | Type | Term | Rate Range |
|-----------|------|------|------|-----------|
| MORTGAGE_30 | 30-Year Fixed Mortgage | mortgage | 360 mo | 3.0% - 9.0% |
| MORTGAGE_15 | 15-Year Fixed Mortgage | mortgage | 180 mo | 2.5% - 8.0% |
| AUTO_NEW | New Auto Loan | auto | 72 mo | 1.9% - 9.9% |
| AUTO_USED | Used Auto Loan | auto | 72 mo | 2.9% - 14.9% |
| PERSONAL | Personal Loan | personal | 84 mo | 6.9% - 39.9% |
| HELOC | Home Equity Line of Credit | heloc | 360 mo | 3.5% - 12.9% |

## 📋 Complete API Reference

### Read Endpoints

#### 1. List All Loan Products
```
GET /api/v1/loan-products?skip=0&limit=10
```
**Response:** Array of 6 loan products

#### 2. Get Product with Full Details
```
GET /api/v1/loan-products/{product_id}
```
**Example:** `/api/v1/loan-products/MORTGAGE_30`
**Response:** Product + Rate + Terms + Fees + Requirements

#### 3. List All Current Rates
```
GET /api/v1/loan-rates
```
**Response:** Array of current rates for all products

#### 4. Get Rate for Specific Product
```
GET /api/v1/loan-rates/{product_id}
```
**Response:** Current rate information (current, min, max, market condition)

#### 5. Get Available Terms
```
GET /api/v1/loan-terms/{product_id}
```
**Response:** Array of available loan terms (months)

#### 6. Get Fee Structure
```
GET /api/v1/loan-fees/{product_id}
```
**Response:** Array of fees (origination, appraisal, title insurance, etc.)

#### 7. Get Credit Requirements
```
GET /api/v1/loan-requirements/{product_id}
```
**Response:** Minimum credit score, DTI limits, down payment %, employment history

### Admin Endpoints

#### Load All Data
```
POST /api/v1/admin/load-loan-data
```
**Purpose:** Load all JSON files into database
**Response:** Statistics of loaded records

#### Get Database Statistics
```
GET /api/v1/admin/stats
```
**Response:** Count of records by type (products, rates, terms, fees, requirements)

## 💾 Database

### Current Setup (Development)
- **Engine:** SQLite (in-memory for testing)
- **File:** `test.db`
- **Records:** 61 total

### Production Setup
```env
# Update .env
DATABASE_URL=postgresql://user:password@localhost:5432/loan_db
```

## 🧪 Run Tests

```bash
# All tests
python -m pytest tests/ -v

# Specific test file
python -m pytest tests/test_api.py -v

# Run with coverage
python -m pytest tests/ --cov=app
```
**Current Status:** ✅ 12 tests passing

## 🔧 Common Tasks

### Reload Data
```bash
# Via API
curl -X POST http://localhost:8000/api/v1/admin/load-loan-data

# Via script
python scripts/init_db.py
```

### Connect to Production Database
```bash
# Update .env
DATABASE_URL=postgresql://user:password@your-host:5432/loan_db

# Restart application
# Data auto-loads on startup via init_db() in lifespan
```

### Check Data Status
```bash
curl http://localhost:8000/api/v1/admin/stats
```

Response example:
```json
{
  "status": "success",
  "statistics": {
    "loan_products": 6,
    "loan_rates": 6,
    "loan_terms": 18,
    "loan_fees": 25,
    "loan_requirements": 6,
    "total": 61
  }
}
```

## 📁 Project Structure

```
app/
├── main.py                     # FastAPI app entry point
├── api/
│   ├── health.py              # Health check endpoints
│   ├── loans.py               # Loan product endpoints
│   ├── reference_data.py       # Reference data endpoints
│   └── admin.py               # Admin management endpoints
├── core/
│   ├── config.py              # Configuration (Pydantic Settings)
│   └── database.py            # Database connection & session
├── models/
│   ├── loan_models.py         # SQLAlchemy ORM models
│   └── reference_data.py       # Generic reference data model
├── services/
│   ├── database_service.py    # Database operations
│   └── reference_data_loader.py # Data fetching service
└── schemas/
    └── loan_schemas.py         # Pydantic request/response models

data/                           # JSON reference data files
├── loan_products.json
├── loan_rates.json
├── loan_terms.json
├── loan_fees.json
└── loan_requirements.json

scripts/
├── load_reference_data.py      # Download reference data
└── init_db.py                  # Initialize database

tests/
├── test_api.py                # API endpoint tests
├── test_reference_data_loader.py # Data loader tests
└── conftest.py                # Test configuration

.env                            # Environment variables
requirements.txt                # Python dependencies
pyproject.toml                  # Project configuration
```

## 🐛 Troubleshooting

### Q: Server won't start - "Module not found"
**A:** Install dependencies: `pip install -r requirements.txt`

### Q: Database empty - No products returned
**A:** Initialize database: `python scripts/init_db.py`

### Q: Can't connect to PostgreSQL
**A:** Check connection string in `.env` and verify PostgreSQL is running

### Q: API returns 404
**A:** Verify endpoint path and HTTP method (use `/docs` for interactive docs)

### Q: Tests fail with "Database error"
**A:** Tests use in-memory SQLite; ensure `TEST_MODE=True` in `.env`

## 📚 Documentation

- Full documentation: See [DATABASE_INTEGRATION.md](DATABASE_INTEGRATION.md)
- API docs (interactive): http://localhost:8000/docs
- Project info: [README.md](README.md)

## 🎯 Next Steps

1. ✅ **Database integrated** - All data persisted in PostgreSQL/SQLite
2. ✅ **API endpoints working** - Full CRUD operations available
3. ✅ **Tests passing** - 12 unit tests validated
4. 🔄 **Optional:** Add authentication (OAuth2/JWT)
5. 🔄 **Optional:** Deploy to AWS (EC2/RDS)
6. 🔄 **Optional:** Add caching layer (Redis)

## 💬 API Examples

### Get all products with pagination
```bash
curl "http://localhost:8000/api/v1/loan-products?skip=0&limit=5"
```

### Get 30-year mortgage details
```bash
curl http://localhost:8000/api/v1/loan-products/MORTGAGE_30 | jq '.product'
```

### Get rates for auto loans
```bash
curl http://localhost:8000/api/v1/loan-rates/AUTO_NEW | jq '.current_rate'
```

### Get monthly payment calculation-ready data
```bash
curl http://localhost:8000/api/v1/loan-products/MORTGAGE_30 | jq '.product | {name, min_rate: .min_rate, max_rate: .max_rate, term_months: .term_months}'
```

---

**Happy coding! 🎉**
