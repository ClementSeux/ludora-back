# 🚀 Ludora API - Docker Deployment Script for Windows
# This script automates the Docker deployment process

Write-Host "🚀 Starting Ludora API Docker deployment..." -ForegroundColor Blue

# Stop and remove existing containers
Write-Host "`n📦 Stopping existing containers..." -ForegroundColor Yellow
docker compose down

# Remove old images (optional - uncomment if you want to rebuild from scratch)
# Write-Host "`n🗑️  Removing old images..." -ForegroundColor Yellow
# docker compose down --rmi all

# Build and start containers
Write-Host "`n🔨 Building and starting containers..." -ForegroundColor Cyan
docker compose up -d --build

# Wait for containers to start
Write-Host "`n⏳ Waiting for containers to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check container status
Write-Host "`n📊 Container Status:" -ForegroundColor Green
docker compose ps

# Show logs
Write-Host "`n📋 Recent logs:" -ForegroundColor Cyan
docker compose logs --tail=20

# Display access information
Write-Host "`n✅ Deployment completed!" -ForegroundColor Green
Write-Host "`n🌐 Your API is now available at:" -ForegroundColor Cyan
Write-Host "   • API: http://localhost:8080" -ForegroundColor White
Write-Host "   • Swagger Docs: http://localhost:8080/api-docs" -ForegroundColor White
Write-Host "   • Prisma Studio: http://localhost:5556" -ForegroundColor White
Write-Host "`n📋 Useful commands:" -ForegroundColor Yellow
Write-Host "   • View logs: docker compose logs -f api" -ForegroundColor White
Write-Host "   • Stop containers: docker compose stop" -ForegroundColor White
Write-Host "   • Restart: docker compose restart" -ForegroundColor White
Write-Host "   • Remove all: docker compose down" -ForegroundColor White
Write-Host "`n🎉 Done!" -ForegroundColor Green
