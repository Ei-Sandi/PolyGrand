# PolyGrand - Quick Reference

## 🎉 AlgoKit is Set Up and Ready!

Your development environment is fully configured. See `SETUP_COMPLETE.md` for full details.

## ⚡ Quick Commands

### Check Setup Status
```bash
.venv/bin/python scripts/setup_verify.py
```

### Fund Your Test Account (REQUIRED BEFORE DEPLOYING!)
1. Visit: https://bank.testnet.algorand.network/
2. Paste address: `BI7LAQSNRIVBJ3WEMTSSDK3URZ6GSNDRVMV3PYT3FEJRIAQDTLLX643DWI`
3. Request test ALGO

### Deploy Contract (after funding account)
```bash
.venv/bin/python scripts/deploy_quick.py
```
or
```bash
.venv/bin/python contracts/deplo.py
```

### Compile Contracts (after editing)
```bash
.venv/bin/python contracts/market_contract.py
```

### Start Backend
```bash
cd backend
npm install
npm start
```

## 📁 New Files Created

- ✅ `.env` - Your configuration (test account included)
- ✅ `.env.example` - Template for others
- ✅ `ALGOKIT_SETUP.md` - Complete setup guide
- ✅ `SETUP_COMPLETE.md` - Setup summary and next steps
- ✅ `scripts/setup_verify.py` - Verify your setup
- ✅ `scripts/deploy_quick.py` - Deploy with balance check
- ✅ `market_approval.teal` - Compiled contract (1,660 bytes)
- ✅ `market_clear.teal` - Compiled clear state (30 bytes)

## 🔐 Security

**NEVER commit `.env` to git!** It contains your private keys.
(Already protected by `.gitignore`)

## 📚 Documentation

- Quick Reference: `QUICK_START.md` (this file)
- Setup Summary: `SETUP_COMPLETE.md`
- Detailed Guide: `ALGOKIT_SETUP.md`
- Original README: `README.md`

## 🆘 Need Help?

Run the verification script:
```bash
.venv/bin/python scripts/setup_verify.py
```

Check the documentation:
- AlgoKit: https://github.com/algorandfoundation/algokit-cli
- Algorand: https://developer.algorand.org/
- PyTeal: https://pyteal.readthedocs.io/

---

**Ready to deploy? Fund your account and run: `.venv/bin/python scripts/deploy_quick.py`** 🚀
