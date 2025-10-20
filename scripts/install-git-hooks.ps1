Param(
    [Parameter(Position = 0, Mandatory = $false)]
    [string]$RepoPath = "."
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)

Set-Location $RepoPath

if (-not (Test-Path ".git")) {
    Write-Host "Не git-репозиторий: $RepoPath" -ForegroundColor Red
    exit 1
}

$hooksDir = Join-Path ".git" "hooks"
New-Item -ItemType Directory -Force -Path $hooksDir | Out-Null

$srcPostCommit = Join-Path "scripts" "hooks/post-commit"
$srcPostMerge  = Join-Path "scripts" "hooks/post-merge"

if (-not (Test-Path $srcPostCommit) -or -not (Test-Path $srcPostMerge)) {
    Write-Host "Файлы хуков не найдены в scripts/hooks" -ForegroundColor Red
    exit 1
}

Copy-Item $srcPostCommit (Join-Path $hooksDir "post-commit") -Force
Copy-Item $srcPostMerge  (Join-Path $hooksDir "post-merge")  -Force

Write-Host "Git-хуки установлены: post-commit, post-merge" -ForegroundColor Green


