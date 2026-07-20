"""Reference data management commands"""

import asyncio
import json
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.reference_data_loader import ReferenceDataLoader


async def download_reference_data(output_dir: str = "data"):
    """Download all reference data and save to files"""
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)
    
    print("📥 Downloading reference data...")
    
    # Download exchange rates
    print("\n1️⃣  Fetching exchange rates...")
    exchange_rates = await ReferenceDataLoader.fetch_exchange_rates()
    if "error" not in exchange_rates:
        rates_file = output_path / "exchange_rates.json"
        with open(rates_file, "w") as f:
            json.dump(exchange_rates, f, indent=2)
        print(f"   ✓ Exchange rates saved to {rates_file}")
        print(f"   ✓ Contains {len(exchange_rates.get('rates', {}))} currencies")
    else:
        print(f"   ✗ Error: {exchange_rates['error']}")
    
    # Download loan products
    print("\n2️⃣  Fetching loan products...")
    loan_products = await ReferenceDataLoader.fetch_loan_products()
    products_file = output_path / "loan_products.json"
    with open(products_file, "w") as f:
        json.dump(loan_products, f, indent=2)
    print(f"   ✓ Loan products saved to {products_file}")
    print(f"   ✓ Contains {len(loan_products)} product types")
    
    # Download risk categories
    print("\n3️⃣  Fetching risk categories...")
    risk_categories = await ReferenceDataLoader.fetch_risk_categories()
    categories_file = output_path / "risk_categories.json"
    with open(categories_file, "w") as f:
        json.dump(risk_categories, f, indent=2)
    print(f"   ✓ Risk categories saved to {categories_file}")
    print(f"   ✓ Contains {len(risk_categories)} categories")
    
    print("\n✅ All reference data downloaded successfully!")
    return {
        "exchange_rates": exchange_rates,
        "loan_products": loan_products,
        "risk_categories": risk_categories
    }


async def download_loan_data(output_dir: str = "data"):
    """Download comprehensive loan data"""
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)
    
    print("📊 Downloading comprehensive loan data...")
    
    # Fetch loan products
    print("\n🏦 1️⃣  Fetching loan products...")
    loan_products = await ReferenceDataLoader.fetch_loan_products()
    products_file = output_path / "loan_products.json"
    with open(products_file, "w") as f:
        json.dump(loan_products, f, indent=2)
    print(f"   ✓ Saved {len(loan_products)} loan products")
    
    # Fetch current rates
    print("\n📈 2️⃣  Fetching current loan rates...")
    loan_rates = await ReferenceDataLoader.fetch_loan_rates()
    rates_file = output_path / "loan_rates.json"
    with open(rates_file, "w") as f:
        json.dump(loan_rates, f, indent=2)
    print(f"   ✓ Saved rates for {len(loan_rates)} products")
    for rate in loan_rates:
        print(f"      • {rate['product_id']}: {rate['current_rate']*100:.2f}%")
    
    # Fetch available terms
    print("\n⏱️  3️⃣  Fetching available loan terms...")
    loan_terms = await ReferenceDataLoader.fetch_loan_terms()
    terms_file = output_path / "loan_terms.json"
    with open(terms_file, "w") as f:
        json.dump(loan_terms, f, indent=2)
    print(f"   ✓ Saved {len(loan_terms)} term options")
    
    # Fetch typical fees
    print("\n💰 4️⃣  Fetching typical loan fees...")
    loan_fees = await ReferenceDataLoader.fetch_loan_fees()
    fees_file = output_path / "loan_fees.json"
    with open(fees_file, "w") as f:
        json.dump(loan_fees, f, indent=2)
    print(f"   ✓ Saved fee structures for {len(loan_fees)} products")
    
    # Fetch credit requirements
    print("\n📋 5️⃣  Fetching credit requirements...")
    loan_requirements = await ReferenceDataLoader.fetch_loan_requirements()
    requirements_file = output_path / "loan_requirements.json"
    with open(requirements_file, "w") as f:
        json.dump(loan_requirements, f, indent=2)
    print(f"   ✓ Saved requirements for {len(loan_requirements)} products")
    
    print("\n✅ All loan data downloaded successfully!")
    print(f"📁 Files saved to: {output_path.absolute()}")
    
    return {
        "loan_products": loan_products,
        "loan_rates": loan_rates,
        "loan_terms": loan_terms,
        "loan_fees": loan_fees,
        "loan_requirements": loan_requirements
    }


