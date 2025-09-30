@echo off
echo 🚀 Starting B2B E-commerce Platform
echo.

echo 📦 Installing dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ❌ Server dependencies installation failed
    pause
    exit /b 1
)

cd ..\client
call npm install
if %errorlevel% neq 0 (
    echo ❌ Client dependencies installation failed
    pause
    exit /b 1
)

echo.
echo ✅ Dependencies installed successfully!
echo.

echo 🧪 Running tests...
cd ..\server
node test-without-db.js
echo.

echo 📝 Database Setup Required:
echo 1. Go to https://cloud.mongodb.com/
echo 2. Navigate to Network Access
echo 3. Click "Add IP Address"
echo 4. Select "Allow access from anywhere" (0.0.0.0/0)
echo 5. Wait 2-3 minutes for changes to take effect
echo.

echo 🚀 Starting the application...
echo.
echo Starting server on http://localhost:5000
start "Server" cmd /k "cd server && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting client on http://localhost:5173
start "Client" cmd /k "cd client && npm run dev"

echo.
echo 🎉 Application started successfully!
echo.
echo 📝 Next steps:
echo 1. Fix MongoDB database connection (see instructions above)
echo 2. Open http://localhost:5173 in your browser
echo 3. Register as a seller and test the platform
echo.
echo Press any key to exit...
pause >nul


