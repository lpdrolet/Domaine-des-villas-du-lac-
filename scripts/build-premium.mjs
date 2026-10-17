import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {build} from "esbuild";
const root=process.cwd(),dist=path.join(root,"dist");
fs.rmSync(dist,{recursive:true,force:true});fs.mkdirSync(dist,{recursive:true});
for(const name of fs.readdirSync(root))if(name.endsWith(".html")||name==="robots.txt")fs.copyFileSync(path.join(root,name),path.join(dist,name));
fs.cpSync(path.join(root,"assets"),path.join(dist,"assets"),{recursive:true});
await build({entryPoints:["src/admin-auth.js"],outfile:path.join(dist,"assets/admin-auth.js"),bundle:true,platform:"browser",format:"esm",target:"es2022",minify:true,logLevel:"info"});
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,"assets/data.js"),"utf8"),context);
const lots=context.window.DOMAIN_DATA.lots;
if(lots.length!==16)throw Error("Le registre doit contenir 16 terrains");
const template=fs.readFileSync(path.join(root,"lot.html"),"utf8");
const domain="https://domaine-des-villas-du-lac.netlify.app";
for(const lot of lots){
 const folder=path.join(dist,"lot",lot.id);fs.mkdirSync(folder,{recursive:true});
 let page=template.replace(/<title>[^<]+<\/title>/,'<title>Terrain '+lot.label+' — Domaine des villas du lac, Sherbrooke</title>');
 page=page.replace('<meta property="og:type" content="website">','<meta property="og:type" content="website"><link rel="canonical" href="'+domain+'/lot/'+lot.id+'/">');
 page=page.replace(/<meta property="og:title" content="[^"]*">/,'<meta property="og:title" content="Terrain '+lot.label+' | Domaine des villas du lac">');
 page=page.replace(/<meta name="description" content="[^"]*">/,'<meta name="description" content="Terrain cadastral '+lot.label+' à Deauville, Sherbrooke : superficie graphique, vue aérienne et statut du projet.">');
 fs.writeFileSync(path.join(folder,"index.html"),page);
}
const pages=["/","/projet.html","/carte.html","/terrains.html","/recapitulatif.html","/financement.html","/contact.html",...lots.map(l=>"/lot/"+l.id+"/")];
fs.writeFileSync(path.join(dist,"sitemap.xml"),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+pages.map(x=>'<url><loc>'+domain+x+'</loc></url>').join("\n")+"\n</urlset>");
console.log("Build premium réussi — "+lots.length+" fiches SEO et "+pages.length+" URL de sitemap.");
