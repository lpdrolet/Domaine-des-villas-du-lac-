import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {build} from "esbuild";
const root=process.cwd(),dist=path.join(root,"dist");
fs.rmSync(dist,{recursive:true,force:true});fs.mkdirSync(dist,{recursive:true});
for(const name of fs.readdirSync(root).filter(s=>s.endsWith(".html")||s==="_redirects"||s==="robots.txt"))
 fs.copyFileSync(path.join(root,name),path.join(dist,name));
fs.cpSync(path.join(root,"assets"),path.join(dist,"assets"),{recursive:true});
fs.mkdirSync(path.join(dist,"terrains"),{recursive:true});
const data={window:{}};
vm.runInNewContext(fs.readFileSync(root+"/assets/data.js","utf8"),data);
const lots=data.window.DOMAIN_DATA.lots;
if(lots.length!==16)throw Error("16 terrains attendus");
for(const lot of lots){
 const source=root+"/terrains/"+lot.id+".html";
 if(!fs.existsSync(source))throw Error("Fiche manquante : "+lot.id);
 fs.copyFileSync(source,dist+"/terrains/"+lot.id+".html");
}
await build({entryPoints:{"admin":root+"/client/admin-entry.js","client":root+"/client/client-entry.js"},outdir:dist+"/assets",outExtension:{".js":".bundle.js"},bundle:true,minify:true,platform:"browser",format:"esm",target:"es2022",logLevel:"info"});
const domain="https://domaine-des-villas-du-lac.netlify.app";
let urls=["/","/terrains.html","/carte.html","/projet.html","/investisseurs.html","/financement.html","/recapitulatif.html","/contact.html",...lots.map(l=>"/terrains/"+l.id+".html")];
fs.writeFileSync(dist+"/sitemap.xml",'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(u=>"<url><loc>"+domain+u+"</loc></url>").join("\n")+"\n</urlset>\n");
fs.writeFileSync(dist+"/robots.txt","User-agent: *\nAllow: /\nDisallow: /admin.html\nDisallow: /client.html\nSitemap: "+domain+"/sitemap.xml\n");
console.log("SITE BUILD OK:",lots.length,"fiches,",urls.length,"URLs SEO.");
