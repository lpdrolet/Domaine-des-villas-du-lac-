import {getUser,oauthLogin,logout,handleAuthCallback} from "@netlify/identity";
const D=window.DOMAIN_DATA||{lots:[]};
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let edits={},selected=null;
const fmt=n=>new Intl.NumberFormat("fr-CA").format(n);
const setAlert=s=>{$("admin-message").textContent=s};
async function api(route,opts={}){
 const res=await fetch("/.netlify/functions/admin-api"+route,{credentials:"same-origin",cache:"no-store",...opts});
 if(!res.ok){const data=await res.json().catch(()=>({}));throw new Error(data.error||"Erreur serveur "+res.status)}
 return res.json();
}
function noAuth(){
 $("admin-area").innerHTML='<div class="panel form-panel"><div class="eyebrow">ESPACE PRIVÉ</div><h2>Accès administrateur</h2><p>Connexion par compte Google autorisé. Seuls les utilisateurs ayant le rôle <b>admin</b> peuvent consulter ou modifier les données.</p><button id="google-login" class="btn btn-dark">Se connecter avec Google →</button><p class="tiny" style="margin-top:16px">Nécessite l’activation de Netlify Identity, du fournisseur Google et de l’inscription sur invitation dans le tableau de bord Netlify.</p></div>';
 $("google-login").addEventListener("click",()=>{oauthLogin("google")});
}
function deny(msg){
 $("admin-area").innerHTML='<div class="panel form-panel"><h2>Accès restreint</h2><p>'+esc(msg)+'</p><p>Le rôle administrateur doit être attribué par le responsable de Netlify Identity, jamais par le navigateur.</p><button class="btn btn-outline" id="signout">Se déconnecter</button></div>';
 $("signout").addEventListener("click",async()=>{await logout();location.reload()});
}
function drawAdmin(user){
 $("admin-area").innerHTML='<div class="panel"><div class="hrow"><div><div class="eyebrow">SESSION ADMINISTRATEUR</div><h2>Piloter les fiches et les demandes</h2><p class="tiny">Connecté : '+esc(user.email)+' · Modifications enregistrées côté serveur.</p></div><button id="logout" class="btn btn-outline btn-sm">Déconnexion</button></div><div class="button-bar" style="margin:22px 0"><button class="btn btn-primary" id="tab-lots">Fiches des terrains</button><button class="btn btn-outline" id="tab-leads">Demandes reçues</button></div><div id="admin-content"></div></div>';
 $("logout").addEventListener("click",async()=>{await logout();location.assign("/index.html")});
 $("tab-lots").addEventListener("click",drawLots);
 $("tab-leads").addEventListener("click",drawLeads);
 drawLots();
}
function drawLots(){
 const items=D.lots.slice().sort((a,b)=>a.id.localeCompare(b.id));
 $("admin-content").innerHTML='<div class="admin-layout"><div class="panel admin-list"><h3>Parcelles</h3><p class="tiny">16 fiches cadastrales</p>'+items.map(l=>'<button data-lot="'+esc(l.id)+'" class="'+(selected===l.id?"active":"")+'">Lot '+esc(l.label)+' · '+fmt(l.area)+' m²</button>').join("")+'</div><div id="lot-editor"></div></div>';
 document.querySelectorAll(".admin-list button[data-lot]").forEach(b=>b.addEventListener("click",()=>{selected=b.dataset.lot;drawLots();}));
 if(!selected)selected=items[0]?.id;
 const l=D.lots.find(x=>x.id===selected);if(!l)return;
 const edit=edits[l.id]||{};
 $("lot-editor").innerHTML='<div class="panel"><div class="eyebrow">ÉDITION PUBLIQUE</div><h3>Lot '+esc(l.label)+'</h3><p class="tiny">Superficie graphique : '+fmt(l.area)+' m², en lecture seule. La propriété, les titres et les offres confidentielles ne sont pas publiés.</p><form id="edit-form"><div class="field"><label for="status">Statut public</label><select id="status" name="status">'+["Information sur demande","Disponible","Réservé","Vendu"].map(v=>'<option '+(v===(edit.status||"Information sur demande")?"selected":"")+'>'+v+'</option>').join("")+'</select></div><div class="field" style="margin-top:14px"><label for="subtitle">Description (300 caractères)</label><textarea name="subtitle" id="subtitle" maxlength="300">'+esc(edit.subtitle||"")+'</textarea></div><div class="field" style="margin-top:14px"><label for="price">Prix public en $ (laisser vide = sur demande)</label><input name="price" id="price" type="number" min="1000" step="100" placeholder="Sur demande" value="'+esc(edit.price||"")+'"></div><div class="field" style="margin-top:14px"><label for="photoUrl">Adresse image HTTPS publique</label><input name="photoUrl" id="photoUrl" type="url" placeholder="https://..." value="'+esc(edit.photoUrl||"")+'"></div><div class="field" style="margin-top:14px"><label for="upload-image">Ou téléverser une photo publique (JPG, PNG, WebP)</label><input id="upload-image" type="file" accept="image/jpeg,image/png,image/webp"></div><div class="field" style="margin-top:14px"><label for="documentUrl">Lien PDF public</label><input name="documentUrl" id="documentUrl" type="url" placeholder="https://..." value="'+esc(edit.documentUrl||"")+'"></div><div class="field" style="margin-top:14px"><label for="upload-pdf">Ou téléverser un PDF public (max 6 Mo)</label><input id="upload-pdf" type="file" accept="application/pdf"></div><label class="checkboxline" style="margin-top:14px"><input id="visible" type="checkbox" '+(edit.visible!==false?"checked":"")+'>Afficher cette parcelle dans le catalogue public</label><p class="tiny">Ne téléversez aucun titre de propriété personnel, contrat ou document financier confidentiel : ces fichiers sont publiquement accessibles.</p><div class="admin-actions" style="margin-top:20px"><button class="btn btn-primary" type="submit">Enregistrer la fiche →</button><a href="/terrains/'+l.id+'.html" target="_blank" rel="noopener" class="btn btn-outline">Aperçu public ↗</a></div><p id="lot-result" aria-live="polite" class="tiny"></p></form></div>';
 $("edit-form").addEventListener("submit",async ev=>{
 ev.preventDefault();const data=Object.fromEntries(new FormData(ev.target));
 $("lot-result").textContent="Enregistrement…";
 try{
 const img=$("upload-image").files[0],pdf=$("upload-pdf").files[0];
 for(const [file,field] of [[img,"photoUrl"],[pdf,"documentUrl"]]){
  if(!file)continue;
  const form=new FormData();form.append("file",file);
  const response=await fetch("/.netlify/functions/media",{method:"POST",body:form,credentials:"same-origin"});
  const upload=await response.json();if(!response.ok)throw Error(upload.error||"Téléversement refusé");
  data[field]=upload.url;
 }
 data.visible=$("visible").checked;
 data.price=$("price").value.trim()===""?null:Number($("price").value);
 await api("",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"saveListing",lot:l.id,...data})});edits[l.id]=data;$("lot-result").textContent="Fiche mise à jour. Rechargez la page publique pour voir les changements."}
 catch(e){$("lot-result").textContent=e.message}
 });
}
async function drawLeads(){
 $("admin-content").innerHTML='<div class="loading">Chargement des demandes…</div>';
 try{
  const {leads=[]}=await api("?resource=leads");
  $("admin-content").innerHTML='<h3>Demandes de présentation reçues ('+leads.length+')</h3>'+(leads.length?'<div class="table-wrap"><table class="dtable"><thead><tr><th>Date</th><th>Nom</th><th>Coordonnées</th><th>Terrain</th><th>Message</th></tr></thead><tbody>'+leads.map(x=>'<tr><td>'+esc((x.createdAt||"").slice(0,16).replace("T"," "))+'</td><td>'+esc(x.name)+'</td><td><a href="mailto:'+encodeURIComponent(x.email)+'">'+esc(x.email)+'</a><br>'+esc(x.phone||"")+'</td><td>'+esc(x.lot||"Général")+'</td><td>'+esc(x.message)+'</td></tr>').join("")+'</tbody></table></div>':'<div class="empty">Aucune demande enregistrée.</div>');
 }catch(e){$("admin-content").innerHTML='<p class="warning-note">'+esc(e.message)+'</p>'}
}
async function init(){
 $("site-header").innerHTML='<div class="sitebar">DOMAINE DES VILLAS DU LAC · ESPACE ADMINISTRATION</div><header class="header"><div class="wrap header-inner"><a class="logo" href="/index.html"><img src="/assets/domaine-logo.webp" alt="Logo"><div class="brand">DOMAINE DES VILLAS DU LAC<span>GESTION DES TERRAINS</span></div></a><a href="/index.html" class="btn btn-outline btn-sm">Retour au site ↗</a></div></header>';
 $("site-footer").innerHTML='<footer class="footer"><div class="wrap"><p class="tiny">Administration privée. Ne jamais publier de documents d’offres, dossiers fiscaux ou données foncières personnelles dans le dépôt public.</p></div></footer>';
 try{await handleAuthCallback();const user=await getUser();if(!user)return noAuth();
   $("admin-message").textContent="Vérification des droits administrateur…";
   await api("");const stored=await api("?resource=listings");edits=stored.lots||{};drawAdmin(user);setAlert("");
 }catch(e){const message=String(e.message||e);
   if(message.includes("403")||message.includes("administrateur")||message.includes("réservé"))deny(message);
   else {noAuth();setAlert("Authentification indisponible ou non activée. Configurez Netlify Identity (Google / inscription par invitation) avant la première connexion.");console.error(e)}
 }
}
document.addEventListener("DOMContentLoaded",init);
