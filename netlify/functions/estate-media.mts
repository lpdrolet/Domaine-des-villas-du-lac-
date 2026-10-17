import {getUser} from "@netlify/identity";
import {getStore} from "@netlify/blobs";
const types=["image/jpeg","image/png","image/webp","application/pdf"];
async function authorizeAdmin(){
 try{const u=await getUser();return !!(u&&u.roles?.includes("admin"));}catch{return false}
}
export default async function handler(req:Request){
 const store=getStore({name:"domaine-media",consistency:"strong"});
 if(req.method==="POST"){
  if(!(await authorizeAdmin()))return Response.json({error:"Accès administrateur requis"},{status:403});
  try{
   const f=await req.formData(),file=f.get("file");
   if(!(file instanceof File))return Response.json({error:"Fichier manquant"},{status:400});
   if(!types.includes(file.type)||file.size>7_000_000)return Response.json({error:"Image JPEG/PNG/WebP ou PDF, taille maximale 7 Mo"},{status:400});
   const publicity=f.get("public")==="yes";
   const key=crypto.randomUUID().replace(/-/g,"")+"."+(file.type==="application/pdf"?"pdf":file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg");
   await store.set(key,file,{metadata:{mime:file.type,public:publicity?"yes":"no"}});
   return Response.json({url:"/api/estate-media?key="+key,key,public:publicity});
  }catch(e){console.error("upload",e);return Response.json({error:"Échec du téléversement"},{status:500})}
 }
 if(req.method==="GET"){
  const key=new URL(req.url).searchParams.get("key");
  if(!key||!/^[a-f0-9]{32}\.(?:jpg|png|webp|pdf)$/.test(key))return new Response("Introuvable",{status:404});
  const found=await store.getWithMetadata(key,{type:"arrayBuffer"});
  if(!found)return new Response("Introuvable",{status:404});
  if(found.metadata?.public!=="yes"&&!(await authorizeAdmin()))return new Response("Non autorisé",{status:403});
  const mime=typeof found.metadata?.mime==="string"&&types.includes(found.metadata.mime)?found.metadata.mime:"application/octet-stream";
  return new Response(found.data,{headers:{"Content-Type":mime,"Content-Disposition":"inline","Cache-Control":found.metadata?.public==="yes"?"public,max-age=3600":"private,no-store","X-Content-Type-Options":"nosniff"}});
 }
 return new Response("Méthode non autorisée",{status:405});
}
export const config={path:"/api/estate-media"};