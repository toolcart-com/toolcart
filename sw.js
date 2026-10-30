/* ToolCart V1.25: resilient static shell, never cache API or media data. */
const CACHE='toolcart-shell-v1-47';
const SHELL=['/','/styles.css','/tempo.css','/tempo06.css','/app.js','/toolcart-v115-symbol.png','/toolcart-v124-wordmark.png','/icon-192.png','/icon-512.png'];
// Public catalog covers are safe to cache for instant repeat views; no private purchases/avatars.
const COVER_CACHE='toolcart-public-covers-v1';
const COVER_LIMIT=60;
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(async c=>{await Promise.allSettled(SHELL.map(u=>c.add(u)));await self.skipWaiting();})));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('toolcart-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
  if(url.pathname.startsWith('/media/')){
    if(!/^\/media\/(?:product-covers|app-icons)\//.test(url.pathname)||req.headers.has('range'))return;
    event.respondWith((async()=>{
      let cache=null;
      try{cache=await caches.open(COVER_CACHE);const saved=await cache.match(req);if(saved)return saved}catch(e){/* Cache unavailable: fetch public image normally. */}
      const response=await fetch(req);
      if(cache&&response.ok&&response.headers.get('content-type')?.startsWith('image/')){
        const forCache=response.clone();
        event.waitUntil((async()=>{
          try{
            await cache.put(req,forCache);
            const keys=await cache.keys();
            if(keys.length>COVER_LIMIT)await Promise.all(keys.slice(0,keys.length-COVER_LIMIT).map(k=>cache.delete(k)));
          }catch(e){/* Storage quotas must never break image delivery. */}
        })());
      }
      return response;
    })());
    return;
  }
  // Never serve an old (or homepage fallback) administrator page from the shell cache.
  if(url.pathname==='/admin'||url.pathname==='/admin/'||url.pathname==='/admin.html'){
    event.respondWith(fetch(req,{cache:'no-store'}));
    return;
  }
  if(req.mode==='navigate'){
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE);
      const network=fetch(req).then(response=>{if(response.ok)cache.put(req,response.clone()).catch(()=>{});return response;});
      // Static HTML contains no account data. Return it immediately on reload;
      // always refresh it in the background for a future navigation.
      const saved=await cache.match(req)||await cache.match('/');
      if(saved){event.waitUntil(network.catch(()=>{}));return saved;}
      return network;
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
