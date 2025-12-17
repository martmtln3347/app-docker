# 🎮 Maets Backend — Bloc 2 POC

Backend de démonstration pour la plateforme **Maets**, une librairie de jeux vidéo en ligne.  
Projet développé en **Node.js / Express**, avec **MariaDB** (SQL) et **MongoDB** (NoSQL).  
Il répond à l’ensemble des critères du **Bloc 2 – Conception et Développement Back-End** (Efrei 2025).

---

## 🚀 Fonctionnalités principales

- 🔐 Authentification et inscription utilisateurs (**/auth/register**, **/auth/login**) avec **bcrypt** et **JWT**
- 🎮 Gestion complète d’un catalogue de jeux (**/games**) stockés en SQL
- 📚 Librairie personnelle de jeux pour chaque utilisateur (**/me/library**)
- ⚙️ Configuration spécifique à chaque jeu (graphismes, langue, etc.) stockée en **MongoDB**
- 🧩 Sécurité : mots de passe hashés, tokens JWT, rôles (**USER** / **ADMIN**)
- 📘 Documentation complète de l’API avec **Swagger** (OpenAPI 3.1)
- 🧪 Tests automatisés avec **Mocha + Chai + Supertest**
- 💾 Sauvegarde automatique SQL et MongoDB (critère C13)
- 🔒 Serveur **HTTPS valide** avec certificat **mkcert**

---

## 📁 Structure du projet

```
projet-backend/
│
├── app.js                # Point d’entrée principal
├── seed.sql              # Jeu de données SQL
├── scripts/              # Scripts utilitaires
│   ├── seed.js
│   ├── backup-sql.js
│   ├── backup-mongo.js
│   └── restore-mongo.js
│
├── Controleur/           # Logique métier (CRUD)
│   ├── user.controller.js
│   ├── game.controller.js
│   ├── library.controller.js
│   └── config.controller.js
│
├── Modele/               # Modèles SQL (Sequelize) et NoSQL (Mongoose)
│   ├── user.model.js
│   ├── game.model.js
│   ├── library.model.js
│   ├── role.model.js
│   └── config.model.js
│
├── Vue/                  # Formatage des réponses JSON (DTO)
│   ├── user.view.js
│   └── game.view.js
│
├── routes/               # Endpoints REST
│   ├── user.routes.js
│   ├── game.routes.js
│   ├── library.routes.js
│   └── config.routes.js
│
├── middlewares/          # Sécurité et gestion d’erreurs
│   ├── auth.js
│   └── error.js
│
├── config/               # Connexions DB + Swagger
│   ├── sequelize.js
│   ├── mongo.js
│   └── swagger.js
│
├── ssl/                  # Certificats HTTPS (mkcert)
│   ├── localhost-key.pem
│   └── localhost-cert.pem
│
└── tests/                # Tests Mocha + Chai
```

---



---

## 🧰 Environnement de développement

L’environnement de développement du projet **Maets Backend** a été configuré et personnalisé afin d’assurer une expérience fluide, sécurisée et homogène entre les différents environnements (développement, test et production).

### 🔧 Outils et configuration

Utilisation de VSCode pour le développement.

Le projet repose sur **Node.js 18+** et un ensemble d’outils cohérents :  
- **Express** pour le serveur web  
- **Sequelize** (ORM SQL) et **Mongoose** (ODM NoSQL)  
- **dotenv** pour la gestion centralisée des variables d’environnement  
- **Mocha + Chai + Supertest** pour les tests unitaires et d’intégration  
- **c8** pour la couverture de code  
- **Swagger JSDoc** pour la documentation automatique de l’API
- **Docker / Docker Compose** pour un environnement local reproductibl(bases de données et exécution en conteneur)  

Les variables sensibles (ports, mots de passe, secrets JWT, URLs de bases de données) sont stockées dans un fichier `.env` non versionné. Un modèle `.env.sample` est fourni pour garantir une configuration reproductible sur tout poste de développement.

### 💻 Organisation de l’environnement local

Le développement se fait sur un environnement local complet :  
- **MariaDB** pour la partie SQL  
- **MongoDB** pour la partie NoSQL  

Un script `seed.js` initialise automatiquement la base de données via :

```bash
npm run seed
```

Les données de test (utilisateurs, rôles, jeux) sont injectées grâce au fichier `seed.sql`, garantissant la portabilité entre environnements.

### 🔒 Sécurité et confort de développement

Le serveur est également accessible en **HTTPS local** via un certificat auto-signé généré avec **mkcert**.  
Cela permet de simuler un environnement de production sécurisé sans déclencher d’avertissement navigateur :

```bash
mkcert -install
mkcert -key-file ssl/localhost-key.pem -cert-file ssl/localhost-cert.pem localhost 127.0.0.1 ::1
```

### ⚙️ Automatisation

Des scripts dédiés simplifient les tâches courantes :
- `npm run seed` → initialise la base SQL  
- `npm run backup:sql` / `npm run backup:mongo` → sauvegardes automatiques  
- `npm test` → exécute la suite de tests avec configuration isolée (`NODE_ENV=test`)  
- `npm start` → lance simultanément les serveurs HTTP et HTTPS avec vérification automatique des connexions SQL et NoSQL  

Cette organisation assure une **installation rapide**, une **reproductibilité complète** et une **maintenance facilitée**.


## ⚙️ Installation

### 1️⃣ Cloner le projet

```bash
git clone <url-du-projet>
cd projet-backend
```

