import {getUser} from "@netlify/identity";
import {getStore} from "@netlify/blobs";
import {randomUUID} from "node:crypto";
const fail=(message,status)=>Response.json({error:message},{status,headers:{"Cache-Control":"no-store"}});
const store=()=>getStore({name:"domaine-public-media",consistency:"strong"});
const adminAllowed=async()=>{
 const user=await getUser();const allow=(Netlify.env.get("ADMIN_ALLOWED_EMAILS")||"").toLowerCase().split(",").map(x=>x.trim()).filter(Boolean);
 return !!user?.roles?.includes("admin")&&allow.includes(String(user.email||"").toLowerCase());
};
export default async function handler(req){
 const url=new URL(req.url);
 if(req.method==="GET"){
   const key=url.searchParams.get("key")||"";
   if(!/^(image|document)\/[0-9a-f-]{36}\.(jpg|png|webp|pdf)$/.test(key))return fail("Fichier introuvable",404);
   try{const found=await store().getWithMetadata(key,{type:"arrayBuffer"});if(!found)return fail("Fichier introuvable",404);
     const contentType=found.metadata?.type||"application/octet-stream";
     return new Response(found.data,{headers:{"Content-Type":contentType,"Cache-Control":"public, max-age=3600","X-Content-Type-Options":"nosniff","Content-Disposition":contentType==="application/pdf"?'inline; filename="document.pdf"':"inline"}});
   }catch(e){console.error("media read",e);return fail("Fichier indisponible",503)}
 }
 if(req.method!=="POST")return fail("Méthode non autorisée",405);
 if(req.headers.get("origin")!==url.origin)return fail("Origine interdite",403);
 if(!(await adminAllowed().catch(()=>false)))return fail("Accès administrateur interdit",403);
 if(Number(req.headers.get("content-length")||0)>6500000)return fail("Fichier trop volumineux (6 Mo maximum)",413);
 const form=await req.formData();const file=form.get("file");
 if(!(file instanceof File))return fail("Fichier manquant",400);
 const allowed={"image/jpeg":["image","jpg"],"image/png":["image","png"],"image/webp":["image","webp"],"application/pdf":["document","pdf"]};
 if(!allowed[file.type]||file.size>6000000||file.size<100)return fail("Formats autorisés : JPG, PNG, WebP ou PDF (max 6 Mo)",400);
 const [type,extension]=allowed[file.type],key=type+"/"+randomUUID()+"."+extension;
 try{await store().set(key,file,{metadata:{type:file.type,uploadedAt:new Date().toISOString()}});
 return Response.json({ok:true,url:url.origin+"/.netlify/functions/media?key="+encodeURIComponent(key),type},{headers:{"Cache-Control":"no-store"}});
 }catch(e){console.error("media write",e);return fail("Téléversement temporairement indisponible",503)}
}
