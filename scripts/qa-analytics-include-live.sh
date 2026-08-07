#!/usr/bin/env bash
set -euo pipefail

urls=(
  "https://senseisandy.com/"
  "https://senseisandy.com/options-pricing"
  "https://senseisandy.com/bjj-classes/adults-tannersville-ny"
)
measurement_id="G-03GTSG5ECF"
error_token='[an error occurred while processing this directive]'

for url in "${urls[@]}"; do
  html="$(curl -fsSL --max-time 30 "$url")"
  if [[ "$html" == *"$error_token"* ]]; then
    echo "FAIL: $url contains an SSI processing error" >&2
    exit 1
  fi
  if [[ "$html" != *"$measurement_id"* ]]; then
    echo "FAIL: $url is missing GA4 measurement ID $measurement_id" >&2
    exit 1
  fi
  echo "PASS: $url includes GA4 bootstrap and no SSI error"
done
