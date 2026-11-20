$ErrorActionPreference = "Continue"
$expected = "google.com, pub-7776844434912624, DIRECT, f08c47fec0942fa0"
$urls = @(
  "https://saanwariyasethfashion.com/ads.txt",
  "http://saanwariyasethfashion.com/ads.txt",
  "https://www.saanwariyasethfashion.com/ads.txt",
  "http://www.saanwariyasethfashion.com/ads.txt"
)

$temp = Join-Path $env:TEMP "saanwariya-ads-check.txt"
foreach ($url in $urls) {
  Write-Host "`nChecking $url" -ForegroundColor Cyan
  $meta = & curl.exe -sS -L --max-redirs 10 --connect-timeout 15 --max-time 30 -o $temp -w "HTTP=%{http_code}`nFINAL_URL=%{url_effective}`nCONTENT_TYPE=%{content_type}`n" $url 2>&1
  $curlExit = $LASTEXITCODE
  $meta | ForEach-Object { Write-Host $_ }
  if ($curlExit -ne 0) {
    Write-Host "RESULT: CONNECTION ERROR (curl exit $curlExit)" -ForegroundColor Red
    continue
  }
  $body = if (Test-Path $temp) { Get-Content $temp -Raw } else { "" }
  if ($meta -match "HTTP=200" -and $body.Trim() -eq $expected) {
    Write-Host "RESULT: PASS - correct publisher line served" -ForegroundColor Green
  } else {
    Write-Host "RESULT: CHECK - expected HTTP 200 and exact publisher line" -ForegroundColor Yellow
    Write-Host "BODY: $body"
  }
}
if (Test-Path $temp) { Remove-Item $temp -Force }
