# 📚 Guide Swagger - Ludora API

## 🌐 Accès à la documentation

-   **Interface Swagger UI** : http://localhost:3000/api-docs
-   **JSON Swagger** : http://localhost:3000/api-docs.json

## 🔐 Authentication avec Swagger

### 1. **Connexion**

1. Aller sur `/api/auth/login` dans Swagger
2. Utiliser les identifiants par défaut :
    ```json
    {
        "email": "admin@ludora.com",
        "password": "admin123"
    }
    ```
3. Copier le `token` de la réponse

### 2. **Autorisation**

1. Cliquer sur le bouton **"Authorize"** 🔒 en haut de Swagger
2. Entrer : `Bearer VOTRE_TOKEN_ICI`
3. Cliquer sur **"Authorize"**

## 📖 Fonctionnalités Swagger

### ✅ **Disponible**

-   **Authentication** - Login/Register avec exemples
-   **Users** - Documentation partielle
-   **Schools** - GET et POST documentés
-   **Health Check** - Vérification API

### 🚧 **À compléter**

-   Routes CRUD complètes pour tous les endpoints
-   Exemples de réponses détaillés
-   Schémas de validation d'erreurs

## 🎯 **Endpoints principaux documentés**

### **Authentication**

-   `POST /api/auth/login` - Connexion
-   `POST /api/auth/register` - Inscription

### **Users**

-   `GET /api/users` - Liste utilisateurs (admin)
-   `GET /api/users/{id}` - Utilisateur par ID

### **Schools**

-   `GET /api/schools` - Liste écoles
-   `POST /api/schools` - Créer école

### **Health**

-   `GET /health` - État de l'API

## 🧪 **Test workflow recommandé**

1. **Se connecter** avec `/api/auth/login`
2. **Autoriser** avec le token reçu
3. **Tester** les endpoints protégés
4. **Explorer** les relations entre entités

## 🔧 **Personnalisation**

### **Modifier les exemples**

Éditer `src/docs/swagger-examples.js`

### **Ajouter une route**

```javascript
/**
 * @swagger
 * /api/mon-endpoint:
 *   get:
 *     summary: Description
 *     tags: [MonTag]
 *     responses:
 *       200:
 *         description: Succès
 */
```

### **Nouveaux schémas**

Ajouter dans `src/config/swagger.js` > `components.schemas`

## 📋 **Modèles de données**

Tous les schémas sont définis dans la configuration Swagger :

-   **User** - Utilisateur complet avec relations
-   **UserPersonalInfo** - Informations personnelles
-   **School** - École avec compteurs
-   **Class** - Classe avec créateur
-   **Role** - Rôles système
-   **Activity, Theme, Domain** - Contenu pédagogique

## 🚀 **Prochaines étapes**

1. **Compléter la documentation** des routes manquantes
2. **Ajouter des exemples** pour chaque endpoint
3. **Documenter les erreurs** spécifiques
4. **Ajouter des cas d'usage** complexes

L'interface Swagger est maintenant fonctionnelle et interactive ! 🎉
