Write-Host "`nBuilding project..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "Build failed." -ForegroundColor Red; exit 1 }

Write-Host "`nDeploying to Netlify (functions + static)..." -ForegroundColor Cyan
netlify deploy --prod --dir=out --functions=netlify/functions

Write-Host "`nDone! Check watchesbyfahad.com" -ForegroundColor Green
