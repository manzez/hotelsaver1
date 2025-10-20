#!/bin/bash

# 🚀 Pre-Deployment Validation Script
# Runs comprehensive regression testing before deployment

set -e  # Exit on any error

echo "🚀 HotelSaver.ng Pre-Deployment Validation"
echo "=========================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required environment variables are set
check_environment() {
    print_status "Checking environment configuration..."
    
    if [ -z "$VERCEL_TOKEN" ]; then
        print_warning "VERCEL_TOKEN not set. Deployment will be skipped."
    fi
    
    if [ ! -f ".env.local" ] && [ ! -f ".env" ]; then
        print_warning "No environment file found. Some features may not work."
    fi
    
    print_success "Environment check completed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm ci > /dev/null 2>&1
    cd tests && npm ci > /dev/null 2>&1 && cd ..
    print_success "Dependencies installed"
}

# Install Playwright browsers
install_browsers() {
    print_status "Installing Playwright browsers..."
    cd tests && npx playwright install --with-deps > /dev/null 2>&1 && cd ..
    print_success "Browsers installed"
}

# Build the application
build_application() {
    print_status "Building application..."
    npm run build > build.log 2>&1
    if [ $? -eq 0 ]; then
        print_success "Build completed successfully"
        rm build.log
    else
        print_error "Build failed. Check build.log for details."
        exit 1
    fi
}

# Start application in background
start_application() {
    print_status "Starting application server..."
    npm start > server.log 2>&1 &
    SERVER_PID=$!
    
    # Wait for server to be ready
    for i in {1..30}; do
        if curl -f http://localhost:3000 > /dev/null 2>&1; then
            print_success "Server is ready (PID: $SERVER_PID)"
            return 0
        fi
        sleep 1
    done
    
    print_error "Server failed to start within 30 seconds"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
}

# Run API tests
run_api_tests() {
    print_status "Running API regression tests..."
    cd tests/api
    npm test > ../api-test-results.log 2>&1
    API_RESULT=$?
    cd ../..
    
    if [ $API_RESULT -eq 0 ]; then
        print_success "API tests passed ✅"
    else
        print_error "API tests failed ❌"
        print_error "Check tests/api-test-results.log for details"
        return 1
    fi
}

# Run E2E tests
run_e2e_tests() {
    print_status "Running E2E regression tests..."
    cd tests
    npx playwright test --reporter=line > e2e-test-results.log 2>&1
    E2E_RESULT=$?
    cd ..
    
    if [ $E2E_RESULT -eq 0 ]; then
        print_success "E2E tests passed ✅"
    else
        print_error "E2E tests failed ❌"
        print_error "Check tests/e2e-test-results.log for details"
        return 1
    fi
}

# Generate test report
generate_report() {
    print_status "Generating test report..."
    cd tests
    node generate-report.js > /dev/null 2>&1
    cd ..
    
    if [ -f "tests/reports/test-report-$(date +%Y-%m-%d).html" ]; then
        print_success "Test report generated"
        echo "📊 Report: tests/reports/test-report-$(date +%Y-%m-%d).html"
    else
        print_warning "Test report generation failed"
    fi
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null || true
        print_status "Server stopped"
    fi
    rm -f server.log build.log
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Main execution
main() {
    echo
    print_status "Starting pre-deployment validation pipeline..."
    echo
    
    # Step 1: Environment check
    check_environment
    
    # Step 2: Install dependencies
    install_dependencies
    install_browsers
    
    # Step 3: Build application
    build_application
    
    # Step 4: Start application
    start_application
    
    # Step 5: Run tests
    TEST_FAILURES=0
    
    if ! run_api_tests; then
        TEST_FAILURES=$((TEST_FAILURES + 1))
    fi
    
    if ! run_e2e_tests; then
        TEST_FAILURES=$((TEST_FAILURES + 1))
    fi
    
    # Step 6: Generate report
    generate_report
    
    # Step 7: Final validation
    echo
    print_status "=========================================="
    if [ $TEST_FAILURES -eq 0 ]; then
        print_success "🎉 ALL REGRESSION TESTS PASSED!"
        print_success "✅ Application is ready for deployment"
        echo
        print_status "Next steps:"
        echo "  • Deploy to staging: npm run deploy:staging"
        echo "  • Deploy to production: npm run deploy:production"
        echo
        exit 0
    else
        print_error "❌ $TEST_FAILURES test suite(s) failed"
        print_error "🚫 Application is NOT ready for deployment"
        echo
        print_status "Fix the following issues before deploying:"
        if [ -f "tests/api-test-results.log" ]; then
            echo "  • API test failures: tests/api-test-results.log"
        fi
        if [ -f "tests/e2e-test-results.log" ]; then
            echo "  • E2E test failures: tests/e2e-test-results.log"
        fi
        echo
        exit 1
    fi
}

# Run main function
main