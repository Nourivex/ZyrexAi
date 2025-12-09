# Test Backend API dengan PowerShell Invoke-RestMethod
$ApiKey = "zyrex-0425-1201-secret"
$BaseUrl = "http://localhost:1810/api/v1"

Write-Host "=== Testing ZyrexAi Backend dengan Invoke-RestMethod ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Chat Non-Streaming
Write-Host "1. Testing Chat (Non-streaming)..." -ForegroundColor Yellow
try {
    $headers = @{
        "X-API-Key" = $ApiKey
        "Content-Type" = "application/json"
    }
    
    $body = @{
        message = "Halo, siapa kamu?"
        stream = $false
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$BaseUrl/chat/chat" -Method Post -Headers $headers -Body $body
    Write-Host "Success! Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "StatusDescription: $($_.Exception.Response.StatusDescription)"
}
Write-Host ""

# Test 2: Roleplay Chat with Coder
Write-Host "2. Testing Roleplay Chat (Coder character)..." -ForegroundColor Yellow
try {
    $body = @{
        message = "Apa itu Python?"
        character_id = 2
        stream = $false
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$BaseUrl/roleplay/chat" -Method Post -Headers $headers -Body $body
    Write-Host "Success! Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "=== Testing Complete ===" -ForegroundColor Green
