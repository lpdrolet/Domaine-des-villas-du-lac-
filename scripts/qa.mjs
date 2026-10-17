import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root=path.resolve(import.meta.dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const sitePaths=['index.html','revue.html','acquisitions.html','routes.html','ventes.html','terrains.html','carte.html','lot.html','finances.html','documents.html'];
const sandbox={window:{location:{assign() {}}}};
vm.runInNewContext(read('assets/data.js'),sandbox,{filename:'assets/data.js'});
vm.runInNewContext(read('assets/geometry.js'),sandbox,{filename:'assets/geometry.js'});
const D=sandbox.window.DOMAIN_DATA,G=sandbox.window.DOMAIN_GEOMETRY;
const sum=(xs,key)=>xs.reduce((a,x)=>a+x[key],0);
assert.equal(D.lots.length,16,'Le cadastre doit contenir 16 lots résidentiels');
assert.equal(D.roads.length,2,'Deux emprises de rue distinctes');
assert.ok(Math.abs(sum(D.lots,'area')-65311.966)<0.01,'Superficie brute résidentielle');
assert.ok(Math.abs(sum(D.roads,'area')-11899.039)<0.01,'Superficie brute des rues');
assert.equal(D.plan.length,14,'Actions prioritaires du projet');
assert.equal(new Set(D.lots.map(x=>x.id)).size,16,'Numéros de terrain uniques');
assert.equal(new Set(D.plan.map(x=>x.id)).size,14,'Identifiants d’action uniques');
assert.equal(new Set(G.features.map(x=>x.id)).size,18,'Contours SIG uniques');
for(const lot of [...D.lots,...D.roads])assert.ok(G.features.some(x=>x.id===lot.label),'Contour manquant : '+lot.label);
for(const f of G.features)assert.ok(f.rings.every(r=>r.length>=3),'Polygone invalide : '+f.id);
for(const lot of D.lots){
 assert.ok(lot.area>1000&&lot.area<12000,'Surface anormale : '+lot.label);
 assert.ok(lot.perimeter>100,'Périmètre anormal : '+lot.label);
 assert.ok(['lp','viviane','blue','verifier'].includes(lot.group),'Groupe inconnu : '+lot.label);
}
for(const p of sitePaths){
 const html=read(p);
 assert.match(html,/<html lang="fr-CA">/,'Langue invalide : '+p);
 assert.match(html,/data-page="[^"]+"/,'Page dynamique non déclarée : '+p);
 assert.match(html,/assets\/portal\.css\?/,'Feuille CSS absente : '+p);
 assert.match(html,/assets\/data\.js\?/,'Registre absent : '+p);
 assert.match(html,/assets\/portal\.js\?/,'Moteur UI absent : '+p);
 assert.ok(html.indexOf('assets/data.js')<html.indexOf('assets/portal.js'),'Ordre des scripts invalide : '+p);
 if(p==='carte.html'){
  assert.ok(html.indexOf('assets/geometry.js')<html.indexOf('assets/portal.js'),'Le cadastre doit être chargé avant la carte');
 }
 for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){
  const href=match[1].split('?')[0];
  if(/^(?:https?:|#|mailto:)/.test(href))continue;
  assert.ok(fs.existsSync(path.join(root,href)),'Ressource manquante '+href+' dans '+p);
 }
}
const oldCsv=read('documents/registre-lots.csv');
assert.ok(oldCsv.includes('1 800 388'), 'Lot existant absent');
assert.equal(oldCsv.trim().split(/\r?\n/).length,17,'Le CSV public doit comporter un en-tête et 16 terrains');
assert.ok(!read('documents/hypotheses.csv').includes('Officiel'),'Ancienne donnée erronée reclassée comme officielle');
const script=read('assets/portal.js');
new vm.Script(script,{filename:'assets/portal.js'});

function fakeDom(page){
 const byId=new Map(),svgs=[];
 const get=id=>{
  if(!byId.has(id)){
   const listeners={};
   byId.set(id,{id,innerHTML:'',textContent:'',value:({
    'lot-group':'all','lot-sort':'id','task-filter':'all','task-priority':'all','road-length':'454.295','road-rate':'800','road-cont':'15',
    'fin-count':'15','fin-price':'185000','fin-length':'454.3','fin-cost':'800','fin-cont':'15','fin-fees':'5'
   })[id]??'',listeners,addEventListener(type,fn){listeners[type]=fn},classList:{toggle(){return true}},setAttribute(){},querySelectorAll(){return []},appendChild(child){this.children??=[];this.children.push(child)}});
  }
  return byId.get(id);
 };
 const document={
  body:{dataset:{page},appendChild(){}},
  getElementById:get,
  createElement(){return {click(){},remove(){},setAttribute(){},appendChild(){},style:{}};},
  createElementNS(ns,tag){const n={tag,attrs:{},style:{},children:[],setAttribute(k,v){this.attrs[k]=v},appendChild(child){this.children.push(child)},addEventListener(){}};svgs.push(n);return n;}
 };
 class URLSearchParamsFake{constructor(q){this.q=q}get(key){return key==='id'?'1800348':null}}
 const location={search:'?id=1800348'};
 class BlobFake{constructor(data,opt){this.data=data;this.opt=opt}}
 const urlMethods={createObjectURL(){return 'blob:local'},revokeObjectURL(){}};
 const localStorage={getItem(){return null},setItem(){}};
 const context={window:sandbox.window,document,URLSearchParams:URLSearchParamsFake,URL:urlMethods,location,localStorage,Blob:BlobFake,
 setTimeout(){return 1},clearTimeout(){}};
 vm.runInNewContext(script,context,{filename:'assets/portal.js'});
 return {get,svgs};
}
for(const [i,page] of sitePaths.map(p=>p.replace(/\.html$/,'')).entries()){
 const {get,svgs}=fakeDom(page);
 const html=get('site-content').innerHTML;
 assert.ok(html.length>200,'Page non rendue : '+page);
 assert.ok(get('site-header').innerHTML.includes('primary-nav'),'Navigation absente : '+page);
 if(page==='carte'){
  assert.equal(svgs.filter(n=>n.tag==='path').length,18,'18 tracés SIG attendus sur la carte');
  assert.equal(svgs.filter(n=>n.tag==='text').length,16,'16 étiquettes attendues sur la carte');
 }
 if(page==='routes'){
  const old=get('road-direct').textContent;
  get('road-rate').value='1100';get('road-rate').listeners.input();
  assert.notEqual(get('road-direct').textContent,old,'Calcul routier non réactif');
 }
 if(page==='finances'){
  const old=get('fin-sales').textContent;
  get('fin-count').value='12';get('fin-count').listeners.input();
  assert.notEqual(get('fin-sales').textContent,old,'Calcul financier non réactif');
 }
 if(page==='terrains'){
  get('lot-search').value='348';get('lot-search').listeners.input();
  assert.ok(get('lot-count').textContent.startsWith('1 terrain'),'Recherche des terrains en panne');
 }
 if(page==='documents'){
  get('task-filter').value='03';get('task-filter').listeners.change();
  assert.ok(get('task-tally').textContent.includes('14 actions au total'),'Filtrage des tâches en panne');
 }
}
console.log('OK: 10 pages, 16 terrains, 2 rues, 14 tâches, carte locale, liens, calculatrices et filtres.');
