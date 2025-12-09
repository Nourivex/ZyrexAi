# PowerShell script untuk menjalankan server tanpa auto-reload untuk debugging
Write-Host "Starting ZyrexAi Backend Server..." -ForegroundColor Cyan
Set-Location "H:\GitHub\ZyrexAi\backend"
& .\venv\Scripts\Activate.ps1
$env:PYTHONUNBUFFERED = "1"
python -m uvicorn app.main:app --host 0.0.0.0 --port 1810 --no-reload
