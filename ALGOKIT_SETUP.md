# AlgoKit Setup Guide for PolyGrand

This guide will help you complete the AlgoKit setup for your PolyGrand prediction market project.

## ✅ What's Already Done

1. **Python Virtual Environment**: Created at `.venv/` (Python 3.13.3)
2. **Python Packages Installed**:
   - `pyteal` - For writing Algorand smart contracts in Python
   - `py-algorand-sdk` - Official Algorand Python SDK
   - `algokit-utils` - AlgoKit utility library
   - `python-dotenv` - For loading environment variables
3. **Smart Contract Compiled**: Your `market_contract.py` has been compiled to:
   - `market_approval.teal` (142 lines)
   - `market_clear.teal` (2 lines)
4. **Environment Template**: `.env.example` created with all necessary configuration placeholders

## 🔧 What You Need to Do

### 1. Install AlgoKit CLI (Optional but Recommended)

The AlgoKit CLI provides helpful commands for managing LocalNet, generating accounts, and more.

**Option A: Install with pipx (Recommended)**
```bash
# Install pipx if you don't have it
sudo apt update && sudo apt install -y pipx

# Ensure pipx is in your PATH
pipx ensurepath

# Install AlgoKit
pipx install algokit

# Verify installation
algokit --version
```

**Option B: Install with snap**
```bash
sudo snap install algokit
```

### 2. Create Your Environment File

Copy the example file and fill in your credentials:

```bash
cp .env.example .env
```

Then edit `.env` with your actual values. **Never commit this file to git** (it's already in `.gitignore`).

### 3. Generate Test Accounts (if using TestNet or LocalNet)

**If AlgoKit is installed:**
```bash
# Generate a new Algorand account
algokit generate account

# This will output an address and mnemonic phrase
# You can convert the mnemonic to a private key for .env
```

**Or use Python:**
```bash
.venv/bin/python -c "from algosdk import account, mnemonic; sk, addr = account.generate_account(); print(f'Address: {addr}'); print(f'Mnemonic: {mnemonic.from_private_key(sk)}'); print(f'Private Key: {sk}')"
```

Copy the address and private key to your `.env` file.

### 4. Fund Your Test Account

**For TestNet:**
- Visit the [Algorand TestNet Dispenser](https://bank.testnet.algorand.network/)
- Paste your `CREATOR_ADDRESS`
- Request funds (you'll get test ALGO)

**For LocalNet:**
```bash
# Start LocalNet (if AlgoKit CLI is installed)
algokit localnet start

# LocalNet comes with pre-funded accounts
# Use the default LocalNet account or generate a new one
```

## 🚀 Running Your Project

### Compile Smart Contracts

```bash
# Activate the virtual environment and compile
.venv/bin/python contracts/market_contract.py
```

This generates:
- `market_approval.teal`
- `market_clear.teal`

### Deploy to TestNet

```bash
# Make sure your .env file is configured with:
# - CREATOR_ADDRESS
# - CREATOR_PRIVATE_KEY
# - ALGOD_ADDRESS (default: https://testnet-api.algonode.cloud)

# Run the deployment script
.venv/bin/python contracts/deplo.py
```

This will:
1. Create two ASAs (Outcome A and Outcome B tokens)
2. Deploy your prediction market smart contract
3. Output the App ID and ASA IDs (save these!)

### Start the Backend

```bash
cd backend
npm install
npm start
```

Backend runs on http://localhost:3000

## 📝 Useful Commands

### Python (always use the venv)

```bash
# Run any Python script
.venv/bin/python your_script.py

# Install additional packages
.venv/bin/pip install package-name

# Python REPL
.venv/bin/python
```

### AlgoKit (if installed)

```bash
# Start LocalNet (local Algorand sandbox)
algokit localnet start

# Stop LocalNet
algokit localnet stop

# Reset LocalNet
algokit localnet reset

# Generate account
algokit generate account

# Check status
algokit localnet status
```

### Contract Development Workflow

```bash
# 1. Edit your contract
# contracts/market_contract.py

# 2. Compile to TEAL
.venv/bin/python contracts/market_contract.py

# 3. Deploy to network
.venv/bin/python contracts/deplo.py

# 4. Test interactions (you'll need to write these)
.venv/bin/python scripts/test_contract.py
```

## 🔍 Project Structure

```
PolyGrand/
├── .venv/                    # Python virtual environment (✓ created)
├── contracts/
│   ├── market_contract.py    # Main prediction market contract (✓ working)
│   ├── deplo.py             # Deployment script (✓ ready)
│   └── ...
├── backend/
│   ├── index.js             # Express API
│   └── package.json
├── .env.example             # Template (✓ created)
├── .env                     # Your secrets (you need to create)
├── market_approval.teal     # Compiled contract (✓ generated)
└── market_clear.teal        # Compiled clear program (✓ generated)
```

## ⚠️ Important Notes

1. **Never commit `.env`** - It contains your private keys
2. **Use TestNet for development** - Don't use MainNet until thoroughly tested
3. **Keep private keys secure** - Consider using hardware wallets for production
4. **Test thoroughly** - Use LocalNet or TestNet before MainNet deployment

## 🐛 Troubleshooting

### "Module not found" errors
Make sure you're using the venv Python:
```bash
.venv/bin/python script.py  # ✓ Correct
python script.py            # ✗ Wrong
```

### AlgoKit commands not found
Make sure pipx path is in your shell:
```bash
pipx ensurepath
source ~/.bashrc  # or ~/.zshrc
```

### Deployment fails
- Check your `.env` has correct `CREATOR_ADDRESS` and `CREATOR_PRIVATE_KEY`
- Ensure your account has funds (use TestNet dispenser)
- Verify `ALGOD_ADDRESS` is correct for your network

## 📚 Next Steps

1. Complete the `.env` configuration
2. Deploy your contract to TestNet
3. Extend the backend API to interact with the deployed contract
4. Build the frontend to create a UI for your prediction market
5. Add tests for your smart contract logic

## 🆘 Need Help?

- [AlgoKit Documentation](https://github.com/algorandfoundation/algokit-cli)
- [Algorand Developer Portal](https://developer.algorand.org/)
- [PyTeal Documentation](https://pyteal.readthedocs.io/)
- [Algorand SDK Documentation](https://py-algorand-sdk.readthedocs.io/)
