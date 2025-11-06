@echo off
echo === HotelSaver.ng Database Setup Helper ===
echo.

echo Step 1: Checking Node.js installation...
where node
if %ERRORLEVEL% NEQ 0 (
    echo Node.js not found in PATH!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Make sure to check "Add to PATH" during installation
    pause
    exit /b 1
)

echo Node.js found! Version:
node --version

echo.
echo Step 2: Checking npm...
where npm
if %ERRORLEVEL% NEQ 0 (
    echo npm not found!
    pause
    exit /b 1
)

echo npm found! Version:
npm --version

echo.
echo Step 3: Testing Prisma database connection...
echo Applying schema to Neon database...
npx prisma db push

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ SUCCESS! Database schema applied successfully!
    echo.
    echo Step 4: Generating Prisma client...
    npx prisma generate
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ✅ SUCCESS! Prisma client generated!
        echo.
        echo Your database is ready! Next steps:
        echo 1. Run hotel migration script
        echo 2. Switch to database mode in .env
        echo 3. Test admin portal
    ) else (
        echo ❌ Failed to generate Prisma client
    )
) else (
    echo.
    echo ❌ Failed to apply database schema
    echo Check your DATABASE_URL in .env file
)

echo.
pause