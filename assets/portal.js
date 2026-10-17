(function portailDomaine(){
"use strict";
const D=window.DOMAIN_DATA;
const P=D.project;
const H=(text)=>String(text??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const n=(x,d=0)=>Number(x).toLocaleString("fr-CA",{minimumFractionDigits:d,maximumFractionDigits:d});
const money=x=>Number(x).toLocaleString("fr-CA",{style:"currency",currency:"CAD",maximumFractionDigits:0});
const sqft=m2=>m2*10.7639104167097;
const count=D.lots.length;
const totalArea=D.lots.reduce((s,x)=>s+x.area,0);
const roadArea=D.roads.reduce((s,x)=>s+x.area,0);
const groupCount=g=>D.lots.filter(x=>x.group===g).length;
const page=document.body.dataset.page||"index";
const sources=D.sources;
const pages=[["index","Vue d'ensemble","index.html"],["revue","Revue 2026","revue.html"],["acquisitions","01 Acquisitions","acquisitions.html"],["routes","02 Construction","routes.html"],["ventes","03 Ventes","ventes.html"],["terrains","Terrains","terrains.html"],["carte","Carte SIG","carte.html"],["finances","Scénarios","finances.html"],["documents","Sources / actions","documents.html"]];
const pill=(s,cls="")=>`<span class="badge-inline ${cls}">${H(s)}</span>`;
const arrow=" → ";
const cta=(text,href,variant="")=>`<a class="button ${variant}" href="${H(href)}">${H(text)}</a>`;
const link=(t,u)=>`<a class="source-link" href="${H(u)}" target="_blank" rel="noopener noreferrer">${H(t)} ↗</a>`;
const hero=(k,title,desc,home=false,actions="")=>home?
`<section class="hero-area"><div class="wrap"><span class="hero-kicker">${H(k)}</span><h1>${H(title)}</h1><p>${H(desc)}</p><div class="hero-actions">${actions}</div></div></section>`:
`<section class="page-hero"><div class="wrap"><div class="crumb"><a href="index.html">Tableau de bord</a> / ${H(k)}</div><span class="hero-kicker">${H(k)}</span><h1>${H(title)}</h1><p>${H(desc)}</p></div></section>`;
const section=(k,title,body,background="",desc="")=>`<section class="section-block ${background}"><div class="wrap"><div class="section-head"><div>${k?`<div class="eyebrow">${H(k)}</div>`:""}<h2>${H(title)}</h2></div>${desc?`<p>${H(desc)}</p>`:""}</div>${body}</div></section>`;
const info=(title,text,cls="info")=>`<div class="warning ${cls}"><strong>${H(title)}</strong><p>${text}</p></div>`;
const metric=(label,value,note)=>`<div class="kpi-card"><span class="k-label">${H(label)}</span><strong>${H(value)}</strong><small>${H(note)}</small></div>`;
const card=(index,title,desc,linkText,url,bullets)=>`<article class="panel"><div class="num-mark">${index}</div><h3>${H(title)}</h3><p>${H(desc)}</p><ul>${bullets.map(b=>`<li>${H(b)}</li>`).join("")}</ul><a class="panel-link" href="${url}">${H(linkText)} →</a></article>`;
const line=(title,text,status="À confirmer",tone="warn")=>`<div class="action-row"><div style="flex:1"><strong>${H(title)}</strong><small>${H(text)}</small></div><div class="push">${pill(status,tone)}</div></div>`;
const cells=(arr)=>arr.map(x=>`<td>${x}</td>`).join("");
const th=(cols)=>`<thead><tr>${cols.map(x=>`<th>${H(x)}</th>`).join("")}</tr></thead>`;
const layoutTable=(cols,rows)=>`<div class="table-wrap"><table class="data-table">${th(cols)}<tbody>${rows.join("")}</tbody></table></div>`;
const statusClass=t=>t==="P0"?"warn":t==="P1"?"":"ok";
const notePublic="Surfaces graphiques recalculées le 17 octobre 2026 sur les polygones cadastraux. Elles ne sont ni une mesure légale, ni une preuve de titre ou de constructibilité. Les contours de carte sont simplifiés.";
const nav=pages.map(([key,label,url])=>`<a href="${url}" ${page===key?'aria-current="page"':""} ${key==="documents"?'class="nav-cta"':""}>${H(label)}</a>`).join("");
const header=`<a class="skip-link" href="#site-content">Aller au contenu</a>
<div class="portal-top"><div class="wrap"><span><strong>DOMAINE DES VILLAS DU LAC</strong> · Dossier de développement / Deauville</span><span>État du dossier : ${H(D.updated)} · Informations de travail</span></div></div>
<header class="portal-header"><div class="wrap portal-head-inner">
<a class="portal-brand" href="index.html"><img src="assets/domaine-logo.webp" alt="Identité du Domaine des villas du lac"><span><b>DOMAINE DES VILLAS DU LAC</b><small>Sherbrooke · Secteur Deauville</small></span></a>
<button class="portal-toggle" id="nav-toggle" aria-expanded="false" aria-controls="primary-nav">Menu</button><nav class="portal-nav" id="primary-nav" aria-label="Navigation principale">${nav}</nav>
</div></header>`;
const footer=`<footer class="portal-footer"><div class="wrap"><div class="footer-grid">
<div><h3>Domaine des villas du lac</h3><p>Projet de lotissement existant à Deauville, Sherbrooke. Une vue de suivi structurée en acquisitions, infrastructure et commercialisation.</p></div>
<div><h3>Les trois volets</h3><a href="acquisitions.html">01 · Acquisitions</a><a href="routes.html">02 · Rue</a><a href="ventes.html">03 · Ventes</a></div>
<div><h3>Fiabilité et sources</h3><a href="terrains.html">Inventaire des 16 lots</a><a href="documents.html">Sources officielles et tâches</a><p>Les titres, prix d'achat, documents fiscaux, ententes et études détaillées ne sont pas publiés ici.</p></div>
</div><div class="footer-line">© 2026 Domaine des villas du lac · Consultation du dossier : ${H(D.updated)} · Données cadastrales indicatives, aucune certification de constructibilité</div></div></footer>`;


function renderRevue(){
const contrôles=[
line("Ancienne autorisation de Deauville","Archives demandées le 16 octobre 2026 à Sherbrooke; accusé reçu. Résolution et plans encore en attente.","En cours","warn"),
line("Titres de propriété et servitudes","16 terrains et deux emprises; le titre légal et les droits d'accès de chaque lot restent à certifier.","À certifier","warn"),
line("Lot 1 800 388","Déjà détenu selon déclaration du porteur; acte à classer. Exclu des neuf acquisitions.","Déclaré","ok"),
line("Route à compléter","223 + 229 = 452 m, contre 478 m dans une autre estimation et 454,295 m par différence. Aucune longueur certifiée.","À mesurer","warn"),
line("Avis municipal du 20 février 2026","Matricule 8321087597; milieux humides et boisés à délimiter officiellement, portée sur les deux emprises à préciser.","À clarifier","warn"),
line("Permis de construire","Le cadastre ne garantit ni 15 permis ni la conformité de la route en gravier sans services.","Non confirmés","warn")
];
return hero("Revue stratégique · 17 octobre 2026","Le projet complet pour décider","Acquisitions, prolongement de la rue, ventes et diligence : une vue consolidée sans présumer des droits ou des autorisations.")
+section("Situation","Inventaire à date",`<div class="cards-4">${metric("Lots résidentiels","16","7 détenus déclarés, 9 à acquérir")}${metric("Superficie graphique",n(totalArea,1)+" m²",n(sqft(totalArea))+" pi² indicatifs")}${metric("Emprises de rue","2",n(roadArea,3)+" m², non vendables")}${metric("Ventes visées","15",money(P.priceDeveloped)+"/lot, cible non validée")}</div>${info("Précaution","Les surfaces sont SIG, les groupes de détention non certifiés, et les droits de construire non acquis.")}`)
+section("Trois volets","Stratégie de réalisation",`<div class="cards-3">${card("01","Acquisitions","Neuf lots visés : six dans le groupe Viviane / SENC et trois Blue Sports.","Détails","acquisitions.html",["Vérifier titres et signataires","Séparer les deux emprises","Propositions de prix conservées en privé"])}${card("02","Réalisation de la rue","Réseau historique de 854,295 m, environ 400 m existants déclarés.","Détails","routes.html",["Chaussée en gravier envisagée","Sans services municipaux","Projet et métrage à approuver"])}${card("03","Vente des lots","Objectif de 15 ventes à prix cible non validé.","Détails","ventes.html",["Vérifier le petit lot 1 800 348","Puits et septique par lot","Comparer lot par lot ou en bloc"])}</div>`,"alt")
+section("Risques","Six contrôles avant engagement",`<div class="lined-list">${contrôles.join("")}</div>`)
+section("Économie du projet","Simulation seulement",`<div class="cards-2"><div class="panel"><h3>Ventes brutes hypothétiques</h3><div class="big-number">${money(15*P.priceDeveloped)}</div><p>15 × prix cible. Ne représente ni un revenu garanti ni la marge après coûts.</p></div><div class="panel"><h3>Prolongement mathématique</h3><div class="big-number">${n(P.theoreticalRemainM,3)} m</div><p>Réseau complet moins chemin existant approximatif : ni levé ni quantité de travaux certifiée.</p></div></div><p class="data-note">Le modèle net exige acquisition, route, études, drainage, taxes, commissions, financement et fiscalité; renseignements détaillés confidentiels.</p>`)
+section("Prochaines étapes","Ordre des validations",`<div class="lined-list">${line("1. Réponse de la Ville","Plan et résolution de Deauville, acceptation d'une rue en gravier, conditions écologiques et statut des emprises.")}${line("2. Notaire et arpenteur","Titres, cotes cadastrales Infolot, servitudes, accès et levé des longueurs réelles.")}${line("3. Environnement et génie civil","Cartographier milieux réglementés, concevoir rue et obtenir deux estimations comparables.")}${line("4. Comptabilité et vente","Choisir structure des achats, convention de quote-part et scénario net après fiscalité.")}</div><p>${cta("Registre et étapes","documents.html#actions")} ${cta("Voir la carte","carte.html","light")}</p>`,"alt");
}

function renderHome(){
const top=hero("Pilotage stratégique","Un projet. Trois décisions. Un plan vérifiable.",
"16 lots résidentiels identifiés, deux emprises de rue et un réseau historique d'environ 854 mètres. Chaque étape doit être validée avant d'engager des achats ou des travaux.",true,
cta("Revue intégrale du projet","revue.html","alt")+cta("Inventaire cadastral","terrains.html","ghost"));
const stats=`<div class="wrap"><div class="kpi-row">${metric("Terrains identifiés",n(count),"Objectif : 15 ventes, non confirmées")}
${metric("Superficie brute",n(totalArea,1)+" m²",n(sqft(totalArea))+" pi²")}
${metric("Emprises de rue","2 lots",n(roadArea,1)+" m² au total")}
${metric("Réseau de chemin",n(P.totalRoadM,0)+" m","≈400 m existants, longueur exacte à relever")}</div></div>`;
const steps=section("Stratégie","Les trois décisions à piloter",`<div class="cards-3">
${card("01","Sécuriser les acquisitions","Établir les droits et décider si l'achat est préférable à une entente de quote-part.","Acquisitions","acquisitions.html",["Titres et bénéficiaires","Acte du 388 déclaré détenu et historique du 374","Conditions de transaction et fiscalité"])}
${card("02","Compléter la rue","Mesurer le chemin restant, confirmer les normes et établir le vrai devis civil.","Construction","routes.html",["Emprises 1 800 349 et 4 889 707","Projet complet : 854 m","Gravier sans services : acceptabilité à confirmer"])}
${card("03","Vendre les terrains","Confirmer le nombre de lots vendables, puis choisir la commercialisation par lot ou en bloc.","Ventes","ventes.html",["15 ventes : objectif","185 000 $ : prix cible, non validé","Analyse nette après coûts et délais"])}
</div>`);
const metro=`<div class="cards-2"><div class="panel"><h3>Longueurs de rue à réconcilier</h3>
<div class="value-line"><span>Réseau historique complet</span><strong>${n(P.totalRoadM,0)} m</strong></div>
<div class="value-line"><span>Portion déclarée existante</span><strong>≈${n(P.existingRoadApproxM)} m</strong></div>
<div class="value-line"><span>Reste arithmétique seulement</span><strong>≈${n(P.theoreticalRemainM)} m</strong></div>
<div class="route-meter" role="img" aria-label="400 mètres existants environ sur 854 mètres au total; 454 mètres résiduels théoriques."><span style="width:${P.existingRoadApproxM/P.totalRoadM*100}%"></span><span style="flex:1"></span></div>
<div class="route-legend"><span>Existants ≈400 m</span><span>Reste théorique ≈454 m</span></div>
<p class="data-note">Les anciens 452 m (223 + 229) et 478 m demeurent contradictoires. Aucun n'est la longueur certifiée des travaux.</p></div>
<div class="panel"><h3>Ce que confirme le cadastre graphique</h3>
<div class="value-line"><span>Rue 1 800 349</span><strong>2 629,5 m²</strong></div>
<div class="value-line"><span>Rue 4 889 707</span><strong>9 270,2 m²</strong></div>
<div class="value-line"><span>Total des deux emprises</span><strong>11 899,7 m²</strong></div>
<p class="data-note">Une emprise cadastrale ne permet pas, à elle seule, de calculer la longueur de la chaussée à construire.</p>
<a class="panel-link" href="routes.html">Dossier d'infrastructure →</a></div></div>`;
const blockers=section("Risques","Les quatre validations qui bloquent la décision",
`<div class="lined-list">
${line("Projet historique de Deauville","Retrouver la résolution, les plans approuvés et la portée des droits encore applicables.","Preuve manquante")}
${line("Cadastre et droits","Obtenir les 18 extraits officiels, les titres et les servitudes; résoudre les lots 388 et 374.","À sécuriser")}
${line("Environnement et constructibilité","9 terrains recoupent la carte de milieux humides potentiels; ce n'est pas une décision de constructibilité.","Études requises")}
${line("Route et prix des travaux","Relever les sections réelles et recevoir une position écrite de Sherbrooke sur le gravier et les normes.","À confirmer")}
</div>
${info("Principe de prudence","Le projet historique peut constituer une pièce utile, mais ne garantit pas une autorisation actuelle. Les anciens modèles de marge ne sont pas des prévisions certifiées.")}`,"alt");
const tasks=section("Exécution","Les prochaines actions prioritaires",`<div class="cards-3">
<div class="panel"><div class="meta">Immédiat</div><h3>Documentation juridique</h3><p>Registre foncier, mesures Infolot et acte de propriété des deux rues.</p>${pill("P0","warn")}</div>
<div class="panel"><div class="meta">En parallèle</div><h3>Réponse de Sherbrooke</h3><p>Validité du projet historique, statut de la rue, standards et milieux naturels.</p>${pill("P0","warn")}</div>
<div class="panel"><div class="meta">Après les validations</div><h3>Devis + marché</h3><p>Avant-projet civil, soumissions, nombre vendable et comparables réels.</p>${pill("P1")}</div></div><p style="margin-top:20px">${cta("Ouvrir les 14 tâches détaillées","documents.html#actions")} ${cta("Carte des terrains","carte.html","light")}</p>`);
return top+stats+steps+section("État du réseau","Le point qui change tout",metro,"alt")+blockers+tasks;
}

function renderAcquisitions(){
const areaBy=g=>D.lots.filter(x=>x.group===g).reduce((s,x)=>s+x.area,0);
return hero("01 · Acquisition","Acheter seulement les droits et lots utiles",
"La priorité est de confirmer la chaîne de propriété, les droits de rue et les conditions d'un éventuel regroupement avant d'établir un prix d'achat définitif.")
+section("Structure actuelle","Portefeuilles de travail, non titres certifiés",`<div class="cards-4">
${metric("Groupe L.-P. / sociétés",n(groupCount("lp"))+" lots",n(areaBy("lp"),1)+" m²")}
${metric("Groupe Viviane / SENC",n(groupCount("viviane"))+" lots",n(areaBy("viviane"),1)+" m²")}
${metric("Blue Sports",n(groupCount("blue"))+" lots",n(areaBy("blue"),1)+" m²")}
${metric("Terrains au total",n(count)+" lots","7 L.-P. + 6 Viviane + 3 Blue")}
</div>${info("Confidentialité et exactitude","Les groupes ci-dessus servent à organiser le travail. Les titulaires actuels doivent être vérifiés par actes; les données détaillées d'acquisition sont conservées dans le classeur privé.")}`)
+section("Choix contractuels","Comparer les options avant toute signature",`<div class="cards-3">
<div class="panel"><div class="num-mark">A</div><h3>Achat conditionnel</h3><p>Acquérir uniquement les lots nécessaires après validation de l'accès, des autorisations, des surfaces et des conditions fiscales.</p><ul><li>Risque de capital immobilisé</li><li>Contrôle plus direct des décisions</li><li>Clause de sortie essentielle</li></ul></div>
<div class="panel"><div class="num-mark">B</div><h3>Entente de quote-part</h3><p>Conserver les titulaires, définir le partage des dépenses du chemin, les bénéfices, l'entretien et les garanties.</p><ul><li>Moins de dépenses d'acquisition initiales</li><li>Coordination juridique plus complexe</li><li>Conformité municipale à confirmer</li></ul></div>
<div class="panel"><div class="num-mark">C</div><h3>Vente concertée</h3><p>Commercialisation commune ou en bloc, avec conditions transparentes pour chaque propriétaire.</p><ul><li>Travaux éventuellement différés</li><li>Prix de vente potentiellement inférieur</li><li>Convention et mandat communs requis</li></ul></div>
</div>`,"alt")
+section("Séquence de décision","Les cinq contrôles préalables",`<div class="lined-list">
${line("1. Titres et pouvoirs de signer","Confirmer chaque détenteur inscrit et toute procuration ou décision d'associés requise.")}
${line("2. Emprises et servitudes","Distinguer les rues 349 et 4 889 707, leur titulaire, les accès et les obligations d'entretien.")}
${line("3. Lots atypiques","Lot 348 : regroupement/cession à étudier; lot 388 : acte à classer; lot 374 : historique cadastral.")}
${line("4. Évaluation conditionnelle","Les prix de négociation et les offres sont conservés dans le dossier confidentiel.")}
${line("5. Fiscalité et entente","Faire valider l'entité acquéreuse, TPS/TVQ, financement, répartitions et pertes fiscales admissibles par des professionnels.")}
</div><div style="margin-top:22px">${cta("Inventaire cadastral","terrains.html")} ${cta("Voir la feuille de route","documents.html#actions","light")}</div>`);
}

function renderRoutes(){
return hero("02 · Infrastructure","Construire la portion manquante, pas les 854 mètres",
"Le réseau complet mesure environ 854 m selon l'ancien tracé. Environ 400 m existent déjà selon le dossier. Il faut lever sur le terrain la partie réelle à construire et confirmer les normes applicables.")
+section("Réseau cadastral","Deux lots de rue et trois longueurs historiques",`
<div class="diagram">
<div class="segment"><span class="badge-inline">Emprise 01</span><strong>1 800 349</strong><small>2 629,3 m² SIG indicatifs</small></div>
<div class="segment"><span class="badge-inline">Emprise 02</span><strong>4 889 707</strong><small>9 269,7 m² SIG indicatifs</small></div>
<div class="segment"><span class="badge-inline warn">Prolongement</span><strong>À mesurer</strong><small>Le réseau projeté ne représente pas directement les travaux à exécuter</small></div>
</div>
<div class="cards-4" style="margin-top:20px">
${metric("Réseau global",n(P.totalRoadM,0)+" m","Trace historique SIG")}
${metric("Existant déclaré","≈400 m","Non levé par arpenteur")}
${metric("A + B anciens","452 m","223 + 229 m")}
${metric("Autre ancien devis","478 m","Différent de 452 et 454 m")}
</div>
${info("Contrainte contractuelle","Le projet vise une rue en gravier, sans asphalte, aqueduc ni égout municipaux. Il faut une réponse écrite de Sherbrooke confirmant que cette configuration et la conception proposée sont acceptables.")}`)
+section("Budget préliminaire","Tester la sensibilité du coût routier",`<div class="cards-2"><div class="panel">
<h3>Hypothèses modifiables</h3>
<div class="input-stack">
<div class="field"><label for="road-length">Longueur examinée</label><select id="road-length"><option value="454.295">≈454,3 m · calcul arithmétique</option><option value="452">452 m · tronçons A+B anciens</option><option value="478">478 m · ancienne enveloppe</option></select></div>
<div class="field"><label for="road-rate">Coût direct illustratif par mètre</label><select id="road-rate"><option value="500">500 $/m · bas</option><option value="800" selected>800 $/m · central</option><option value="1100">1 100 $/m · haut</option></select></div>
<div class="field"><label for="road-cont">Contingence hypothétique (%)</label><input id="road-cont" type="number" value="15" min="0" max="100" step="1"></div>
</div><p class="data-note">Ce ne sont pas des soumissions. Le modèle n'inclut ni études, permis, taxes, acquisition de droits, environnement ni mise aux normes de la portion existante.</p></div>
<div class="cal-result" aria-live="polite"><small>Coût direct estimatif</small><strong id="road-direct">—</strong><small>Avec contingence</small><strong id="road-with-cont">—</strong><small>Budget illustratif seulement — non contractuel</small></div></div>
`,"alt")
+section("Conception","Mandats techniques à faire avant les soumissions",`<div class="lined-list">
${line("Arpentage et profil longitudinal","Identifier la chaussée construite, les deux emprises, les pentes, les croisements et les accès.")}
${line("Urbanisme et ancienne autorisation","Retrouver la résolution de Deauville; vérifier le statut privé/public et toutes les normes actuelles.")}
${line("Milieux naturels et drainage","Caractériser les sols humides, fossés, ponceaux, eaux pluviales, habitats sensibles et mesures d'atténuation.")}
${line("Avant-projet de génie civil","Coupe-type en gravier, fondation et matériaux adaptés aux exigences, stabilité et sécurité incendie.")}
${line("Deux devis comparables","Quantités mesurées : déboisement, excavation, granulats, ponceaux, stabilisation, inspection, imprévus.")}
${line("Titre et entretien du chemin","Fixer propriétaire, servitudes, responsabilité et quote-parts avant le chantier.")}
</div>`)
+section("Plan de travail","Schéma indicatif du secteur",`<div class="cards-2"><div class="panel diagram-figure"><img src="assets/plan-schematic.svg" alt="Schéma de principe des tronçons de la rue, non cadastral"><p class="data-note">Schéma historique indicatif, pas un plan d'arpentage et ne distingue pas les sections construites certifiées.</p></div><div class="panel"><h3>Ce que le plan final devra montrer</h3><ul><li>Les limites des lots 1 800 349 et 4 889 707.</li><li>Le relevé géoréférencé de la route déjà construite.</li><li>La longueur mesurée du prolongement et ses ouvrages de drainage.</li><li>Les restrictions hydriques, environnementales et servitudes.</li><li>Les points d'accès à chaque lot futur.</li></ul><p>${cta("Consulter les sources","documents.html#sources")}</p></div></div>`,"alt");
}

function renderVentes(){
const rows=D.lots.map(x=>`<tr><td><a href="lot.html?id=${x.id}">${x.label}</a></td><td class="num">${n(x.area,1)} m²</td><td class="num">${n(sqft(x.area))} pi²</td><td>${x.group==="verifier"?pill("À vérifier","warn"):pill("À confirmer")}</td></tr>`);
return hero("03 · Commercialisation","Préparer les ventes sans promettre la constructibilité",
"15 ventes à 185 000 $ sont un objectif de planification. Les surfaces géométriques sont connues, mais l'accès, l'enveloppe constructible et les autorisations demeurent à démontrer.")
+section("Hypothèses commerciales","Séparer superficie, prix et droit de construire",`<div class="cards-4">
${metric("Lots identifiés","16","Nombre de parcelles, non d'autorisations")}
${metric("Ventes visées","15","Cible commerciale non garantie")}
${metric("Prix par lot",money(P.priceDeveloped),"Valeur cible non étayée par comparables")}
${metric("Référence tel quel","1,50 $/pi²","Hypothèse et non évaluation agréée")}
</div>
${info("Point de méthode","Le produit brut indicatif de 15 × 185 000 $ est 2 775 000 $. Ce n'est ni une prévision de ventes, ni une marge : il faut retirer acquisitions, travaux, études, financement, taxes, commissions et fiscalité.")}`)
+section("Stratégie","Trois scénarios à comparer",`<div class="cards-3">
<div class="panel"><div class="num-mark">A</div><h3>Vente telle quelle</h3><p>Pas d'avance de capital pour la route, mais prix potentiellement réduit et acheteurs limités.</p><p>Base à valider : surface véritablement cessible × prix établi par comparables.</p></div>
<div class="panel"><div class="num-mark">B</div><h3>Ventes individuelles</h3><p>Réaliser les accès conformes et vendre chaque lot développé avec un dossier acheteur complet.</p><p>Dépend des permis, du nombre constructible et des coûts civils.</p></div>
<div class="panel"><div class="num-mark">C</div><h3>Vente en bloc</h3><p>Présenter le plan aux promoteurs avec une diligence claire sur les risques, titres et accès.</p><p>Comparer produit net, délai et risque de financement.</p></div></div>`,"alt")
+section("Vérification par lot","Inventaire commercial potentiel",layoutTable(["Lot","Aire graphique","Équivalent","État"],rows)+`<p class="data-note">Un lot identifié n'est pas automatiquement un lot constructible. Les contraintes environnementales détaillées et les titres restent dans le dossier de travail confidentiel.</p><p>${cta("Consulter les fiches de lots","terrains.html")} ${cta("Carte cadastrale","carte.html","light")} ${cta("Analyse illustrative","finances.html","light")}</p>`)
+section("Livrables","Conditions de lancement de la commercialisation",`<div class="lined-list">
${line("Plan légal et certificat","Aire, façade, limites, servitudes, périmètre constructible et droit de vente du titulaire.")}
${line("Conformité de la rue","Accès légal, voie conforme, entretien et coûts résiduels connus.")}
${line("Puits et installations septiques","Études et espace d'implantation conformes sur chaque terrain.")}
${line("Prix comparables","Transactions récentes comparables, ajustées selon superficie, accessibilité et contraintes.")}
${line("Dossier acheteur","Plans, restrictions, autorisations, informations environnementales et conditions explicites.")}
</div>`,"alt");
}

function renderTerrains(){
const totalBy=g=>D.lots.filter(x=>x.group===g).reduce((s,x)=>s+x.area,0);
const groups=Object.entries(D.groups).map(([k,v])=>`<option value="${k}">${H(v)} (${groupCount(k)})</option>`).join("");
return hero("Inventaire · 16 lots","Le cadastre vérifié, terrain par terrain",
"Surfaces graphiques recalculées sur 16 lots résidentiels et deux emprises de rue. Les propriétaires légaux, conditions d'achat et contraintes environnementales de détail sont conservés hors du dépôt public.")
+section("Superficies","Périmètre résidentiel et affectations de travail",`<div class="cards-4">
${metric("Ensemble résidentiel",n(totalArea,1)+" m²",n(sqft(totalArea))+" pi²")}
${metric("Groupe L.-P.",n(groupCount("lp"))+" lots",n(totalBy("lp"),1)+" m²")}
${metric("Autres groupes",n(groupCount("viviane")+groupCount("blue"))+" lots","Groupe Viviane + Blue Sports")}
${metric("Lots du projet",n(count)+" lots","7 L.-P. · 6 Viviane · 3 Blue")}
</div>${info("Précision et limites",H(notePublic))}`)
+section("Recherche","Explorer, trier et exporter les parcelles",`
<div class="toolbar"><div class="field"><label for="lot-search">Rechercher un numéro</label><input id="lot-search" placeholder="Ex. 1 800 348" autocomplete="off"></div>
<div class="field"><label for="lot-group">Groupe de travail</label><select id="lot-group"><option value="all">Tous les groupes (16)</option>${groups}</select></div>
<div class="field"><label for="lot-sort">Trier</label><select id="lot-sort"><option value="id">Numéro de lot</option><option value="area-asc">Superficie croissante</option><option value="area-desc">Superficie décroissante</option></select></div>
<button class="button light" id="export-lots" type="button">Exporter CSV</button></div>
<p class="subtle" id="lot-count" aria-live="polite"></p><p style="margin:12px 0"><a class="button light" href="carte.html">Afficher la carte cadastrale indicative</a></p><div class="mini-grid" id="lot-cards"></div>`,"alt")
+section("Rues","Emprises distinctes, non comprises dans les 16 terrains",
layoutTable(["Lot de rue","Superficie SIG","Périmètre graphique","Rôle dans le projet"],
D.roads.map(r=>`<tr>${cells([`<strong>${H(r.label)}</strong>`,`<span class="num">${n(r.area,1)} m²</span>`,`<span class="num">${n(r.perimeter,1)} m</span>`,H(r.note)])}</tr>`))+
`<p class="data-note">Total : ${n(roadArea,1)} m². Le rapprochement avec l'unité d'évaluation historique explique une partie des doublons du premier registre.</p>`);
}

function renderLot(){
const id=new URLSearchParams(location.search).get("id");
const x=D.lots.find(v=>v.id===id);
if(!x)return hero("Inventaire","Terrain introuvable","Ce numéro ne correspond à aucun des 16 lots suivis.")+section("Retour","Consulter les terrains",cta("Retour à l'inventaire","terrains.html"));
const special=x.id==="1800348"?"Une fusion, cession ou autre solution foncière peut être nécessaire compte tenu de sa taille, sans présumer d'une obligation réglementaire.":x.id==="1800388"?"Terrain déjà détenu selon la déclaration du propriétaire du 15 octobre 2026; acte à classer pour confirmer le titulaire légal exact.":x.note;
return hero("Fiche de lot","Terrain "+x.label,
"Caractéristiques géométriques vérifiées sur deux services de diffusion cadastrale. Les superficies légales, le propriétaire actuel et les droits de construction doivent encore être confirmés.")
+section("Données SIG","Caractéristiques géométriques",`<div class="cards-4">
${metric("Superficie",n(x.area,1)+" m²",n(sqft(x.area))+" pi²")}
${metric("En acres",n(sqft(x.area)/43560,3),"Superficie brute, non vendable nette")}
${metric("Périmètre",n(x.perimeter,1)+" m","Contour graphique, non bornage")}
${metric("Contact avec rue",n(x.roadContact,1)+" m","Contiguïté estimée SIG, non façade réglementaire")}
</div>
${info("Contexte particulier",H(special))}
${info("Source de superficie",H(notePublic))}`)
+section("Décision foncière","Statut et validations propres au lot",`<div class="cards-2">
<div class="panel"><div class="meta">Groupe de travail</div><h3>${H(D.groups[x.group])}</h3><p>Indication interne non équivalente au titre foncier. Vérifier l'acte et les droits réels.</p><p>Zone au point central : <strong>${H(P.zoningCentroid)}</strong>. Les règlements applicables à toute la parcelle restent à confirmer.</p></div>
<div class="panel"><div class="meta">Valeur indicative brute</div><h3>${money(sqft(x.area)*P.priceRawPerSqft)}</h3><p>Hypothèse de comparaison de 1,50 $/pi², uniquement sur l'aire brute. Ne constitue pas une offre, une évaluation ou une assurance de vente.</p></div></div>`)
+section("À obtenir","Pièces avant mise en marché",`<div class="lined-list">
${line("Fiche Infolot et limites cotées","Vérifier aire descriptive officielle, longueurs et mises à jour.")}
${line("Titre, servitudes et accès","Confirmer titulaire, droits routiers, droits de passage et restrictions.")}
${line("Enveloppe constructible","Vérifier marges, zones de contraintes, usages, surface minimale et réglementation municipale.")}
${line("Étude de sol et services autonomes","Évaluer puits, fosse septique, eau, drainage et conditions particulières.")}
${line("Conditions de commercialisation","Confirmer permis, conformité de la rue et prix à partir de transactions comparables.")}
</div><div style="margin-top:21px">${cta("Tous les terrains","terrains.html")} ${cta("Sources officielles","documents.html#sources","light")}</div>`,"alt");
}

function renderFinances(){
return hero("Scénarios · non confidentiels","Comparer le potentiel brut et les coûts de la rue",
"Simulateur de sensibilité, pas une projection de profit. Les coûts d'acquisition, les répartitions entre sociétés et la fiscalité restent dans le modèle privé.")
+section("Paramètres","Calculateur de scénarios illustratifs",`<div class="cards-2">
<div class="panel"><h3>Paramètres modifiables</h3><div class="input-stack">
<div class="field"><label for="fin-count">Nombre de lots vendus (0–16)</label><input id="fin-count" type="number" value="15" min="0" max="16" step="1"></div>
<div class="field"><label for="fin-price">Prix moyen brut par lot ($)</label><input id="fin-price" type="number" value="185000" min="0" max="1000000" step="5000"></div>
<div class="field"><label for="fin-length">Longueur de travaux testée (m)</label><input id="fin-length" type="number" value="454.3" min="0" max="854.3" step="1"></div>
<div class="field"><label for="fin-cost">Coût direct de rue ($/m)</label><input id="fin-cost" type="number" value="800" min="0" max="10000" step="50"></div>
<div class="field"><label for="fin-cont">Contingence (%)</label><input id="fin-cont" type="number" value="15" min="0" max="100" step="1"></div>
<div class="field"><label for="fin-fees">Frais de vente (%)</label><input id="fin-fees" type="number" value="5" min="0" max="30" step=".5"></div>
</div>
<button class="button light" id="fin-reset" type="button" style="margin-top:17px">Rétablir les hypothèses</button>
</div><div class="panel">
<h3>Résultats bruts de la simulation</h3>
<div class="value-line"><span>Ventes brutes hypothétiques</span><strong id="fin-sales">—</strong></div>
<div class="value-line"><span>Chemin direct</span><strong id="fin-road">—</strong></div>
<div class="value-line"><span>Chemin + contingence</span><strong id="fin-road-cont">—</strong></div>
<div class="value-line"><span>Frais de vente</span><strong id="fin-sale-fees">—</strong></div>
${info("Ce résultat ne mesure pas la rentabilité","Ne pas soustraire seulement ces postes pour annoncer un profit. Il manque acquisitions, valeur des terrains déjà détenus, honoraires, taxes, intérêts, conformité, environnement et fiscalité.","")}
</div></div>`,"alt")
+section("Comparaison stratégique","Trois cadres de décision",`<div class="cards-3">
<div class="panel"><div class="num-mark">A</div><h3>Vendre maintenant</h3><p>Besoin d'une valeur actuelle appuyée par des comparables, sur les seules surfaces légalement cessibles.</p></div>
<div class="panel"><div class="num-mark">B</div><h3>Terminer les accès</h3><p>Besoin de la longueur réelle de travaux, de normes acceptées par la Ville et de devis par poste.</p></div>
<div class="panel"><div class="num-mark">C</div><h3>Quote-part ou partenariat</h3><p>Besoin d'une convention de répartition et d'une structure fiscale et légale documentée.</p></div>
</div>${info("Ordre de comparaison","Valeur de sortie brute → coût incrémental des travaux → coût de capital et délai → coûts d'acquisitions et fiscaux → valeur nette après risques.")}`)
+section("Protection des données","Ce qui n'est pas publié",`<div class="lined-list">
${line("Prix individuels et offres négociées","À conserver dans le classeur privé et chez le notaire.","Confidentiel","")}
${line("Situation fiscale des sociétés","Analyser séparément l'utilisation légale de pertes et les transactions entre entités.","Confidentiel","")}
${line("Conventions entre propriétaires","Version juridique et tableaux de répartition des coûts hors du dépôt public.","Confidentiel","")}
</div>`,"alt");
}

function renderDocuments(){
const sourcesRows=[
["Cadastre SIG primaire",D.sourceDate,sources.cadastre,"Superficies graphiques; pas des titres ni des cotes opposables."],
["Cadastre SIG secondaire","Diffusion distincte",sources.cadastreSecondary,"Même base cadastrale; accord ≠ contrôle géodésique indépendant."],
["Infolot Québec","À obtenir",sources.infolot,"Fiches descriptives et cotes; accès payant selon produits."],
["Rôle d'évaluation de Sherbrooke","2025–2027",sources.role,"Une unité d'évaluation peut couvrir plusieurs lots."],
["Règlement de zonage PRA1589","À relire par lot",sources.zonage,"Zone du centroïde, usages et contraintes à confirmer."],
["Protection des milieux naturels","Règlements en vigueur à vérifier",sources.milieu,"Cartographie indicative; étude biologique et position de la Ville."],
];
return hero("Diligence · Sources","Registre des preuves et plan d'action",
"Les calculs SIG sont reproduits. Les autorisations, les titres, les études environnementales et le devis final ne le sont pas encore. Cette page distingue ce qui est acquis de ce qui reste à produire.")
+section("Traçabilité","Ce que nous pouvons affirmer",`<div class="cards-3">
<div class="panel"><span class="badge-inline ok">Calcul reproductible</span><h3 style="margin-top:14px">Surfaces et périmètres</h3><p>16 lots et 2 rues recalculés le 17 octobre 2026. Ces surfaces SIG ne sont pas juridiquement certifiées.</p></div>
<div class="panel"><span class="badge-inline warn">Étude à faire</span><h3 style="margin-top:14px">Environnement</h3><p>9 lots recoupent une couche de milieux humides potentiels, soit environ 8 011,9 m² de superposition graphique. Aucun droit de construire conclu.</p></div>
<div class="panel"><span class="badge-inline warn">Pièces à obtenir</span><h3 style="margin-top:14px">Titres et permis</h3><p>Propriété du lot 388, historique du 374, deux rues, plans approuvés et normes municipales non certifiés.</p></div>
</div>`)
+section("Suivi","Les 14 actions, classées par urgence",`<div id="actions" class="toolbar"><div class="field"><label for="task-filter">Filtrer par volet</label>
<select id="task-filter"><option value="all">Tous les volets</option><option value="01">01 Acquisitions</option><option value="02">02 Infrastructure</option><option value="03">03 Ventes</option></select></div>
<div class="field"><label for="task-priority">Priorité</label><select id="task-priority"><option value="all">Toutes</option><option value="P0">P0 · critique</option><option value="P1">P1 · haute</option><option value="P2">P2 · suivante</option></select></div>
<button class="button light" id="task-export" type="button">Exporter les tâches CSV</button></div>
<div class="warning info"><strong>Suivi local</strong><p>Les cases cochées sont enregistrées uniquement dans ce navigateur. Elles ne modifient pas les données partagées sur GitHub ou les statuts officiels du projet.</p></div>
<p class="subtle" id="task-tally" aria-live="polite"></p><div class="lined-list" id="task-list"></div>`,"alt")
+section("Références","Sources et limites",layoutTable(["Document","Version / situation","Lien","Portée"],sourcesRows.map(([name,ver,url,scope])=>`<tr><td><strong>${H(name)}</strong></td><td>${H(ver)}</td><td>${link("Consulter",url)}</td><td>${H(scope)}</td></tr>`)).replace('<div class="table-wrap">','<div class="table-wrap" id="sources">')+
`<p class="data-note">Les anciennes archives CSV du dépôt sont remplacées comme références de calcul par les mesures SIG du 17 octobre 2026. Le classeur exhaustif demeure privé; il n'est pas publié dans ce site.</p>`)
+section("Pièces bloquantes","Dossier de décision et confidentialité",`<div class="lined-list">
${line("Plan de lotissement initial de Deauville","Résolution datée, plan tamponné, conditions originales et avis sur validité actuelle.")}
${line("Titres et Infolot","18 fiches cadastrales, actes, servitudes et propriété des deux emprises.")}
${line("Avis écrit de Sherbrooke","Règlements applicables, rue en gravier, sécurité, milieux naturels, projets existants et projet de prolongement.")}
${line("Rapports techniques","Arpentage, environnement, géotechnique si nécessaire, drainage et plans de génie civil.")}
${line("Finance et contrats","Offres, quote-parts, devis, transactions comparables et validation fiscale dans le dossier privé.")}
</div>`);
}


const initMap=(function mapFeature(){
const D=window.DOMAIN_DATA;
const H=t=>String(t??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const mapMain=()=>`<section class="page-hero"><div class="wrap"><div class="crumb"><a href="index.html">Tableau de bord</a> / <a href="terrains.html">Terrains</a> / Carte</div><span class="hero-kicker">Carte cadastrale indicative</span><h1>Voir les 16 terrains et les deux rues</h1><p>Visualisation à partir de géométries cadastrales gouvernementales simplifiées et conservées localement. Les superficies ont déjà été contre-vérifiées; cette carte n'est ni un plan de bornage ni une preuve de droit de bâtir.</p></div></section>
<section class="section-block"><div class="wrap">
<div class="cards-2 map-layout">
<div class="panel"><div id="cadastral-map" role="region" aria-live="polite" aria-label="Carte SIG indicative"><p>Préparation des géométries cadastrales locales…</p></div></div>
<div class="panel"><h3>Légende</h3><div class="value-line"><span><span style="display:inline-block;width:14px;height:14px;background:#ddae66;border-radius:4px"></span> Groupe L.-P.</span><strong>7 lots</strong></div>
<div class="value-line"><span><span style="display:inline-block;width:14px;height:14px;background:#83b5ab;border-radius:4px"></span> Viviane / SENC</span><strong>6 lots</strong></div>
<div class="value-line"><span><span style="display:inline-block;width:14px;height:14px;background:#8ca9d1;border-radius:4px"></span> Blue Sports</span><strong>3 lots</strong></div>

<div class="value-line"><span><span style="display:inline-block;width:14px;height:14px;background:#a7bec8;border-radius:4px"></span> Emprises de rue</span><strong>2 lots</strong></div>
<div class="warning info"><strong>Lecture de la carte</strong><p>Les limites et dimensions proviennent du cadastre graphique. Cliquer sur un lot pour consulter sa fiche. Les propriétaires restent à confirmer par titres.</p></div>
<a class="button light" href="terrains.html">Inventaire en tableau</a></div></div>
<div class="warning" style="margin-top:20px"><strong>Contraintes environnementales</strong><p>Les données biologiques détaillées et l'emplacement des milieux humides potentiels ne sont pas publiés ici; aucune partie de la carte ne certifie une enveloppe constructible.</p></div>
</div></section>`;
document.getElementById("site-content").innerHTML=mapMain();
const target=document.getElementById("cadastral-map");
const geo=window.DOMAIN_GEOMETRY;
const origin=geo?.origin||[0,0];
const features=(geo?.features||[]).map(f=>({attributes:{NO_LOT:f.id},geometry:{rings:f.rings.map(r=>r.map(p=>[p[0]+origin[0],p[1]+origin[1]]))}}));
if(features.length!==18){target.innerHTML='<div class="warning">Géométries non disponibles. <a href="terrains.html">Consulter le registre des terrains</a>.</div>';return;}
const points=features.flatMap(f=>f.geometry.rings.flat());
const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys);
const pad=26,width=660,height=820,spanX=xmax-xmin,spanY=ymax-ymin,scale=Math.min((width-pad*2)/spanX,(height-pad*2)/spanY);
const X=x=>pad+(x-xmin)*scale,Y=y=>height-pad-(y-ymin)*scale;
const ns="http://www.w3.org/2000/svg";
const svg=document.createElementNS(ns,"svg");svg.setAttribute("viewBox",`0 0 ${width} ${height}`);svg.setAttribute("role","img");svg.setAttribute("aria-label","Plan cadastral graphique de 16 lots et deux emprises");svg.style.width="100%";svg.style.height="auto";
const bg=document.createElementNS(ns,"rect");for(const [k,v] of Object.entries({x:0,y:0,width,height,fill:"#f4f9fa",rx:12}))bg.setAttribute(k,v);svg.appendChild(bg);
features.sort((a,b)=>Number(Boolean(D.roads.some(r=>r.label===b.attributes.NO_LOT)))-Number(Boolean(D.roads.some(r=>r.label===a.attributes.NO_LOT))));
for(const f of features){
 const id=f.attributes.NO_LOT, lot=D.lots.find(l=>l.label===id), road=!lot;
 const groups={lp:"#ddae66",viviane:"#83b5ab",blue:"#8ca9d1",verifier:"#d6aed1"};
 const polygon=document.createElementNS(ns,"path");
 const paths=f.geometry.rings.map(r=>"M"+r.map(p=>`${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join("L")+"Z").join(" ");
 polygon.setAttribute("d",paths);polygon.setAttribute("fill",road?"#a7bec8":groups[lot.group]);polygon.setAttribute("stroke","#234457");polygon.setAttribute("stroke-width",road?"2":"1.3");polygon.setAttribute("fill-rule","evenodd");
 const title=document.createElementNS(ns,"title");title.textContent=road?"Rue "+id:"Lot "+id+" — "+lot.area.toLocaleString("fr-CA")+" m²";polygon.appendChild(title);
 if(lot){polygon.setAttribute("tabindex","0");polygon.setAttribute("role","link");polygon.setAttribute("aria-label","Ouvrir la fiche du lot "+id);
 const go=()=>window.location.assign("lot.html?id="+lot.id);polygon.style.cursor="pointer";polygon.addEventListener("click",go);polygon.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();go();}});}
 svg.appendChild(polygon);
}
for(const lot of D.lots){
 const f=features.find(x=>x.attributes.NO_LOT===lot.label);if(!f)continue;
 const a=f.geometry.rings[0],xs=a.map(p=>p[0]),ys=a.map(p=>p[1]);
 const cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2;
 const tx=document.createElementNS(ns,"text");tx.setAttribute("x",X(cx));tx.setAttribute("y",Y(cy));tx.setAttribute("font-size","14");tx.setAttribute("font-weight","750");tx.setAttribute("text-anchor","middle");tx.setAttribute("fill","#12334b");tx.setAttribute("stroke","white");tx.setAttribute("stroke-width","3");tx.setAttribute("paint-order","stroke");tx.textContent=lot.label.slice(-3);svg.appendChild(tx);
}
target.innerHTML="";target.appendChild(svg);
const c=document.createElement("p");c.className="data-note";c.textContent="18 polygones SIG simplifiés chargés localement. Les surfaces affichées proviennent des calculs indépendants sur les polygones non simplifiés. Mesures indicatives, non opposables.";target.appendChild(c);

});
const renderMap=()=>'<section class="section-block"><div class="wrap"><p>Préparation de la carte cadastrale…</p></div></section>';
const renderers={carte:renderMap,index:renderHome,revue:renderRevue,acquisitions:renderAcquisitions,routes:renderRoutes,ventes:renderVentes,terrains:renderTerrains,lot:renderLot,finances:renderFinances,documents:renderDocuments};
document.getElementById("site-header").innerHTML=header;
document.getElementById("site-footer").innerHTML=footer;
document.getElementById("site-content").innerHTML=(renderers[page]||renderHome)();
if(page==="carte")initMap();
const toggle=document.getElementById("nav-toggle");
if(toggle)toggle.addEventListener("click",()=>{const navEl=document.getElementById("primary-nav");const open=navEl.classList.toggle("open");toggle.setAttribute("aria-expanded",String(open));});
const clamp=(x,min,max,def)=>{let v=Number(x);return Number.isFinite(v)?Math.min(max,Math.max(min,v)):def;};
if(page==="routes"){
 const refresh=()=>{const length=Number(document.getElementById("road-length").value);const rate=Number(document.getElementById("road-rate").value);const cont=clamp(document.getElementById("road-cont").value,0,100,15);document.getElementById("road-direct").textContent=money(length*rate);document.getElementById("road-with-cont").textContent=money(length*rate*(1+cont/100));};
 for(const id of ["road-length","road-rate","road-cont"])document.getElementById(id).addEventListener("input",refresh);
 refresh();
}
if(page==="finances"){
const def={"fin-count":15,"fin-price":185000,"fin-length":454.3,"fin-cost":800,"fin-cont":15,"fin-fees":5};
const refresh=()=>{
const numLots=Math.round(clamp(document.getElementById("fin-count").value,0,16,15));
const price=clamp(document.getElementById("fin-price").value,0,1e6,185000);
const length=clamp(document.getElementById("fin-length").value,0,854.3,454.3);
const rate=clamp(document.getElementById("fin-cost").value,0,10000,800);
const cont=clamp(document.getElementById("fin-cont").value,0,100,15);
const fees=clamp(document.getElementById("fin-fees").value,0,30,5);
const gross=numLots*price,road=length*rate;
document.getElementById("fin-sales").textContent=money(gross);
document.getElementById("fin-road").textContent=money(road);
document.getElementById("fin-road-cont").textContent=money(road*(1+cont/100));
document.getElementById("fin-sale-fees").textContent=money(gross*fees/100);
};
Object.keys(def).forEach(id=>document.getElementById(id).addEventListener("input",refresh));
document.getElementById("fin-reset").addEventListener("click",()=>{for(const [id,v] of Object.entries(def))document.getElementById(id).value=v;refresh()});
refresh();
}
function exportCSV(filename,rows){
const escapeCell=x=>'"'+String(x??"").replace(/"/g,'""')+'"';
const csv="\uFEFF"+rows.map(r=>r.map(escapeCell).join(";")).join("\r\n");
const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
const a=document.createElement("a");const u=URL.createObjectURL(blob);a.href=u;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000);
}
if(page==="terrains"){
const search=document.getElementById("lot-search"),group=document.getElementById("lot-group"),sort=document.getElementById("lot-sort");
const filtered=()=>{
const query=search.value.trim().replace(/\s/g,"");
let l=D.lots.filter(x=>(group.value==="all"||x.group===group.value)&&(!query||x.id.includes(query)||x.label.replace(/\s/g,"").includes(query)));
if(sort.value==="area-asc")l.sort((a,b)=>a.area-b.area);
else if(sort.value==="area-desc")l.sort((a,b)=>b.area-a.area);
else l.sort((a,b)=>a.id.localeCompare(b.id));
return l;};
const render=()=>{const arr=filtered();document.getElementById("lot-count").textContent=`${arr.length} terrain(s) affiché(s) sur ${count}`;
document.getElementById("lot-cards").innerHTML=arr.length?arr.map(x=>`<a class="lot-tile" href="lot.html?id=${x.id}"><span class="badge-inline ${x.group==="verifier"?"warn":""}">${H(D.groups[x.group])}</span><div class="code" style="margin-top:12px">Lot ${H(x.label)}</div><div class="area">${n(sqft(x.area))} pi²</div><div class="small-line">${n(x.area,1)} m² · ${n(sqft(x.area)/43560,2)} acres</div><div class="tile-bottom"><span class="mini-code">Mesure graphique indicative</span><strong style="color:#16617b">Fiche →</strong></div></a>`).join(""):`<div class="empty">Aucun terrain ne correspond aux filtres.</div>`;};
[search,group,sort].forEach(el=>el.addEventListener("input",render));
document.getElementById("export-lots").addEventListener("click",()=>exportCSV("lots-cadastre-public.csv",[["Lot","Groupe de travail","Superficie SIG m²","Superficie pi²","Périmètre SIG m","Contact rue indicatif m"],...filtered().map(x=>[x.label,D.groups[x.group],x.area,sqft(x.area).toFixed(1),x.perimeter,x.roadContact])]));
render();
}
if(page==="documents"){
const filter=document.getElementById("task-filter"),priority=document.getElementById("task-priority");
const key="domaineVillas.actionChecks.v1";
let stored={};try{stored=JSON.parse(localStorage.getItem(key)||"{}")||{}}catch(e){stored={}};
const filtered=()=>D.plan.filter(t=>(filter.value==="all"||t.phase===filter.value)&&(priority.value==="all"||t.priority===priority.value));
const render=()=>{const arr=filtered();document.getElementById("task-tally").textContent=`${arr.filter(t=>stored[t.id]).length}/${arr.length} tâche(s) cochée(s) dans ce navigateur · ${D.plan.length} actions au total`;
const holder=document.getElementById("task-list");
holder.innerHTML=arr.map(t=>`<div class="check-item ${stored[t.id]?"done":""}">
<input type="checkbox" id="task-${t.id}" data-id="${t.id}" ${stored[t.id]?"checked":""}>
<label for="task-${t.id}"><strong>${H(t.title)}</strong><small>${H(t.owner)} · Statut initial : ${H(t.status)} · Volet ${t.phase}</small></label>
${pill(t.priority,statusClass(t.priority))}</div>`).join("");
holder.querySelectorAll("input[type=checkbox]").forEach(el=>el.addEventListener("change",()=>{stored[el.dataset.id]=el.checked;try{localStorage.setItem(key,JSON.stringify(stored))}catch(e){}render();}));};
[filter,priority].forEach(el=>el.addEventListener("change",render));
document.getElementById("task-export").addEventListener("click",()=>exportCSV("plan-action-domaine.csv",[["ID","Volet","Priorité","Action","Responsable pressenti","Statut initial","Cochée dans ce navigateur"],...filtered().map(t=>[t.id,t.phase,t.priority,t.title,t.owner,t.status,stored[t.id]?"Oui":"Non"])]));
render();
}
})();
