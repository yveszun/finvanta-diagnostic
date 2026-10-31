#!/bin/bash

# Production Verification Script for GitHub Pages Deployment
# Tests all critical paths and data loading for the deployed Finvanta Diagnostic

set -e

BASE_URL="https://yveszun.github.io/finvanta-diagnostic"
ERRORS=0

echo "=== Finvanta Diagnostic Production Verification ==="
echo "Testing: $BASE_URL"
echo ""

# Test 1: Main page loads
echo "[1/10] Testing main page..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Main page loads (HTTP 200)"
else
    echo "❌ Main page failed (HTTP $HTTP_CODE)"
    ((ERRORS++))
fi

# Test 2: JavaScript bundle loads
echo "[2/10] Testing JavaScript bundle..."
BUNDLE=$(curl -s "$BASE_URL/" | grep -o 'assets/index-[^"]*\.js' | head -1)
if [ -n "$BUNDLE" ]; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/$BUNDLE")
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ JavaScript bundle loads: $BUNDLE"
    else
        echo "❌ JavaScript bundle failed (HTTP $HTTP_CODE)"
        ((ERRORS++))
    fi
else
    echo "❌ JavaScript bundle not found in HTML"
    ((ERRORS++))
fi

# Test 3-5: Analytics data files
echo "[3/10] Testing low scenario data..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/outputs/phase3_analytics/low_bottleneck_mix_analytics.json")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Low scenario data accessible"
else
    echo "❌ Low scenario data failed (HTTP $HTTP_CODE)"
    ((ERRORS++))
fi

echo "[4/10] Testing moderate scenario data..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/outputs/phase3_analytics/moderate_bottleneck_mix_analytics.json")
if [ "$HTTP_CODE" = "200" ]; then
    # Validate JSON structure
    JSON_VALID=$(curl -s "$BASE_URL/outputs/phase3_analytics/moderate_bottleneck_mix_analytics.json" | jq '.analytics.facilityParticipationCascade' 2>/dev/null)
    if [ -n "$JSON_VALID" ] && [ "$JSON_VALID" != "null" ]; then
        echo "✅ Moderate scenario data accessible and valid"
    else
        echo "❌ Moderate scenario JSON invalid"
        ((ERRORS++))
    fi
else
    echo "❌ Moderate scenario data failed (HTTP $HTTP_CODE)"
    ((ERRORS++))
fi

echo "[5/10] Testing high scenario data..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/outputs/phase3_analytics/high_bottleneck_mix_analytics.json")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ High scenario data accessible"
else
    echo "❌ High scenario data failed (HTTP $HTTP_CODE)"
    ((ERRORS++))
fi

# Test 6: Config file
echo "[6/10] Testing recommendation rules..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/config/recommendationRules.json")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Recommendation rules accessible"
else
    echo "❌ Recommendation rules failed (HTTP $HTTP_CODE)"
    ((ERRORS++))
fi

# Test 7: Favicon
echo "[7/10] Testing favicon..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/favicon.svg")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Favicon loads"
else
    echo "❌ Favicon failed (HTTP $HTTP_CODE)"
    ((ERRORS++))
fi

# Test 8: Page title
echo "[8/10] Testing page title..."
TITLE=$(curl -s "$BASE_URL/" | grep -o '<title>[^<]*</title>' | sed 's/<[^>]*>//g')
if echo "$TITLE" | grep -q "Prototype"; then
    echo "✅ Page title indicates prototype: $TITLE"
else
    echo "❌ Page title missing prototype indicator"
    ((ERRORS++))
fi

# Test 9: Base path in HTML
echo "[9/10] Testing base path configuration..."
if curl -s "$BASE_URL/" | grep -q "/finvanta-diagnostic/assets"; then
    echo "✅ Base path correctly configured in HTML"
else
    echo "❌ Base path not found in HTML"
    ((ERRORS++))
fi

# Test 10: Bundle contains correct paths
echo "[10/10] Testing bundle paths..."
if [ -n "$BUNDLE" ]; then
    if curl -s "$BASE_URL/$BUNDLE" | grep -q "/finvanta-diagnostic/outputs"; then
        echo "✅ Bundle contains correct data paths"
    else
        echo "❌ Bundle missing correct paths"
        ((ERRORS++))
    fi
fi

echo ""
echo "=== Verification Complete ==="
if [ $ERRORS -eq 0 ]; then
    echo "✅ All checks passed! Site is operational."
    exit 0
else
    echo "❌ $ERRORS check(s) failed. See errors above."
    exit 1
fi
