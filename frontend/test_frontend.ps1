# ZyrexAi Frontend Test Script

Write-Host "=== ZyrexAi Frontend Test ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Backend Health..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:1810/api/v1/health" -Headers @{"X-API-Key"="zyrex-0425-1201-secret"}
    Write-Host "✓ Backend Status: $($response.status)" -ForegroundColor Green
    Write-Host "✓ Ollama Status: $($response.ollama_status)" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend not responding" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Get Characters
Write-Host "2. Testing Characters Endpoint..." -ForegroundColor Yellow
try {
    $characters = Invoke-RestMethod -Uri "http://localhost:1810/api/v1/roleplay/characters" -Headers @{"X-API-Key"="zyrex-0425-1201-secret"}
    Write-Host "✓ Found $($characters.Length) characters" -ForegroundColor Green
    foreach ($char in $characters) {
        Write-Host "  - $($char.name) (temp: $($char.temperature))" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Failed to get characters" -ForegroundColor Red
}

Write-Host ""

# Test 3: Send Test Message
Write-Host "3. Testing Chat Endpoint..." -ForegroundColor Yellow
try {
    $body = @{
        message = "Hello! Just a quick test message."
        stream = $false
    } | ConvertTo-Json
    
    $chatResponse = Invoke-RestMethod -Uri "http://localhost:1810/api/v1/chat/chat" `
        -Method POST `
        -Headers @{
            "X-API-Key"="zyrex-0425-1201-secret"
            "Content-Type"="application/json"
        } `
        -Body $body
    
    Write-Host "✓ Chat Response:" -ForegroundColor Green
    Write-Host "  Session ID: $($chatResponse.session_id)" -ForegroundColor Gray
    Write-Host "  Message ID: $($chatResponse.message_id)" -ForegroundColor Gray
    Write-Host "  Model: $($chatResponse.model_used)" -ForegroundColor Gray
    Write-Host "  Response: $($chatResponse.message.Substring(0, [Math]::Min(100, $chatResponse.message.Length)))..." -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed to send chat message" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""

# Test 4: Frontend Availability
Write-Host "4. Testing Frontend Server..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 5
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✓ Frontend is running on http://localhost:5173" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Frontend not accessible" -ForegroundColor Red
    Write-Host "  Make sure to run: npm run dev" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "Backend:  http://localhost:1810" -ForegroundColor Green
Write-Host "API Docs: http://localhost:1810/docs" -ForegroundColor Green
Write-Host ""
