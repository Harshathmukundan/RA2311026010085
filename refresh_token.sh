#!/bin/bash
RESPONSE=$(curl -s -X POST http://20.207.122.201/evaluation-service/auth \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rs5485@srmist.edu",
    "name": "harshath mukundan",
    "rollNo": "ra2311026010085",
    "accessCode": "QkbpxH",
    "clientID": "a188c731-2b3c-4ab3-ab03-396a21e437fd",
    "clientSecret": "QpnXCYbauKvWJZuV"
  }')
TOKEN=$(echo $RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
sed -i '' "s|export const TOKEN =.*|export const TOKEN = \"$TOKEN\";|" /Users/harshath/Downloads/RA2311026010085/stage2/lib/api.ts
echo "Token updated!"
