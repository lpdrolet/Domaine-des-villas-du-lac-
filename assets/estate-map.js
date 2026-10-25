
/* Cartographie de consultation : polygones SIG simplifiés, pas un bornage. */
(function(){
"use strict";
const CRS="+proj=tmerc +lat_0=0 +lon_0=-70.5 +k=0.9999 +x_0=304800 +y_0=0 +datum=NAD83 +units=m +no_defs";
const colors={personal:"#af9dcb",lp:"#cdac71",viviane:"#4b9485",blue:"#6f9ec0",verifier:"#af9dcb",rue:"#b6c6ca"};
let contexts=new Map();
const escapeHtml=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pointToGeo=p=>{
 const geo=window.DOMAIN_GEOMETRY;
 if(!geo||!window.proj4)return null;
 const xy=[p[0]+geo.origin[0],p[1]+geo.origin[1]];
 const lonlat=window.proj4(CRS,"WGS84",xy);
 return [lonlat[1],lonlat[0]];
};
const getLotFeature=id=>window.DOMAIN_GEOMETRY?.features?.find(g=>g.id.replace(/\s/g,"")===String(id).replace(/\s/g,""));
const getLotCenter=id=>{
 const feature=getLotFeature(id);if(!feature)return null;
 const ring=feature.rings[0]; if(!ring||!ring.length)return null;
 // Centroid of polygon in projected CRS, fall back to average for degenerate geometry
 let twiceArea=0,x=0,y=0;
 for(let i=0;i<ring.length-1;i++){const p=ring[i],q=ring[i+1],cross=p[0]*q[1]-q[0]*p[1];twiceArea+=cross;x+=(p[0]+q[0])*cross;y+=(p[1]+q[1])*cross;}
 let center;
 if(Math.abs(twiceArea)>1e-6)center=[x/(3*twiceArea),y/(3*twiceArea)];
 else center=[ring.reduce((s,p)=>s+p[0],0)/ring.length,ring.reduce((s,p)=>s+p[1],0)/ring.length];
 return pointToGeo(center);
};
const satelliteLink=id=>{
 const pos=getLotCenter(id);if(!pos)return "https://www.google.com/maps";
 return "https://www.google.com/maps/@"+pos[0].toFixed(6)+","+pos[1].toFixed(6)+",18z/data=!3m1!1e3";
};
function init(mapId,settings={}){
 const target=document.getElementById(mapId);
 if(!target)return null;
 if(!window.L||!window.proj4||!window.DOMAIN_GEOMETRY){
  target.innerHTML='<div class="map-fallback">Carte interactive indisponible. Utilisez le lien vers Google Maps.</div>';return null;
 }
 const map=L.map(target,{scrollWheelZoom:false,zoomControl:true,preferCanvas:true,attributionControl:true});
 const satellite=L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{attribution:"Imagery © Esri, Earthstar Geographics, Maxar et partenaires",maxZoom:19});
 const street=L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap contributors"});
 satellite.addTo(map);
 L.control.layers({"Satellite (Esri)":satellite,"Plan de rue (OpenStreetMap)":street},null,{position:"topright"}).addTo(map);
 const lots=settings.lots||window.DOMAIN_DATA.lots||[];
 const selectedId=String(settings.selectedId||"").replace(/\s/g,"");
 const ids=new Set(lots.map(x=>x.id));
 const shapes=[], active=[];
 for(const feat of window.DOMAIN_GEOMETRY.features){
  const id=feat.id.replace(/\s/g,"");
  const lot=lots.find(x=>x.id===id);
  if(!lot && !settings.showRoads)continue;
  const rings=feat.rings.map(r=>r.map(pointToGeo).filter(Boolean)).filter(r=>r.length>=3);
  if(!rings.length)continue;
  const color=lot?(colors[lot.group]||colors.verifier):colors.rue;
  const selected=id===selectedId;
  const poly=L.polygon(rings,{color:selected?"#e7b255":"#fafbf9",weight:selected?4:2,fillColor:color,fillOpacity:selected?.52:.33,dashArray:lot?undefined:"6 5"});
  poly.addTo(map);
  const center=getLotCenter(id);
  if(lot&&center){
    const marker=L.marker(center,{icon:L.divIcon({className:"estate-map-marker",html:'<span style="display:grid;place-items:center;min-width:37px;height:30px;padding:0 7px;border-radius:8px;box-shadow:0 5px 17px #001a2166;background:'+color+';border:2px solid #fff;color:#062e33;font-size:12px;font-weight:900">'+escapeHtml(lot.label.slice(-3))+'</span>',iconSize:[37,30],iconAnchor:[19,15]})}).addTo(map);
    const label=escapeHtml(lot.label);
    const sqft=Intl.NumberFormat("fr-CA",{maximumFractionDigits:0}).format(lot.area*10.7639104167097);
    const detail='<div class="map-popup"><h3>Terrain '+label+'</h3><p>'+sqft+' pi² · '+(lot.statusLabel||"Situation à confirmer")+'</p><a href="lot.html?id='+encodeURIComponent(id)+'">Consulter la fiche →</a></div>';
    marker.bindPopup(detail);
    poly.bindPopup(detail);
    active.push({lot,poly,marker,center});
  }
  shapes.push(poly);
 }
 const bounds=L.featureGroup(shapes).getBounds();
 if(bounds.isValid())map.fitBounds(bounds.pad(settings.selectedId? .22:.12),{maxZoom:settings.selectedId?18:16,animate:false});
 else map.setView([45.42,-71.89],13);
 setTimeout(()=>map.invalidateSize(),250);
 const ctx={map,active,centerOf:getLotCenter,filter(fn){for(const row of active){const show=fn(row.lot);if(show){if(!map.hasLayer(row.poly))row.poly.addTo(map);if(!map.hasLayer(row.marker))row.marker.addTo(map)}else{map.removeLayer(row.poly);map.removeLayer(row.marker)}}},highlight(id){const v=active.find(x=>x.lot.id===id);if(v){map.setView(v.center,17);v.marker.openPopup()}},focus(id){const v=active.find(x=>x.lot.id===id);if(v)map.setView(v.center,18);}};
 contexts.set(mapId,ctx);return ctx;
}
window.ESTATE_MAP={init,getLotCenter,satelliteLink,getLotFeature,colors,getContext:id=>contexts.get(id)};
})();
