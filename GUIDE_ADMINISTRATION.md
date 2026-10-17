# Domaine des villas du lac — Guide d'administration (17 octobre 2026)

Site : https://domaine-des-villas-du-lac.netlify.app
Administration : https://domaine-des-villas-du-lac.netlify.app/admin.html
Catalogue : https://domaine-des-villas-du-lac.netlify.app/terrains.html

## Activer l'accès Google (action du propriétaire Netlify)

1. Dans https://app.netlify.com/projects/domaine-des-villas-du-lac/identity , **Enable Identity**.
2. Choisir **Invite only** dans Identity > Registration; activer **Google** dans Identity > External providers.
3. Inviter les adresses Google autorisées dans Identity > Users et attribuer le rôle `admin` aux administrateurs.
4. Dans la configuration Netlify, créer la variable d'environnement **`ADMIN_ALLOWED_EMAILS`** avec les adresses autorisées, séparées par une virgule, portée **Functions**. Ne publier aucune adresse ou secret dans le dépôt GitHub.
5. Redéployer après modification des variables. Tester la connexion Google sur le site déployé (elle ne se teste pas localement via netlify dev).

**Important :** le rôle `admin` ET la liste `ADMIN_ALLOWED_EMAILS` sont vérifiés côté serveur. Une adresse Gmail seule ne suffit pas. Si l'un manque, l'administration est refusée.

## Modifier un des 16 terrains

1. Ouvrir `/admin.html`, se connecter via Google et sélectionner un lot dans la liste.
2. Mettre à jour sa présentation, le prix demandé, son statut et sa photographie. Ne présenter un lot comme disponible ou constructible qu'après confirmation professionnelle et droit de vente.
3. Utiliser le téléversement pour ajouter image ou PDF; vérifier les droits d'utilisation et la confidentialité avant de publier un fichier.
4. Enregistrer puis vérifier la fiche publique dans `/terrains/{numero}.html`.

## Ajouter un nouveau lot cadastral

Le registre initial est volontairement limité aux **16 lots recensés et deux emprises routières séparées**. L'interface administrateur déployée modifie et peut masquer les annonces existantes, mais **ne crée pas automatiquement un 17e lot cadastral**.

Pour ajouter une nouvelle parcelle officiellement vérifiée : obtenir les plans Infolot/titres et la géométrie valide; actualiser `assets/data.js`, `assets/lots-geo.json`, les contraintes, les tests et la génération des pages `terrains/*.html`; soumettre une PR GitHub et valider les contrôles automatisés avant fusion. Ne jamais ajouter un numéro cadastral fictif ni présumer un droit de construire.

## Carte et coûts

La carte utilise **OpenStreetMap + Leaflet**, avec des liens Google Maps en vue satellite sur chaque fiche. Aucune clé Google Maps ni service de cartographie payant n'est nécessaire pour la version actuelle. Le site utilise Netlify et ses fonctionnalités incluses suivant les limites du forfait; vérifier l'utilisation afin de rester dans les quotas gratuits.

## Fiabilité et sécurité

Les surfaces sont graphiques, non des mesures légales certifiées. Les valeurs internes de négociation, documents fiscaux et titres nominatifs ne doivent jamais être publiés dans le dépôt public. L'espace client synchronise favoris et demandes après activation de Netlify Identity; les documents privés ne deviennent accessibles qu'une fois explicitement partagés via un mécanisme sécurisé.

Les formulaires de contact et fonctions d'administration n'ont pas été vérifiés avec une authentification réelle faute de configuration Identity et de liste d'emails autorisés.
