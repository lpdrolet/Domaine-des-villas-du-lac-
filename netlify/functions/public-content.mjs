import {getStore} from "@netlify/blobs";
const ids=["1800347","1800348","1800385","1800387","1800388","1800389","1800390","1800391","1800392","1800393","1800394","1800395","1800411","1800412","1800413","1800414"];
export default async function handler(req){
 if(req.method!=="GET")return new Response("Méthode interdite",{status:405});
 try{
 const store=getStore("domaine-public"),lots={};
 for(const id of ids){
 const v=await store.get("lot-"+id,{type:"json"});if(!v)continue;
 const price=Number.isInteger(v.price)&&v.price>=1000&&v.price<=10000000?v.price:null;
 lots[id]={status:["Disponible","Réservé","Vendu","Information sur demande"].includes(v.status)?v.status:"Information sur demande",subtitle:String(v.subtitle||"").slice(0,300),price,photoUrl:typeof v.photoUrl==="string"&&/^https:\/\//.test(v.photoUrl)?v.photoUrl:"",documentUrl:typeof v.documentUrl==="string"&&/^https:\/\//.test(v.documentUrl)?v.documentUrl:"",visible:v.visible!==false};
 }
 return Response.json({lots},{headers:{"Cache-Control":"public, max-age=60","X-Content-Type-Options":"nosniff"}});
 }catch(e){console.error("public listings unavailable",e);return Response.json({lots:{}},{headers:{"Cache-Control":"no-store"}})}
}