import {getUser,oauthLogin,handleAuthCallback,logout} from "@netlify/identity";
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let currentUser=null,adminRows=[];
async function identityState(){
 try{await handleAuthCallback();currentUser=await getUser()}catch(e){console.warn("Identity not ready",e);currentUser=null}
 return currentUser;
}
function signGoogle(){try{oauthLogin("google")}catch(e){const dest=$("admin-message")||$("client-auth-message");if(dest)dest.textContent="Connexion Google non configurée dans Netlify Identity. Activez Identity, Google et les invitations dans les réglages Netlify."}}
async function signOut(){try{await logout()}catch(e){console.error(e)}location.reload()}
function input(label,name,value,type="text"){return '<div class="field"><label for="adm-'+name+'">'+label+'</label><input id="adm-'+name+'" name="'+name+'" type="'+type+'" value="'+esc(value??"")+'"></div>'}
function textArea(label,name,val){return '<div class="field"><label for="adm-'+name+'">'+label+'</label><textarea id="adm-'+name+'" name="'+name+'">'+esc(val??"")+'</textarea></div>'}
function renderAdminEntry(item){
 const l=item||{id:"",area:"",description:"",price:"",status:"a_confirmer",publishPrice:false,image:"",zoning:"",services:"",dimensions:"",highlights:[],custom:true};
 return '<form id="edit-lot"><h3>'+(l.id?"Modifier le lot "+esc(l.id):"Ajouter un terrain (non validé)")+'</h3><div class="form-grid">'+input("Numéro cadastral à 7 chiffres","id",l.id)+input("Superficie graphique ou mesurée (m²)","area",l.area,"number")+'</div><div class="form-grid" style="margin-top:12px"><div class="field"><label for="adm-status">Statut commercial</label><select id="adm-status">'+[["a_confirmer","Étude en cours"],["disponible","Disponible"],["reserve","Réservé"],["vendu","Vendu"],["retire","Retiré"]].map(([x,y])=>'<option value="'+x+'" '+(l.status===x?"selected":"")+'>'+y+'</option>').join("")+'</select></div>'+input("Prix demandé ($)","price",l.price,"number")+'</div><p class="checkboxline" style="margin-top:13px"><input id="adm-publish" type="checkbox" '+(l.publishPrice?"checked":"")+'><label for="adm-publish">Publier ce prix dans la vitrine publique</label></p><div style="margin-top:12px">'+textArea("Description du terrain","description",l.description)+'</div><div class="form-grid" style="margin-top:12px">'+input("Zonage (vérifié seulement)","zoning",l.zoning)+input("Dimensions (vérifiées seulement)","dimensions",l.dimensions)+'</div><div style="margin-top:12px">'+textArea("Services et desserte","services",l.services)+'</div><div style="margin-top:12px">'+textArea("Points forts (une ligne par point)","highlights",(l.highlights||[]).join("\n"))+'</div><div style="margin-top:12px">'+input("URL de l’image principale","image",l.image)+'</div><div class="form-grid" style="margin-top:12px">'+input("Latitude (nouveau lot)","lat",l.lat||"","number")+input("Longitude (nouveau lot)","lon",l.lon||"","number")+'</div><div class="button-bar" style="margin-top:18px"><button class="btn btn-primary" type="submit">Enregistrer les modifications</button><button id="remove-lot" class="btn btn-outline" type="button" '+(!l.id?"disabled":"")+'>Retirer l’annonce</button></div><p id="edit-result" role="status" class="tiny"></p></form><hr style="margin:25px 0;border:0;border-top:1px solid #ddeae6"><h3>Photos et documents</h3><p class="tiny">Téléversez une image publique ou un PDF privé (7 Mo maximum). La publication de photos nécessite vos droits d’utilisation.</p><input type="file" id="adm-file" accept=".jpg,.jpeg,.png,.webp,.pdf"><label style="font-size:.79rem"><input type="checkbox" id="adm-media-public" checked> Autoriser l’accès public au fichier</label><button id="upload-file" class="btn btn-outline btn-sm" type="button">Téléverser</button><p id="upload-result" class="tiny" role="status"></p>';
}
async function callAdmin(endpoint,options={}){
 const res=await fetch(endpoint,{credentials:"same-origin",...options});
 let json;try{json=await res.json()}catch{json={error:"Service non disponible"}}
 if(!res.ok)throw new Error(json.error||"Erreur serveur "+res.status);
 return json;
}
async function initAdmin(){
 const host=$("admin-app");if(!host)return;
 if(!currentUser){host.innerHTML='<div class="panel form-panel"><span class="eyebrow">Authentification requise</span><h2>Accès réservé</h2><p>Connectez-vous avec le compte Google invité pour gérer le projet. Un rôle administrateur vérifié sur le serveur est obligatoire.</p><button id="admin-google" class="btn btn-primary">Continuer avec Google →</button><p class="tiny" id="admin-message">Google Identity doit être activé dans Netlify avant utilisation.</p></div>';$("admin-google").addEventListener("click",signGoogle);return}
 try{
  const results=await callAdmin("/api/estate-admin");
  adminRows=results.overrides;
  host.innerHTML='<div class="admin-banner"><strong>Session autorisée</strong> · '+esc(currentUser.email)+' <button id="admin-out" class="btn btn-outline btn-sm" style="float:right">Se déconnecter</button><p class="tiny">Données enregistrement sécurisé. Le statut « disponible » n’est pas une certification de droit de construire.</p></div><div class="admin-layout" style="margin-top:20px"><div class="panel admin-list"><div class="hrow"><h3>Terrains</h3><button id="add-lot" class="btn btn-outline btn-sm">+ Ajouter</button></div><div id="admin-select"></div></div><div class="panel"><div id="admin-editor"></div></div></div>';
  $("admin-out").addEventListener("click",signOut);$("add-lot").addEventListener("click",()=>activate(null));refreshList();activate(null);
 }catch(err){host.innerHTML='<div class="panel form-panel"><h3>Accès non accordé</h3><p>'+esc(err.message)+'</p><p>Le compte doit être invité, et le rôle <strong>admin</strong> attribué par le propriétaire dans Netlify Identity. Ce contrôle est appliqué sur le serveur.</p><button id="admin-out" class="btn btn-outline">Se déconnecter</button></div>';$("admin-out").addEventListener("click",signOut);}
}
function refreshList(){
 const root=$("admin-select"),original=window.ESTATE_PUBLIC?.getLots()||[];
 const combined=[...original,...adminRows.filter(x=>x.custom&&!original.some(l=>l.id===x.id))].sort((a,b)=>a.id.localeCompare(b.id));
 root.innerHTML=combined.map(l=>'<button type="button" data-id="'+l.id+'">'+esc(l.label||l.id)+' · '+(adminRows.find(x=>x.id===l.id)?.status||"a_confirmer")+'</button>').join("");
 root.querySelectorAll("button[data-id]").forEach(btn=>btn.addEventListener("click",()=>activate(btn.dataset.id)));
}
function activate(id){
 const original=window.ESTATE_PUBLIC?.getLot(id),override=adminRows.find(x=>x.id===id);
 const item=id?{...original,...override,id}:null;
 $("admin-editor").innerHTML=renderAdminEntry(item);
 $("edit-lot").addEventListener("submit",saveEntry);
 $("remove-lot").addEventListener("click",removeEntry);
 $("upload-file").addEventListener("click",upload);
 if(id)$("adm-id").readOnly=true;
}
function fromForm(){
 const el=id=>$("adm-"+id);
 const id=el("id").value.replace(/\s/g,"");
 const base=window.ESTATE_PUBLIC?.getLot(id);
 return {id,custom:!base||base.custom===true,area:Number(el("area").value),status:el("status").value,price:el("price").value?Number(el("price").value):null,publishPrice:$("adm-publish").checked,description:el("description").value,zoning:el("zoning").value,dimensions:el("dimensions").value,services:el("services").value,highlights:el("highlights").value.split(/\n/).map(s=>s.trim()).filter(Boolean),image:el("image").value,lat:Number(el("lat").value)||undefined,lon:Number(el("lon").value)||undefined}
}
async function saveEntry(ev){
 ev.preventDefault();const box=$("edit-result");box.textContent="Enregistrement…";
 try{const data=fromForm();if(!/^\d{7}$/.test(data.id)||!(data.area>0))throw Error("Le numéro cadastral et la superficie sont requis");const res=await callAdmin("/api/estate-admin",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});adminRows=adminRows.filter(x=>x.id!==data.id).concat([res.entry]);box.textContent="Enregistré. Actualiser la vitrine pour vérifier le résultat.";refreshList();}catch(e){box.textContent="Échec : "+e.message}
}
async function removeEntry(){
 if(!confirm("Retirer cette annonce de la commercialisation ? Le lot cadastral reste dans le registre."))return;
 const id=$("adm-id").value;try{await callAdmin("/api/estate-admin?id="+id,{method:"DELETE"});$("edit-result").textContent="Annonce retirée. Le lot cadastral n’est pas supprimé.";adminRows=adminRows.filter(x=>x.id!==id).concat([{id,status:"retire",publishPrice:false}]);refreshList()}catch(e){$("edit-result").textContent=e.message}
}
async function upload(){
 const file=$("adm-file")?.files?.[0],out=$("upload-result");if(!file){out.textContent="Choisissez un fichier.";return}out.textContent="Téléversement…";
 try{const form=new FormData();form.append("file",file);form.append("public",$("adm-media-public").checked?"yes":"no");const res=await callAdmin("/api/estate-media",{method:"POST",body:form});out.innerHTML="Fichier ajouté : <a href='"+esc(res.url)+"' target='_blank' rel='noopener'>Consulter</a>. "+(res.public?"Public":"Privé");if(file.type.startsWith("image/")&&res.public)$("adm-image").value=res.url;}catch(e){out.textContent="Téléversement échoué : "+e.message}
}
async function initClient(){
 const button=$("client-signin"),msg=$("client-auth-message");if(!button)return;
 button.addEventListener("click",signGoogle);
 $("client-signout").addEventListener("click",signOut);
 if(currentUser){button.classList.add("visible-none");$("client-signout").classList.remove("visible-none");msg.textContent="Connecté : "+currentUser.email+". Les favoris restent pour l'instant stockés localement sur cet appareil."}
 else msg.textContent="Pour une connexion Google, le fournisseur doit être activé dans Netlify Identity.";
}
async function main(){await identityState();const page=document.body.dataset.estatePage;
 const boot=()=>page==="admin"?initAdmin():page==="client"?initClient():null;
 if((page==="admin"&&$("admin-app"))||(page==="client"&&$("client-signin"))){boot();return}
 document.addEventListener("estate-rendered",boot,{once:true});
}
main().catch(e=>console.error("auth init",e));
