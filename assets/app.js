(function(){
  const path = location.pathname.split('/').pop() || 'index.html';
  const inLots = false;
  const prefix = '';
  const nav = [
    ['index.html','Accueil'],['terrains.html','Terrains'],['routes.html','Routes'],['finances.html','Plan d’affaires'],['documents.html','Documents']
  ];
  const activeFile = path==='lot.html' ? 'terrains.html' : path;
  const header = `
    <div class="topbar"><div class="container"><span><strong>Dossier de développement</strong> · Deauville / Sherbrooke</span><span>Données de travail · mise à jour ${window.DOMAIN_DATA?.updated || ''}</span></div></div>
    <header class="site-header"><div class="container nav-wrap">
      <a class="brand" href="${prefix}index.html"><img src="${prefix}assets/logo.svg" alt="Logo Domaine des Villas du Lac"><div class="brand-title">DOMAINE <span>DES VILLAS DU LAC</span></div></a>
      <button class="menu-btn" aria-label="Ouvrir le menu">Menu</button>
      <nav class="nav">${nav.map(([href,label])=>`<a class="${activeFile===href?'active':''}" href="${prefix}${href}">${label}</a>`).join('')}<a class="cta" href="${prefix}terrains.html#inventaire">Inventaire</a></nav>
    </div></header>`;
  const footer = `<footer class="footer"><div class="container"><div class="footer-grid">
    <div><a class="brand" href="${prefix}index.html"><img src="${prefix}assets/logo.svg" alt=""><div class="brand-title">DOMAINE <span>DES VILLAS DU LAC</span></div></a><p>Plateforme de travail pour structurer la décision de vente ou de développement des terrains de la rue des Villas.</p></div>
    <div><h4>Projet</h4><a href="${prefix}terrains.html">Terrains</a><a href="${prefix}routes.html">Construction des routes</a><a href="${prefix}finances.html">Scénarios financiers</a></div>
    <div><h4>Diligence</h4><a href="${prefix}documents.html">Documents</a><a href="${prefix}documents.html#sources">Sources</a><a href="${prefix}documents.html#actions">Actions à valider</a></div>
    <div><h4>Statut</h4><p>Données préliminaires. Les titres, superficies, droits de passage, contraintes environnementales et permis doivent être confirmés avant une transaction ou des travaux.</p></div>
  </div><div class="footer-bottom"><span>© 2026 Domaine des Villas du Lac</span><span>Document de travail — non destiné à constituer un avis juridique, fiscal ou d’ingénierie.</span></div></div></footer>`;
  const h=document.querySelector('[data-site-header]'); if(h) h.innerHTML=header;
  const f=document.querySelector('[data-site-footer]'); if(f) f.innerHTML=footer;
  const btn=document.querySelector('.menu-btn'), n=document.querySelector('.nav'); if(btn&&n) btn.addEventListener('click',()=>n.classList.toggle('open'));

  window.money = n => n==null ? 'À valider' : new Intl.NumberFormat('fr-CA',{style:'currency',currency:'CAD',maximumFractionDigits:0}).format(n);
  window.num = (n,d=0) => n==null ? 'À valider' : new Intl.NumberFormat('fr-CA',{maximumFractionDigits:d}).format(n);
  window.sqft = n => n==null ? 'À valider' : `${num(n,0)} pi²`;
  window.acres = n => n==null ? 'À valider' : `${num(n/43560,2)} ac`;
  window.badgeClass = s => s.includes('Validation')?'pending':s.includes('Sous')?'warn':'good';
})();
