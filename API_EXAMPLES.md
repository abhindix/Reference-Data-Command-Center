# API Usage Examples & Testing

## 🎬 Running the Examples

All examples assume the API is running at `http://localhost:8000`

### Start the Server
```bash
python -m uvicorn app.main:app --reload
```

---

## 📌 Base URL
```
http://localhost:8000/api/v1
```

---

## 🔍 Read Endpoints

### 1. List All Loan Products
```bash
curl http://localhost:8000/api/v1/loan-products
```

**Query Parameters:**
- `skip` (int, default: 0) - Number of records to skip
- `limit` (int, default: 10) - Number of records to return

**Example with pagination:**
```bash
curl "http://localhost:8000/api/v1/loan-products?skip=0&limit=5"
```

**Sample Response:**
```json
[
  {
    "product_id": "MORTGAGE_30",
    "name": "30-Year Fixed Mortgage",
    "product_type": "mortgage",
    "term_months": 360,
    "min_rate": 0.03,
    "max_rate": 0.09,
    "min_loan_amount": 50000.0,
    "max_loan_amount": 1000000.0,
    "description": "Standard 30-year fixed-rate mortgage",
    "id": "2b269534-993f-42d6-bdec-a6f757011e1d",
    "created_at": "2026-07-20T06:07:21.629975",
    "updated_at": "2026-07-20T06:07:21.631227"
  },
  ...
]
```

---

### 2. Get Product with Full Details
```bash
curl http://localhost:8000/api/v1/loan-products/MORTGAGE_30
```

**URL Parameters:**
- `product_id` (string) - Product identifier (MORTGAGE_30, MORTGAGE_15, AUTO_NEW, AUTO_USED, PERSONAL, HELOC)

**Response includes:**
- Product information
- Current rates
- Available terms
- Fee structure
- Credit requirements

**Sample Response:**
```json
{
  "product": {
    "id": "2b269534-993f-42d6-bdec-a6f757011e1d",
    "product_id": "MORTGAGE_30",
    "name": "30-Year Fixed Mortgage",
    "product_type": "mortgage",
    "term_months": 360,
    "min_rate": 0.03,
    "max_rate": 0.09,
    "min_loan_amount": 50000.0,
    "max_loan_amount": 1000000.0,
    "description": "Standard 30-year fixed-rate mortgage",
    "created_at": "2026-07-20T06:07:21.629975",
    "updated_at": "2026-07-20T06:07:21.631227"
  },
  "rate": {
    "id": "4a2ed316-4269-4a22-a86f-2e3cc8942ce8",
    "product_id": "MORTGAGE_30",
    "current_rate": 0.065,
    "min_rate": 0.0575,
    "max_rate": 0.0725,
    "market_condition": "Normal",
    "rate_effective_date": "2026-07-20T07:03:29.839361",
    "last_updated": "2026-07-20T06:07:21.635412"
  },
  "available_terms": [
    {
      "id": "dfa6c5bd-c996-424b-838c-8409c8e3a779",
      "product_id": "MORTGAGE_30",
      "term_months": 360,
      "is_common": true
    }
  ],
  "fees": [
    {
      "id": "c57868f6-a994-4dd8-8b29-c53f0140cead",
      "product_id": "MORTGAGE_30",
      "fee_type": "origination_fee",
      "fee_amount": null,
      "fee_percentage": 0.01,
      "description": "origination_fee for MORTGAGE_30"
    },
    {
      "id": "85fb7da2-80fb-4918-9398-6eb02604f93c",
      "product_id": "MORTGAGE_30",
      "fee_type": "appraisal_fee",
      "fee_amount": 500.0,
      "fee_percentage": null,
      "description": "appraisal_fee for MORTGAGE_30"
    }
  ],
  "requirements": {
    "id": "7019e582-45bb-4e76-9c62-b7ed294e0c21",
    "product_id": "MORTGAGE_30",
    "min_credit_score": 620,
    "max_dti": 0.43,
    "min_down_payment": 0.03,
    "home_equity_required": null,
    "employment_history_months": 24,
    "income_verification_required": true
  }
}
```

---

### 3. List All Current Rates
```bash
curl http://localhost:8000/api/v1/loan-rates
```

