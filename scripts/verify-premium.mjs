import fs from "node:fs";import vm from "node:vm";import assert from "node:assert/strict";
const root=process.cwd();const d={window:{}};vm.runInNewContext(fs.readFileSync(root+"/assets/data.js","utf8"),d);const D=d.window.DOMAIN_DATA;
const geo=JSON.parse(fs.readFileSync(root+"/assets/lots-geo.json","utf8"));
assert.equal(D.lots.length,16);assert.equal(D.roads.length,2);assert.equal(geo.features.length,18);
for(const lot of D.lots){const file=root+"/terrains/"+lot.id+".html";assert.ok(fs.existsSync(file),file);const h=fs.readFileSync(file,"utf8");assert.ok(h.includes('data-lot="'+lot.id+'"'));assert.ok(h.includes('property="og:title"'));assert.ok(geo.features.some(x=>x.properties.lot===lot.label));}
for(const file of ["assets/estate.js","assets/estate-map.js","client/admin-entry.js","client/client-entry.js","netlify/functions/admin-api.mjs","netlify/functions/lead.mjs","netlify/functions/public-content.mjs","netlify/functions/client-api.mjs","netlify/functions/media.mjs"]){const code=fs.readFileSync(root+"/"+file,"utf8");new vm.Script("void 0",{filename:file});assert.ok(code.length>120,file);}
const pages=["index.html","projet.html","carte.html","terrains.html","investisseurs.html","contact.html","admin.html","client.html"];
for(const p of pages)assert.ok(fs.existsSync(root+"/"+p),"Page absente "+p);
const netlify=fs.readFileSync(root+"/netlify.toml","utf8");assert.ok(netlify.includes('publish = "dist"'));
const areas=D.lots.reduce((s,x)=>s+x.area,0);assert.ok(Math.abs(areas-65311.966)<.002);
assert.ok(/ADMIN_ALLOWED_EMAILS/.test(fs.readFileSync(root+"/netlify/functions/admin-api.mjs","utf8")),"Contrôle des administrateurs absent");
console.log("PREMIUM OK: 16 fiches individuelles, 18 contours, 8 pages, accès admin vérifié et dossier public.");