### 2️⃣ Installer les dépendances

```bash
npm install
```

### 3️⃣ Créer le fichier `.env`

```env
PORT=3000
JWT_SECRET=supersecret

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=maets
MYSQL_PASSWORD=maets
MYSQL_DATABASE=maets

MONGO_URL=mongodb://localhost:27017/maets_nosql
SSL_PORT=3443
```

### 4️⃣ Initialiser la base SQL

```bash
npm run seed
```

➡️ Crée les rôles, utilisateurs et jeux de test :
- **admin@maets.com / password** → ROLE_ADMIN  
- **alice@maets.com / password** → ROLE_USER  
- **bob@maets.com / password** → ROLE_USER  

### 5️⃣ Lancer le serveur

```bash
npm start
```

📍 Accès :
- **HTTP** → http://localhost:3000  
- **HTTPS** → https://localhost:3443  
- **Swagger** → https://localhost:3443/docs  

---

## 🛣️ Endpoints principaux

### 🔑 Authentification
- **POST /auth/register** → créer un utilisateur  
- **POST /auth/login** → se connecter et recevoir un JWT  

### 🎮 Jeux
- **GET /games** → liste des jeux  
- **POST /games** *(admin)* → ajouter un jeu  
- **PATCH /games/:id** *(admin)* → modifier un jeu  
- **DELETE /games/:id** *(admin)* → supprimer un jeu  

### 📚 Librairie utilisateur
- **GET /me/library** → voir sa collection  
- **POST /me/library/:gameId** → ajouter un jeu  
- **DELETE /me/library/:gameId** → retirer un jeu  

### ⚙️ Configurations (MongoDB)
- **GET /me/configs/:gameId** → lire config d’un jeu  
- **PUT /me/configs/:gameId** → créer ou modifier config  

---

## 🧩 Stack technique

- **Node.js + Express** → API REST  
- **Sequelize** → ORM SQL (MariaDB)  
- **Mongoose** → ODM NoSQL (MongoDB)  
- **JWT + bcrypt** → Sécurité et authentification  
- **Mocha / Chai / Supertest** → Tests automatisés  
- **Swagger (OpenAPI 3.1)** → Documentation  
- **mkcert** → HTTPS local sans alerte  
- **dotenv + c8** → Variables d’environnement et couverture  

---

## 💾 Sauvegardes (Critère C13)

### 🔹 Sauvegarde SQL

```bash
npm run backup:sql
```
→ Crée `backups/mysql-YYYY-MM-DD-HH-MM.sql`

### 🔹 Sauvegarde MongoDB

```bash
npm run backup:mongo
```
→ Crée `backups/mongo-YYYY-MM-DD-HH-MM/`

### 🔹 Restauration MongoDB

```bash
npm run restore:mongo -- backups/mongo-YYYY-MM-DD-HH-MM
```

---

## 🔒 HTTPS (Critère C15)

Le serveur utilise un certificat **mkcert** localement fiable pour supprimer les alertes de sécurité du navigateur.  

Pour le générer :

```bash
mkcert -install
mkcert -key-file ssl/localhost-key.pem -cert-file ssl/localhost-cert.pem localhost 127.0.0.1 ::1
```

➡️ L’application démarre ensuite en HTTPS sur  
👉 **https://localhost:3443**

---

## 🧪 Tests

Lancer les tests automatisés :

```bash
npm test
```

Sortie attendue :

```
15 passing
0 failing
Coverage: ~90%
```

Les tests valident :
- Authentification et JWT  
- Autorisations USER / ADMIN  
- CRUD des jeux  
- Librairie utilisateur  
- Configurations MongoDB  

---

## 📚 Documentation Swagger

Accessible via :  
👉 **https://localhost:3443/docs**

**Tags disponibles :**
- `Auth` → création et connexion utilisateur  
- `Games` → gestion du catalogue  
- `Library` → jeux de l’utilisateur  
- `Configs` → préférences MongoDB  

Toutes les routes protégées nécessitent :

```
Authorization: Bearer <token>
```

---

## 🧠 Architecture SQL / NoSQL

### 💾 SQL (MariaDB)
Utilisé pour :
- Utilisateurs, rôles, jeux, bibliothèques  

Schéma :
- `users (1..n) user_role (n..1) role`
- `users (n..n) user_game (n..n) jeux`

### 🧩 NoSQL (MongoDB)
Utilisé pour :
- Configurations dynamiques par utilisateur et jeu  

Exemple :

```json
{
  "userId": 2,
  "gameId": 3,
  "settings": {
    "difficulty": "hard",
    "resolution": "1440p",
    "language": "en",
    "dlcs": ["Hearts of Stone"]
  }
}
```

---

## 🧰 Commandes utiles

| Commande | Description |
|-----------|-------------|
| `npm start` | Lance le serveur (HTTP + HTTPS) |
| `npm run seed` | Initialise la base SQL |
| `npm test` | Exécute les tests |
| `npm run backup:sql` | Sauvegarde MariaDB |
| `npm run backup:mongo` | Sauvegarde MongoDB |
| `npm run restore:mongo` | Restaure MongoDB |

---

## 🧾 Notes pédagogiques (Bloc 2)

- **E3 – Épreuve 3** → preuve de conception et BDD SQL / NoSQL fonctionnelles  
- **E4 – Épreuve 4** → API sécurisée, testée, documentée  
- **Module Back-End** → respect du MVC, REST, sauvegardes et HTTPS  


