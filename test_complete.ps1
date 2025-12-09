# ZyrexAi - Complete Integration Test
# Tests all features: backend, frontend, sidebar, characters, settings

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ZyrexAi - Complete Integration Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$TestResults = @{
    Passed = 0
    Failed = 0
    Total = 0
}

function Test-Feature {
    param(
        [string]$Name,
        [scriptblock]$TestBlock
    )
    
    $TestResults.Total++
    Write-Host "Testing: $Name" -ForegroundColor Yellow -NoNewline
    
    try {
        & $TestBlock
        Write-Host " ✓ PASSED" -ForegroundColor Green
        $TestResults.Passed++
        return $true
    } catch {
        Write-Host " ✗ FAILED" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        $TestResults.Failed++
        return $false
    }
}

Write-Host "1️⃣  Backend Health Tests" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────" -ForegroundColor Gray

Test-Feature "Backend Server Running" {
    $response = Invoke-RestMethod -Uri "http://localhost:1810/api/v1/health" `
        -Headers @{"X-API-Key"="zyrex-0425-1201-secret"} `
        -TimeoutSec 5
    if ($response.status -ne "ok") { throw "Backend not healthy" }
}

Test-Feature "Ollama Connection" {
    $response = Invoke-RestMethod -Uri "http://localhost:1810/api/v1/health" `
        -Headers @{"X-API-Key"="zyrex-0425-1201-secret"}
    if ($response.ollama_status -ne "online") { throw "Ollama not online" }
}

Test-Feature "Database Connection" {
    $response = Invoke-RestMethod -Uri "http://localhost:1810/api/v1/health" `
        -Headers @{"X-API-Key"="zyrex-0425-1201-secret"}
    if ($response.database -ne "sqlite") { throw "Database not connected" }
}

Write-Host ""
Write-Host "2️⃣  Character System Tests" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────" -ForegroundColor Gray

Test-Feature "Get Characters List" {
    $chars = Invoke-RestMethod -Uri "http://localhost:1810/api/v1/roleplay/characters" `
        -Headers @{"X-API-Key"="zyrex-0425-1201-secret"}
    if ($chars.Length -lt 3) { throw "Not enough characters" }
}

Test-Feature "Assistant Character Exists" {
    $chars = Invoke-RestMethod -Uri "http://localhost:1810/api/v1/roleplay/characters" `
        -Headers @{"X-API-Key"="zyrex-0425-1201-secret"}
    $assistant = $chars | Where-Object { $_.name -eq "Assistant" }
    if (!$assistant) { throw "Assistant character not found" }
    if ($assistant.temperature -ne 0.7) { throw "Assistant temperature incorrect" }
}

Test-Feature "Coder Character Exists" {
    $chars = Invoke-RestMethod -Uri "http://localhost:1810/api/v1/roleplay/characters" `
        -Headers @{"X-API-Key"="zyrex-0425-1201-secret"}
    $coder = $chars | Where-Object { $_.name -eq "Coder" }
    if (!$coder) { throw "Coder character not found" }
    if ($coder.temperature -ne 0.3) { throw "Coder temperature incorrect" }
    if ($coder.model_preference -ne "qwen2.5-coder:14b-instruct") { 
        throw "Coder model incorrect" 
    }
}

Test-Feature "Storyteller Character Exists" {
    $chars = Invoke-RestMethod -Uri "http://localhost:1810/api/v1/roleplay/characters" `
        -Headers @{"X-API-Key"="zyrex-0425-1201-secret"}
    $story = $chars | Where-Object { $_.name -eq "Storyteller" }
    if (!$story) { throw "Storyteller character not found" }
    if ($story.temperature -ne 0.9) { throw "Storyteller temperature incorrect" }
}

Write-Host ""
Write-Host "3️⃣  Chat Functionality Tests" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────" -ForegroundColor Gray

