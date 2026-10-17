import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
const read=path=>fs.readFileSync(path,"utf8");
const ctx={window:{}};vm.runInNewContext(read("assets/data.js"),ctx);
vm.runInNewContext(read("assets/geometry.js"),ctx);
const D=ctx.window.DOMAIN_DATA,G=ctx.window.DOMAIN_GEOMETRY;
assert.equal(D.lots.length,16);
assert.equal(D.roads.length,2);
assert.equal(G.features.length,18);
const sum=(v)=>v.reduce((a,x)=>a+x.area,0);
assert.ok(Math.abs(sum(D.lots)-65311.966)<.01);
assert.ok(Math.abs(sum(D.roads)-11899.039)<.01);
assert.ok(D.lots.some(x=>x.id==="1800388"&&x.group==="lp"));
const keys=new Set(D.lots.map(x=>x.id));
assert.equal(keys.size,16);
for(const lot of D.lots){
 assert.ok(G.features.some(x=>x.id===lot.label));
 assert.ok(fs.existsSync("dist/lot/"+lot.id+"/index.html"));
 const contents=read("dist/lot/"+lot.id+"/index.html");
 assert.ok(contents.includes("og:title"));
 assert.ok(contents.includes(lot.label));
}
const pages=["index.html","projet.html","carte.html","terrains.html","lot.html","recapitulatif.html","financement.html","contact.html","client.html","admin.html"];
for(const p of pages){
 const html=read("dist/"+p);
 assert.ok(html.includes('lang="fr-CA"'));
 assert.ok(html.includes("assets/estate.css"));
 assert.ok(html.includes("assets/estate-app.js"));
}
new vm.Script(read("assets/estate-app.js"));
new vm.Script(read("assets/estate-map.js"));
new vm.Script(read("src/admin-auth.js").replace(/^import.*$/m,""));
assert.ok(read("dist/__forms.html").includes('name="domaine-lead"'));
assert.ok(read("dist/assets/admin-auth.js").length>1000);
assert.ok(read("netlify/functions/estate-admin.mts").includes('includes("admin")'));
assert.ok(!read("assets/estate-app.js").includes("507869.86"));
assert.ok(!read("assets/estate-app.js").includes("426184.52"));
console.log("OK : 10 pages, 16 fiches SEO, carte SIG, sécurité server-side, formulaires et bundle auth.");