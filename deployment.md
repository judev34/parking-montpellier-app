# Guide de déploiement sur Hostinger

Ce document explique comment déployer l'application Vue.js "Parking Montpellier" sur un hébergement Hostinger (sans VPS) à partir d'un dépôt GitHub.

## Prérequis

- Un compte Hostinger
- Un dépôt GitHub contenant le code de l'application
- Les informations de connexion au panneau de contrôle Hostinger (hPanel)

## Étape 1 : Préparer votre application pour la production

1. Assurez-vous que votre fichier `.gitignore` contient les entrées suivantes pour éviter de pousser les variables d'environnement sur GitHub :
   ```
   # Environment variables
   .env
   .env.*
   !.env.example
   ```

2. Créez un fichier `.env.example` pour documenter les variables d'environnement requises sans révéler les valeurs réelles.

3. Avant de déployer, testez localement votre build de production :
   ```bash
   npm run build
   npm run preview
   ```

## Étape 2 : Pousser les changements sur GitHub

1. Ajoutez et committez vos changements :
   ```bash
   git add .
   git commit -m "Préparation pour le déploiement"
   git push origin master
   ```

## Étape 3 : Configurer l'hébergement sur Hostinger

1. Connectez-vous à votre compte Hostinger et accédez à hPanel.

2. Dans la section "Sites Web", sélectionnez votre domaine.

3. Allez dans "Gestionnaire de fichiers" ou utilisez FTP pour accéder à votre espace d'hébergement.

4. Créez un dossier (par exemple, `public_html`) où vous souhaitez déployer l'application.

## Étape 4 : Choisir une méthode de déploiement

### Option 1 : Déploiement manuel

1. Localement, exécutez `npm run build` pour générer les fichiers de production dans le dossier `dist`.

2. Téléchargez les fichiers du dossier `dist` vers le dossier choisi sur Hostinger (par exemple, `public_html`).

### Option 2 : Déploiement automatique avec GitHub Actions

1. Créez un fichier `.github/workflows/deploy.yml` dans votre dépôt avec le contenu suivant :

```yaml
name: Deploy to Hostinger

on:
  push:
    branches: [ master ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22.14.0'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build-prod
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
          VITE_DOMAIN: ${{ secrets.VITE_DOMAIN }}
          VITE_PAYPAL_DONATION_URL: ${{ secrets.VITE_PAYPAL_DONATION_URL }}
          VITE_TIPEEE_DONATION_URL: ${{ secrets.VITE_TIPEEE_DONATION_URL }}
          
      - name: Deploy to Hostinger via FTP
        uses: SamKirkland/FTP-Deploy-Action@v4.3.4
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          protocol: ftp
          port: 21
          local-dir: ./dist/
          server-dir: /public_html/
```

2. Dans les paramètres de votre dépôt GitHub, allez dans "Secrets and variables" > "Actions" et ajoutez les secrets suivants :
   - `FTP_SERVER` : Adresse FTP de Hostinger (généralement ftp.votredomaine.com)
   - `FTP_USERNAME` : Nom d'utilisateur FTP
   - `FTP_PASSWORD` : Mot de passe FTP
   - `VITE_API_BASE_URL`
   - `VITE_DOMAIN`
   - `VITE_PAYPAL_DONATION_URL`
   - `VITE_TIPEEE_DONATION_URL`

## Étape 5 : Configuration du serveur Hostinger

### Configuration pour Single Page Application (SPA)

Pour que votre application Vue Router fonctionne correctement, vous devez configurer la redirection pour une SPA. Créez un fichier `.htaccess` dans le dossier racine de votre site (par exemple, `public_html`) avec le contenu suivant :

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## Étape 6 : Tester votre déploiement

1. Accédez à votre site web (`https://votredomaine.com`) pour vérifier que l'application fonctionne correctement.

2. Testez toutes les fonctionnalités clés, notamment :
   - Navigation entre les différentes pages
   - Affichage des parkings et des informations en temps réel
   - Fonctionnalités de donation

## Résolution des problèmes courants

- **Erreur 404 lors de la navigation** : Vérifiez que le fichier `.htaccess` est correctement configuré.
- **Problèmes d'API** : Vérifiez que `VITE_API_BASE_URL` pointe vers la bonne URL.
- **Erreurs CORS** : Assurez-vous que votre API autorise les requêtes depuis votre domaine.

## Maintenance

Pour mettre à jour votre application :

1. Faites vos modifications localement et testez-les.
2. Poussez les changements sur GitHub.
3. Si vous utilisez GitHub Actions, le déploiement se fera automatiquement.
4. Si vous faites un déploiement manuel, répétez l'étape 4 (Option 1).
