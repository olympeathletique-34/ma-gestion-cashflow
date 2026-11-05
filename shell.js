/* Coquille commune au livre, à l'appli et à l'accueil : code d'accès, installation hors ligne,
   recherche de mise à jour et boutons pour passer du livre à l'appli. */
(function(){
  'use strict';
  var VERSION='1.0.2';
  var HASHES=["83a591b4ea621f55d5da448a359bb91b6ae6d020a7984ee7f3246cfaff16e845"];
  var KEY='mgc:access';
  var page=(location.pathname.split('/').pop()||'index.html').replace(/\.html$/,'')||'index';
  function lsGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
  function lsSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
  var unlocked=HASHES.indexOf(lsGet(KEY))>=0;
  /* Le livre et l'appli ne s'ouvrent que dans l'application installée (écran d'accueil, Dock, menu Démarrer). */
  function mm(q){try{return matchMedia(q).matches}catch(e){return false}}
  var installed=mm('(display-mode: standalone)')||mm('(display-mode: fullscreen)')||mm('(display-mode: minimal-ui)')||mm('(display-mode: window-controls-overlay)')||navigator.standalone===true;
  if(page!=='index'&&(!installed||!unlocked)){location.replace('./');return}

  var reg=null;
  var S=window.CFShell={version:VERSION,home:'./',livre:'livre.html',appli:'appli.html',unlocked:unlocked,installed:installed,page:page,
    norm:function(c){return String(c||'').toUpperCase().replace(/[\s-]/g,'')},
    tryCode:function(code){var data=new TextEncoder().encode('mgc|'+S.norm(code));
      return crypto.subtle.digest('SHA-256',data).then(function(b){var h=Array.prototype.map.call(new Uint8Array(b),function(x){return ('0'+x.toString(16)).slice(-2)}).join('');
        if(HASHES.indexOf(h)>=0){lsSet(KEY,h);S.unlocked=true;return true}return false})},
    checkUpdate:checkUpdate,applyUpdate:applyUpdate};

  /* ---------- Hors ligne et installation ---------- */
  if('serviceWorker' in navigator&&location.protocol!=='file:'){
    navigator.serviceWorker.register('sw.js').then(function(r){reg=r}).catch(function(e){console.warn('sw',e)});
    var reloading=false;
    navigator.serviceWorker.addEventListener('controllerchange',function(){if(reloading||!S.updating)return;reloading=true;location.reload()});
  }
  try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){}

  /* ---------- Mise à jour ---------- */
  function cmp(a,b){a=String(a).split('.').map(Number);b=String(b).split('.').map(Number);for(var i=0;i<3;i++){if((a[i]||0)!==(b[i]||0))return (a[i]||0)>(b[i]||0)?1:-1}return 0}
  function checkUpdate(manual){
    if(!navigator.onLine){if(manual)note('Pas de connexion : la recherche de mise à jour se fera à ta prochaine connexion.');return Promise.resolve(null)}
    return fetch('version.json?t='+Date.now(),{cache:'no-store'}).then(function(r){return r.json()}).then(function(j){
      lsSet('mgc:lastCheck',String(Date.now()));
      if(j&&cmp(j.version,VERSION)>0){banner(j);return j}
      if(manual)note('Tu as la dernière version ('+VERSION+').');return null
    }).catch(function(){if(manual)note('Impossible de joindre le serveur de mise à jour. Réessaie plus tard.');return null})}
  function applyUpdate(){
    S.updating=true;var b=document.getElementById('mgc-up-go');if(b){b.disabled=true;b.textContent='Mise à jour…'}
    if(!reg){location.reload();return}
    reg.update().then(function(){
      var sw=reg.waiting||reg.installing;
      if(!sw){location.reload();return}
      var go=function(w){w.postMessage('skip')};
      if(sw.state==='installed')go(sw);
      else sw.addEventListener('statechange',function(){if(sw.state==='installed')go(sw)});
      setTimeout(function(){location.reload()},8000);
    }).catch(function(){location.reload()})}

  /* ---------- Interface ---------- */
  var CSS='.mgc-bar{position:fixed;z-index:9999;left:0;right:0;top:0;padding:calc(8px + env(safe-area-inset-top,0px)) max(16px,env(safe-area-inset-right,0px)) 8px max(16px,env(safe-area-inset-left,0px));background:#14251f;color:#f3f5f1;font:500 14px/1.35 system-ui,-apple-system,"Segoe UI",sans-serif;display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;box-shadow:0 4px 18px rgba(0,0,0,.25)}'+
   '.mgc-bar b{color:#e3b14a}.mgc-bar span{flex:1 1 220px;min-width:0}.mgc-bar button{font:600 14px system-ui,sans-serif;border-radius:999px;border:0;padding:8px 16px;cursor:pointer;background:#e3b14a;color:#14251f}.mgc-bar button.x{background:transparent;color:#f3f5f1;border:1px solid rgba(243,245,241,.4)}'+
   '.mgc-note{position:fixed;z-index:9999;left:50%;transform:translateX(-50%);bottom:calc(90px + env(safe-area-inset-bottom,0px));max-width:min(440px,calc(100vw - 32px));background:#14251f;color:#f3f5f1;padding:10px 16px;border-radius:12px;font:500 14px/1.4 system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.3)}'+
   '.mgc-fab{position:fixed;z-index:50;right:max(16px,env(safe-area-inset-right,0px));bottom:calc(16px + env(safe-area-inset-bottom,0px));display:flex;gap:8px}'+
   '.mgc-fab a{display:inline-flex;align-items:center;gap:8px;text-decoration:none;font:600 15px/1 "IBM Plex Sans Condensed","Arial Narrow",sans-serif;letter-spacing:.02em;border-radius:999px;padding:12px 18px;background:#0b7f8f;color:#fff;box-shadow:0 6px 20px rgba(11,127,143,.35)}'+
   '.mgc-fab a.h{background:#fbfcfa;color:#14251f;border:1px solid #d5ded8;box-shadow:0 4px 14px rgba(0,0,0,.08);padding:12px 14px}'+
   '@media (prefers-color-scheme:dark){.mgc-fab a{background:#4fc2cf;color:#0f1714}.mgc-fab a.h{background:#151f1b;color:#e4ece7;border-color:#2a3832}}'+
   '.actionbar .in .btn.mgc-x{display:inline-flex;align-items:center;justify-content:center;gap:6px;text-decoration:none;flex:0 0 auto;padding:0 16px;background:var(--soft,#f5f6f2);color:var(--ink,#18201c);font-weight:600}'+
   '.mgc-x svg,.mgc-fab svg{width:18px;height:18px;flex:none}';
  var BOOK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/></svg>';
  var APP='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 15l3-3 3 2 4-5"/></svg>';
  var HOME='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>';
  function style(){if(document.getElementById('mgc-css'))return;var s=document.createElement('style');s.id='mgc-css';s.textContent=CSS;document.head.appendChild(s)}
  function note(t){style();var n=document.createElement('div');n.className='mgc-note';n.setAttribute('role','status');n.textContent=t;document.body.appendChild(n);setTimeout(function(){n.remove()},4200)}
  function banner(j){style();if(document.getElementById('mgc-up'))return;var b=document.createElement('div');b.id='mgc-up';b.className='mgc-bar';b.setAttribute('role','status');
    var t=document.createElement('span');t.innerHTML='<b>Nouvelle version '+String(j.version).replace(/[<&]/g,'')+'</b> · ';t.appendChild(document.createTextNode(j.notes||'Améliorations et chiffres à jour.'));
    var go=document.createElement('button');go.id='mgc-up-go';go.textContent='Mettre à jour';go.onclick=applyUpdate;
    var x=document.createElement('button');x.className='x';x.textContent='Plus tard';x.onclick=function(){b.remove()};
    b.appendChild(t);b.appendChild(go);b.appendChild(x);document.body.appendChild(b)}
  S.note=note;

  function cross(){style();
    if(page==='appli'){var bar=document.querySelector('.actionbar .in');if(!bar||document.getElementById('mgc-x'))return;
      var a=document.createElement('a');a.id='mgc-x';a.href=S.livre;a.className='btn mgc-x';a.setAttribute('aria-label','Ouvrir le livre');a.innerHTML=BOOK+'<span>Livre</span>';bar.insertBefore(a,bar.firstChild)}
    if(page==='livre'){if(document.querySelector('.mgc-fab'))return;var f=document.createElement('div');f.className='mgc-fab';
      f.innerHTML='<a class="h" href="./" aria-label="Accueil">'+HOME+'</a><a href="'+S.appli+'">'+APP+'<span>Ouvrir l’appli</span></a>';document.body.appendChild(f)}
  }
  function ready(){cross();
    var last=Number(lsGet('mgc:lastCheck')||0);if(Date.now()-last>12*3600*1000)setTimeout(function(){checkUpdate(false)},2500)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();
