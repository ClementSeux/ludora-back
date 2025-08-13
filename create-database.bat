@echo off
echo 🗄️  Configuration automatique de la base de données Ludora

set PGPATH="C:\Program Files\PostgreSQL\16\bin\psql.exe"

echo.
echo 📝 Ce script va créer :
echo    - Utilisateur : ludora_user
echo    - Mot de passe : ludora_password123  
echo    - Base de données : ludora
echo.

echo 🔑 Vous devrez entrer le mot de passe de l'utilisateur 'postgres'
echo.

echo 👤 Création de l'utilisateur ludora_user...
%PGPATH% -U postgres -c "CREATE USER ludora_user WITH PASSWORD 'ludora_password123';"

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erreur lors de la création de l'utilisateur
    echo 💡 L'utilisateur existe peut-être déjà, continuons...
)

echo.
echo 🗄️  Création de la base de données ludora...
%PGPATH% -U postgres -c "CREATE DATABASE ludora OWNER ludora_user;"

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erreur lors de la création de la base de données
    echo 💡 La base existe peut-être déjà, continuons...
)

echo.
echo 🔐 Configuration des privilèges...
%PGPATH% -U postgres -d ludora -c "GRANT ALL PRIVILEGES ON SCHEMA public TO ludora_user; GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ludora_user; GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ludora_user;"

echo.
echo ✅ Configuration terminée !
echo.
echo 🔧 Mise à jour du fichier .env...

echo NODE_ENV=development > .env.new
echo PORT=3000 >> .env.new
echo DATABASE_URL="postgresql://ludora_user:ludora_password123@localhost:5432/ludora?schema=public" >> .env.new
echo JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-make-it-very-long-and-random" >> .env.new
echo JWT_EXPIRES_IN="7d" >> .env.new

move .env.new .env

echo ✅ Fichier .env mis à jour !
echo.
echo 🚀 Prochaines étapes :
echo    1. npm run db:migrate (créer les tables)
echo    2. npm run db:seed (insérer les données de test)
echo    3. npm run dev (démarrer le serveur)
echo.

pause
