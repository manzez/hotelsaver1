@echo off
REM Test Runner Script for HotelSaver (Windows)

echo 🚀 HotelSaver Test Suite Runner
echo ================================

REM Check if server is running
echo 📡 Checking if development server is running...
curl -s http://localhost:3001 > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Development server not running. Please start with: npm run dev
    exit /b 1
)

echo ✅ Development server is running

REM Install test dependencies if not already installed
if not exist "node_modules" (
    echo 📦 Installing test dependencies...
    npm install @cucumber/cucumber @playwright/test ts-node typescript cross-env concurrently
)

REM Install Playwright browsers
echo 🌐 Installing Playwright browsers...
npx playwright install

REM Run tests based on argument
set TEST_TYPE=%1
if "%TEST_TYPE%"=="" set TEST_TYPE=all

if "%TEST_TYPE%"=="search" (
    echo 🔍 Running hotel search tests...
    npx cucumber-js tests/features/hotel-search.feature --require-module ts-node/register --require tests/step-definitions/*.ts
) else if "%TEST_TYPE%"=="negotiation" (
    echo 💰 Running negotiation pricing tests...
    npx cucumber-js tests/features/negotiation-pricing.feature --require-module ts-node/register --require tests/step-definitions/*.ts
) else if "%TEST_TYPE%"=="booking" (
    echo 📋 Running booking process tests...
    npx cucumber-js tests/features/booking-process.feature --require-module ts-node/register --require tests/step-definitions/*.ts
) else if "%TEST_TYPE%"=="services" (
    echo 🛎️ Running services booking tests...
    npx cucumber-js tests/features/services-booking.feature --require-module ts-node/register --require tests/step-definitions/*.ts
) else if "%TEST_TYPE%"=="taxi" (
    echo 🚖 Running taxi booking tests...
    npx cucumber-js tests/features/taxi-booking.feature --require-module ts-node/register --require tests/step-definitions/*.ts
) else if "%TEST_TYPE%"=="food" (
    echo 🍽️ Running food ordering tests...
    npx cucumber-js tests/features/food-ordering.feature --require-module ts-node/register --require tests/step-definitions/*.ts
) else if "%TEST_TYPE%"=="apartments" (
    echo 🏠 Running apartment listings tests...
    npx cucumber-js tests/features/apartment-listings.feature --require-module ts-node/register --require tests/step-definitions/*.ts
) else if "%TEST_TYPE%"=="negative" (
    echo ⚠️ Running negative scenario tests...
    npx cucumber-js tests/features/negative-scenarios.feature --require-module ts-node/register --require tests/step-definitions/*.ts
) else if "%TEST_TYPE%"=="all" (
    echo 🎯 Running all test scenarios...
    npx cucumber-js tests/features --require-module ts-node/register --require tests/step-definitions/*.ts --format progress
) else if "%TEST_TYPE%"=="debug" (
    echo 🐛 Running tests in debug mode...
    set DEBUG=true
    set HEADLESS=false
    npx cucumber-js tests/features --require-module ts-node/register --require tests/step-definitions/*.ts --format progress
) else (
    echo Usage: %0 [search^|negotiation^|booking^|services^|taxi^|food^|apartments^|negative^|all^|debug]
    echo.
    echo Examples:
    echo   %0                 # Run all tests
    echo   %0 search          # Run hotel search tests only
    echo   %0 negotiation     # Run pricing negotiation tests only
    echo   %0 debug           # Run all tests in debug mode (visible browser^)
    exit /b 1
)

echo ✅ Test execution completed!
echo.
echo 📊 Test Results Summary:
echo - Check the output above for pass/fail status
echo - Screenshots and logs are available in tests/reports/ (if configured^)
echo - For detailed debugging, use: %0 debug

pause