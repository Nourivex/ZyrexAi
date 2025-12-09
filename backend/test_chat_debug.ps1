# Test regular chat dengan detail error
$ApiKey = "zyrex-0425-1201-secret"
$BaseUrl = "http://localhost:1810/api/v1"

Write-Host "Testing Chat Endpoint..." -ForegroundColor Cyan

$headers = @{
    "X-API-Key" = $ApiKey
    "Content-Type" = "application/json"
}

$body = @{
    message = "Test"
    stream = $false
    model = "qwen2.5-coder:14b-instruct"
} | ConvertTo-Json

Write-Host "Request Body:" $body
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/chat/chat" -Method Post -Headers $headers -Body $body -UseBasicParsing
    Write-Host "Success!" -ForegroundColor Green
    Write-Host $response.Content
} catch {
    Write-Host "Error!" -ForegroundColor Red
    Write-Host "StatusCode:" $_.Exception.Response.StatusCode.value__
    Write-Host "Response:" $_.Exception.Response
    if ($_.ErrorDetails.Message) {
        Write-Host "Details:" $_.ErrorDetails.Message
    }
}
