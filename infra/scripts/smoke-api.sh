#!/usr/bin/env bash
# ----------------------------------------------------------------------------
# Smoke test untuk enmarket API + Web.
# Verifikasi endpoint kritikal hidup, mengembalikan shape yang diharapkan,
# auth gate jalan, dan rate limiting aktif.
#
# Usage:
#   bash infra/scripts/smoke-api.sh
#   API_BASE=http://api.example.com bash infra/scripts/smoke-api.sh
#
# Exit code: 0 = semua pass, 1 = ada minimal 1 fail.
# ----------------------------------------------------------------------------

set -u

API_BASE="${API_BASE:-http://localhost:8000}"
WEB_BASE="${WEB_BASE:-http://localhost:3000}"
ADMIN_TOK="${ADMIN_TOK:-dev-admin-token-12345}"
H_ADMIN="Authorization: Bearer ${ADMIN_TOK}"

PASS=0
FAIL=0

# ───── Helpers ─────

c() { printf "\033[1;36m%s\033[0m\n" "$*"; }
g() { printf "\033[1;32m✓ %s\033[0m\n" "$*"; PASS=$((PASS+1)); }
r() { printf "\033[1;31m✗ %s\033[0m\n" "$*"; FAIL=$((FAIL+1)); }

check() {
  local label="$1"
  local expected="$2"
  local actual="$3"
  if [ "$expected" = "$actual" ]; then
    g "${label}  (${actual})"
  else
    r "${label}  expected=${expected}, got=${actual}"
  fi
}

http_status() {
  curl -s -o /dev/null -w "%{http_code}" "$@"
}

http_json() {
  curl -s "$@" | python3 -c 'import sys,json,re; raw=sys.stdin.read();
try:
    d=json.loads(raw); k=re.split(r"[\[\]\.]+", "'"$1"'".strip("."));
    for x in k:
        if x.isdigit(): d=d[int(x)]
        elif x: d=d.get(x)
    print(d)
except Exception: print("")' 2>/dev/null
}

# ───── 1. Backend health ─────

c "── 1. Backend health ──"
CODE=$(http_status "$API_BASE/api/health")
check "GET /api/health → 200" "200" "$CODE"

CODE=$(http_status "$API_BASE/api/health" -X POST)
check "POST /api/health → 405" "405" "$CODE"

# ───── 2. Public catalog ─────

c ""
c "── 2. Public catalog ──"
CODE=$(http_status "$API_BASE/api/public/products")
check "GET /api/public/products → 200" "200" "$CODE"

CODE=$(http_status "$API_BASE/api/public/products/latest")
check "GET /api/public/products/latest → 200" "200" "$CODE"

CODE=$(http_status "$API_BASE/api/public/products/featured")
check "GET /api/public/products/featured → 200" "200" "$CODE"

CODE=$(http_status "$API_BASE/api/public/categories")
check "GET /api/public/categories → 200" "200" "$CODE"

# ───── 3. Auth gate ─────

c ""
c "── 3. Auth gate ──"
CODE=$(http_status "$API_BASE/api/admin/orders")
check "GET /api/admin/orders tanpa token → 401" "401" "$CODE"

CODE=$(http_status -H "$H_ADMIN" "$API_BASE/api/admin/orders")
check "GET /api/admin/orders dengan token → 200" "200" "$CODE"

CODE=$(http_status -H "$H_ADMIN" "$API_BASE/api/admin/orders/stats")
check "GET /api/admin/orders/stats → 200" "200" "$CODE"

CODE=$(http_status -H "$H_ADMIN" "$API_BASE/api/admin/license-keys")
check "GET /api/admin/license-keys → 200" "200" "$CODE"

# ───── 4. Cart endpoints ─────

c ""
c "── 4. Cart (unauthenticated, anonymous session) ──"
COOKIE="cart_session=smoke-test-$(date +%s)"
CODE=$(http_status -H "Cookie: $COOKIE" "$API_BASE/api/cart")
check "GET /api/cart → 200" "200" "$CODE"

# ───── 5. Rate limiting ─────

c ""
c "── 5. Rate limiting ──"
# Cart throttled 60/menit — pastikan 60 OK
CODE=$(http_status -H "Cookie: $COOKIE" "$API_BASE/api/cart")
check "GET /api/cart (warm-up) → 200" "200" "$CODE"

# Checkout throttled 5/menit — 6th request harus 429
GOT_429=0
for i in 1 2 3 4 5 6; do
  CODE=$(http_status -X POST -H "Cookie: $COOKIE" -H "Content-Type: application/json" \
    -d '{"nama":"x","email":"x@x.com","wa":"08123"}' \
    "$API_BASE/api/checkout")
  if [ "$CODE" = "429" ]; then
    GOT_429=1
    break
  fi
done
if [ "$GOT_429" = "1" ]; then
  g "Checkout throttle 6× rapid → 429 muncul"
else
  r "Checkout throttle 6× rapid → 429 TIDAK muncul"
fi

# Download throttled per-token — 31x token invalid, last must 429
TOK="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
GOT_DL_429=0
for i in $(seq 1 31); do
  CODE=$(http_status "$API_BASE/api/download/$TOK")
  if [ "$CODE" = "429" ]; then
    GOT_DL_429=1
    break
  fi
done
if [ "$GOT_DL_429" = "1" ]; then
  g "Download throttle per token → 429 muncul"
else
  r "Download throttle per token → 429 TIDAK muncul"
fi

# ───── 6. Web pages render ─────

c ""
c "── 6. Web pages ──"
for path in / /katalog /login; do
  CODE=$(http_status "$WEB_BASE$path")
  check "GET $path → 200" "200" "$CODE"
done

# Admin pages — butuh cookie auth
for path in /admin /admin/orders /admin/license-keys; do
  CODE=$(http_status -H "Cookie: admin_token=$ADMIN_TOK" "$WEB_BASE$path")
  check "GET $path (authed) → 200" "200" "$CODE"
done

# ───── 7. Error pages ─────

c ""
c "── 7. Error/404 pages ──"
CODE=$(http_status "$WEB_BASE/totally-missing-route-here")
check "GET /totally-missing → 404" "404" "$CODE"

CODE=$(http_status -H "Cookie: admin_token=$ADMIN_TOK" "$WEB_BASE/admin/products/999999")
if [ "$CODE" = "200" ] || [ "$CODE" = "404" ]; then
  g "GET /admin/products/999999 (authed, missing) → $CODE (expected — 200 with notFound UI or 404)"
else
  r "GET /admin/products/999999 unexpected: $CODE"
fi

# ───── 8. Tripay callback signature ─────

c ""
c "── 8. Tripay callback signature ──"
CODE=$(http_status -X POST -H "Content-Type: application/json" \
  -H "X-Callback-Signature: invalid" \
  -d '{"reference":"SMOKE","status":"PAID"}' \
  "$API_BASE/api/tripay/callback")
if [ "$CODE" = "403" ] || [ "$CODE" = "404" ]; then
  g "Callback dengan signature invalid → $CODE (403 or 404 accepted)"
else
  r "Callback dengan signature invalid unexpected: $CODE"
fi

# ───── Summary ─────

c ""
TOTAL=$((PASS + FAIL))
echo "── Summary ──"
echo "  Pass: $PASS / $TOTAL"
echo "  Fail: $FAIL / $TOTAL"
echo ""

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
echo "✓ Smoke test passed."
exit 0