async def load_reference_data_into_db(output_dir: str = "data"):
    """Load reference data from files into database (mock)"""
    output_path = Path(output_dir)
    
    print("📤 Loading reference data into storage...")
    
    all_data = []
    
    # Load exchange rates
    rates_file = output_path / "exchange_rates.json"
    if rates_file.exists():
        print("\n1️⃣  Processing exchange rates...")
        with open(rates_file) as f:
            rates_data = json.load(f)
        formatted = ReferenceDataLoader.format_for_storage(
            "exchange_rates",
            rates_data
        )
        all_data.extend(formatted)
        print(f"   ✓ Formatted {len(formatted)} exchange rate entries")
    
    # Load loan products
    products_file = output_path / "loan_products.json"
    if products_file.exists():
        print("\n2️⃣  Processing loan products...")
        with open(products_file) as f:
            products_data = json.load(f)
        formatted = ReferenceDataLoader.format_for_storage(
            "loan_products",
            products_data
        )
        all_data.extend(formatted)
        print(f"   ✓ Formatted {len(formatted)} loan product entries")
    
    # Load loan rates
    rates_file = output_path / "loan_rates.json"
    if rates_file.exists():
        print("\n3️⃣  Processing loan rates...")
        with open(rates_file) as f:
            rates_data = json.load(f)
        formatted = ReferenceDataLoader.format_for_storage(
            "loan_rates",
            rates_data
        )
        all_data.extend(formatted)
        print(f"   ✓ Formatted {len(formatted)} loan rate entries")
    
    # Load loan terms
    terms_file = output_path / "loan_terms.json"
    if terms_file.exists():
        print("\n4️⃣  Processing loan terms...")
        with open(terms_file) as f:
            terms_data = json.load(f)
        formatted = ReferenceDataLoader.format_for_storage(
            "loan_terms",
            terms_data
        )
        all_data.extend(formatted)
        print(f"   ✓ Formatted {len(formatted)} loan term entries")
    
    # Load loan fees
    fees_file = output_path / "loan_fees.json"
    if fees_file.exists():
        print("\n5️⃣  Processing loan fees...")
        with open(fees_file) as f:
            fees_data = json.load(f)
        formatted = ReferenceDataLoader.format_for_storage(
            "loan_fees",
            fees_data
        )
        all_data.extend(formatted)
        print(f"   ✓ Formatted {len(formatted)} loan fee entries")
    
    # Load loan requirements
    requirements_file = output_path / "loan_requirements.json"
    if requirements_file.exists():
        print("\n6️⃣  Processing loan requirements...")
        with open(requirements_file) as f:
            requirements_data = json.load(f)
        formatted = ReferenceDataLoader.format_for_storage(
            "loan_requirements",
            requirements_data
        )
        all_data.extend(formatted)
        print(f"   ✓ Formatted {len(formatted)} loan requirement entries")
    
    # Load risk categories
    categories_file = output_path / "risk_categories.json"
    if categories_file.exists():
        print("\n7️⃣  Processing risk categories...")
        with open(categories_file) as f:
            categories_data = json.load(f)
        formatted = ReferenceDataLoader.format_for_storage(
            "risk_categories",
            categories_data
        )
        all_data.extend(formatted)
        print(f"   ✓ Formatted {len(formatted)} risk category entries")
    
    print(f"\n✅ Total entries ready for storage: {len(all_data)}")
    
    # Save formatted data for reference
    formatted_file = output_path / "formatted_reference_data.json"
    with open(formatted_file, "w") as f:
        json.dump(all_data, f, indent=2)
    print(f"✓ Formatted data saved to {formatted_file}")
    
    return all_data


if __name__ == "__main__":
    command = sys.argv[1] if len(sys.argv) > 1 else "download"
    output_dir = sys.argv[2] if len(sys.argv) > 2 else "data"
    
    if command == "download":
        asyncio.run(download_reference_data(output_dir))
    elif command == "loan":
        asyncio.run(download_loan_data(output_dir))
    elif command == "load":
        asyncio.run(load_reference_data_into_db(output_dir))
    elif command == "all":
        asyncio.run(download_reference_data(output_dir))
        asyncio.run(download_loan_data(output_dir))
        asyncio.run(load_reference_data_into_db(output_dir))
    else:
        print(f"Unknown command: {command}")
        print("Available commands: download, loan, load, all")
