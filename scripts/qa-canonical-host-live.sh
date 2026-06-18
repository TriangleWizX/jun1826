#!/usr/bin/env bash
set -euo pipefail

ROOT_EXPECTED="https://senseisandy.com/"
USER_AGENT="${QA_CANONICAL_UA:-SenseiSandyCanonicalQA/1.0}"

check_single_hop() {
  local url="$1"
  local expected_effective="$2"

  local result effective redirects
  result="$(curl -A "$USER_AGENT" -Ls -o /dev/null -w '%{url_effective} %{num_redirects}' --max-time 20 --connect-timeout 10 "$url")"
  effective="${result% *}"
  redirects="${result##* }"

  if [[ "$effective" != "$expected_effective" ]]; then
    echo "FAIL: $url resolved to $effective (expected $expected_effective)"
    return 1
  fi
  if [[ "$redirects" != "1" ]]; then
    echo "FAIL: $url used $redirects redirects (expected 1)"
    return 1
  fi
  echo "PASS: $url -> $effective ($redirects redirect)"
}

check_canonical_root() {
  local url="$1"
  local status
  status="$(curl -A "$USER_AGENT" -sS -o /dev/null -w '%{http_code}' --max-time 20 --connect-timeout 10 "$url")"
  if [[ "$status" == 3* ]]; then
    echo "FAIL: $url returned $status (expected non-3xx)"
    return 1
  fi
  echo "PASS: $url returned $status (non-3xx)"
}

echo "Running live canonical host checks..."
check_single_hop "http://senseisandy.com/" "$ROOT_EXPECTED"
check_single_hop "http://www.senseisandy.com/" "$ROOT_EXPECTED"
check_single_hop "https://www.senseisandy.com/" "$ROOT_EXPECTED"
check_canonical_root "$ROOT_EXPECTED"
echo "All canonical host checks passed."
