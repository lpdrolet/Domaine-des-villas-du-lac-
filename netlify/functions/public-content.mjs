import { getStore } from "@netlify/blobs";
export default async function handler(request) {
 if(request.method !== "GET") return new Response("Method Not Allowed",{status:405});
 try {
  const store=getStore("domaine-public");
  const keys=await store.list({prefix:"lot-"});
  const result={};
  for(const item of (keys.blobs||[]).slice(0,100)){
   const lot=String(item.key||"").replace(/^lot-/,"");
   if(!/^\d{7}$/.test(lot))continue;
   const entry=await store.get(item.key,{type:"json"});
   if(entry && typeof entry==="object"){
    result[lot]={
     status:entry.status||"Information sur demande",
     subtitle:entry.subtitle||"",
     photoUrl:entry.photoUrl||"",
    };
   }
  }
  return Response.json({lots:result},{headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
 }catch(e){
  console.error("public-content error",e);
  return Response.json({lots:{}},{status:200,headers:{"Cache-Control":"no-store"}});
 }
}