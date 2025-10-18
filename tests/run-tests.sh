#!/usr/bin/env bash

# HotelSaver.ng Test Report Runner
# Generates comprehensive test reports for the entire application

set -e

echo "🧪 HotelSaver.ng Comprehensive Test Suite"
echo "========================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create reports directory
mkdir -p reports

echo -e "${BLUE}📁 Creating reports directory...${NC}"

# Function to check if server is running
check_server() {
    echo -e "${BLUE}🔍 Checking if development server is running...${NC}"
    if curl -s http://localhost:3000 > /dev/null; then
        echo -e "${GREEN}✅ Server is running${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Server not running, starting it...${NC}"
        return 1
    fi
}

# Start development server if not running
start_server() {
    if ! check_server; then
        echo -e "${BLUE}🚀 Starting Next.js development server...${NC}"
        cd ../
        npm run dev &
        SERVER_PID=$!
        echo "Server PID: $SERVER_PID"
        
        # Wait for server to start
        echo -e "${BLUE}⏳ Waiting for server to start...${NC}"
        sleep 10
        
        if check_server; then
            echo -e "${GREEN}✅ Server started successfully${NC}"
        else
            echo -e "${RED}❌ Failed to start server${NC}"
            exit 1
        fi
        cd tests/
    fi
}

# Run API tests
run_api_tests() {
    echo -e "\n${BLUE}🔧 Running API Tests...${NC}"
    cd api
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing API test dependencies...${NC}"
        npm install
    fi
    
    # Run tests with multiple reporters
    echo -e "${BLUE}📊 Running API tests with detailed reporting...${NC}"
    
    # Spec reporter for console output
    npm run test:spec > ../reports/api-console.log 2>&1 || true
    
    # JSON reporter for data
    npm run test:json > ../reports/api-json.log 2>&1 || true
    
    echo -e "${GREEN}✅ API tests completed${NC}"
    cd ..
}

# Run E2E tests
run_e2e_tests() {
    echo -e "\n${BLUE}🖥️  Running E2E Tests...${NC}"
    
    # Install Playwright if needed
    if [ ! -d "node_modules/@playwright" ]; then
        echo -e "${YELLOW}📦 Installing Playwright...${NC}"
        npm install
        npx playwright install
    fi
    
    # Run E2E tests with HTML reporter
    echo -e "${BLUE}🎭 Running Playwright tests...${NC}"
    npm run test:html > reports/e2e-console.log 2>&1 || true
    
    echo -e "${GREEN}✅ E2E tests completed${NC}"
}

# Generate consolidated report
generate_report() {
    echo -e "\n${BLUE}📋 Generating consolidated test report...${NC}"
    
    # Run our custom report generator
    node generate-report.js
    
    echo -e "${GREEN}✅ Test report generated${NC}"
}

# Main execution
main() {
    echo -e "${BLUE}🏨 Starting HotelSaver.ng test suite...${NC}"
    
    # Change to tests directory
    cd "$(dirname "$0")"
    
    # Start server
    start_server
    
    # Run tests
    run_api_tests
    run_e2e_tests
    
    # Generate reports
    generate_report
    
    # Show summary
    echo -e "\n${GREEN}🎉 Test Suite Complete!${NC}"
    echo -e "${GREEN}========================${NC}"
    echo -e "${BLUE}📁 Reports generated in: ${NC}$(pwd)/reports/"
    echo -e "${BLUE}📊 Main report: ${NC}$(pwd)/reports/test-report-*.html"
    echo -e "${BLUE}🔧 API logs: ${NC}$(pwd)/reports/api-console.log"
    echo -e "${BLUE}🖥️  E2E logs: ${NC}$(pwd)/reports/e2e-console.log"
    
    # Open report in browser (macOS)
    if command -v open &> /dev/null; then
        LATEST_REPORT=$(ls -t reports/test-report-*.html 2>/dev/null | head -1)
        if [ -n "$LATEST_REPORT" ]; then
            echo -e "\n${BLUE}🌐 Opening report in browser...${NC}"
            open "$LATEST_REPORT"
        fi
    fi
    
    echo -e "\n${GREEN}✨ All done! Check the reports directory for detailed results.${NC}"
}

# Cleanup function
cleanup() {
    if [ ! -z "$SERVER_PID" ]; then
        echo -e "\n${YELLOW}🧹 Cleaning up server (PID: $SERVER_PID)...${NC}"
        kill $SERVER_PID 2>/dev/null || true
    fi
}

# Set trap for cleanup on exit
trap cleanup EXIT

# Run main function
main "$@"