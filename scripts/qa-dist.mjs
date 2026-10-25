import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve('dist');
let pages=0;
function visit(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
 const file=path.join(dir,entry.name);if(entry.isDirectory()){visit(file);continue}
 if(!file.endsWith('.html'))continue;pages++;
 const html=fs.readFileSync(file,'utf8');
 for(const match of html.matchAll(/(?:src|href)="([^"#?]+)(?:[?#][^"]*)?"/g)){
  const url=match[1];if(/^(https?:|mailto:|tel:|data:)/.test(url))continue;
  const resolved=url.startsWith('/')?path.join(root,url):path.resolve(path.dirname(file),url);
  assert.ok(fs.existsSync(resolved),`${path.relative(root,file)} references missing ${url}`);
 }
}}
visit(root);
assert.ok(pages>=26);console.log(`OK: ${pages} generated HTML pages and all local asset/link targets.`);
