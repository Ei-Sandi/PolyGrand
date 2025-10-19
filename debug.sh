#!/bin/bash
# Debug script to check what's happening

echo "=== Checking if services are running ==="
echo ""

echo "1. Backend (port 8000):"
curl -s http://localhost:8000/health | python3 -m json.tool || echo "Backend not responding"
echo ""

echo "2. Frontend (port 3000):"
curl -s -I http://localhost:3000 | head -5
echo ""

echo "3. API Markets endpoint:"
curl -s http://localhost:8000/api/v1/markets/ | python3 -m json.tool | head -20
echo ""

echo "4. API Stats endpoint:"
curl -s http://localhost:8000/api/v1/stats/platform | python3 -m json.tool
echo ""

echo "=== Open browser console and check for errors ==="
echo "Visit: http://localhost:3000"
echo "Press F12 to open developer console"
echo "Look for any red errors in the Console tab"
