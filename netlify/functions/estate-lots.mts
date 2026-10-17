import { getStore } from "@netlify/blobs";

export default async function handler(req: Request) {
 if(req.method!=="GET") return new Response("Method not allowed",{status:405});
 try{
 const store=getStore({name:"domaine-listings",consistency:"strong"});
 const {blobs}=await store.list({prefix:"lot/"});
 const overrides:unknown[]=[];
 for(const b of blobs.slice(0,200)){
  const row=await store.get(b.key,{type:"json"});
  if(row && typeof row==="object")overrides.push(row);
 }
 return Response.json({overrides},{headers:{"Cache-Control":"public,max-age=30,stale-while-revalidate=60","X-Content-Type-Options":"nosniff"}});
 }catch(err){console.error("estate-lots",err);return Response.json({overrides:[],degraded:true},{headers:{"Cache-Control":"no-store"}})}
}
export const config={path:"/api/estate-lots"};