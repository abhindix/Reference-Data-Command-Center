# Loan Reference Data Platform

A FastAPI-based reference data management service for loan processing systems with PostgreSQL backend and AWS integration.

## Features

- **FastAPI REST API** - High-performance async Python web framework
- **PostgreSQL Database** - Persistent data storage with SQLAlchemy ORM
- **AWS Integration** - S3 for object storage and RDS support
- **Docker Support** - Containerized deployment with docker-compose
- **Testing** - Pytest-based test suite with async support
- **CI/CD Ready** - Configured for automated testing and deployment

## Tech Stack

- **Python 3.11+**
- **FastAPI 0.104+**
- **SQLAlchemy 2.0+**
- **PostgreSQL 16**
- **AWS SDK (boto3)**
- **Pydantic 2.5+**

## Project Structure

```
loan-reference-data-platform/
├── app/                    # Main application package
│   ├── api/               # API endpoints
│   ├── models/            # SQLAlchemy models
│   ├── schemas/           # Pydantic schemas
│   ├── services/          # Business logic
│   ├── core/              # Core configuration
│   └── main.py            # FastAPI app entry point
├── tests/                 # Test suite
├── config/                # Configuration files
├── requirements.txt       # Python dependencies
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Local development setup
├── pyproject.toml         # Project metadata
├── .env.example           # Environment variables template
└── README.md              # This file
```

## Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL 16+
- Docker (optional)
- AWS account (optional, for cloud deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd loan-reference-data-platform
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

5. **Run the application**
   ```bash
   uvicorn app.main:app --reload
   ```

The API will be available at `http://localhost:8000`

### Docker Deployment

1. **Build and run with docker-compose**
   ```bash
   docker-compose up -d
   ```

2. **Run migrations** (if applicable)
   ```bash
   docker-compose exec app python -m alembic upgrade head
   ```

3. **Access the application**
   - API: `http://localhost:8000`
   - PostgreSQL: `localhost:5432`

## API Documentation

Once the application is running, access the interactive API documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Development

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_api.py
```

### Code Quality

```bash
# Format code with black
black .

# Lint with ruff
ruff check .

# Type checking with mypy
mypy app/
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Application
APP_NAME=Loan Reference Data Platform
DEBUG=True

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/loan_ref_db

# AWS
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

## API Endpoints

### Health Checks
- `GET /api/v1/health` - Service health check
- `GET /api/v1/ready` - Service readiness probe

### Reference Data
- `GET /api/v1/reference-data` - List all reference data
- `GET /api/v1/reference-data/{data_id}` - Get specific reference data
- `POST /api/v1/reference-data` - Create new reference data
- `PUT /api/v1/reference-data/{data_id}` - Update reference data
- `DELETE /api/v1/reference-data/{data_id}` - Delete reference data

## Deployment

### AWS RDS

1. Create PostgreSQL RDS instance
2. Update `DATABASE_URL` in `.env` with RDS endpoint
3. Deploy containerized application to ECS/EKS

### AWS S3

Configure S3 bucket for reference data backups:
```python
# In services, use boto3
import boto3
s3 = boto3.client('s3', region_name=settings.AWS_REGION)
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `pytest`
4. Submit a pull request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For issues and questions, please create an issue in the repository.
