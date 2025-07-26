#!/bin/bash

# CORS Testing Script
# This script tests the CORS implementation

echo "CORS Testing Script"
echo "==================="
echo ""

# Test 1: Same-origin request (no Origin header)
echo "Test 1: Same-origin request (no Origin header)"
echo "Expected: Should succeed"
curl -i -X GET http://localhost:3000/api/employees \
  -H "Host: localhost:3000" \
  2>/dev/null | head -n 10
echo ""
echo "---"
echo ""

# Test 2: Same-origin request with matching Origin header
echo "Test 2: Same-origin request with matching Origin header"
echo "Expected: Should succeed with CORS headers"
curl -i -X GET http://localhost:3000/api/employees \
  -H "Host: localhost:3000" \
  -H "Origin: http://localhost:3000" \
  2>/dev/null | head -n 15
echo ""
echo "---"
echo ""

# Test 3: Cross-origin request from different domain
echo "Test 3: Cross-origin request from different domain"
echo "Expected: Should be blocked (403 Forbidden)"
curl -i -X GET http://localhost:3000/api/employees \
  -H "Host: localhost:3000" \
  -H "Origin: https://evil-site.com" \
  2>/dev/null | head -n 15
echo ""
echo "---"
echo ""

# Test 4: Preflight OPTIONS request from same origin
echo "Test 4: Preflight OPTIONS request from same origin"
echo "Expected: Should succeed with CORS headers"
curl -i -X OPTIONS http://localhost:3000/api/employees \
  -H "Host: localhost:3000" \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  2>/dev/null | head -n 15
echo ""
echo "---"
echo ""

# Test 5: Preflight OPTIONS request from different origin
echo "Test 5: Preflight OPTIONS request from different origin"
echo "Expected: Should be blocked (403 Forbidden)"
curl -i -X OPTIONS http://localhost:3000/api/employees \
  -H "Host: localhost:3000" \
  -H "Origin: https://evil-site.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  2>/dev/null | head -n 10
echo ""
echo "---"
echo ""

echo "Tests completed!"
echo ""
echo "To use this script:"
echo "1. Make sure your Next.js dev server is running: pnpm dev"
echo "2. Run this script: chmod +x test-cors.sh && ./test-cors.sh"