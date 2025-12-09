# ZyrexAi Backend API Testing Script
$ApiKey = "zyrex-0425-1201-secret"
$BaseUrl = "http://localhost:1810/api/v1"

Write-Host "=== Testing ZyrexAi Backend Endpoints ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
curl.exe "$BaseUrl/health"
Write-Host ""

# Test 2: List Characters
Write-Host "2. Testing List Characters..." -ForegroundColor Yellow
curl.exe "$BaseUrl/roleplay/characters" -H "X-API-Key: $ApiKey"
Write-Host ""

# Test 3: Chat (Non-streaming)
Write-Host "3. Testing Chat (Non-streaming)..." -ForegroundColor Yellow
$chatBody = @{
    message = "Halo, siapa kamu?"
    stream = $false
} | ConvertTo-Json -Compress

curl.exe "$BaseUrl/chat/chat" `
    -X POST `
    -H "Content-Type: application/json" `
    -H "X-API-Key: $ApiKey" `
    --data-raw $chatBody
Write-Host ""

# Test 4: Roleplay Chat with Coder Character
Write-Host "4. Testing Roleplay Chat (Coder)..." -ForegroundColor Yellow
$roleplayBody = @{
    message = "Jelaskan tentang Python secara singkat"
    character_id = 2
    stream = $false
} | ConvertTo-Json -Compress

curl.exe "$BaseUrl/roleplay/chat" `
    -X POST `
    -H "Content-Type: application/json" `
    -H "X-API-Key: $ApiKey" `
    --data-raw $roleplayBody
Write-Host ""

# Test 5: List Agents
Write-Host "5. Testing List Agents..." -ForegroundColor Yellow
curl.exe "$BaseUrl/agents" -H "X-API-Key: $ApiKey"
Write-Host ""

# Test 6: List Tools
Write-Host "6. Testing List Tools..." -ForegroundColor Yellow
curl.exe "$BaseUrl/tools" -H "X-API-Key: $ApiKey"
Write-Host ""

# Test 7: List Automations
Write-Host "7. Testing List Automations..." -ForegroundColor Yellow
curl.exe "$BaseUrl/automations" -H "X-API-Key: $ApiKey"
Write-Host ""

Write-Host "=== Testing Complete ===" -ForegroundColor Green
