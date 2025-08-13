@echo off
echo 🗄️  Configuration de la base de données PostgreSQL pour Ludora

echo.
echo Étapes à suivre manuellement :
echo.
echo 1️⃣  Ouvrir pgAdmin ou utiliser la ligne de commande PostgreSQL
echo 2️⃣  Se connecter en tant qu'administrateur (généralement 'postgres')
echo 3️⃣  Exécuter le script setup-database.sql
echo.

echo 📍 Localisation probable de PostgreSQL :
echo    - C:\Program Files\PostgreSQL\[version]\bin\
echo    - C:\Program Files (x86)\PostgreSQL\[version]\bin\
echo.

echo 🔍 Recherche des installations PostgreSQL...
for /f "tokens=*" %%i in ('dir "C:\Program Files\PostgreSQL" /b 2^>nul') do (
    echo    Trouvé: C:\Program Files\PostgreSQL\%%i\bin\
    set PGPATH=C:\Program Files\PostgreSQL\%%i\bin
)

for /f "tokens=*" %%i in ('dir "C:\Program Files (x86)\PostgreSQL" /b 2^>nul') do (
    echo    Trouvé: C:\Program Files (x86)\PostgreSQL\%%i\bin\
    set PGPATH=C:\Program Files (x86)\PostgreSQL\%%i\bin
)

if defined PGPATH (
    echo.
    echo ✅ PostgreSQL trouvé dans: %PGPATH%
    echo.
    echo 🚀 Pour exécuter le script automatiquement :
    echo    "%PGPATH%\psql.exe" -U postgres -f setup-database.sql
    echo.
    echo 💡 Ou copiez ce répertoire dans votre PATH pour utiliser psql directement
) else (
    echo.
    echo ❌ PostgreSQL non trouvé dans les emplacements standards
    echo.
    echo 📋 Méthodes alternatives :
    echo    1. Utiliser pgAdmin (interface graphique)
    echo    2. Localiser manuellement l'installation PostgreSQL
    echo    3. Réinstaller PostgreSQL si nécessaire
)

echo.
echo 📝 Après avoir créé la base de données, mettez à jour le fichier .env avec :
echo    DATABASE_URL="postgresql://ludora_user:ludora_password123@localhost:5432/ludora?schema=public"
echo.

pause
