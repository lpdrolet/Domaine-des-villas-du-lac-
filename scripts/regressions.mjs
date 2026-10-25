import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';
const read=p=>fs.readFileSync(p,'utf8');
async function site(page, overrides={}, search='') {
 const elements=new Map();let ready;
 const element=id=>{if(!elements.has(id))elements.set(id,{innerHTML:'',textContent:'',disabled:false,value:'',classList:{toggle(){},add(){},contains(){return false}},setAttribute(){},addEventListener(type,fn){this[type]=fn},appendChild(){}});return elements.get(id)};
 const data={window:{}};vm.runInNewContext(read('assets/data.js'),data);
 const context={window:{DOMAIN_DATA:data.window.DOMAIN_DATA},document:{body:{dataset:{page,lot:page==='lot'?'1800388':undefined},appendChild(){},classList:{add(){},contains(){},toggle(){}}},getElementById:element,createElement:()=>element('created'),addEventListener(type,fn){ready=fn}},location:{search},localStorage:{getItem(){return null}},URLSearchParams,Intl,console:{warn(){},error(){}},setTimeout(){},FormData:class {constructor(){return new Map([['name','Test User'],['email','test@example.com'],['message','A valid request']])}},fetch:async url=>url.includes('lots-geo')?{ok:true,json:async()=>({features:[]})}:url.includes('public-content')?{ok:true,json:async()=>({lots:overrides})}:{ok:true}};
 vm.runInNewContext(read('assets/estate.js'),context);await ready();return {elements,element};
}
test('successful contact submission remains successful after the event dispatch ends',async()=>{
 const {element}=await site('contact');let resets=0;
 const form={reset(){resets++}};const ev={currentTarget:form,preventDefault(){}};
 const completion=element('lead-form').submit(ev);ev.currentTarget=null;await completion;
 assert.match(element('alert-region').textContent,/a été reçue/);assert.equal(resets,1);assert.equal(element('lead-submit').disabled,false);
});
test('hidden listing direct URL does not display its commercial content',async()=>{
 const {element}=await site('lot',{'1800388':{visible:false,subtitle:'PRIVATE LISTING TEXT',price:999999,status:'Disponible'}});
 assert.doesNotMatch(element('main').innerHTML,/PRIVATE LISTING TEXT/);assert.match(element('main').innerHTML,/indisponible|introuvable/i);
});
test('generic lot entry uses the active renderer and no missing auth bundle',()=>{
 const html=read('lot.html');assert.match(html,/data-page="lot"/);assert.match(html,/assets\/estate\.js/);assert.doesNotMatch(html,/assets\/admin-auth\.js/);
});
test('hidden listing public API omits description price and media',async()=>{
 const code=read('netlify/functions/public-content.mjs').replace(/^import .*;$/m,'').replace('export default async function handler','async function handler');
 const context={Response,console,getStore:()=>({get:async key=>key==='lot-1800388'?{visible:false,subtitle:'SECRET',price:123000,photoUrl:'https://example.com/private.jpg'}:null})};
 vm.runInNewContext(code+'\nthis.handler=handler;',context);
 const res=await context.handler(new Request('https://example.com/.netlify/functions/public-content'));const json=await res.json();
 assert.deepEqual(json.lots['1800388'],{visible:false});
});
test('admin authorization requires both approved email and server admin role',async()=>{
 const {isAllowedAdmin}=await import('../src/server-auth.mjs');
 assert.equal(isAllowedAdmin({email:'owner@example.com',roles:['admin']},''),false);
 assert.equal(isAllowedAdmin({email:'other@example.com',roles:['admin']},'owner@example.com'),false);
 assert.equal(isAllowedAdmin({email:'owner@example.com',roles:['client']},'owner@example.com'),false);
 assert.equal(isAllowedAdmin({email:'OWNER@example.com',roles:['admin']},' owner@example.com '),true);
 assert.equal(isAllowedAdmin(null,'owner@example.com'),false);
});
test('legacy mutation APIs enforce the same email allowlist and same-origin contract',()=>{
 for(const file of ['netlify/functions/estate-admin.mts','netlify/functions/estate-media.mts']){
  const code=read(file);assert.match(code,/isAllowedAdmin/);assert.match(code,/ADMIN_ALLOWED_EMAILS/);assert.match(code,/req.headers.get\("origin"\)/);
 }
});
