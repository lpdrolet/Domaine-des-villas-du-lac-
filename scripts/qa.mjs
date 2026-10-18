import fs from "node:fs";import assert from "node:assert/strict";import vm from "node:vm";import {execFileSync} from "node:child_process";
const check=path=>execFileSync("node",["--check",path],{stdio:"pipe"});
const scripts=["assets/data.js","assets/estate.js","assets/estate-map.js","client/admin-entry.js","client/client-entry.js","netlify/functions/admin-api.mjs","netlify/functions/media.mjs","netlify/functions/lead.mjs","netlify/functions/client-api.mjs","netlify/functions/public-content.mjs"];
for(const file of scripts)check(file);
const d={window:{}};vm.runInNewContext(fs.readFileSync("assets/data.js","utf8"),d);
const D=d.window.DOMAIN_DATA,geo=JSON.parse(fs.readFileSync("assets/lots-geo.json","utf8"));
assert.equal(D.lots.length,16);assert.equal(D.roads.length,2);assert.equal(geo.features.length,18);
assert.ok(Math.abs(D.lots.reduce((s,l)=>s+l.area,0)-65311.966)<.002);
assert.ok(Math.abs(D.roads.reduce((s,l)=>s+l.area,0)-11899.039)<.002);
for(const lot of D.lots){const p="terrains/"+lot.id+".html";assert.ok(fs.existsSync(p),p);const html=fs.readFileSync(p,"utf8");assert.ok(html.includes('data-lot="'+lot.id+'"'));assert.ok(html.includes('property="og:title"'));assert.ok(geo.features.some(f=>f.properties.lot===lot.label));}
const pages=["index.html","carte.html","terrains.html","projet.html","investisseurs.html","financement.html","recapitulatif.html","voirie.html","contact.html","admin.html","client.html"];
for(const p of pages){const h=fs.readFileSync(p,"utf8");assert.ok(h.includes("assets/estate.css"),p);if(p==="admin.html")assert.ok(h.includes("assets/admin.bundle.js"));if(p==="client.html")assert.ok(h.includes("assets/client.bundle.js"));}
const admin=fs.readFileSync("netlify/functions/admin-api.mjs","utf8");assert.match(admin,/ADMIN_ALLOWED_EMAILS/);assert.match(admin,/roles\?\.includes\("admin"\)/);
const config=fs.readFileSync("netlify.toml","utf8");assert.match(config,/publish = "dist"/);
console.log("OK: 16 lots, 2 emprises, 10 pages, authentification et CSP, médias, fichiers SIG.");
\n