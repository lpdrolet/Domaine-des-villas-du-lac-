# Domaine des Villas du Lac — Site du projet

Site statique du développement immobilier de la rue des Villas, secteur Deauville, Sherbrooke (Québec).

## Organisation du projet

- `index.html` — **tableau de bord** « où nous sommes rendus / reste à faire », avec statut et points bloquants.
- `acquisitions.html` — **01 Acquisition des autres propriétaires** : titres, négociations conditionnelles, quote-part.
- `routes.html` — **02 Construction de la rue** : réseau total, partie existante et travaux résiduels.
- `ventes.html` — **03 Ventes des terrains** : lots constructibles, prix et stratégie de commercialisation.
- `finances.html` — hypothèses et scénarios comparatifs (aucun bénéfice net affirmé).
- `terrains.html`, `lot.html` — registre partiel et fiches cadastrales, non suffisant pour transfert de propriété.
- `documents.html` — sources, documents de travail et diligences.

## Réconciliation des longueurs (15 octobre 2026)

| Notion | Valeur | Statut |
| --- | ---: | --- |
| Réseau complet | 854,295 m | Tracé historique des 3 tronçons |
| Déjà construit | environ 400 m | Information du propriétaire, approximative |
| Restant théorique | environ 454 m | 854 - 400, résultat approximatif |
| Annonce historique travaux | 478 m | Hypothèse non mesurée, à ne pas retenir comme longueur du chantier |
| Lots commercialisés visés | 15 | Objectif, non nombre légalement constructible |

Écart de 24 m entre reste théorique et reste budgété. Les tronçons A (223 m) et B (229 m) additionnent 452 m et présentent un autre écart de 26 m par rapport aux 478 m annoncés. Un plan et un mesurage d'arpentage doivent trancher.

## Correction des deux emprises routières

- Rue cadastrée sous le lot **1 800 349** : 11 897 m² déclarés à l’ancien rôle municipal; aucune limite certifiée ici.
- Deuxième emprise : lot **4 889 707**. Sa superficie et sa façade sont **inconnues** : ne pas copier la valeur du lot 1 800 349.
- Ancien tronçon A (223 m) + B (229 m) = **452 m**, et non 478 m. La différence 854 − environ 400 = environ 454 m reste indicative.
- Aucun de ces nombres ne remplace un relevé du tronçon à construire ni la validation municipale du statut de la rue.

## Données de base, limites et confidentialité

Le fichier Excel fourni daté du 7 septembre 2026 inventorie 48 lots **de contrôle** incluant des voisins. Les 48 géométries ont été recalculées au 15 octobre 2026. Le site affiche désormais **16 lots résidentiels identifiés** et **2 emprises de rue distinctes**. Le lot 1 800 374 n’a pas été retrouvé dans la couche SIG actuelle. Cela ne confirme pas que 15 lots pourront être vendus.

Le projet de lotissement aurait été accepté par l'ancienne Ville de Deauville selon le propriétaire; preuve écrite et portée actuelle à confirmer auprès de Sherbrooke.

**Ce dépôt est public.** Ne jamais y ajouter les propositions d'achat signées, les noms/adresses personnels non nécessaires, la fiscalité détaillée, les offres et les renseignements financiers privés. Éviter de traiter les anciens fichiers CSV/JS comme des sources à jour.

## Publication

Aucune compilation ni dépendance nécessaire. La racine du dépôt est compatible avec GitHub Pages et des hébergements de site statique.

## Statut

Mise à jour de la structure le 15 octobre 2026. Les analyses juridiques, fiscales, municipales, techniques et financières doivent être validées avant décision.

## Audit cadastral — 15 octobre 2026

Les géométries proviennent du service public [Cadastre Québec](https://services3.arcgis.com/0lL78GhXbg1Po7WO/ArcGIS/rest/services/cadastre_bd_allegee/FeatureServer/0), reprojetées EPSG:32187 : aire et périmètre géométriques (non légaux).

- 16 terrains résidentiels candidats : **65 315,1 m² (≈703 046 pi²)**.
- Rue 1 800 349 : **2 629,5 m²**; rue 4 889 707 : **9 270,2 m²**. Total : **11 899,7 m²**.
- Terrains 1 800 348 = **1 571,9 m²** et 1 800 389 = **3 484,2 m²**. Leurs aires totalisent **5 056,1 m²**, près de la superficie inscrite pour chacun dans l'ancien registre du rôle. Cette ancienne superficie est vraisemblablement celle de l'unité d'évaluation regroupée.
- Les chiffres exacts inscrits au plan cadastral, les actes et permis restent à consulter auprès d’Infolot, des notaires et de la Ville. Ne pas confondre superficie brute avec droits constructibles.

## Contre-vérification du 15 octobre 2026

- La **version primaire** du service SIG cadastral indique **9 août 2026**, et le second service gouvernemental consulté affiche une version historique du **5 octobre 2025** : la consultation en octobre n'en fait pas une édition d'octobre.
- 18 lots (16 parcelles + 2 rues) concordent entre les deux services à **0,02 m² d'écart géométrique maximum**. Les sources reposent toutes deux sur le cadastre du Québec; ceci ne constitue **pas une preuve légale indépendante**.
- Le lot **1 800 388** est affecté à Gestion DeniDro dans un ancien registre mais marqué comme **« à reprendre »** dans une autre version. L'attribution actuelle n'est pas validée. Répartition de contrôle : 6 associés au groupe Louis-Philippe + 1 non confirmé + 3 Blue Sports + 6 Viviane/SENC.
- Une seconde intersection des milieux humides potentiels **sans simplification** donne **8 011,9 m² sur 9 lots**, au lieu des 8 004,0 m² indicatifs antérieurs. Cette surface n'est pas assimilable à une aire légalement non constructible.
- Les fiches descriptives officielles Infolot, les titres et servitudes, la délimitation biologique et le contrôle municipal restent requis avant prix, acquisitions ou travaux.
