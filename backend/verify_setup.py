#!/usr/bin/env python3
"""
PolyGrand Backend Setup Verification Script
Verifies that all required files and dependencies are in place
"""

import sys
import os
from pathlib import Path


def check_files():
    """Check that all required files exist"""
    print("📁 Checking required files...")

    required_files = {
        "Core Files": [
            "app.py",
            "config.py",
            "storage.py",
            "requirements.txt",
            ".env.example"
        ],
        "Models": [
            "models/__init__.py",
            "models/user.py",
            "models/market.py",
            "models/tournament.py",
            "models/trade.py",
            "models/stake.py"
        ],
        "Schemas": [
            "schemas/__init__.py",
            "schemas/market.py",
            "schemas/tournament.py",
            "schemas/stake.py"
        ],
        "Routes": [
            "routes/__init__.py",
            "routes/markets.py",
            "routes/tournaments.py",
            "routes/staking.py",
            "routes/ai.py"
        ],
        "Services": [
            "services/__init__.py",
            "services/algorand.py",
            "services/ai_service.py",
            "services/websocket.py"
        ]
    }

    missing_files = []
    total_files = 0

    for category, files in required_files.items():
        print(f"\n  {category}:")
        for file in files:
            total_files += 1
            if Path(file).exists():
                print(f"    ✅ {file}")
            else:
                print(f"    ❌ {file} - MISSING")
                missing_files.append(file)

    return missing_files, total_files


def check_python_version():
    """Check Python version"""
    print("\n🐍 Checking Python version...")
    version = sys.version_info

    if version.major == 3 and version.minor >= 12:
        print(f"  ✅ Python {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print(f"  ⚠️  Python {version.major}.{version.minor}.{version.micro} (3.12+ recommended)")
        return False


def check_imports():
    """Check if critical packages can be imported"""
    print("\n📦 Checking Python packages...")

    packages = [
        ("fastapi", "FastAPI"),
        ("uvicorn", "Uvicorn"),
        ("pydantic", "Pydantic"),
        ("algosdk", "Algorand SDK"),
        ("algokit_utils", "AlgoKit Utils"),
        ("dotenv", "Python-dotenv")
    ]

    missing_packages = []

    for package, name in packages:
        try:
            __import__(package)
            print(f"  ✅ {name}")
        except ImportError:
            print(f"  ❌ {name} - NOT INSTALLED")
            missing_packages.append(name)

    return missing_packages


def check_env_file():
    """Check if .env file exists"""
    print("\n⚙️  Checking environment configuration...")

    if Path(".env").exists():
        print("  ✅ .env file exists")
        return True
    else:
        print("  ⚠️  .env file not found")
        if Path(".env.example").exists():
            print("  💡 Run: cp .env.example .env")
        return False


def main():
    """Main verification function"""
    print("=" * 60)
    print("PolyGrand Backend - Setup Verification")
    print("=" * 60)

    # Check Python version
    python_ok = check_python_version()

    # Check files
    missing_files, total_files = check_files()

    # Check packages
    missing_packages = check_imports()

    # Check env
    env_ok = check_env_file()

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)

    if python_ok:
        print("✅ Python version: OK")
    else:
        print("⚠️  Python version: Upgrade recommended")

    if not missing_files:
        print(f"✅ All {total_files} required files present")
    else:
        print(f"❌ Missing {len(missing_files)} files:")
        for f in missing_files:
            print(f"   - {f}")

    if not missing_packages:
        print("✅ All required packages installed")
    else:
        print(f"❌ Missing {len(missing_packages)} packages:")
        for p in missing_packages:
            print(f"   - {p}")
        print("\n💡 Run: pip install -r requirements.txt")

    if env_ok:
        print("✅ Environment file configured")
    else:
        print("⚠️  Environment file needs setup")

    print("\n" + "=" * 60)

    if not missing_files and not missing_packages:
        print("🎉 READY TO RUN!")
        print("\nStart the server with:")
        print("  ./run.sh (macOS/Linux)")
        print("  run.bat (Windows)")
        print("  python app.py")
        print("\nThen visit: http://localhost:8000/docs")
    else:
        print("⚠️  SETUP INCOMPLETE")
        print("\nPlease address the issues above, then run this script again.")
        sys.exit(1)

    print("=" * 60)


if __name__ == "__main__":
    main()