**Sample Response:**
```json
[
  {
    "id": "4a2ed316-4269-4a22-a86f-2e3cc8942ce8",
    "product_id": "MORTGAGE_30",
    "current_rate": 0.065,
    "min_rate": 0.0575,
    "max_rate": 0.0725,
    "market_condition": "Normal",
    "rate_effective_date": "2026-07-20T07:03:29.839361",
    "last_updated": "2026-07-20T06:07:21.635412"
  },
  ...
]
```

---

### 4. Get Rate for Specific Product
```bash
curl http://localhost:8000/api/v1/loan-rates/AUTO_NEW
```

**Sample Response:**
```json
{
  "id": "...",
  "product_id": "AUTO_NEW",
  "current_rate": 0.055,
  "min_rate": 0.019,
  "max_rate": 0.099,
  "market_condition": "Normal",
  "rate_effective_date": "2026-07-20T07:03:29.839361",
  "last_updated": "2026-07-20T06:07:21.635412"
}
```

---

### 5. Get Available Terms
```bash
curl http://localhost:8000/api/v1/loan-terms/PERSONAL
```

**Sample Response:**
```json
[
  {
    "id": "...",
    "product_id": "PERSONAL",
    "term_months": 36,
    "is_common": true
  },
  {
    "id": "...",
    "product_id": "PERSONAL",
    "term_months": 60,
    "is_common": true
  },
  {
    "id": "...",
    "product_id": "PERSONAL",
    "term_months": 84,
    "is_common": true
  }
]
```

---

### 6. Get Fee Structure
```bash
curl http://localhost:8000/api/v1/loan-fees/HELOC
```

**Sample Response:**
```json
[
  {
    "id": "...",
    "product_id": "HELOC",
    "fee_type": "origination_fee",
    "fee_amount": null,
    "fee_percentage": 0.005,
    "description": "origination_fee for HELOC"
  },
  {
    "id": "...",
    "product_id": "HELOC",
    "fee_type": "annual_fee",
    "fee_amount": 50.0,
    "fee_percentage": null,
    "description": "annual_fee for HELOC"
  }
]
```

---

### 7. Get Credit Requirements
```bash
curl http://localhost:8000/api/v1/loan-requirements/MORTGAGE_15
```

**Sample Response:**
```json
{
  "id": "...",
  "product_id": "MORTGAGE_15",
  "min_credit_score": 640,
  "max_dti": 0.40,
  "min_down_payment": 0.05,
  "home_equity_required": null,
  "employment_history_months": 24,
  "income_verification_required": true
}
```

---

## ⚙️ Admin Endpoints

### Load All Data
```bash
curl -X POST http://localhost:8000/api/v1/admin/load-loan-data
```

**Response:**
```json
{
  "status": "success",
  "message": "Loaded 61 total records",
  "loaded": {
    "loan_products": 6,
    "loan_rates": 6,
    "loan_terms": 18,
    "loan_fees": 25,
    "loan_requirements": 6
  },
  "errors": null
}
```

---

### Get Database Statistics
```bash
curl http://localhost:8000/api/v1/admin/stats
```

**Response:**
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

---

## 🧪 Using Python Requests

### Install requests library
```bash
pip install requests
```

### Example Python script
```python
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

# Get all products
response = requests.get(f"{BASE_URL}/loan-products")
products = response.json()
print(f"Found {len(products)} products")

# Get specific product
response = requests.get(f"{BASE_URL}/loan-products/MORTGAGE_30")
product = response.json()
print(f"Product: {product['product']['name']}")
print(f"Current Rate: {product['rate']['current_rate']*100:.2f}%")
print(f"Min Rate: {product['rate']['min_rate']*100:.2f}%")
print(f"Max Rate: {product['rate']['max_rate']*100:.2f}%")

# Get database stats
response = requests.get(f"{BASE_URL}/admin/stats")
stats = response.json()['statistics']
print(f"\nDatabase Statistics:")
for key, value in stats.items():
    print(f"  {key}: {value}")
```

---

## 🔄 Using JavaScript/Node.js

