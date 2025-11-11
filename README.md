# GlobeTelecom Admin

Interface d'administration Next.js 15 pour la gestion des messages de contact GlobeTelecom stockés en PostgreSQL.

## 🚀 Fonctionnalités

### 📊 Dashboard Analytics (NOUVEAU !)
- **Métriques en temps réel** : total messages, activité quotidienne, tendances
- **Graphiques interactifs** : évolution temporelle, répartition des services
- **Indicateurs clés** : taux d'acceptation, analyse par heure
- **Activité récente** : derniers messages et domaines populaires

### 📧 Gestion des Messages
- **Interface sécurisée** avec authentification Basic Auth
- **Consultation des messages** avec recherche avancée et filtres
- **Tri et pagination** des résultats
- **Export CSV** optimisé pour téléchargement direct
- **Vue détaillée** des messages dans une modal
- **Suppression** de messages (optionnelle)

### 🎨 Interface Moderne
- **Navigation sidebar** responsive avec menu mobile
- **Design Glass Morphism** avec gradients et effets visuels
- **Thème cohérent** aux couleurs GlobeTelecom
- **Composants shadcn/ui** pour une UX professionnelle

### 🔔 Système de Notifications (NOUVEAU !)
- **Toast notifications** avec Sonner pour feedback utilisateur
- **Notifications temps réel** sur les actions (export, suppression, etc.)
- **Messages d'erreur** informatifs avec descriptions détaillées
- **Notifications de succès** pour confirmer les opérations

### 📋 Pages Complètes (NOUVEAU !)
- **Page Rapports** : génération d'exports avancés, filtres par date, aperçu
- **Page Paramètres** : configuration sécurité, notifications, base de données
- **Interface unifiée** : navigation fluide entre toutes les sections

## 🛠️ Stack technique

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** pour les composants
- **PostgreSQL** avec pg
- **CSV Writer** pour l'export

## 📊 Structure de la base de données

**Base:** `globe_telecom`
**Table:** `globetelecom.messages_contact`

```sql
CREATE TABLE globetelecom.messages_contact (
  id SERIAL PRIMARY KEY,
  prenom VARCHAR(100) NOT NULL,
  nom VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telephone VARCHAR(20),
  installation BOOLEAN DEFAULT FALSE,
  maintenance BOOLEAN DEFAULT FALSE,
  surveillance BOOLEAN DEFAULT FALSE,
  consultation BOOLEAN DEFAULT FALSE,
  message TEXT,
  recevoir_offres BOOLEAN DEFAULT FALSE,
  accepte_conditions BOOLEAN DEFAULT FALSE,
  date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address INET,
  user_agent TEXT
);
```

## ⚙️ Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd GlobeTelecomAdmin
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de l'environnement**
```bash
cp .env.example .env.local
```

Modifier `.env.local` avec vos valeurs :
```env
DATABASE_URL=postgresql://username:password@localhost:5432/globe_telecom
ADMIN_USER=admin
ADMIN_PASSWORD=your-secure-password
```

4. **Vérifier la connexion PostgreSQL**
Assurez-vous que votre base de données PostgreSQL est accessible et contient la table `globetelecom.messages_contact`.

5. **Lancer le serveur de développement**
```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🔐 Authentification

L'application est protégée par une authentification Basic Auth sur toutes les routes.

**Identifiants par défaut :**
- Utilisateur : `admin`
- Mot de passe : `your-secure-password`

⚠️ **Important :** Changez ces identifiants par défaut en production !

## 🗂️ Structure du projet

```
├── app/
│   ├── api/messages/          # API routes
│   ├── globals.css           # Styles globaux
│   ├── layout.tsx            # Layout principal
│   └── page.tsx              # Page d'accueil
├── components/
│   ├── ui/                   # Composants shadcn/ui
│   ├── MessageTable.tsx     # Table des messages
│   └── MessageDetailModal.tsx # Modal de détail
├── lib/
│   ├── db.ts                 # Connexion PostgreSQL
│   └── services/
│       └── messageService.ts # Service de gestion des messages
├── types/
│   └── message.ts            # Types TypeScript
└── middleware.ts             # Middleware d'authentification
```

## 📡 API Endpoints

### GET `/api/stats` (NOUVEAU !)
Récupère les statistiques complètes pour le dashboard.

**Réponse :**
```json
{
  "metrics": {
    "total": 15,
    "today": 0,
    "week": 15,
    "acceptanceRate": 85.7,
    "offersRate": 67.3,
    "avgPerDay": 0.5,
    "todayTrend": 0
  },
  "charts": {
    "daily": [...],
    "services": [...],
    "hourly": [...],
    "domains": [...]
  },
  "recentActivity": [...]
}
```

### GET `/api/messages`
Récupère la liste des messages avec filtres et pagination.

**Paramètres query :**
- `page` : Numéro de page (défaut: 1)
- `limit` : Nombre d'éléments par page (défaut: 10)
- `search` : Recherche textuelle
- `dateFrom` : Date de début (YYYY-MM-DD)
- `dateTo` : Date de fin (YYYY-MM-DD)
- `services` : Services filtrés (comma-separated)
- `sortBy` : Champ de tri (défaut: date_envoi)
- `sortOrder` : Ordre de tri (asc/desc, défaut: desc)
- `export=csv` : Export au format CSV

### GET `/api/messages/[id]`
Récupère les détails d'un message spécifique.

### DELETE `/api/messages/[id]`
Supprime un message (optionnel).

## 🔒 Sécurité

- **Basic Auth** sur toutes les routes
- **Requêtes paramétrées** pour éviter les injections SQL
- **Validation** des paramètres d'entrée
- **Protection CSRF** intégrée à Next.js

## 🚀 Déploiement

### Variables d'environnement de production
```env
DATABASE_URL=postgresql://user:pass@host:port/globe_telecom
ADMIN_USER=your-admin-username
ADMIN_PASSWORD=your-secure-password
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-domain.com
```

### Build et déploiement
```bash
npm run build
npm start
```

## 📝 Utilisation

### 🎯 **Navigation dans l'application**

L'interface comprend maintenant 4 sections principales :

1. **📊 Dashboard** (http://localhost:3000/dashboard) - Analytics et métriques temps réel
2. **💬 Messages** (http://localhost:3000/) - Gestion des messages de contact  
3. **📋 Rapports** (http://localhost:3000/reports) - Génération d'exports avancés
4. **⚙️ Paramètres** (http://localhost:3000/settings) - Configuration de l'application

### 🔄 **Fonctionnalités principales**

1. **Accès** : Authentifiez-vous (admin / Globe-Admin-2024!)
2. **Dashboard** : Consultez les métriques et graphiques en temps réel
3. **Messages** : Recherchez, filtrez et gérez les messages de contact
4. **Rapports** : Générez des exports CSV personnalisés avec filtres
5. **Paramètres** : Configurez la sécurité, notifications et base de données
6. **Notifications** : Recevez des confirmations toast pour toutes les actions

**Fonctionnalités testées et opérationnelles :**
- ✅ Dashboard avec vos 15 messages réels et statistiques
- ✅ Export CSV avec notifications de progression
- ✅ Suppression avec confirmations toast
- ✅ Navigation sidebar responsive
- ✅ Toutes les pages accessibles et sécurisées

## 🔧 Développement

```bash
# Mode développement
npm run dev

# Build
npm run build

# Lint
npm run lint
```

## 📄 Licence

Ce projet est destiné à un usage interne pour la gestion des messages de contact GlobeTelecom.