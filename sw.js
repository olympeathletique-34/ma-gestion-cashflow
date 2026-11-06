/* Fonctionnement hors ligne : les fichiers du pack sont gardés sur l'appareil.
   Pages, scripts et données du pack : réseau d'abord (la dernière version publiée s'affiche tout de suite), copie locale si pas de connexion.
   Polices, icônes, images et scripts PDF : copie locale d'abord (ils ne changent pas d'une version à l'autre).
   Une nouvelle version s'active sans attendre. Les données (localStorage) ne sont jamais touchées. */
const VERSION='1.0.7';
const CACHE='mgc-'+VERSION;
const FILES=["./", "index.html", "livre.html", "appli.html", "params.js", "shell.js", "store.js", "fonts.css", "manifest.webmanifest", "version.json", "couverture.webp", "accueil.webp", "vendor/jspdf.umd.min.js", "vendor/jspdf.plugin.autotable.min.js", "fonts/caveat-latin-700-normal.woff2", "fonts/playfair-display-latin-900-normal.woff2", "fonts/playfair-display-latin-900-italic.woff2", "fonts/marcellus-sc-latin-400-normal.woff2", "fonts/libre-franklin-latin-400-normal.woff2", "fonts/libre-franklin-latin-500-normal.woff2", "fonts/libre-franklin-latin-600-normal.woff2", "fonts/libre-franklin-latin-700-normal.woff2", "fonts/libre-franklin-latin-800-normal.woff2", "fonts/archivo-narrow-latin-500-normal.woff2", "fonts/archivo-narrow-latin-600-normal.woff2", "fonts/archivo-narrow-latin-700-normal.woff2", "fonts/gloock-latin-400-normal.woff2", "fonts/source-serif-4-latin-400-normal.woff2", "fonts/source-serif-4-latin-600-normal.woff2", "fonts/source-serif-4-latin-400-italic.woff2", "fonts/ibm-plex-mono-latin-400-normal.woff2", "fonts/ibm-plex-mono-latin-600-normal.woff2", "fonts/ibm-plex-sans-condensed-latin-500-normal.woff2", "fonts/ibm-plex-sans-condensed-latin-600-normal.woff2", "fonts/ibm-plex-sans-condensed-latin-700-normal.woff2", "icons/maskable-512.png", "icons/icon-192.png", "icons/apple-touch-icon.png", "icons/favicon-32.png", "icons/icon-512.png"];
const STATIC=/\/(fonts|icons|vendor|shots)\/|\.(woff2|png|webp)$/;
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('message',e=>{if(e.data==='skip')self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('mgc-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request,u=new URL(req.url);
  if(req.method!=='GET'||u.origin!==location.origin)return;
  if(STATIC.test(u.pathname)){
    e.respondWith(caches.open(CACHE).then(c=>c.match(req,{ignoreSearch:true}).then(hit=>hit||fetch(req).then(r=>{if(r.ok&&r.type==='basic')c.put(req,r.clone());return r}))));
    return;
  }
  e.respondWith(caches.open(CACHE).then(c=>fetch(req,{cache:'no-cache'}).then(r=>{if(r.ok&&r.type==='basic'&&!u.pathname.endsWith('/version.json'))c.put(req,r.clone());return r})
    .catch(()=>c.match(req,{ignoreSearch:true}).then(hit=>hit||(req.mode==='navigate'?c.match('index.html'):Response.error())))));
});
