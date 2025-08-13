-- Script de création de la base de données Ludora
-- À exécuter en tant qu'administrateur PostgreSQL

-- Créer l'utilisateur ludora
CREATE USER ludora_user WITH PASSWORD 'ludora_password123';

-- Créer la base de données
CREATE DATABASE ludora OWNER ludora_user;

-- Accorder tous les privilèges à l'utilisateur sur la base
GRANT ALL PRIVILEGES ON DATABASE ludora TO ludora_user;

-- Se connecter à la base ludora et configurer les permissions
\c ludora;

-- Accorder les privilèges sur le schéma public
GRANT ALL PRIVILEGES ON SCHEMA public TO ludora_user;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ludora_user;

GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ludora_user;

-- Configurer les privilèges par défaut pour les futurs objets
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL PRIVILEGES ON TABLES TO ludora_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL PRIVILEGES ON SEQUENCES TO ludora_user;