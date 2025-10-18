#!/usr/bin/env python3
"""
Quick deployment script for PolyGrand prediction market
Checks account balance before deploying
"""

import os
import sys
from dotenv import load_dotenv
from algosdk.v2client import algod

def check_account_balance():
    """Check if the creator account has sufficient balance"""
    load_dotenv()
    
    creator_address = os.getenv('CREATOR_ADDRESS')
    algod_address = os.getenv('ALGOD_ADDRESS', 'https://testnet-api.algonode.cloud')
    algod_token = os.getenv('ALGOD_TOKEN', '')
    
    if not creator_address or creator_address.startswith('YOUR_'):
        print("❌ CREATOR_ADDRESS not configured in .env file")
        sys.exit(1)
    
    print(f"🔍 Checking balance for: {creator_address}\n")
    
    try:
        client = algod.AlgodClient(algod_token, algod_address)
        account_info = client.account_info(creator_address)
        
        balance = account_info.get('amount', 0)
        balance_algo = balance / 1_000_000  # Convert microAlgos to ALGO
        
        print(f"💰 Balance: {balance_algo:.6f} ALGO ({balance} microAlgos)")
        
        # Check minimum balance (need at least ~0.5 ALGO for deployment)
        min_balance = account_info.get('min-balance', 0) / 1_000_000
        available = balance_algo - min_balance
        
        print(f"📊 Min Balance: {min_balance:.6f} ALGO")
        print(f"✅ Available: {available:.6f} ALGO\n")
        
        if balance_algo < 1.0:
            print("⚠️  WARNING: Balance is low!")
            print("⚠️  You need at least 1 ALGO to deploy contracts and create ASAs")
            print("\n🔗 Fund your account at: https://bank.testnet.algorand.network/")
            print(f"📋 Address: {creator_address}\n")
            
            response = input("Continue anyway? (y/n): ")
            if response.lower() not in ['y', 'yes']:
                print("❌ Deployment cancelled")
                sys.exit(1)
        
        return True
        
    except Exception as e:
        print(f"❌ Error checking account: {e}")
        print("\n💡 Make sure:")
        print("   1. Your .env file is configured")
        print("   2. You're connected to the internet")
        print("   3. The ALGOD_ADDRESS is correct")
        return False

def run_deployment():
    """Run the deployment script"""
    print("="*70)
    print("  PolyGrand - Deploying Prediction Market Contract")
    print("="*70 + "\n")
    
    # Check balance first
    if not check_account_balance():
        sys.exit(1)
    
    print("🚀 Starting deployment...\n")
    print("="*70 + "\n")
    
    # Import and run the deployment
    try:
        # Change to the correct directory
        script_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(script_dir)
        os.chdir(project_root)
        
        # Import and run deploy function
        sys.path.insert(0, os.path.join(project_root, 'contracts'))
        from deploy import deploy_contract  # type: ignore  # noqa: E402 - dynamic import
        
        app_id, asa_a, asa_b = deploy_contract()
        
        if app_id:
            print("\n" + "="*70)
            print("🎉 DEPLOYMENT SUCCESSFUL!")
            print("="*70)
            print(f"\n📝 Save these IDs:\n")
            print(f"   App ID: {app_id}")
            print(f"   Outcome A ASA: {asa_a}")
            print(f"   Outcome B ASA: {asa_b}")
            print("\n💡 Update your .env file with these values:")
            print(f"   APP_ID={app_id}")
            print(f"   OUTCOME_A_ASA_ID={asa_a}")
            print(f"   OUTCOME_B_ASA_ID={asa_b}")
            print("="*70 + "\n")
        else:
            print("\n❌ Deployment failed - check the errors above")
            sys.exit(1)
            
    except Exception as e:
        print(f"\n❌ Deployment error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    run_deployment()
