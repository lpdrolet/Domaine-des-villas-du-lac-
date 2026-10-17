import {getUser,oauthLogin,logout,handleAuthCallback} from "@netlify/identity";
const D=window.DOMAIN_DATA||{lots:[]},$=id=>document.getElementById(id);
const escape=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const api=async(body)=>{const r=await fetch("/.netlify/functions/client-api",{method:body?"POST":"GET",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:body?JSON.stringify(body):undefined});const x=await r.json();if(!r.ok)throw Error(x.error||"Erreur serveur");return x};
const lotText=id=>D.lots.find(x=>x.id===id)?.label||id;
let state=null;
async function render(user){
 const pre=new URLSearchParams(location.search).get("favori");
 if(pre&&D.lots.some(x=>x.id===pre)&&!state.favorites.includes(pre)){state=await api({action:"favorite",lot:pre,enabled:true});history.replaceState(null,"","/client.html")}
 const container=$("client-root");
 container.innerHTML='<div class="wrap"><div class="hrow"><div><span class="eyebrow">ESPACE CLIENT</span><h1 style="font-size:2.65rem">Mon espace du domaine</h1><p class="muted">'+escape(user.email)+' · Terrains suivis et demandes de contact</p></div><button id="signout" class="btn btn-outline">Déconnexion</button></div>'
 +'<div class="cols-2" style="margin-top:28px"><div class="panel"><h3>Mes terrains favoris</h3><p class="tiny">Favoris sauvegardés avec votre compte.</p><div id="faves"></div></div><div class="panel"><h3>Demande d’information</h3><form id="client-request"><div class="field"><label for="favorite-lot">Terrain visé</label><select id="favorite-lot" name="lot"><option value="">Projet en général</option>'+D.lots.map(l=>'<option value="'+l.id+'">Lot '+escape(l.label)+'</option>').join("")+'</select></div><div class="field" style="margin-top:12px"><label for="request-msg">Votre message</label><textarea id="request-msg" name="message" required minlength="10" maxlength="1200" placeholder="Je souhaite en savoir plus sur…"></textarea></div><button class="btn btn-primary" style="margin-top:13px" type="submit">Transmettre ma demande</button><p id="request-feedback" class="tiny"></p></form></div></div>'
 +'<div class="cols-2" style="margin-top:22px"><div class="panel"><h3>Historique de mes demandes</h3><div id="requests"></div></div><div class="panel"><h3>Documents partagés</h3><p class="muted">Aucun document individuel n’est actuellement partagé avec ce compte. Demandez la documentation disponible à l’équipe du projet.</p><a class="btn btn-outline btn-sm" href="/contact.html?objet=documents">Demander un document</a></div></div></div>';
 $("signout").onclick=async()=>{await logout();location.reload()};
 $("client-request").onsubmit=async e=>{e.preventDefault();const fd=Object.fromEntries(new FormData(e.target));const msg=$("request-feedback");msg.textContent="Transmission…";try{state=await api({action:"request",...fd});draw();e.target.reset();msg.textContent="Demande reçue et ajoutée à votre dossier."}catch(err){msg.textContent=err.message}};
 draw();
}
function draw(){
 $("faves").innerHTML=state.favorites.length?state.favorites.map(id=>'<div class="feature"><span><a class="mini-link" href="/terrains/'+id+'.html">Lot '+escape(lotText(id))+' ↗</a></span><button class="btn btn-outline btn-sm" data-remove="'+id+'">Retirer</button></div>').join(""):'<p class="muted">Aucun favori. Ajoutez-en à partir des fiches de terrains.</p>';
 document.querySelectorAll("[data-remove]").forEach(b=>b.onclick=async()=>{state=await api({action:"favorite",lot:b.dataset.remove,enabled:false});draw()});
 $("requests").innerHTML=state.requests.length?state.requests.slice(0,10).map(r=>'<div class="feature" style="display:block"><div class="tiny">'+escape(r.createdAt.slice(0,10))+' · '+escape(r.lot?lotText(r.lot):"Projet")+'</div><div>'+escape(r.message)+'</div></div>').join(""):'<p class="muted">Aucune demande envoyée depuis cet espace.</p>';
}
async function init(){
 $("client-header").innerHTML='<div class="sitebar">DOMAINE DES VILLAS DU LAC · ESPACE CLIENT</div><header class="header"><div class="wrap header-inner"><a class="logo" href="/"><img src="/assets/domaine-logo.webp" alt="Logo"><div class="brand">DOMAINE DES VILLAS DU LAC<span>MON DOSSIER</span></div></a><a class="btn btn-outline btn-sm" href="/terrains.html">Les terrains</a></div></header>';
 $("client-footer").innerHTML='<footer class="footer"><div class="wrap"><p>Les superficies et la constructibilité restent à vérifier. Les documents privés ne sont accessibles qu’aux comptes autorisés.</p></div></footer>';
 try{await handleAuthCallback();const user=await getUser();if(!user){$("client-root").innerHTML='<div class="wrap"><div class="panel form-panel"><span class="eyebrow">ACCÈS CLIENT</span><h1 style="font-size:2.8rem">Suivez votre projet immobilier.</h1><p>Connectez-vous avec Google pour enregistrer vos favoris et retrouver vos demandes.</p><button class="btn btn-dark" id="google-btn">Continuer avec Google</button><p class="tiny">La connexion doit d’abord être activée dans Netlify Identity.</p></div></div>';$("google-btn").onclick=()=>oauthLogin("google");return}
 state=await api();await render(user);
 }catch(e){$("client-root").innerHTML='<div class="wrap"><div class="panel form-panel"><h2>Connexion temporairement indisponible</h2><p>'+escape(e.message)+'</p><a class="btn btn-outline" href="/contact.html">Contacter le projet</a></div></div>'}
}
document.addEventListener("DOMContentLoaded",init);
