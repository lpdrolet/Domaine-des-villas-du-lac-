# Société des Villas — Pilotage du développement

Site statique de suivi du projet de Deauville à Sherbrooke, au Québec.
Révision fonctionnelle et cadastrale : **17 octobre 2026**.

## Les trois piliers

1. **Acquisitions** : titres et droits réels, achat conditionnel, quote-part et décisions des partenaires.
2. **Construction de la rue** : deux emprises distinctes, chemin existant, prolongement à mesurer, autorisations et devis.
3. **Ventes** : capacité légale de vendre, dossiers acheteurs, prix comparables et scénarios de commercialisation.

Pages : `index.html`, `revue.html`, `acquisitions.html`, `routes.html`, `ventes.html`, `terrains.html`, `carte.html`, `lot.html`, `finances.html`, `documents.html`.

Le portail commun est dans `assets/portal.js`, la présentation dans `assets/portal.css` et les données non sensibles dans `assets/data.js`.

## Données de référence

| Variable | Valeur | Fiabilité |
| --- | ---: | --- |
| Terrains candidats identifiés | 16 | Concordance graphique, non constructibilité |
| Superficie graphique résidentielle | 65 311,966 m² / env. 703 012 pi² | Polygones cadastraux |
| Lot de rue 1 800 349 | 2 629,327 m² | Mesure SIG |
| Lot de rue 4 889 707 | 9 269,712 m² | Mesure SIG |
| Superficie des deux rues | 11 899,039 m² | Mesure SIG |
| Réseau historique complet | 854,295 m | Tracé SIG ancien |
| Rue déjà construite | env. 400 m | Déclaration à arpenter |
| Reste théorique | env. 454 m | Calcul, non métrage de travaux |
| Ancienne mesure A + B | 452 m | 223 + 229 m |
| Ancienne enveloppe chantier | 478 m | Contradictoire, à mesurer |
| Ventes visées | 15 | Cible, non faisabilité légale |
| Prix développé cible | 185 000 $/terrain | Sans comparables validés |
| Valeur tel quel indicative | 1,50 $/pi² | Hypothèse, non évaluation |

La version primaire du service cadastral est datée du **9 août 2026**; le 15 octobre est la date de contrôle. Une seconde diffusion des mêmes données produit un écart maximal de 0,02 m² sur les 18 parcelles de travail. Cela n'est pas une certification légale indépendante.

La couche provinciale de milieux humides **potentiels** recoupe 9 lots sur environ 8 011,9 m². Il ne s'agit pas d'une aire réglementaire réputée inconstructible. Ne pas publier la superposition lot par lot sans évaluer le contexte.

L'ancien rôle a très probablement regroupé les lots 1 800 348 et 1 800 389 sous une même unité; leurs superficies géométriques individuelles sont respectivement 1 571,9 m² et 3 484,2 m². L'ancien rôle a aussi regroupé les deux emprises de rue. Le lot 1 800 374 n'est pas retrouvé dans la couche cadastrale actuelle. Le lot 1 800 388 est déclaré déjà détenu par le porteur du projet (15 octobre 2026); acte de propriété à conserver au dossier pour confirmer le titulaire légal exact.

## Niveau de confidentialité

**Le dépôt GitHub est public.** Aucun titre détaillé, offre signée, perte fiscale, trésorerie, simulation de bénéfice privée, entente entre associés ou document personnel ne doit y être publié.

La carte cadastrale utilise désormais **assets/geometry.js**, soit une copie locale simplifiée des polygones gouvernementaux (18 contours) et **ne dépend plus d'une requête ArcGIS au chargement**. Ces polygones ne doivent servir qu'à la visualisation : les superficies proviennent des calculs géométriques sur les contours non simplifiés. Les tests automatisés vérifient les 18 tracés, mais l'affichage en production Netlify reste à contrôler après déploiement.

Le navigateur sauvegarde les cases cochées du plan d'action **localement**. Cette sauvegarde ne synchronise pas les tâches entre utilisateurs et ne constitue pas un dossier officiel.

Le site doit être traité comme un outil de présentation et de pilotage public. Le registre cadastral exhaustif contre-vérifié, les contrats, les analyses fiscales et les études par lot restent dans un dossier privé distinct.

## Livrables à obtenir

- Fiches Infolot détaillées des 16 terrains et 2 rues, et historique du lot 374.
- Titres actuels, servitudes et acte du lot 388 déclaré déjà détenu.
- Résolution et plans du projet historique de Deauville.
- Réponse écrite de Sherbrooke concernant le statut de la rue, les normes, la possibilité de gravier et les contraintes municipales.
- Mesurage de la rue existante et du prolongement, caractérisation environnementale et plans de génie civil.
- Deux soumissions comparables, comparables immobiliers et modèle fiscal/net **privé**.

## Exploitation du site

Site statique sans compilation et sans dépendances externes. Toutes les pages doivent charger `assets/data.js`, puis `assets/portal.js` et `assets/portal.css`. Les pages sont directement accessibles depuis leur fichier HTML.

Le dépôt est compatible avec un hébergement statique. Les changements sur GitHub ne prouvent **pas** que le déploiement actuel Netlify a été actualisé. Contrôler la version publiée, le statut de l'accès par SSO et la branche de déploiement. Ne pas désactiver les contrôles d'accès pour faciliter le déploiement sans accord explicite.

## Sources

- [Cadastre SIG primaire](https://services3.arcgis.com/0lL78GhXbg1Po7WO/ArcGIS/rest/services/cadastre_bd_allegee/FeatureServer/0)
- [Cadastre SIG secondaire](https://geo.environnement.gouv.qc.ca/donnees/rest/services/Reference/Cadastre_allege/MapServer/0)
- [Infolot](https://appli.foncier.gouv.qc.ca/infolot/)
- [Rôle municipal de Sherbrooke](https://www.sherbrooke.ca/fr/services-a-la-population/taxes-et-evaluation/evaluation-fonciere/role-d-evaluation)
- [Grille d'usage PRA1589](https://cartes.ville.sherbrooke.qc.ca/GrilleUsage/?zoneid=PRA1589)
- [Protection des milieux naturels](https://www.sherbrooke.ca/fr/services-a-la-population/permis-et-certificats/permis-pour-construction-renovation-et-travaux/zones-de-contraintes-naturelles/protection-des-milieux-naturels)

## Contrôle qualité automatisé

Le workflow `.github/workflows/verify.yml` s'exécute à chaque push sur `main` et sur les demandes de fusion. Son script `scripts/qa.mjs` vérifie les neuf pages, les liens vers les ressources, la syntaxe JS, les 16 lots, les 2 emprises, les 14 tâches, les contours SIG locaux, les filtres et les calculatrices. **Un contrôle de code réussi n'atteste pas que Netlify a publié le commit.**

## Rectification propriétaire — 15 octobre 2026

Selon confirmation du porteur du projet, le lot **1 800 388 appartient déjà à son groupe**. Répartition de travail : **7 terrains groupe Louis-Philippe / sociétés associées, 6 Viviane / Société Villa Deauville, 3 Blue Sports = 16 terrains résidentiels**. Les deux emprises routières sont exclues. Le modèle conserve **15 ventes prévues sur 16 terrains** à titre d'hypothèse, compte tenu notamment du sort du lot 1 800 348. La déclaration de détention est distincte de la vérification du titulaire légal inscrit.
