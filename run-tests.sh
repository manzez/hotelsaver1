#!/bin/bash
# Test Runner Script for HotelSaver

echo "🚀 HotelSaver Test Suite Runner"
echo "================================"

# Check if server is running
echo "📡 Checking if development server is running..."
if ! curl -s http://localhost:3001 > /dev/null; then
    echo "❌ Development server not running. Please start with: npm run dev"
    exit 1
fi

echo "✅ Development server is running"

# Install test dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing test dependencies..."
    npm install @cucumber/cucumber @playwright/test ts-node typescript cross-env concurrently
fi

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
npx playwright install

# Run tests based on argument
case "$1" in
    "search")
        echo "🔍 Running hotel search tests..."
        npx cucumber-js tests/features/hotel-search.feature --require-module ts-node/register --require tests/step-definitions/*.ts
        ;;
    "negotiation")
        echo "💰 Running negotiation pricing tests..."
        npx cucumber-js tests/features/negotiation-pricing.feature --require-module ts-node/register --require tests/step-definitions/*.ts
        ;;
    "booking")
        echo "📋 Running booking process tests..."
        npx cucumber-js tests/features/booking-process.feature --require-module ts-node/register --require tests/step-definitions/*.ts
        ;;
    "services")
        echo "🛎️ Running services booking tests..."
        npx cucumber-js tests/features/services-booking.feature --require-module ts-node/register --require tests/step-definitions/*.ts
        ;;
    "taxi")
        echo "🚖 Running taxi booking tests..."
        npx cucumber-js tests/features/taxi-booking.feature --require-module ts-node/register --require tests/step-definitions/*.ts
        ;;
    "food")
        echo "🍽️ Running food ordering tests..."
        npx cucumber-js tests/features/food-ordering.feature --require-module ts-node/register --require tests/step-definitions/*.ts
        ;;
    "apartments")
        echo "🏠 Running apartment listings tests..."
        npx cucumber-js tests/features/apartment-listings.feature --require-module ts-node/register --require tests/step-definitions/*.ts
        ;;
    "negative")
        echo "⚠️ Running negative scenario tests..."
        npx cucumber-js tests/features/negative-scenarios.feature --require-module ts-node/register --require tests/step-definitions/*.ts
        ;;
    "all"|"")
        echo "🎯 Running all test scenarios..."
        npx cucumber-js tests/features --require-module ts-node/register --require tests/step-definitions/*.ts --format progress
        ;;
    "debug")
        echo "🐛 Running tests in debug mode..."
        DEBUG=true HEADLESS=false npx cucumber-js tests/features --require-module ts-node/register --require tests/step-definitions/*.ts --format progress
        ;;
    *)
        echo "Usage: $0 [search|negotiation|booking|services|taxi|food|apartments|negative|all|debug]"
        echo ""
        echo "Examples:"
        echo "  $0                 # Run all tests"
        echo "  $0 search          # Run hotel search tests only"
        echo "  $0 negotiation     # Run pricing negotiation tests only"
        echo "  $0 debug           # Run all tests in debug mode (visible browser)"
        exit 1
        ;;
esac

echo "✅ Test execution completed!"
echo ""
echo "📊 Test Results Summary:"
echo "- Check the output above for pass/fail status"
echo "- Screenshots and logs are available in tests/reports/ (if configured)"
echo "- For detailed debugging, use: $0 debug"