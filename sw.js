/* Fonctionnement hors ligne : tous les fichiers du pack sont gardés sur l'appareil.
   Une nouvelle version s'installe en arrière-plan et ne remplace l'ancienne que lorsque la personne clique sur « Mettre à jour ».
   Les données (localStorage) ne sont jamais touchées. */
const VERSION='1.0.2';
const CACHE='mgc-'+VERSION;
const FILES=["./", "index.html", "livre.html", "appli.html", "params.js", "shell.js", "store.js", "fonts.css", "manifest.webmanifest", "version.json", "vendor/jspdf.umd.min.js", "vendor/jspdf.plugin.autotable.min.js", "fonts/caveat-latin-700-normal.woff2", "fonts/marcellus-sc-latin-400-normal.woff2", "fonts/libre-franklin-latin-400-normal.woff2", "fonts/libre-franklin-latin-500-normal.woff2", "fonts/libre-franklin-latin-600-normal.woff2", "fonts/libre-franklin-latin-700-normal.woff2", "fonts/libre-franklin-latin-800-normal.woff2", "fonts/archivo-narrow-latin-500-normal.woff2", "fonts/archivo-narrow-latin-600-normal.woff2", "fonts/archivo-narrow-latin-700-normal.woff2", "fonts/gloock-latin-400-normal.woff2", "fonts/source-serif-4-latin-400-normal.woff2", "fonts/source-serif-4-latin-600-normal.woff2", "fonts/source-serif-4-latin-400-italic.woff2", "fonts/ibm-plex-mono-latin-400-normal.woff2", "fonts/ibm-plex-mono-latin-600-normal.woff2", "fonts/ibm-plex-sans-condensed-latin-500-normal.woff2", "fonts/ibm-plex-sans-condensed-latin-600-normal.woff2", "fonts/ibm-plex-sans-condensed-latin-700-normal.woff2", "icons/maskable-512.png", "icons/icon-192.png", "icons/apple-touch-icon.png", "icons/favicon-32.png", "icons/icon-512.png"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.registration.active?null:self.skipWaiting()))});
self.addEventListener('message',e=>{if(e.data==='skip')self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('mgc-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return;
  if(u.pathname.endsWith('/version.json')){e.respondWith(fetch(e.request).catch(()=>caches.match('version.json')));return}
  e.respondWith(caches.open(CACHE).then(c=>c.match(e.request,{ignoreSearch:true}).then(hit=>hit||fetch(e.request).then(r=>{if(r.ok&&r.type==='basic')c.put(e.request,r.clone());return r}).catch(()=>e.request.mode==='navigate'?c.match('index.html'):Response.error()))));
});
