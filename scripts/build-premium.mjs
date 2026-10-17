import fs from "node:fs";
import path from "node:path";
import {build} from "esbuild";
const root=process.cwd(),dist=path.join(root,"dist");
fs.rmSync(dist,{recursive:true,force:true});fs.mkdirSync(dist,{recursive:true});
for(const name of fs.readdirSync(root)){
 if(name.endsWith(".html"))fs.copyFileSync(path.join(root,name),path.join(dist,name));
}
fs.cpSync(path.join(root,"assets"),path.join(dist,"assets"),{recursive:true});
fs.copyFileSync(path.join(root,"robots.txt"),path.join(dist,"robots.txt"));
await build({entryPoints:["src/admin-auth.js"],outfile:path.join(dist,"assets","admin-auth.js"),bundle:true,platform:"browser",format:"esm",target:"es2022",minify:true,logLevel:"info"});
const clean=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const code=fs.readFileSync(path.join(root,"assets/data.js"),"utf8");
const ids=[...code.matchAll(/"id": "([0-9]{7})"/g)].map(x=>x[1]).filter((s,i,a)=>a.indexOf(s)===i);
const validIds=ids.filter(id=>!["1800349","4889707"].includes(id));
if(validIds.length!==16)throw new Error("La compilation exige exactement 16 lots résidentiels, reçu "+validIds.length);
const template=fs.readFileSync(path.join(root,"lot.html"),"utf8");
const url="https://domaine-des-villas-du-lac.netlify.app";
for(const id of validIds){
 const formatted=id.replace(/^(\d)(\d{3})(\d{3})$/,"$1 $2 $3");
 const dest=path.join(dist,"lot",id);fs.mkdirSync(dest,{recursive:true});
 let page=template.replace('<title>Fiche d\'un terrain | Domaine des villas du lac</title>','<title>Terrain '+formatted+' — Domaine des villas du lac, Sherbrooke</title>');
 page=page.replace('content="Localisez chaque lot du Domaine des villas du lac, consultez sa superficie graphique et les renseignements disponibles."','content="Fiche du lot cadastral '+formatted+' : superficie indicative, vue satellite et renseignements sur le Domaine des villas du lac."');
 page=page.replace('<meta property="og:type" content="website">','<meta property="og:type" content="website"><link rel="canonical" href="'+url+'/lot/'+id+'/">');
 page=page.replace('<meta property="og:title" content="Fiche d\'un terrain | Domaine des villas du lac">','<meta property="og:title" content="Terrain '+formatted+' | Domaine des villas du lac">');
 fs.writeFileSync(path.join(dest,"index.html"),page);
}
let sitemap='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
for(const p of ["index.html","projet.html","carte.html","terrains.html","recapitulatif.html","financement.html","contact.html",...validIds.map(x=>"lot/"+x+"/")])sitemap+='  <url><loc>'+url+'/'+clean(p)+'</loc></url>\n';
sitemap+="</urlset>\n";fs.writeFileSync(path.join(dist,"sitemap.xml"),sitemap);
console.log("Site premium : "+validIds.length+" fiches distinctes, 7 pages de présentation, identité sécurisée compilée.");
