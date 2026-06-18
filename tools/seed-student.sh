#!/usr/bin/env bash
set -euo pipefail

API_BASE="${API_BASE:-http://localhost/api}"
ENDPOINT="${API_BASE%/}/students"
OPS_API_KEY="${OPS_API_KEY:-}"

FIRST_NAME="${FIRST_NAME:-Smoke}"
LAST_NAME="${LAST_NAME:-Tester}"
EMAIL="${EMAIL:-smoke.$(date +%s)@example.test}"
PHONE="${PHONE:-+15555550123}"
PROGRAM_CODE="${PROGRAM_CODE:-adults}"
START_DATE="${START_DATE:-$(date +%F)}"

read -r -d '' PAYLOAD <<JSON || true
{
  "first_name": "${FIRST_NAME}",
  "last_name": "${LAST_NAME}",
  "email": "${EMAIL}",
  "phone": "${PHONE}",
  "is_minor": false,
  "status": "active",
  "household_name": "${LAST_NAME} Household",
  "household_role": "adult",
  "program_code": "${PROGRAM_CODE}",
  "enrollment_status": "active",
  "start_date": "${START_DATE}"
}
JSON

echo "POST ${ENDPOINT}"
echo "Payload: ${PAYLOAD}"

curl_args=(
  -sS
  -o /tmp/seed-student-response.json
  -w "%{http_code}"
  -X POST "${ENDPOINT}"
  -H "Content-Type: application/json"
  --data "${PAYLOAD}"
)

if [[ -n "${OPS_API_KEY}" ]]; then
  curl_args+=(-H "X-Ops-Api-Key: ${OPS_API_KEY}")
fi

HTTP_CODE="$(curl "${curl_args[@]}")"

echo "HTTP ${HTTP_CODE}"
cat /tmp/seed-student-response.json
echo

if command -v jq >/dev/null 2>&1; then
  echo "Parsed response:"
  jq . /tmp/seed-student-response.json
fi
