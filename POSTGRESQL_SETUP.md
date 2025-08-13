# 🚀 Guide de Configuration PostgreSQL Local

## Étapes de configuration

### 1. Créer la base de données

```bash
# Exécuter le script automatique
.\create-database.bat

# OU manuellement avec psql :
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres
```

### 2. Commandes SQL manuelles (si nécessaire)

```sql
-- Créer l'utilisateur
CREATE USER ludora_user WITH PASSWORD 'ludora_password123';

-- Créer la base de données
CREATE DATABASE ludora OWNER ludora_user;

-- Se connecter à la base ludora
\c ludora;

-- Configurer les privilèges
GRANT ALL PRIVILEGES ON SCHEMA public TO ludora_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ludora_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ludora_user;
```

### 3. Vérifier la connexion

```bash
# Tester la connexion
node test-db.js
```

### 4. Initialiser la base

```bash
# Créer les tables
npm run db:migrate

# Insérer les données de test
npm run db:seed
```

### 5. Démarrer l'API

```bash
npm run dev
```

## Informations de connexion

-   **Host** : localhost
-   **Port** : 5432
-   **Database** : ludora
-   **User** : ludora_user
-   **Password** : ludora_password123

## URL de connexion

```
postgresql://ludora_user:ludora_password123@localhost:5432/ludora?schema=public
```

## Résolution des problèmes

### PostgreSQL n'est pas dans le PATH

Ajoutez à votre PATH : `C:\Program Files\PostgreSQL\16\bin\`

### Erreur d'authentification

1. Vérifiez le mot de passe de l'utilisateur `postgres`
2. Modifiez `pg_hba.conf` si nécessaire
3. Redémarrez le service PostgreSQL

### Service PostgreSQL non démarré

```bash
# Windows Services
services.msc -> PostgreSQL -> Démarrer
```

## Outils recommandés

-   **pgAdmin** : Interface graphique pour PostgreSQL
-   **DBeaver** : Client universel de base de données
-   **DataGrip** : IDE JetBrains pour bases de données
