document.addEventListener('DOMContentLoaded',()=>{
  const id=new URLSearchParams(location.search).get('id');
  const x=DOMAIN_DATA.lots.find(l=>l.id===id);
  if(!x){document.querySelector('main').innerHTML='<section class="section"><div class="narrow"><h1>Lot introuvable</h1></div></section>';return;}
  document.title=`Lot ${x.label} | Domaine des Villas du Lac`;
  const raw=x.sqft?x.sqft*DOMAIN_DATA.project.rawPricePerSqft:null;
  document.querySelector('[data-lot-content]').innerHTML=`
    <section class="page-hero"><div class="container"><div class="breadcrumbs"><a href="index.html">Accueil</a> / <a href="terrains.html">Terrains</a> / ${x.label}</div><span class="badge ${badgeClass(x.status)}">${x.status}</span><div class="eyebrow mt-2">Fiche terrain</div><h1>Lot ${x.label}</h1><p class="lead">${x.group} · ${x.address}</p></div></section>
    <section class="section"><div class="container lot-detail-grid"><div>
      <div class="notice ${x.status.includes('Validation')?'':'info'}"><strong>Statut :</strong> ${x.note}</div>
      <div class="mt-4"><div class="eyebrow">Données cadastrales de travail</div><h2>Caractéristiques du lot</h2></div>
      <div class="key-value mt-3">
        <div><small>Superficie</small><b>${sqft(x.sqft)}</b></div><div><small>Superficie acres</small><b>${x.sqft?acres(x.sqft):'À valider'}</b></div>
        <div><small>Superficie métrique</small><b>${x.sqm?num(x.sqm,1)+' m²':'À valider'}</b></div><div><small>Frontage</small><b>${x.frontage?num(x.frontage,2)+' m':'À valider'}</b></div>
        <div><small>Valeur terrain au rôle</small><b>${money(x.assessment)}</b></div><div><small>Valeur au rôle / pi²</small><b>${x.roleSqft?num(x.roleSqft,2)+' $/pi²':'À valider'}</b></div>
        <div><small>Propriétaire au rôle</small><b>${x.ownerRole}</b></div><div><small>Groupe projet</small><b>${x.holder}</b></div>
      </div>
      <div class="mt-4"><div class="eyebrow">Hypothèse commerciale</div><h2>Valeur indicative tel quel</h2><p class="lead">${raw?money(raw):'Non calculable'} ${raw?'sur la base de 1,50 $/pi².':''}</p><p class="muted">Cette valeur est une hypothèse interne et ne constitue pas une évaluation agréée ni un prix demandé définitif.</p></div>
      <div class="mt-4"><div class="eyebrow">Constructibilité</div><h2>Points à confirmer avant mise en marché</h2><div class="grid-2"><div class="card"><h3>Urbanisme</h3><p>Zone PRA1589, superficie minimale applicable, marge, frontage, accès et conformité d’un lot desservi par la rue projetée.</p></div><div class="card"><h3>Infrastructure</h3><p>Raccordement au chemin, drainage, profil du terrain, coûts attribuables et calendrier de construction.</p></div><div class="card"><h3>Environnement</h3><p>Contraintes naturelles, couvert boisé, cours d’eau / milieux humides et autorisations requises.</p></div><div class="card"><h3>Titre</h3><p>Registre foncier, servitudes, droits de passage et plan d’arpentage à confirmer avant transaction.</p></div></div></div>
    </div><aside class="card side-card"><div class="meta">Résumé</div><h3>Lot ${x.label}</h3><div class="metric-list"><div class="metric-row"><span>Groupe</span><strong>${x.group}</strong></div><div class="metric-row"><span>Surface</span><strong>${sqft(x.sqft)}</strong></div><div class="metric-row"><span>Valeur rôle</span><strong>${money(x.assessment)}</strong></div><div class="metric-row"><span>Hypothèse 1,50 $/pi²</span><strong>${raw?money(raw):'À valider'}</strong></div></div><div class="actions"><a class="btn primary" href="terrains.html">Retour à l’inventaire</a><a class="btn secondary" href="routes.html">Voir les routes</a></div></aside></div></section>`;
});
