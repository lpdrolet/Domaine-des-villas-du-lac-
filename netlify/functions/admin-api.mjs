import {getUser} from "@netlify/identity";
import {getStore} from "@netlify/blobs";
const headers={"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"};
const json=(obj,status=200)=>Response.json(obj,{status,headers});
const ids=new Set(["1800347","1800348","1800385","1800387","1800388","1800389","1800390","1800391","1800392","1800393","1800394","1800395","1800411","1800412","1800413","1800414"]);
const emailAllowed=user=>{
 const allow=(Netlify.env.get("ADMIN_ALLOWED_EMAILS")||"").toLowerCase().split(",").map(v=>v.trim()).filter(Boolean);
 return allow.length>0 && allow.includes(String(user?.email||"").toLowerCase());
};
export default async function handler(req){
 let user;try{user=await getUser()}catch(e){return json({error:"Connexion Identity indisponible"},401)}
 if(!user)return json({error:"Authentification nécessaire"},401);
 if(!user.roles?.includes("admin")||!emailAllowed(user))return json({error:"Compte non autorisé. Vérifier le rôle admin et ADMIN_ALLOWED_EMAILS dans Netlify."},403);
 const store=getStore({name:"domaine-public",consistency:"strong"});
 if(req.method==="GET"){
  const resource=new URL(req.url).searchParams.get("resource");
  if(resource==="leads"){
   const leadsStore=getStore("domaine-leads");
   const result=await leadsStore.list({prefix:"lead/"});const leads=[];
   for(const item of (result.blobs||[]).slice(-100)){const l=await leadsStore.get(item.key,{type:"json"});if(l)leads.push(l)}
   return json({leads:leads.sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)))});
  }
  if(resource==="listings"){
   const lots={};
   for(const id of ids){const lot=await store.get("lot-"+id,{type:"json"});if(lot)lots[id]=lot;}
   return json({lots});
  }
  return json({email:user.email,roles:user.roles,admin:true});
 }
 if(req.method!=="POST")return json({error:"Méthode non autorisée"},405);
 const origin=req.headers.get("origin");if(origin!==new URL(req.url).origin)return json({error:"Origine non autorisée"},403);
 if(Number(req.headers.get("content-length")||0)>16000)return json({error:"Contenu trop volumineux"},413);
 let body;try{body=await req.json()}catch{return json({error:"JSON invalide"},400)}
 const lot=String(body.lot||"");if(!ids.has(lot))return json({error:"Lot non répertorié au cadastre du projet"},400);
 if(body.action==="resetListing"){await store.delete("lot-"+lot);return json({ok:true,reset:true})}
 if(body.action!=="saveListing")return json({error:"Action inconnue"},400);
 const statuses=["Information sur demande","Disponible","Réservé","Vendu"];
 const status=statuses.includes(body.status)?body.status:"Information sur demande";
 const subtitle=String(body.subtitle||"").trim().slice(0,300);
 const photoUrl=String(body.photoUrl||"").trim().slice(0,1000);
 const documentUrl=String(body.documentUrl||"").trim().slice(0,1000);
 const price=body.price==null||String(body.price).trim()===""?null:Number(body.price);
 const visible=body.visible!==false;
 if(price!==null&&(!Number.isInteger(price)||price<1000||price>10000000))return json({error:"Prix invalide"},400);
 if(photoUrl&&(!/^https:\/\/[^\s<>"']+$/i.test(photoUrl)))return json({error:"Lien photo HTTPS requis"},400);
 if(documentUrl&&(!/^https:\/\/[^\s<>"']+$/i.test(documentUrl)))return json({error:"Lien PDF HTTPS requis"},400);
 const updatedAt=new Date().toISOString();
 await store.setJSON("lot-"+lot,{status,subtitle,photoUrl,documentUrl,price,visible,updatedAt,updatedBy:user.id});
 return json({ok:true,updatedAt});
}