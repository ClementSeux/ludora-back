@echo off
echo 🚀 Setting up Ludora Backend Development Environment

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ first.
    pause
    exit /b 1
)

:: Check if PostgreSQL is installed
psql --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  PostgreSQL is not installed. Please install PostgreSQL and create a database.
    echo    Then update the DATABASE_URL in .env file
)

:: Install dependencies
echo 📦 Installing dependencies...
npm install

:: Check if .env exists
if not exist .env (
    echo 📝 Creating .env file from example...
    copy .env.example .env >nul
    echo ⚠️  Please update the DATABASE_URL in .env with your database credentials
)

echo 🔧 Generating Prisma client...
npx prisma generate

echo 📊 Setting up database...
echo    Please make sure your PostgreSQL database is running and accessible
echo    Then run: npm run db:migrate
echo    And: npm run db:seed

echo.
echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Update DATABASE_URL in .env with your database credentials
echo 2. Run 'npm run db:migrate' to create database tables
echo 3. Run 'npm run db:seed' to populate with initial data
echo 4. Run 'npm run dev' to start the development server
echo.
echo Default admin credentials (after seeding):
echo Email: admin@ludora.com
echo Password: admin123

pause
