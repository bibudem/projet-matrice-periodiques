# Matrice des périodiques

Application web de gestion et de suivi des périodiques pour la Direction des bibliothèques de l'Université de Montréal.

---

## Fonctionnalites

- Gestion des périodiques (archives, prix, historique, notes, plateformes)
- Collecte des statistiques d'utilisation via le protocole SUSHI
- Import de données par fichier CSV
- Export des données vers Excel
- Visualisation graphique des statistiques
- Authentification via Azure Active Directory (comptes UdeM)

---

## Technologies

- **Frontend** : Angular 12, Angular Material, Bootstrap, ApexCharts
- **Backend** : Node.js, Express, MySQL
- **Authentification** : Azure AD OAuth2 (Passport.js)

---

## Prerequis

- Node.js >= 14.x
- Angular CLI 12 (`npm install -g @angular/cli@12`)
- Serveur MySQL
- Acces au réseau UdeM

---

## Installation et démarrage

### Backend

```bash
cd backend
npm install
npm start
# Démarre sur le port 9110
```

### Frontend

```bash
yarn install
ng serve
# Accessible sur http://localhost:4200
```

---

## Variables d'environnement

Créer un fichier `.env` dans le dossier `backend/` :

```env
PORT=9110
NODE_ENV=development
SESSION_SECRET=

DB_HOST=
DB_PORT=3306
DB_NAME=
DB_USER=
DB_PASSWORD=

AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=
```

---

## Auteurs

Développé par Natalia Jabinschi — Direction des bibliothèques, Université de Montréal.

© Université de Montréal — Tous droits réservés.
