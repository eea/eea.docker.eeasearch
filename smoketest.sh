#!/bin/bash

set -e

COMPOSEFILE="./test/docker-compose-smoketest.yml"

rm -f index.html
printf "%-50s" "--> [TEST] Image build..."
docker-compose -f $COMPOSEFILE build &> /dev/null
echo "[OK]"

printf "%-50s" "--> [TEST] Image start..."
docker-compose -f $COMPOSEFILE up -d &> /dev/null
echo "[OK]"

# Test app responds with correct title on port 3000
printf "%-50s" "--> [TEST] HTTP server responds..."
sleep 1
wget -q localhost:3000
grep -q "<title>EEA Advanced search &mdash; Global catalogue</title>" index.html
echo "[OK]"
rm index.html

printf "%-50s" "--> [TEST] Cleanup..."
docker-compose -f $COMPOSEFILE stop &> /dev/null
docker-compose -f $COMPOSEFILE rm --force &>/dev/null
echo "[OK]"

echo "--> [TEST] All tests passed!"
