/* Stockage local de l'appli : reproduit la petite partie de l'API de base de données dont l'appli a besoin,
   mais enregistre tout dans ce navigateur (localStorage). Aucune donnée ne quitte l'appareil. */
(function(){
  'use strict';
  var PFX='mgc:db:';
  var docL={},colL={};
  function key(p){return PFX+p}
  function read(p){try{var v=localStorage.getItem(key(p));return v==null?null:JSON.parse(v)}catch(e){return null}}
  function err(code,msg){var e=new Error(msg||code);e.code=code;return e}
  function write(p,data){
    try{localStorage.setItem(key(p),JSON.stringify(data))}
    catch(e){throw err('quota_exceeded','Stockage plein')}
  }
  function snap(p,d){return {id:p.split('/').pop(),exists:d!=null,data:function(){return d==null?undefined:JSON.parse(JSON.stringify(d))}}}
  function colDocs(c){var out=[],pre=key(c)+'/';
    for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf(pre)===0&&k.slice(pre.length).indexOf('/')<0){var p=k.slice(PFX.length);var d=read(p);if(d!=null)out.push(snap(p,d))}}
    out.sort(function(a,b){return a.id<b.id?-1:a.id>b.id?1:0});return out}
  function emitDoc(p){(docL[p]||[]).forEach(function(cb){try{cb(snap(p,read(p)))}catch(e){console.warn(e)}})}
  function emitCol(c){(colL[c]||[]).forEach(function(cb){try{cb({docs:colDocs(c),empty:!colDocs(c).length})}catch(e){console.warn(e)}})}
  function parent(p){var a=p.split('/');a.pop();return a.join('/')}
  function doc(p){return {
    id:p.split('/').pop(),path:p,
    get:function(){return Promise.resolve(snap(p,read(p)))},
    set:function(d){return new Promise(function(ok,ko){try{write(p,d);ok()}catch(e){ko(e)}})},
    update:function(d){return new Promise(function(ok,ko){try{var cur=read(p)||{};for(var k in d)cur[k]=d[k];write(p,cur);ok()}catch(e){ko(e)}})},
    delete:function(){try{localStorage.removeItem(key(p))}catch(e){}return Promise.resolve()},
    onSnapshot:function(cb){(docL[p]=docL[p]||[]).push(cb);setTimeout(function(){cb(snap(p,read(p)))},0);return function(){docL[p]=(docL[p]||[]).filter(function(x){return x!==cb})}}
  }}
  function collection(c){return {
    path:c,
    doc:function(id){return doc(c+'/'+id)},
    get:function(){var d=colDocs(c);return Promise.resolve({docs:d,empty:!d.length})},
    onSnapshot:function(cb){(colL[c]=colL[c]||[]).push(cb);setTimeout(function(){var d=colDocs(c);cb({docs:d,empty:!d.length})},0);return function(){colL[c]=(colL[c]||[]).filter(function(x){return x!==cb})}}
  }}
  /* Un autre onglet de l'appli a enregistré : on rafraîchit celui-ci. */
  window.addEventListener('storage',function(e){if(!e.key||e.key.indexOf(PFX)!==0)return;var p=e.key.slice(PFX.length);emitDoc(p);emitCol(parent(p))});
  var db={doc:doc,collection:collection};
  var downloads={save:function(o){return new Promise(function(ok,ko){try{
    var type=/\.pdf$/i.test(o.filename)?'application/pdf':/\.csv$/i.test(o.filename)?'text/csv;charset=utf-8':/\.json$/i.test(o.filename)?'application/json':'application/octet-stream';
    var blob=o.data instanceof Blob?o.data:new Blob([o.data],{type:type});var url=URL.createObjectURL(blob);
    var a=document.createElement('a');a.href=url;a.download=o.filename;a.rel='noopener';document.body.appendChild(a);a.click();
    setTimeout(function(){URL.revokeObjectURL(url);a.remove()},4000);ok()}catch(e){ko(err('unavailable'))}})}};
  var caps={db:db,downloads:downloads};
  window.claude={use:function(name){return Promise.resolve(caps[name]||null)}};
})();
