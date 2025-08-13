@echo off
REM 🚀 Ludora API - Windows to VM Transfer Script
REM This script helps transfer your project to the VM

echo 🚀 Ludora API - VM Transfer Helper
echo =====================================

REM Get VM connection details
set /p VM_USER="Enter VM username: "
set /p VM_IP="Enter VM IP address: "
set /p VM_PATH="Enter destination path on VM (default: /home/%VM_USER%/): "

if "%VM_PATH%"=="" set VM_PATH=/home/%VM_USER%/

echo.
echo 📋 Transfer Configuration:
echo    User: %VM_USER%
echo    IP: %VM_IP%
echo    Destination: %VM_PATH%
echo.

REM Check if using SSH key
set /p USE_KEY="Do you want to use SSH key authentication? (y/N): "

if /i "%USE_KEY%"=="y" (
    set /p KEY_PATH="Enter path to your SSH private key: "
    set SSH_OPTS=-i "%KEY_PATH%"
) else (
    set SSH_OPTS=
)

echo.
echo 🔄 Starting file transfer...

REM Create project archive (if 7zip is available)
if exist "C:\Program Files\7-Zip\7z.exe" (
    echo Creating archive...
    "C:\Program Files\7-Zip\7z.exe" a -ttar ludora-back.tar . -xr!node_modules -xr!.git -xr!logs -xr!*.log
    echo Transferring archive...
    scp %SSH_OPTS% ludora-back.tar %VM_USER%@%VM_IP%:%VM_PATH%
    echo Connecting to VM to extract...
    ssh %SSH_OPTS% %VM_USER%@%VM_IP% "cd %VM_PATH% && tar -xf ludora-back.tar && rm ludora-back.tar"
    del ludora-back.tar
) else (
    REM Direct transfer using scp
    echo Transferring files directly...
    scp %SSH_OPTS% -r . %VM_USER%@%VM_IP%:%VM_PATH%ludora-back
)

echo.
echo ✅ Transfer completed!
echo.
echo 📋 Next steps on your VM:
echo    1. SSH to your VM: ssh %SSH_OPTS% %VM_USER%@%VM_IP%
echo    2. Navigate to project: cd %VM_PATH%ludora-back
echo    3. Run deployment script: chmod +x deploy-vm.sh && ./deploy-vm.sh
echo.
echo 🌐 Or transfer this script and run it on the VM:
echo    chmod +x deploy-vm.sh
echo    ./deploy-vm.sh
echo.

set /p CONNECT_NOW="Do you want to connect to the VM now? (y/N): "
if /i "%CONNECT_NOW%"=="y" (
    ssh %SSH_OPTS% %VM_USER%@%VM_IP%
)

pause
