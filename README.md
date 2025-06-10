# Next.js Frontend

Ce projet est une application [Next.js](https://nextjs.org) bootstrappée avec [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Prérequis

- [Node.js](https://nodejs.org/) (version recommandée : 18.x ou supérieure)
- [npm](https://www.npmjs.com/)

## Installation

1. **Cloner le projet :**
   ```bash
   git clone https://github.com/elarbi-allam/test-technique-front.git

   cd test-technique-front
   ```

2. **Installer les dépendances :**
   ```bash
   npm install
   ```

## Configuration des variables d'environnement

Le projet utilise un fichier `.env` pour stocker les variables d'environnement nécessaires à son fonctionnement.  
Un fichier d'exemple `.env.example` est fourni. Pour l'utiliser :

```bash
cp .env.example .env
```

**Explication des variables du `.env` :**

- `NEXT_PUBLIC_API_URL` :  
  L’URL sur laquelle le frontend sera accessible dans le navigateur.  
  Exemple : `http://localhost:3001`

- `BACKEND_URL` :  
  L’URL du backend (serveur principal).  
  Exemple : `http://localhost:3000`  
  > **Remarque :** Le port doit correspondre à celui sur lequel votre backend est lancé.

## Lancement du serveur

Pour démarrer le projet :

```bash
npm run dev
```

Ouvrez ensuite [http://localhost:3001](http://localhost:3001) (ou le port défini dans votre `.env`) dans votre navigateur pour accéder à l'application.