### Example JavaScript
```javascript
const BASE_URL = "http://localhost:8000/api/v1";

// Fetch all products
fetch(`${BASE_URL}/loan-products`)
  .then(response => response.json())
  .then(data => {
    console.log("Products:", data);
    data.forEach(product => {
      console.log(`- ${product.name}: ${product.min_rate * 100}%-${product.max_rate * 100}%`);
    });
  });

// Fetch specific product
fetch(`${BASE_URL}/loan-products/MORTGAGE_30`)
  .then(response => response.json())
  .then(data => {
    const product = data.product;
    const rate = data.rate;
    console.log(`${product.name}: ${rate.current_rate * 100}%`);
  });
```

---

## 🛠️ Using Postman

### 1. Import Collection
- Open Postman
- Create new collection "Loan Reference API"

### 2. Add Requests

**Request 1: Get All Products**
- Method: GET
- URL: `http://localhost:8000/api/v1/loan-products`
- Params: skip=0, limit=10

**Request 2: Get Product Details**
- Method: GET
- URL: `http://localhost:8000/api/v1/loan-products/MORTGAGE_30`

**Request 3: Get Database Stats**
- Method: GET
- URL: `http://localhost:8000/api/v1/admin/stats`

**Request 4: Load Data**
- Method: POST
- URL: `http://localhost:8000/api/v1/admin/load-loan-data`

---

## 📊 Error Responses

### 404 - Product Not Found
```bash
curl http://localhost:8000/api/v1/loan-products/INVALID_PRODUCT
```

**Response:**
```json
{
  "detail": "Product not found"
}
```

**HTTP Status:** 404

---

### 500 - Server Error
```bash
curl http://localhost:8000/api/v1/loan-rates/INVALID
```

**Response:**
```json
{
  "detail": "Product not found"
}
```

**HTTP Status:** 500

---

## 📋 Product IDs Reference

| Product ID | Full Name | Type |
|-----------|-----------|------|
| MORTGAGE_30 | 30-Year Fixed Mortgage | mortgage |
| MORTGAGE_15 | 15-Year Fixed Mortgage | mortgage |
| AUTO_NEW | New Auto Loan | auto |
| AUTO_USED | Used Auto Loan | auto |
| PERSONAL | Personal Loan | personal |
| HELOC | Home Equity Line of Credit | heloc |

---

## 🔐 Rate Information (Current)

| Product | Current Rate | Min Rate | Max Rate |
|---------|-------------|----------|----------|
| MORTGAGE_30 | 6.50% | 5.75% | 7.25% |
| MORTGAGE_15 | 5.90% | 5.00% | 7.50% |
| AUTO_NEW | 5.50% | 1.90% | 9.90% |
| AUTO_USED | 8.50% | 2.90% | 14.90% |
| PERSONAL | 22.00% | 6.90% | 39.90% |
| HELOC | 8.20% | 3.50% | 12.90% |

---

## 📝 Fee Types

- **origination_fee** - Fee charged when loan is created
- **appraisal_fee** - Fee for property/asset appraisal
- **title_insurance** - Title search and insurance
- **recording_fee** - Recording fees with county/local authority
- **processing_fee** - Loan processing fee
- **annual_fee** - Annual maintenance fee (HELOC)

---

## ✅ Health Check

### Root Endpoint
```bash
curl http://localhost:8000/
```

**Response:**
```json
{
  "message": "Loan Reference Data Platform",
  "version": "0.1.0",
  "status": "running",
  "test_mode": true
}
```

### Health Check
```bash
curl http://localhost:8000/api/v1/health
```

**Response:**
```json
{
  "status": "healthy"
}
```

### Readiness Check
```bash
curl http://localhost:8000/api/v1/ready
```

**Response:**
```json
{
  "status": "ready",
  "database": "connected"
}
```

---

## 🔗 Related Endpoints

Use product_id from one endpoint as parameter in another:

```
GET /loan-products/MORTGAGE_30              → Get product info
GET /loan-rates/MORTGAGE_30                 → Get rates for product
GET /loan-terms/MORTGAGE_30                 → Get available terms
GET /loan-fees/MORTGAGE_30                  → Get fee structure
GET /loan-requirements/MORTGAGE_30          → Get credit requirements
```

---

## 📖 Interactive Documentation

While the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

Both provide:
- Complete endpoint documentation
- Live testing interface
- Request/response schemas
- Example values

---

*All examples are ready to copy and run!*
