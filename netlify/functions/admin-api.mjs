import { getUser } from "@netlify/identity";
import { getStore } from "@netlify/blobs";
const noCache={"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"};
const json=(obj,status=200)=>Response.json(obj,{status,headers:noCache});
const validLot=v=>/^\d{7}$/.test(String(v||""));
export default async function handler(req) {
 let user;
 try {user=await getUser();} catch(e){return json({error:"Session invalide ou Identity non configuré"},401)}
 if(!user)return json({error:"Connexion nécessaire"},401);
 if(!Array.isArray(user.roles)||!user.roles.includes("admin"))return json({error:"Accès réservé au rôle administrateur"},403);
 if(req.method==="GET"){
  const what=new URL(req.url).searchParams.get("resource");
  if(what==="leads"){
   const store=getStore("domaine-leads"),listed=await store.list({prefix:"lead/"});
   const leads=[];
   for(const entry of (listed.blobs||[]).slice(-100)){
    const v=await store.get(entry.key,{type:"json"});
    if(v)leads.push(v);
   }
   return json({leads:leads.sort((a,b)=>(b.createdAt||"").localeCompare(a.createdAt||""))});
  }
  if(what==="listings"){
   const store=getStore("domaine-public"),listing=await store.list({prefix:"lot-"}),lots={};
   for(const entry of (listing.blobs||[])){
    const id=entry.key.replace(/^lot-/,"");if(!validLot(id))continue;
    lots[id]=await store.get(entry.key,{type:"json"});
   }
   return json({lots});
  }
  return json({email:user.email,roles:user.roles});
 }
 if(req.method!=="POST")return json({error:"Méthode interdite"},405);
 const origin=req.headers.get("origin");
 if(origin && origin!==new URL(req.url).origin)return json({error:"Origine interdite"},403);
 if(Number(req.headers.get("content-length")||"0")>12000)return json({error:"Taille excessive"},413);
 let body;try{body=await req.json()}catch{return json({error:"JSON invalide"},400)}
 if(body.action!=="saveListing"||!validLot(body.lot))return json({error:"Données invalides"},400);
 const acceptable=["Disponible","Information sur demande","Réservé","Vendu"];
 const subtitle=String(body.subtitle||"").trim().slice(0,300);
 const photoUrl=String(body.photoUrl||"").trim().slice(0,600);
 const status=acceptable.includes(body.status)?body.status:"Information sur demande";
 if(photoUrl && (!/^https:\/\//i.test(photoUrl)||/[<>"']/.test(photoUrl)))return json({error:"Adresse photo invalide : HTTPS requis"},400);
 const store=getStore("domaine-public");
 await store.setJSON("lot-"+body.lot,{status,subtitle,photoUrl,updatedAt:new Date().toISOString(),updatedBy:user.id});
 return json({ok:true});
}