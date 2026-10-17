import { getStore } from "@netlify/blobs";
import { randomUUID } from "node:crypto";
const json=(obj,status=200)=>Response.json(obj,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
export default async function handler(req){
 if(req.method!=="POST")return json({error:"Method Not Allowed"},405);
 const origin=req.headers.get("origin");
 if(origin && origin!==new URL(req.url).origin)return json({error:"Origine interdite"},403);
 if(Number(req.headers.get("content-length")||0)>10000)return json({error:"Demande trop grande"},413);
 let body;try{body=await req.json()}catch{return json({error:"Contenu invalide"},400)}
 if(body.website)return json({ok:true});
 const name=String(body.name||"").trim().slice(0,100);
 const email=String(body.email||"").trim().slice(0,200);
 const message=String(body.message||"").trim().slice(0,1500);
 const phone=String(body.phone||"").trim().slice(0,35);
 const lot=String(body.lot||"").trim().slice(0,8);
 const kind=String(body.kind||"autre").trim().slice(0,40);
 if(name.length<2||!/^.+@.+\..+$/.test(email)||message.length<10)return json({error:"Champs invalides"},400);
 const now=new Date().toISOString(),id=randomUUID();
 try {
  await getStore("domaine-leads").setJSON("lead/"+id,{id,name,email,phone,lot,kind,message,createdAt:now,status:"nouveau"});
  return json({ok:true});
 }catch(e){console.error("lead storage failure",e);return json({error:"Serveur indisponible"},503)}
}
export const config={rateLimit:{action:"rate_limit",aggregateBy:"ip",windowSize:60,windowLimit:3}};
