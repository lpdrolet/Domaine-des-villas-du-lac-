import {getUser} from "@netlify/identity";
import {getStore} from "@netlify/blobs";

const lotId=(id:unknown)=>/^[0-9]{7}$/.test(String(id))?String(id):null;
const statuses=new Set(["a_confirmer","disponible","reserve","vendu","retire"]);
const cut=(v:unknown,max=1000)=>typeof v==="string"?v.trim().slice(0,max):"";
const cleanURL=(v:unknown)=>{const s=cut(v,700);return (/^https:\/\//i.test(s)||/^\/api\/estate-media\?key=[A-Za-z0-9._-]+$/.test(s))?s:""};
function sanitize(v:any,id:string){
 const price=Number(v.price),area=Number(v.area);
 return {
  id,
  custom:v.custom===true,
  ...(Number.isFinite(area)&&area>0&&area<100000?{area:Math.round(area*1000)/1000}:{}),
  ...(Number.isFinite(Number(v.lat))&&Number(v.lat)>40&&Number(v.lat)<55&&Number.isFinite(Number(v.lon))&&Number(v.lon)<-60&&Number(v.lon)>-84?{lat:Number(v.lat),lon:Number(v.lon)}:{}),
  status:statuses.has(v.status)?v.status:"a_confirmer",
  price:Number.isFinite(price)&&price>=0&&price<10000000?price:null,
  publishPrice:v.publishPrice===true,
  description:cut(v.description,2000),
  image:cleanURL(v.image),
  gallery:Array.isArray(v.gallery)?v.gallery.map(cleanURL).filter(Boolean).slice(0,15):[],
  zoning:cut(v.zoning,120),
  dimensions:cut(v.dimensions,120),
  services:cut(v.services,900),
  highlights:Array.isArray(v.highlights)?v.highlights.map(x=>cut(x,180)).filter(Boolean).slice(0,9):[]
 };
}
const unauth=()=>Response.json({error:"Connexion administrateur requise"},{status:401,headers:{"Cache-Control":"no-store"}});
export default async function handler(req:Request){
 try{
  const user=await getUser();
  if(!user)return unauth();
  if(!Array.isArray(user.roles)||!user.roles.includes("admin"))return Response.json({error:"Accès interdit : rôle administrateur requis."},{status:403,headers:{"Cache-Control":"no-store"}});
  const store=getStore({name:"domaine-listings",consistency:"strong"});
  if(req.method==="GET"){
   const {blobs}=await store.list({prefix:"lot/"});
   const overrides=await Promise.all(blobs.slice(0,200).map(x=>store.get(x.key,{type:"json"})));
   return Response.json({email:user.email,overrides:overrides.filter(Boolean)},{headers:{"Cache-Control":"no-store"}});
  }
  if(req.method==="PUT"){
   if(req.headers.get("content-type")?.split(";")[0]!=="application/json")return new Response("JSON requis",{status:415});
   const body=await req.json(),id=lotId(body?.id);
   if(!id)return Response.json({error:"Numéro de lot invalide"},{status:400});
   const entry=sanitize(body,id);
   await store.setJSON("lot/"+id,entry);
   return Response.json({success:true,entry},{headers:{"Cache-Control":"no-store"}});
  }
  if(req.method==="DELETE"){
   const id=lotId(new URL(req.url).searchParams.get("id"));
   if(!id)return Response.json({error:"Lot invalide"},{status:400});
   // Hide the commercial listing without removing the official cadastral reference.
   const previous=(await store.get("lot/"+id,{type:"json"}))||{};
   await store.setJSON("lot/"+id,{...previous,id,status:"retire",publishPrice:false});
   return Response.json({success:true},{headers:{"Cache-Control":"no-store"}});
  }
  return new Response("Méthode non autorisée",{status:405});
 }catch(e){console.error("estate-admin",e);return Response.json({error:"Administration non configurée ou momentanément indisponible."},{status:503,headers:{"Cache-Control":"no-store"}})}
}
export const config={path:"/api/estate-admin"};