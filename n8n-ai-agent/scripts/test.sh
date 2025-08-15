#!/bin/bash

# Advanced AI Agent Testing Script
# Comprehensive testing suite for all system components

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
TESTS_DIR="tests"
RESULTS_DIR="test-results"
N8N_URL="http://localhost:5678"
REDIS_URL="redis://localhost:6379"
MCP_SERVERS=(
    "http://localhost:3001"  # filesystem
    "http://localhost:3002"  # database
    "http://localhost:3003"  # web
    "http://localhost:3004"  # code
)

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Function to check if service is running
check_service() {
    local service_name=$1
    local url=$2
    local timeout=${3:-10}
    
    print_status "Checking $service_name at $url"
    
    if curl -s --max-time $timeout "$url/health" > /dev/null 2>&1; then
        print_success "$service_name is running"
        return 0
    else
        print_error "$service_name is not accessible"
        return 1
    fi
}

# Function to run unit tests
run_unit_tests() {
    print_status "Running unit tests..."
    
    if [ ! -d "$TESTS_DIR/unit" ]; then
        print_warning "Unit tests directory not found, skipping unit tests"
        return 0
    fi
    
    local test_count=0
    local pass_count=0
    
    for test_file in "$TESTS_DIR/unit"/*.test.js; do
        if [ -f "$test_file" ]; then
            test_count=$((test_count + 1))
            test_name=$(basename "$test_file" .test.js)
            
            print_status "Running unit test: $test_name"
            
            if node "$test_file" > "$RESULTS_DIR/unit_${test_name}.log" 2>&1; then
                print_success "Unit test passed: $test_name"
                pass_count=$((pass_count + 1))
            else
                print_error "Unit test failed: $test_name"
                cat "$RESULTS_DIR/unit_${test_name}.log"
            fi
        fi
    done
    
    echo "Unit Tests: $pass_count/$test_count passed"
    return $((test_count - pass_count))
}

# Function to test MCP servers
test_mcp_servers() {
    print_status "Testing MCP servers..."
    
    local server_names=("filesystem" "database" "web" "code")
    local test_count=0
    local pass_count=0
    
    for i in "${!MCP_SERVERS[@]}"; do
        local server_url="${MCP_SERVERS[$i]}"
        local server_name="${server_names[$i]}"
        
        test_count=$((test_count + 1))
        
        print_status "Testing MCP $server_name server at $server_url"
        
        # Test health endpoint
        if curl -s --max-time 10 "$server_url/health" | grep -q "healthy"; then
            print_success "MCP $server_name server health check passed"
        else
            print_error "MCP $server_name server health check failed"
            continue
        fi
        
        # Test capabilities endpoint
        if curl -s --max-time 10 "$server_url/capabilities" | grep -q "tools"; then
            print_success "MCP $server_name server capabilities check passed"
        else
            print_error "MCP $server_name server capabilities check failed"
            continue
        fi
        
        # Test execute endpoint with auto-detect
        local test_payload='{"tool":"'$server_name'","action":"auto_detect","context":"test","ai_response":"test"}'
        
        if curl -s --max-time 30 -X POST -H "Content-Type: application/json" \
           -d "$test_payload" "$server_url/execute" | grep -q "success"; then
            print_success "MCP $server_name server execute test passed"
            pass_count=$((pass_count + 1))
        else
            print_error "MCP $server_name server execute test failed"
        fi
    done
    
    echo "MCP Server Tests: $pass_count/$test_count passed"
    return $((test_count - pass_count))
}

# Function to test Redis caching
test_redis_cache() {
    print_status "Testing Redis cache..."
    
    local test_count=0
    local pass_count=0
    
    # Test Redis connectivity
    test_count=$((test_count + 1))
    if redis-cli -u "$REDIS_URL" ping | grep -q "PONG"; then
        print_success "Redis connectivity test passed"
        pass_count=$((pass_count + 1))
    else
        print_error "Redis connectivity test failed"
        return 1
    fi
    
    # Test cache set/get operations
    test_count=$((test_count + 1))
    local test_key="test_cache_$(date +%s)"
    local test_value="test_value_$(date +%s)"
    
    if redis-cli -u "$REDIS_URL" set "$test_key" "$test_value" | grep -q "OK"; then
        if [ "$(redis-cli -u "$REDIS_URL" get "$test_key")" = "$test_value" ]; then
            print_success "Redis cache set/get test passed"
            pass_count=$((pass_count + 1))
            redis-cli -u "$REDIS_URL" del "$test_key" > /dev/null
        else
            print_error "Redis cache get test failed"
        fi
    else
        print_error "Redis cache set test failed"
    fi
    
    # Test cache expiration
    test_count=$((test_count + 1))
    local expire_key="test_expire_$(date +%s)"
    
    if redis-cli -u "$REDIS_URL" setex "$expire_key" 2 "expire_test" | grep -q "OK"; then
        sleep 3
        if [ "$(redis-cli -u "$REDIS_URL" get "$expire_key")" = "" ]; then
            print_success "Redis cache expiration test passed"
            pass_count=$((pass_count + 1))
        else
            print_error "Redis cache expiration test failed"
        fi
    else
        print_error "Redis cache expiration setup failed"
    fi
    
    echo "Redis Cache Tests: $pass_count/$test_count passed"
    return $((test_count - pass_count))
}

# Function to test n8n workflow
test_n8n_workflow() {
    print_status "Testing n8n AI agent workflow..."
    
    local test_count=0
    local pass_count=0
    
    # Test n8n health
    test_count=$((test_count + 1))
    if check_service "n8n" "$N8N_URL" 15; then
        pass_count=$((pass_count + 1))
    fi
    
    # Test AI agent webhook
    test_count=$((test_count + 1))
    local webhook_url="$N8N_URL/webhook/ai-agent"
    local test_payload='{"session_id":"test_session","message":"Hello, can you help me list files in the current directory?"}'
    
    print_status "Testing AI agent webhook at $webhook_url"
    
    local response=$(curl -s --max-time 60 -X POST -H "Content-Type: application/json" \
                    -d "$test_payload" "$webhook_url" 2>/dev/null || echo "ERROR")
    
    if echo "$response" | grep -q "success"; then
        print_success "AI agent webhook test passed"
        pass_count=$((pass_count + 1))
        
        # Save response for analysis
        echo "$response" > "$RESULTS_DIR/webhook_response.json"
        
        # Check if tools were used
        if echo "$response" | grep -q "tool"; then
            print_success "AI agent tool integration working"
        else
            print_warning "AI agent responded but no tools were detected"
        fi
    else
        print_error "AI agent webhook test failed"
        echo "Response: $response" > "$RESULTS_DIR/webhook_error.log"
    fi
    
    echo "n8n Workflow Tests: $pass_count/$test_count passed"
    return $((test_count - pass_count))
}

# Function to run performance tests
run_performance_tests() {
    print_status "Running performance tests..."
    
    local test_count=0
    local pass_count=0
    
    # Test response time
    test_count=$((test_count + 1))
    local webhook_url="$N8N_URL/webhook/ai-agent"
    local test_payload='{"session_id":"perf_test","message":"What is 2+2?"}'
    
    print_status "Testing response time performance"
    
    local start_time=$(date +%s%3N)
    local response=$(curl -s --max-time 30 -X POST -H "Content-Type: application/json" \
                    -d "$test_payload" "$webhook_url" 2>/dev/null || echo "ERROR")
    local end_time=$(date +%s%3N)
    local response_time=$((end_time - start_time))
    
    if echo "$response" | grep -q "success"; then
        if [ $response_time -lt 10000 ]; then  # Less than 10 seconds
            print_success "Response time test passed: ${response_time}ms"
            pass_count=$((pass_count + 1))
        else
            print_warning "Response time test slow: ${response_time}ms"
        fi
    else
        print_error "Response time test failed"
    fi
    
    # Test concurrent requests
    test_count=$((test_count + 1))
    print_status "Testing concurrent request handling"
    
    local concurrent_count=5
    local success_count=0
    
    for i in $(seq 1 $concurrent_count); do
        local session_payload='{"session_id":"concurrent_'$i'","message":"Hello from session '$i'"}'
        curl -s --max-time 30 -X POST -H "Content-Type: application/json" \
             -d "$session_payload" "$webhook_url" > "$RESULTS_DIR/concurrent_$i.json" 2>&1 &
    done
    
    wait  # Wait for all background processes
    
    for i in $(seq 1 $concurrent_count); do
        if grep -q "success" "$RESULTS_DIR/concurrent_$i.json"; then
            success_count=$((success_count + 1))
        fi
    done
    
    if [ $success_count -eq $concurrent_count ]; then
        print_success "Concurrent request test passed: $success_count/$concurrent_count"
        pass_count=$((pass_count + 1))
    else
        print_error "Concurrent request test failed: $success_count/$concurrent_count"
    fi
    
    echo "Performance Tests: $pass_count/$test_count passed"
    return $((test_count - pass_count))
}

# Function to test monitoring endpoints
test_monitoring() {
    print_status "Testing monitoring and health endpoints..."
    
    local test_count=0
    local pass_count=0
    
    # Test monitoring dashboard
    test_count=$((test_count + 1))
    if check_service "monitoring dashboard" "http://localhost:3000" 10; then
        pass_count=$((pass_count + 1))
    fi
    
    # Test Redis Commander
    test_count=$((test_count + 1))
    if curl -s --max-time 10 "http://localhost:8081" > /dev/null 2>&1; then
        print_success "Redis Commander is accessible"
        pass_count=$((pass_count + 1))
    else
        print_error "Redis Commander is not accessible"
    fi
    
    echo "Monitoring Tests: $pass_count/$test_count passed"
    return $((test_count - pass_count))
}

# Function to generate test report
generate_test_report() {
    local total_failures=$1
    
    print_status "Generating test report..."
    
    cat > "$RESULTS_DIR/test_report.html" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>AI Agent Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f4f4f4; padding: 20px; border-radius: 5px; }
        .pass { color: green; }
        .fail { color: red; }
        .warn { color: orange; }
        .section { margin: 20px 0; padding: 10px; border-left: 3px solid #007cba; }
        pre { background: #f9f9f9; padding: 10px; border-radius: 3px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Advanced AI Agent Test Report</h1>
        <p>Generated: $(date)</p>
        <p>Status: $([ $total_failures -eq 0 ] && echo '<span class="pass">PASSED</span>' || echo '<span class="fail">FAILED</span>')</p>
    </div>
    
    <div class="section">
        <h2>Test Summary</h2>
        <ul>
            <li>Total Failures: $total_failures</li>
            <li>Test Results Directory: $RESULTS_DIR</li>
        </ul>
    </div>
    
    <div class="section">
        <h2>Service Health Status</h2>
        <ul>
            <li>n8n: $(check_service "n8n" "$N8N_URL" 5 >/dev/null 2>&1 && echo '<span class="pass">UP</span>' || echo '<span class="fail">DOWN</span>')</li>
            <li>Redis: $(redis-cli -u "$REDIS_URL" ping >/dev/null 2>&1 && echo '<span class="pass">UP</span>' || echo '<span class="fail">DOWN</span>')</li>
            <li>MCP Servers: $(
                up_count=0
                for server in "${MCP_SERVERS[@]}"; do
                    curl -s --max-time 5 "$server/health" >/dev/null 2>&1 && up_count=$((up_count + 1))
                done
                echo "$up_count/${#MCP_SERVERS[@]} UP"
            )</li>
        </ul>
    </div>
    
    <div class="section">
        <h2>Detailed Results</h2>
        <p>Check individual log files in the $RESULTS_DIR directory for detailed information.</p>
    </div>
</body>
</html>
EOF
    
    print_success "Test report generated: $RESULTS_DIR/test_report.html"
}

# Main test execution
main() {
    echo -e "${GREEN}===============================================${NC}"
    echo -e "${GREEN}    Advanced AI Agent - Test Suite           ${NC}"
    echo -e "${GREEN}===============================================${NC}"
    echo ""
    
    # Create results directory
    mkdir -p "$RESULTS_DIR"
    
    # Initialize failure counter
    local total_failures=0
    
    # Check if services are running
    print_status "Checking service availability..."
    
    if ! check_service "n8n" "$N8N_URL" 15; then
        print_error "n8n is not running. Please start the services first."
        exit 1
    fi
    
    # Run test suites
    echo ""
    print_status "Starting test execution..."
    echo ""
    
    # Unit tests
    run_unit_tests || total_failures=$((total_failures + $?))
    echo ""
    
    # MCP server tests
    test_mcp_servers || total_failures=$((total_failures + $?))
    echo ""
    
    # Redis cache tests
    test_redis_cache || total_failures=$((total_failures + $?))
    echo ""
    
    # n8n workflow tests
    test_n8n_workflow || total_failures=$((total_failures + $?))
    echo ""
    
    # Performance tests
    run_performance_tests || total_failures=$((total_failures + $?))
    echo ""
    
    # Monitoring tests
    test_monitoring || total_failures=$((total_failures + $?))
    echo ""
    
    # Generate test report
    generate_test_report $total_failures
    
    # Final results
    echo ""
    echo -e "${GREEN}===============================================${NC}"
    if [ $total_failures -eq 0 ]; then
        print_success "All tests passed successfully!"
        echo -e "${GREEN}System is ready for production use.${NC}"
        exit 0
    else
        print_error "Tests completed with $total_failures failures"
        echo -e "${RED}Please review the test results and fix issues.${NC}"
        exit 1
    fi
}

# Handle script arguments
case "${1:-}" in
    "unit")
        run_unit_tests
        ;;
    "mcp")
        test_mcp_servers
        ;;
    "redis")
        test_redis_cache
        ;;
    "n8n")
        test_n8n_workflow
        ;;
    "performance")
        run_performance_tests
        ;;
    "monitoring")
        test_monitoring
        ;;
    *)
        main
        ;;
esac