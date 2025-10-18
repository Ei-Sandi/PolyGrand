#!/usr/bin/env python3
"""
Setup verification and test account generator for PolyGrand
Run this to verify your AlgoKit setup and generate test accounts
"""

import sys

def check_imports():
    """Verify all required packages are installed"""
    print("🔍 Checking installed packages...\n")
    
    packages = {
        'pyteal': 'PyTeal',
        'algosdk': 'Algorand SDK',
        'algokit_utils': 'AlgoKit Utils',
        'dotenv': 'python-dotenv'
    }
    
    all_ok = True
    for module, name in packages.items():
        try:
            __import__(module)
            print(f"  ✓ {name}")
        except ImportError:
            print(f"  ✗ {name} - NOT INSTALLED")
            all_ok = False
    
    return all_ok

def generate_account():
    """Generate a new Algorand account"""
    from algosdk import account, mnemonic
    
    print("\n🔑 Generating new Algorand account...\n")
    
    private_key, address = account.generate_account()
    mn = mnemonic.from_private_key(private_key)
    
    print(f"Address: {address}")
    print(f"\nMnemonic (25 words - SAVE THIS SECURELY!):")
    print(f"{mn}")
    print(f"\nPrivate Key (for .env file):")
    print(f"{private_key}")
    
    print("\n" + "="*70)
    print("⚠️  IMPORTANT: Save these credentials securely!")
    print("⚠️  Never share your private key or mnemonic!")
    print("⚠️  For TestNet, fund this address at:")
    print("    https://bank.testnet.algorand.network/")
    print("="*70)
    
    return address, private_key

def check_env_file():
    """Check if .env file exists"""
    import os
    
    print("\n📄 Checking environment configuration...\n")
    
    if os.path.exists('.env'):
        print("  ✓ .env file exists")
        
        # Try to load and check for required keys
        from dotenv import load_dotenv
        load_dotenv()
        
        required_vars = ['CREATOR_ADDRESS', 'CREATOR_PRIVATE_KEY', 'ALGOD_ADDRESS']
        missing = []
        
        for var in required_vars:
            value = os.getenv(var)
            if not value or value.startswith('YOUR_'):
                missing.append(var)
                print(f"  ⚠ {var} - needs to be set")
            else:
                # Show partial value for verification
                display_value = value[:10] + "..." if len(value) > 10 else value
                print(f"  ✓ {var} - configured")
        
        if missing:
            print(f"\n  ℹ️  Update these values in your .env file")
            return False
        return True
    else:
        print("  ✗ .env file not found")
        print("  ℹ️  Run: cp .env.example .env")
        return False

def test_algod_connection():
    """Test connection to Algod node"""
    import os
    from algosdk.v2client import algod
    from dotenv import load_dotenv
    
    load_dotenv()
    
    print("\n🌐 Testing Algod connection...\n")
    
    algod_address = os.getenv('ALGOD_ADDRESS', 'https://testnet-api.algonode.cloud')
    algod_token = os.getenv('ALGOD_TOKEN', '')
    
    try:
        client = algod.AlgodClient(algod_token, algod_address)
        status = client.status()
        
        print(f"  ✓ Connected to Algod")
        print(f"  Network: {algod_address}")
        print(f"  Last Round: {status.get('last-round', 'unknown')}")
        
        # Try to get genesis
        genesis = client.versions()
        print(f"  Genesis ID: {genesis.get('genesis_id', 'unknown')}")
        
        return True
    except Exception as e:
        print(f"  ✗ Connection failed: {e}")
        return False

def check_compiled_contracts():
    """Check if TEAL files exist"""
    import os
    
    print("\n📜 Checking compiled contracts...\n")
    
    files = ['market_approval.teal', 'market_clear.teal']
    all_exist = True
    
    for file in files:
        if os.path.exists(file):
            size = os.path.getsize(file)
            print(f"  ✓ {file} ({size} bytes)")
        else:
            print(f"  ✗ {file} - not found")
            all_exist = False
    
    if not all_exist:
        print("\n  ℹ️  Compile contracts with:")
        print("     .venv/bin/python contracts/market_contract.py")
    
    return all_exist

def main():
    """Main setup verification"""
    print("="*70)
    print("  PolyGrand - AlgoKit Setup Verification")
    print("="*70)
    
    # Check imports
    if not check_imports():
        print("\n❌ Some packages are missing. Install with:")
        print("   .venv/bin/pip install pyteal py-algorand-sdk algokit-utils python-dotenv")
        sys.exit(1)
    
    # Check compiled contracts
    check_compiled_contracts()
    
    # Check env file
    env_ok = check_env_file()
    
    # Test connection if env is configured
    if env_ok:
        test_algod_connection()
    
    print("\n" + "="*70)
    
    # Offer to generate account
    if not env_ok:
        response = input("\n🔑 Would you like to generate a test account? (y/n): ")
        if response.lower() in ['y', 'yes']:
            generate_account()
            print("\n💡 Next steps:")
            print("   1. Copy the address and private key to your .env file")
            print("   2. Fund the address using the TestNet dispenser")
            print("   3. Run this script again to verify the setup")
        else:
            print("\n💡 To generate an account later, run:")
            print("   .venv/bin/python scripts/setup_verify.py")
    else:
        print("\n✅ Setup looks good! You're ready to deploy.")
        print("\n💡 Next steps:")
        print("   1. Deploy your contract: .venv/bin/python contracts/deplo.py")
        print("   2. Start the backend: cd backend && npm start")
        print("   3. Build your frontend!")
    
    print("="*70 + "\n")

if __name__ == "__main__":
    main()
