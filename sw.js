/* ToolCart V1.25: resilient static shell, never cache API or media data. */
const CACHE='toolcart-shell-v1-25';
const SHELL=['/','/styles.css','/tempo.css','/tempo06.css','/app.js','/toolcart-v115-symbol.png','/toolcart-v124-wordmark.png','/toolcart-v122-hero-cart.png','/icon-192.png','/icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(async c=>{await Promise.allSettled(SHELL.map(u=>c.add(u)));await self.skipWaiting();})));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('toolcart-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin||url.pathname.startsWith('/api/')||url.pathname.startsWith('/media/'))return;
  if(req.mode==='navigate'){
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE);
      const network=fetch(req).then(response=>{if(response.ok)cache.put(req,response.clone()).catch(()=>{});return response;});
      // Use an already saved storefront if mobile connectivity hangs.
      const saved=await cache.match(req)||await cache.match('/');
      if(!saved)return network;
      return Promise.race([network,new Promise(resolve=>setTimeout(()=>resolve(saved),1800))]);
    })());
    return;
  }
  const staticPaths=new Set(SHELL.filter(x=>x!=='/'));
  if(!staticPaths.has(url.pathname))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const saved=await cache.match(req);
    if(saved)return saved;
    const response=await fetch(req);
    if(response.ok)cache.put(req,response.clone()).catch(()=>{});
    return response;
  })());
});
