# Domaine des villas du lac — guide d'utilisation

**Version : 17 octobre 2026.** Hébergement Netlify, site vitrine public et administration protégée. La carte utilise OpenStreetMap; les vues satellite Google s’ouvrent par un lien externe sans clé API Google Maps ni facturation Google.

## Ouvrir le site
Site : https://domaine-des-villas-du-lac.netlify.app/
Catalogue : https://domaine-des-villas-du-lac.netlify.app/terrains.html
Carte : https://domaine-des-villas-du-lac.netlify.app/carte.html
Récapitulatif : https://domaine-des-villas-du-lac.netlify.app/recapitulatif.html
Investisseurs : https://domaine-des-villas-du-lac.netlify.app/investisseurs.html
Espace client : https://domaine-des-villas-du-lac.netlify.app/client.html
Administration : https://domaine-des-villas-du-lac.netlify.app/admin.html

## Activer la connexion Google (action requise dans Netlify)
1. Ouvrir https://app.netlify.com/projects/domaine-des-villas-du-lac/identity.
2. Activer **Netlify Identity**. Dans les paramètres d’inscription, choisir « Open » si tous les clients peuvent se créer un compte Google, ou « Invite only » si l’accès client doit se faire sur invitation.
3. Activer **Google** parmi les fournisseurs externes. Suivre uniquement les instructions affichées dans le tableau de bord Netlify.
4. Inviter ou créer le compte administrateur, puis attribuer **le rôle `admin`** dans les paramètres Identity. L’identité Google seule ne donne aucun privilège.
5. Dans Netlify > Project configuration > Environment variables, créer `ADMIN_ALLOWED_EMAILS` avec l'adresse Gmail administrateur exacte (plusieurs adresses séparées par une virgule), portée **Functions**, et redéployer. Sans cette variable, tout accès administrateur est refusé.
6. Tester /client.html puis /admin.html avec un compte autorisé et un compte sans rôle admin. Les actions d’édition sont validées côté serveur.

**N'inscrire aucune clé ou aucun secret dans GitHub.** Aucune clé Google Maps n’est nécessaire pour le fond de carte actuel. Les fonctions et Netlify Blobs restent soumis aux quotas du forfait Netlify : vérifier l’utilisation si le trafic augmente.

## Modifier une fiche
Se connecter à /admin.html > « Fiches des terrains », sélectionner un lot, modifier le statut, le prix public et la description. Téléverser une vraie photo JPEG/PNG/WebP ou un PDF **destiné au public** (6 Mo maximum). Enregistrer. Les lots d’emprise de rue sont exclus des ventes. Tout statut « Disponible », « Réservé » ou « Vendu » doit être justifié; le défaut « Information sur demande » évite les annonces erronées.

## Ajouter un 17e terrain (nouveau numéro cadastral)
Le portail suit pour l’instant 16 lots validés dans le registre SIG. L’administration permet de gérer leur contenu, pas d’inventer ou de supprimer des lots cadastraux. Pour un nouveau lot, faire confirmer officiellement le lot et sa contenance, puis ajouter son identifiant, aire et statut dans `assets/data.js`, ajouter sa géométrie à `assets/lots-geo.json`, créer sa fiche `terrains/NUMERO.html`, adapter les validations et redéployer GitHub/Netlify. Retirer de la vente ne signifie pas supprimer juridiquement le lot.

## Contact et confidentialité
Le formulaire Contact enregistre les demandes dans **Netlify Blobs**. L’espace administrateur autorisé consulte les demandes reçues. Les favoris et les demandes envoyées depuis l’espace client sont associés à son compte. Les photos/PDF téléversés via l’éditeur sont publics; il ne faut jamais y déposer les titres, données fiscales, offres d’achat, pièces d’identité ou documents bancaires. La gestion de documents clients privés individualisés n'est pas encore configurée.

## À vérifier avant de commercialiser
Une superficie SIG n’est ni un bornage ni une preuve de titre. Les statuts de vente, les droits d’accès, l’approbation historique de Deauville, les milieux humides, les servitudes, les usages autorisés, l’électricité/l’internet, les puits et l’assainissement doivent être confirmés par les professionnels et la Ville.

## Maintenance
Les changements sur `main` de GitHub déclenchent le déploiement Netlify. Vérifier l’état « ready » et le SHA GitHub correspondant avant d’annoncer une mise à jour. Les tests sont exécutés sous GitHub Actions. 

## Étude du coût de la rue — 18 octobre 2026

La page publique `/voirie.html` explique le prolongement, les trois longueurs contradictoires (452 m, 454,295 m, 478 m) et les validations techniques requises. Un modèle Excel **privé** séparé, `Domaine_Villas_MODELE_ROUTE_FINANCE_2026-10-18.xlsx`, contient les hypothèses de prix unitaires, un bordereau de 18 postes, les trois scénarios, un modèle de rentabilité conditionnel et les références publiques. **Ne pas copier ce fichier dans le dépôt public ni le joindre au site.** Le coût central est une estimation préliminaire non soumissionnée; les autorisations municipales et environnementales ne sont pas confirmées.
