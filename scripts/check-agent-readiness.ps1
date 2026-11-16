$ErrorActionPreference = 'Stop'
$Base = 'https://saanwariyasethfashion.com'
$Results = New-Object System.Collections.Generic.List[object]

function Test-Url($Name, $Url, $ExpectedStatus = 200) {
  try {
    $Response = Invoke-WebRequest -Uri $Url -Method Get -MaximumRedirection 5 -UseBasicParsing
    $Status = [int]$Response.StatusCode
    $Results.Add([pscustomobject]@{ Check = $Name; Status = $Status; Pass = ($Status -eq $ExpectedStatus); Detail = $Response.Headers['Content-Type'] })
    return $Response
  } catch {
    $Status = 0
    if ($_.Exception.Response) { $Status = [int]$_.Exception.Response.StatusCode }
    $Results.Add([pscustomobject]@{ Check = $Name; Status = $Status; Pass = $false; Detail = $_.Exception.Message })
    return $null
  }
}

$Robots = Test-Url 'robots.txt' "$Base/robots.txt"
$null = Test-Url 'sitemap.xml' "$Base/sitemap.xml"
$null = Test-Url 'llms.txt' "$Base/llms.txt"
$null = Test-Url 'AI Catalog' "$Base/.well-known/ai-catalog.json"
$null = Test-Url 'Legacy MCP Server Card' "$Base/.well-known/mcp/server-card.json"
$null = Test-Url 'Current MCP Server Card' "$Base/api/mcp/server-card"
$Ads = Test-Url 'ads.txt' "$Base/ads.txt"

if ($Robots) {
  $Text = [string]$Robots.Content
  $Results.Add([pscustomobject]@{ Check = 'Content-Signal directive'; Status = 'Text'; Pass = ($Text -match '(?m)^Content-Signal:\s*search=yes,\s*ai-train=no\s*$'); Detail = 'robots.txt content' })
  $Results.Add([pscustomobject]@{ Check = 'Sitemap directive'; Status = 'Text'; Pass = ($Text -match '(?m)^Sitemap:\s*https://saanwariyasethfashion\.com/sitemap\.xml\s*$'); Detail = 'robots.txt content' })
}

try {
  $Html = Invoke-WebRequest -Uri "$Base/" -Headers @{ Accept = 'text/html' } -MaximumRedirection 5 -UseBasicParsing
  $HasJsonLd = ([string]$Html.Content -match 'application/ld\+json')
  $Results.Add([pscustomobject]@{ Check = 'Homepage JSON-LD'; Status = [int]$Html.StatusCode; Pass = ($Html.StatusCode -eq 200 -and $HasJsonLd); Detail = 'application/ld+json in rendered HTML' })
} catch {
  $Results.Add([pscustomobject]@{ Check = 'Homepage JSON-LD'; Status = 0; Pass = $false; Detail = $_.Exception.Message })
}

try {
  $Markdown = Invoke-WebRequest -Uri "$Base/" -Headers @{ Accept = 'text/markdown' } -MaximumRedirection 5 -UseBasicParsing
  $ContentType = [string]$Markdown.Headers['Content-Type']
  $Pass = ($Markdown.StatusCode -eq 200 -and $ContentType -match 'text/markdown')
  $Results.Add([pscustomobject]@{ Check = 'Markdown negotiation'; Status = [int]$Markdown.StatusCode; Pass = $Pass; Detail = $ContentType })
} catch {
  $Results.Add([pscustomobject]@{ Check = 'Markdown negotiation'; Status = 0; Pass = $false; Detail = $_.Exception.Message })
}

if ($Ads) {
  $AdsText = [string]$Ads.Content
  $HasSeller = $AdsText -match 'google\.com,\s*pub-7776844434912624,\s*DIRECT,\s*f08c47fec0942fa0'
  $Results.Add([pscustomobject]@{ Check = 'AdSense seller record'; Status = 'Text'; Pass = $HasSeller; Detail = 'Publisher line present' })
}

$Results | Format-Table -AutoSize -Wrap
$Failures = @($Results | Where-Object { -not $_.Pass })
Write-Host "`nPassed: $($Results.Count - $Failures.Count) / $($Results.Count)"
if ($Failures.Count -gt 0) {
  Write-Host 'One or more public checks failed. Confirm the latest Hostinger deployment and inspect those endpoints.' -ForegroundColor Yellow
  exit 1
}
Write-Host 'All public agent-readiness HTTP checks passed.' -ForegroundColor Green
