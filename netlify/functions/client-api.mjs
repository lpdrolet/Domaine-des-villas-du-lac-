import {getUser} from "@netlify/identity";
import {getStore} from "@netlify/blobs";
import {randomUUID} from "node:crypto";
const json=(v,s=200)=>Response.json(v,{status:s,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
const ids=new Set(["1800347","1800348","1800385","1800387","1800388","1800389","1800390","1800391","1800392","1800393","1800394","1800395","1800411","1800412","1800413","1800414"]);
export default async function handler(req){
 let user;try{user=await getUser()}catch{return json({error:"Connexion Identity non configurée"},401)}
 if(!user?.id||!user?.email)return json({error:"Connexion nécessaire"},401);
 const key="user/"+user.id,store=getStore({name:"domaine-clients",consistency:"strong"});
 const model=await store.get(key,{type:"json"}).catch(()=>null)||{favorites:[],requests:[],documents:[]};
 if(req.method==="GET")return json({email:user.email,...model});
 if(req.method!=="POST")return json({error:"Méthode non autorisée"},405);
 if(req.headers.get("origin")!==new URL(req.url).origin)return json({error:"Origine non autorisée"},403);
 if(Number(req.headers.get("content-length")||0)>5000)return json({error:"Demande trop grande"},413);
 let body;try{body=await req.json()}catch{return json({error:"Contenu invalide"},400)}
 if(body.action==="favorite"){
 const id=String(body.lot||"");if(!ids.has(id))return json({error:"Lot invalide"},400);
 model.favorites=Array.isArray(model.favorites)?model.favorites.filter(x=>ids.has(x)):[];
 model.favorites=body.enabled?Array.from(new Set([...model.favorites,id])):model.favorites.filter(x=>x!==id);
 }else if(body.action==="request"){
 const id=String(body.lot||"");
 if(id&&!ids.has(id))return json({error:"Lot invalide"},400);
 const message=String(body.message||"").trim().slice(0,1200);
 if(message.length<10)return json({error:"Message trop court (10 caractères minimum)"},400);
 const item={id:randomUUID(),lot:id,message,createdAt:new Date().toISOString(),status:"reçu"};
 model.requests=[item,...(model.requests||[])].slice(0,50);
 await getStore("domaine-leads").setJSON("lead/"+item.id,{...item,name:String(user.email).split("@")[0],email:user.email,kind:"client",createdAt:item.createdAt,phone:""});
 }else return json({error:"Action inconnue"},400);
 model.documents=Array.isArray(model.documents)?model.documents:[]; // Future files require explicit admin sharing
 await store.setJSON(key,model);return json({ok:true,...model});
}
export const config={rateLimit:{action:"rate_limit",aggregateBy:"ip",windowSize:60,windowLimit:8}};