Test-Feature "Send Regular Chat Message" {
    $body = @{
        message = "Hello! This is a test."
        stream = $false
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:1810/api/v1/chat/chat" `
        -Method POST `
        -Headers @{
            "X-API-Key"="zyrex-0425-1201-secret"
            "Content-Type"="application/json"
        } `
        -Body $body
    
    if (!$response.message) { throw "No message in response" }
    if (!$response.session_id) { throw "No session ID" }
    Write-Host "    Session ID: $($response.session_id)" -ForegroundColor Gray
}

Test-Feature "Send Roleplay Chat with Coder" {
    $chars = Invoke-RestMethod -Uri "http://localhost:1810/api/v1/roleplay/characters" `
        -Headers @{"X-API-Key"="zyrex-0425-1201-secret"}
    $coder = $chars | Where-Object { $_.name -eq "Coder" }
    
    $body = @{
        character_id = $coder.id
        message = "What is Python?"
        stream = $false
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:1810/api/v1/roleplay/chat" `
        -Method POST `
        -Headers @{
            "X-API-Key"="zyrex-0425-1201-secret"
            "Content-Type"="application/json"
        } `
        -Body $body
    
    if (!$response.message) { throw "No message in response" }
    if ($response.character -ne "Coder") { throw "Wrong character responded" }
}

Write-Host ""
Write-Host "4️⃣  Frontend Tests" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────" -ForegroundColor Gray

Test-Feature "Frontend Server Accessible" {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" `
        -Method GET `
        -TimeoutSec 5
    if ($response.StatusCode -ne 200) { throw "Frontend not responding" }
}

Test-Feature "Frontend HTML Contains React" {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET
    $html = $response.Content
    if ($html -notmatch "root") { throw "React root element not found" }
}

Test-Feature "Vite Assets Loading" {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET
    $html = $response.Content
    if ($html -notmatch "\.tsx|\.ts|module") { throw "Vite assets not loading" }
}

Write-Host ""
Write-Host "5️⃣  Component Structure Tests" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────" -ForegroundColor Gray

Test-Feature "Sidebar Component Exists" {
    if (!(Test-Path "frontend\src\components\Sidebar.tsx")) {
        throw "Sidebar component missing"
    }
}

Test-Feature "ChatArea Component Exists" {
    if (!(Test-Path "frontend\src\components\ChatArea.tsx")) {
        throw "ChatArea component missing"
    }
}

Test-Feature "CharacterModal Component Exists" {
    if (!(Test-Path "frontend\src\components\CharacterModal.tsx")) {
        throw "CharacterModal component missing"
    }
}

Test-Feature "SettingsModal Component Exists" {
    if (!(Test-Path "frontend\src\components\SettingsModal.tsx")) {
        throw "SettingsModal component missing"
    }
}

Test-Feature "InputBox Component Exists" {
    if (!(Test-Path "frontend\src\components\InputBox.tsx")) {
        throw "InputBox component missing"
    }
}

Test-Feature "MessageBubble Component Exists" {
    if (!(Test-Path "frontend\src\components\MessageBubble.tsx")) {
        throw "MessageBubble component missing"
    }
}

Test-Feature "Header Component Exists" {
    if (!(Test-Path "frontend\src\components\Header.tsx")) {
        throw "Header component missing"
    }
}

Test-Feature "ErrorBoundary Component Exists" {
    if (!(Test-Path "frontend\src\components\ErrorBoundary.tsx")) {
        throw "ErrorBoundary component missing"
    }
}

Write-Host ""
Write-Host "6️⃣  API Service Tests" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────" -ForegroundColor Gray

Test-Feature "API Service File Exists" {
    if (!(Test-Path "frontend\src\services\api.ts")) {
        throw "API service missing"
    }
}

Test-Feature "useChat Hook Exists" {
    if (!(Test-Path "frontend\src\hooks\useChat.ts")) {
        throw "useChat hook missing"
    }
}

Test-Feature "TypeScript Types Defined" {
    if (!(Test-Path "frontend\src\types\index.ts")) {
        throw "TypeScript types missing"
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "         📊 Test Results Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$passRate = [math]::Round(($TestResults.Passed / $TestResults.Total) * 100, 2)

Write-Host "Total Tests:  " -NoNewline
Write-Host $TestResults.Total -ForegroundColor White

Write-Host "Passed:       " -NoNewline
Write-Host $TestResults.Passed -ForegroundColor Green

Write-Host "Failed:       " -NoNewline
if ($TestResults.Failed -eq 0) {
    Write-Host $TestResults.Failed -ForegroundColor Green
} else {
    Write-Host $TestResults.Failed -ForegroundColor Red
}

Write-Host "Pass Rate:    " -NoNewline
if ($passRate -eq 100) {
    Write-Host "$passRate%" -ForegroundColor Green
} elseif ($passRate -ge 80) {
    Write-Host "$passRate%" -ForegroundColor Yellow
} else {
    Write-Host "$passRate%" -ForegroundColor Red
}

Write-Host ""

if ($TestResults.Failed -eq 0) {
    Write-Host "🎉 All tests passed! ZyrexAi is fully functional!" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ Backend running perfectly" -ForegroundColor Green
    Write-Host "✅ Frontend components complete" -ForegroundColor Green
    Write-Host "✅ Characters system working" -ForegroundColor Green
    Write-Host "✅ Chat functionality operational" -ForegroundColor Green
    Write-Host "✅ Sidebar & modals ready" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Please review the errors above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📱 Access Points:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "   Backend:   http://localhost:1810" -ForegroundColor White
Write-Host "   API Docs:  http://localhost:1810/docs" -ForegroundColor White
Write-Host "   Superadmin: http://localhost:1810/superadmin" -ForegroundColor White
Write-Host ""

# Return exit code based on test results
if ($TestResults.Failed -eq 0) {
    exit 0
} else {
    exit 1
}
