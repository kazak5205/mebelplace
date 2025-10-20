Param(
    [Parameter(Position = 0, Mandatory = $false)]
    [string]$Message
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)

try {
    $branch = (git rev-parse --abbrev-ref HEAD).Trim()
} catch {
    Write-Host "Git is not available or this is not a Git repo." -ForegroundColor Red
    exit 1
}

$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "Nothing to commit. Working tree clean." -ForegroundColor Yellow
    exit 0
}

if (-not $Message -or [string]::IsNullOrWhiteSpace($Message)) {
    $now = (Get-Date).ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss 'UTC'")
    $Message = "Auto-commit: $now"
}

git add -A | Out-Null

$null = git commit -m "$Message"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Commit failed. Check above output for details." -ForegroundColor Red
    exit $LASTEXITCODE
}

$null = git push origin $branch
if ($LASTEXITCODE -ne 0) {
    Write-Host "Push failed. Check your remote/credentials." -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "Successfully pushed to branch '$branch'." -ForegroundColor Green


