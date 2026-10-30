const state={user:null,csrf:null,apps:[],products:[],wallet:{balanceMinor:0,currency:'NGN'},cartCount:0,cartItems:[],cartTotalMinor:0,cartCurrency:'NGN',cartReady:false,cartRevision:0,cartRenderSignature:null,updates:[],notifications:[],requests:[],recentApps:[],currentPlan:null,settings:{},promos:[],activeTab:'home',appCategory:'all',updateFilter:'all',notifFilter:'unread'};
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtDate=v=>{if(!v)return'';const d=new Date(v);return Number.isNaN(d)?'':new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',year:d.getFullYear()!==new Date().getFullYear()?'numeric':undefined}).format(d)};
const fmtMoney=(minor,currency='NGN')=>new Intl.NumberFormat(undefined,{style:'currency',currency,currencyDisplay:'narrowSymbol'}).format((Number(minor)||0)/100);
const humanStatus=s=>String(s||'').replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase());

async function api(path,opts={}){
  const headers=new Headers(opts.headers||{});
  if(opts.body&&!(opts.body instanceof FormData)){headers.set('content-type','application/json');opts.body=typeof opts.body==='string'?opts.body:JSON.stringify(opts.body)}
  if(state.csrf&&!['GET','HEAD'].includes((opts.method||'GET').toUpperCase()))headers.set('x-csrf-token',state.csrf);
  const res=await fetch(path,{credentials:'same-origin',...opts,headers});
  const data=await res.json().catch(()=>({ok:false,error:'We could not read the server response.'}));
  if(!res.ok){const err=new Error(data.error||'Something went wrong.');err.status=res.status;err.data=data;throw err}
  return data;
}
// Display only the latest status message; a newer action replaces the previous one.
let toastDismissTimer=null;
function toast(message,type='ok'){
  const host=$('#toastHost');
  if(!host)return;
  if(toastDismissTimer!==null){clearTimeout(toastDismissTimer);toastDismissTimer=null;}
  const el=document.createElement('div');
  el.className=`toast ${type}`;
  el.textContent=message;
  host.replaceChildren(el);
  toastDismissTimer=setTimeout(()=>{
    if(host.firstElementChild===el)el.remove();
    toastDismissTimer=null;
  },3600);
}
function setTheme(theme){document.documentElement.dataset.theme='pearl';document.querySelector('meta[name="theme-color"]').setAttribute('content','#000000');localStorage.setItem('toolcart_theme','pearl')}
function preferredVisualTheme(preferred,fallback='pearl'){return 'pearl'}
function initials(name='ToolCart'){return name.trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'TC'}
function iconHtml(app,cls='app-icon'){const style=`--accent:${esc(app.accent_color||app.accentColor||'#7b65ff')}`;return `<div class="${cls}" style="${style}">${app.icon_url?`<img src="${esc(app.icon_url)}" alt="">`:esc(initials(app.name))}</div>`}
function tempoToolCover(app,priority=false){return app.icon_url?`<img class="tempo-tool-cover" src="${esc(app.icon_url)}" alt="${esc(app.name)} cover" loading="${priority?'eager':'lazy'}" decoding="async" ${priority?'fetchpriority="high"':''}>`:`<div class="tempo-tool-fallback" style="--accent:${esc(app.accent_color||'#ae9ac9')}"><span>${esc(initials(app.name))}</span></div>`}
function empty(title,text,icon='◇'){return `<div class="empty-state"><span>${icon}</span><h3>${esc(title)}</h3><p>${esc(text)}</p></div>`}

async function boot(){
  if('serviceWorker'in navigator)navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'}).catch(()=>{});
  // Render the public storefront immediately while checking the account session.
  $('#signedOut').classList.remove('hidden');
  bindGlobalEvents();
  // A single authenticated bootstrap replaces the old serial /api/session then
  // /api/bootstrap round trips. Never treat server failures as a signed-out state.
  try{
    const initial=await api('/api/bootstrap');
    state.csrf=initial.csrfToken;
    await enterApp(initial);
  }catch(e){
    if(e.status!==401)console.warn('ToolCart bootstrap failed:',e.message);
    await enterPublic();
  }
  void handleDeepLinks();
  setupViewportDock();
}

async function enterPublic(){
  $('#appShell').classList.add('hidden');$('#signedOut').classList.remove('hidden');
  try{const data=await api('/api/public/bootstrap');state.settings=data.settings||{};setTheme(preferredVisualTheme(null,state.settings.default_theme||'pearl'));renderPublicApps(data.apps||[],data.products||[])}catch{setTheme(preferredVisualTheme(null,'pearl'));renderPublicApps([],[])}
}
function renderPublicApps(apps,products=[]){
 const productCards=products.map((p,i)=>`<article class="tempo-merchant-card tempo-good-card" data-auth="register"><div class="tempo-card-media tempo-product-media">${p.display_image_url?`<img src="${esc(p.display_image_url)}" alt="${esc(p.name)}" loading="${i<2?'eager':'lazy'}" ${i<2?'fetchpriority="high"':''}>`:`<div class="tempo-product-placeholder"><small>DIGITAL GOODS / TOOLCART</small><strong>${esc(p.name)}</strong><i>DESIGNED FOR EVERYDAY USE</i></div>`}<button class="tempo06-save" data-auth="register" aria-label="Sign in to save ${esc(p.name)}">${T06_HEART}</button></div><div class="tempo-card-info"><small class="tempo-card-type">${esc(p.short_description||productAvailability(p))}</small><h3>${esc(p.name)}</h3><strong class="tempo-card-price">${esc(productPrice(p))}</strong></div><button class="tempo06-add" data-auth="register"><span>+</span> Add to cart</button></article>`);
 const toolCards=apps.map((a,i)=>`<article class="tempo-merchant-card tempo-tool-card" data-auth="register"><div class="tempo-card-media tempo-tool-media">${tempoToolCover(a,products.length+i<2)}</div><div class="tempo-card-info"><small class="tempo-card-type">WORKING TOOL</small><h3>${esc(a.name)}</h3><strong class="tempo-online ${appAvailability(a)}">${esc(humanStatus(a.status)||'AVAILABLE')}</strong></div><button class="tempo06-add" data-auth="register">Explore tool ↗</button></article>`);
 const all=[...productCards,...toolCards];$('#publicApps').innerHTML=all.length?all.slice(0,24).join(''):empty('New goods on the way','New digital products and working tools appear here when published.');
}
const T06_HEART='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="M20.6 5.4a5.1 5.1 0 0 0-7.2 0L12 6.8l-1.4-1.4a5.1 5.1 0 0 0-7.2 7.2L12 21l8.6-8.4a5.1 5.1 0 0 0 0-7.2z"/></svg>';
const t06Saved=()=>{try{return JSON.parse(localStorage.getItem('toolcart_product_wishlist')||'[]').map(Number)}catch{return[]}};
function t06ToggleSave(id){
  const saved=new Set(t06Saved());
  saved.has(id)?saved.delete(id):saved.add(id);
  localStorage.setItem('toolcart_product_wishlist',JSON.stringify([...saved]));
  const isSaved=saved.has(id),product=state.products.find(p=>Number(p.id)===id);
  // Update the heart in place. Rebuilding renderApps() here replaces every loaded cover image,
  // making R2 images briefly disappear on iPhone Safari while they load again.
  $$('[data-t06-save]').forEach(button=>{
    if(Number(button.dataset.t06Save)!==id)return;
    button.classList.toggle('saved',isSaved);
    button.setAttribute('aria-label',`${isSaved?'Remove':'Save'} ${product?.name||'product'} ${isSaved?'from':'to'} wishlist`);
  });
  if(state.activeTab==='wishlist')renderWishlist();
  toast(isSaved?'Added to wishlist.':'Removed from wishlist.');
}
function renderWishlist(){const saved=new Set(t06Saved());const goods=state.products.filter(p=>saved.has(Number(p.id)));const el=$('#wishlistProducts');if(el)el.innerHTML=goods.length?goods.map(productCard).join(''):empty('Your wishlist is empty','Tap the heart on a product to save it here.','♡')}
function tempo06CategoryMatches(p){const cat=state.tempo06Category||'all';if(cat==='all')return true;if(cat==='free')return p.access_type==='free'||Number(p.price_minor)===0;const text=`${p.name} ${p.short_description||''} ${p.description||''}`.toLowerCase();return cat==='ai'?/\bai\b|artificial intelligence|prompt|machine learning/.test(text):cat==='guide'?/guide|tutorial|handbook|pdf|ebook|course/.test(text):text.includes(cat)}
async function addProductCardToCart(id,button){const oldLabel=button?.innerHTML;if(button){button.disabled=true;button.textContent='Adding…'}try{const d=await api('/api/cart/items',{method:'POST',body:{productId:Number(id),quantity:1}});state.cartCount=Number(d.cartCount||0);updateBadges();updateLocalCartItem(Number(id),1);void refreshCart();toast('Added to your cart.')}catch(e){toast(e.message,'error')}finally{if(button){button.disabled=false;button.innerHTML=oldLabel}}}

async function enterApp(preloaded){
  // Keep the existing storefront visible until essential account/catalog data arrive.
  // Nonessential updates, notifications and promotions are loaded separately later.
  const data=preloaded||await api('/api/bootstrap');
  state.csrf=data.csrfToken||state.csrf;
  Object.assign(state,{user:data.user,apps:data.apps||[],products:data.products||[],wallet:data.wallet||{balanceMinor:0,currency:'NGN'},cartCount:Number(data.cartCount||0),updates:data.updates||[],notifications:data.notifications||[],recentApps:data.recentApps||[],currentPlan:data.currentPlan,settings:data.settings||{},promos:data.promos||[],cartItems:data.cartItems||[],cartTotalMinor:Number(data.cartTotalMinor||0),cartCurrency:data.cartCurrency||'NGN',cartReady:Array.isArray(data.cartItems),cartRevision:state.cartRevision+1,cartRenderSignature:null});
  setTheme(preferredVisualTheme(state.user.preferredTheme,state.settings.default_theme||'pearl'));
  renderApp();
  renderCart();
  switchTab('home');
  $('#signedOut').classList.add('hidden');$('#appShell').classList.remove('hidden');
  void loadDeferredBootstrap();
}
async function loadDeferredBootstrap(){
  const userId=state.user?.id;
  try{
    const data=await api('/api/bootstrap/deferred');
    if(!state.user||state.user.id!==userId)return;
    state.updates=data.updates||[];
    state.notifications=data.notifications||[];
    state.recentApps=data.recentApps||[];
    state.promos=data.promos||[];
    renderRecent();renderUpdates();renderPromos();updateBadges();
  }catch(e){console.warn('ToolCart extras will retry on refresh:',e.message)}
}
function renderApp(){renderHeader();renderApps();renderRecent();renderUpdates();renderSubscription();renderPromos();renderSettingsProfile();updateStoreMenuAccount();renderDockVisibility();updateBadges()}
function greeting(){const h=new Date().getHours();return h<12?'Good morning':h<18?'Good afternoon':'Good evening'}
function renderHeader(){
  $('#greeting').textContent=greeting();$('#firstName').textContent=state.user.firstName||'there';
  const av=$('#avatar');if(state.user.profileImageUrl){av.style.backgroundImage=`url("${state.user.profileImageUrl}")`;av.textContent=''}else{av.style.backgroundImage='';av.textContent=initials(state.user.fullName)}
}
function appAvailability(a){return a.status==='online'?'online':'offline'}
function appCard(a,featured=false,priority=false){const availability=appAvailability(a);return `<article class="tempo-merchant-card tempo-tool-card" data-app-id="${a.id}" tabindex="0" role="button" aria-label="Open ${esc(a.name)}"><div class="tempo-card-media tempo-tool-media">${tempoToolCover(a,priority)}</div><div class="tempo-card-info"><small class="tempo-card-type">WORKING TOOL</small><h3>${esc(a.name)}</h3><small class="tempo-online ${availability}">${featured?esc(humanStatus(a.status)||'Available'):availability.toUpperCase()}</small></div><button class="tempo06-add" data-tool-launch="${a.id}">${featured?'Explore tool':'Open tool'} ↗</button></article>`}
function productAvailability(p){return p.stock_mode==='unlimited'?'UNLIMITED':Number(p.stock_quantity||0)>0?`${Number(p.stock_quantity)} IN STOCK`:'SOLD OUT'}
function productCard(p,priority=false){const price=productPrice(p),stock=productAvailability(p),soldOut=stock==='SOLD OUT',saved=t06Saved().includes(Number(p.id));return `<article class="tempo-merchant-card tempo-good-card" data-product-id="${p.id}" tabindex="0" role="button" aria-label="View ${esc(p.name)}"><div class="tempo-card-media tempo-product-media">${p.display_image_url?`<img src="${esc(p.display_image_url)}" loading="${priority?'eager':'lazy'}" ${priority?'fetchpriority="high"':''} alt="${esc(p.name)} cover">`:`<div class="tempo-product-placeholder"><small>THE TOOLCART COLLECTION</small><strong>${esc(p.name)}</strong><i>DIGITAL GOODS / ${esc(stock)}</i></div>`}<button type="button" class="tempo06-save ${saved?'saved':''}" data-t06-save="${p.id}" aria-label="${saved?'Remove':'Save'} ${esc(p.name)} ${saved?'from':'to'} wishlist">${T06_HEART}</button></div><div class="tempo-card-info"><small class="tempo-card-type">${esc(p.short_description||stock)}</small><h3>${esc(p.name)}</h3><strong class="tempo-card-price">${esc(price)}</strong></div><button type="button" class="tempo06-add" data-card-add="${p.id}" ${soldOut?'disabled':''}><span>+</span> ${soldOut?'Out of stock':p.access_type==='free'?'Get free product':'Add to cart'}</button></article>`}

function launcherItems(){const tools=state.apps.map(x=>({...x,_kind:'app',_order:Number(x.display_order||0)}));const products=state.products.map(x=>({...x,_kind:'product',_order:Number(x.display_order||0)}));return [...products,...tools].sort((a,b)=>(b.badge_featured||b.featured||0)-(a.badge_featured||a.featured||0)||a._order-b._order||String(a.name).localeCompare(String(b.name)))}
function launcherCard(x){return x._kind==='product'?productCard(x):appCard(x)}
function renderApps(){
  const goods=state.products.slice().filter(tempo06CategoryMatches).sort((a,b)=>{const sort=$('#tempo06Sort')?.value||'featured';if(sort==='low')return Number(a.price_minor||0)-Number(b.price_minor||0);if(sort==='high')return Number(b.price_minor||0)-Number(a.price_minor||0);if(sort==='newest')return Number(b.id)-Number(a.id);return (Number(b.featured||0)-Number(a.featured||0))||(Number(a.display_order||0)-Number(b.display_order||0))});
  // Match the public storefront: products followed by working tools in one two-column lineup.
  // Category-specific selections only show matching products; the separate Working Tools shelf remains below.
  const lineup=[...goods.map((p,i)=>productCard(p,i<2)),...((state.tempo06Category||'all')==='all'?state.apps.map((a,i)=>appCard(a,true,goods.length+i<2)):[])];
  $('#homeProducts').innerHTML=lineup.length?lineup.join(''):empty('No products in this selection','Try Everything to browse all current goods.');
  $('#homeApps').innerHTML=state.apps.length?state.apps.map(appCard).join(''):empty('Working tools, coming soon','New tools will appear here when available.');
  const categories=['all','products','tools',...new Set(state.apps.map(a=>a.category).filter(Boolean))];$('#categoryChips').innerHTML=categories.map(c=>`<button class="chip ${state.appCategory===c?'active':''}" data-category="${esc(c)}">${c==='all'?'Everything':c==='products'?'Digital goods':c==='tools'?'Working tools':esc(c)}</button>`).join('');renderAppsPage();renderWishlist();
}
function renderAppsPage(){const q=($('#appSearch')?.value||'').toLowerCase().trim();let items=launcherItems();items=items.filter(x=>{const catOk=state.appCategory==='all'||(state.appCategory==='products'&&x._kind==='product')||(state.appCategory==='tools'&&x._kind==='app')||(x._kind==='app'&&x.category===state.appCategory);const hay=`${x.name} ${x.short_description||''} ${x.description||''} ${x.category||''}`.toLowerCase();return catOk&&(!q||hay.includes(q))});$('#appCount').textContent=`${items.length} find${items.length===1?'':'s'}`;$('#appsGrid').innerHTML=items.length?items.map(launcherCard).join(''):empty('Nothing on this shelf','Try another keyword or browse a different category.','⌕')}
function renderRecent(){const sec=$('#recentSection');if(!state.recentApps.length){sec.classList.add('hidden');return}sec.classList.remove('hidden');$('#recentApps').innerHTML=state.recentApps.slice(0,5).map(a=>{const availability=appAvailability(a);return `<article class="recent-card" data-app-id="${a.id}">${iconHtml(a,'app-icon')}<div><strong>${esc(a.name)}</strong><span class="availability ${availability}"><i></i>${availability.toUpperCase()}</span></div></article>`}).join('')}
function updateCard(u){const unread=!u.is_read;return `<article class="update-card" data-update-id="${u.id}"><div class="update-type">${u.update_type==='security'?'!' : u.update_type==='maintenance'?'M':'U'}</div><div><h3>${esc(u.title)}</h3><p>${esc(u.summary||u.content?.slice(0,120)||'')}</p></div><div>${unread?'<i class="unread-mark"></i>':`<time>${fmtDate(u.publish_at)}</time>`}</div></article>`}
function renderUpdates(){const home=state.updates.slice(0,3);$('#homeUpdates').innerHTML=home.length?home.map(updateCard).join(''):empty('You are up to date','New product and service updates will appear here.');renderUpdatesPage()}
function renderUpdatesPage(){let items=state.updates;if(state.updateFilter==='unread')items=items.filter(x=>!x.is_read);if(state.updateFilter==='important')items=items.filter(x=>x.priority==='important'||x.priority==='urgent'||x.update_type==='important'||x.update_type==='security');$('#updatesList').innerHTML=items.length?items.map(updateCard).join(''):empty('Nothing here','No updates match this filter.')}
function renderSubscription(){const p=state.currentPlan;$('#subscriptionCard').innerHTML=`<div class="subscription-meta"><div class="subscription-icon">${esc((p?.name||'F')[0])}</div><div><span class="eyebrow">CURRENT PLAN</span><h3>${esc(p?.name||'Free')}</h3><p>${p?.current_period_end?`Renews or ends ${fmtDate(p.current_period_end)}`:'Manage your ToolCart membership'}</p></div></div><button class="btn btn-secondary compact" data-setting="subscription">Manage</button>`}
function renderPromos(){if(!state.promos.length||state.settings.floating_promo_enabled===false){$('#promoArea').innerHTML='';return}const p=state.promos[0];$('#promoArea').innerHTML=`<article class="promo-card" ${p.destination_url?`data-promo-url="${esc(p.destination_url)}"`:''}><span class="eyebrow">FEATURED</span><h3>${esc(p.title)}</h3><p>${esc(p.message)}</p></article>`}
function renderSettingsProfile(){const u=state.user;const appearanceBtn=document.querySelector('[data-setting="appearance"]');if(appearanceBtn)appearanceBtn.classList.toggle('hidden',state.settings.allow_user_theme===false);$('#settingsProfileCard').innerHTML=`<div class="avatar" style="${u.profileImageUrl?`background-image:url('${esc(u.profileImageUrl)}')`:''}">${u.profileImageUrl?'':esc(initials(u.fullName))}</div><div><h3>${esc(u.fullName)}</h3><p>${esc(u.email)} · ${esc(state.currentPlan?.name||'Free')}</p></div>`}
function renderPurchases(){const box=$('#purchasedProducts');if(!box)return;const owned=state.products.filter(p=>Number(p.owned||0)>0);box.innerHTML=owned.length?owned.map(p=>`<article class="tempo-merchant-card tempo-good-card" data-product-id="${p.id}" tabindex="0" role="button" aria-label="Open files for ${esc(p.name)}"><div class="tempo-card-media tempo-product-media">${p.display_image_url?`<img src="${esc(p.display_image_url)}" alt="${esc(p.name)}" loading="lazy">`:`<div class="tempo-product-placeholder"><strong>${esc(p.name)}</strong></div>`}</div><div class="tempo-card-info"><small class="tempo-card-type">PURCHASED PRODUCT</small><h3>${esc(p.name)}</h3></div><button class="tempo06-add" data-product-id="${p.id}">View files ↗</button></article>`).join(''):empty('No purchases yet','Products you purchase or unlock will appear here.');}
function renderWalletView(){const el=$('#walletViewBalance');if(el)el.textContent=fmtMoney(state.wallet?.balanceMinor||0,state.wallet?.currency||'NGN')}
function updateStoreMenuAccount(){const u=state.user;if(!u)return;const name=$('#menuAccountName'),email=$('#menuAccountEmail'),av=$('#menuAccountAvatar');if(name)name.textContent=u.fullName||'My account';if(email)email.textContent=u.email||'';if(av){av.textContent=initials(u.fullName);av.style.backgroundImage=u.profileImageUrl?`url("${u.profileImageUrl}")`:'';if(u.profileImageUrl)av.textContent=''}}
function openStoreMenu(){if(!state.user)return;updateStoreMenuAccount();$('#toolcartMenuBackdrop').classList.remove('hidden');$('#toolcartMenu').classList.remove('hidden');$('#menuBtn').setAttribute('aria-expanded','true');document.body.classList.add('tempo06-menu-open');$('#menuCloseBtn').focus()}
function closeStoreMenu(){const el=$('#toolcartMenu');if(!el||el.classList.contains('hidden'))return;el.classList.add('hidden');$('#toolcartMenuBackdrop').classList.add('hidden');$('#menuBtn').setAttribute('aria-expanded','false');document.body.classList.remove('tempo06-menu-open')}
function renderDockVisibility(){const map={apps:'dock_apps_enabled',updates:'dock_updates_enabled',requests:'dock_requests_enabled',settings:'dock_settings_enabled'};for(const [tab,key]of Object.entries(map)){const btn=$(`[data-tab="${tab}"]`,$('#dock'));if(btn)btn.classList.toggle('hidden',state.settings[key]===false)}}
function updateBadges(){const unread=state.notifications.filter(n=>!n.read_at).length;$('#notifBadge').classList.toggle('hidden',!unread);$('#notifBadge').textContent=unread>99?'99+':unread;const cart=Number(state.cartCount||0);$('#cartBadge')?.classList.toggle('hidden',!cart);if($('#cartBadge'))$('#cartBadge').textContent=cart>99?'99+':cart;const updates=state.updates.filter(u=>!u.is_read).length;$('#dockUpdateBadge')?.classList.toggle('hidden',!updates)}

function productPrice(p){return p.access_type==='free'||Number(p.price_minor)===0?'Free':fmtMoney(p.price_minor,p.currency||'NGN')}
// Open product details from already loaded catalog data on the tap itself.
// Authoritative stock, ownership, wallet and protected file links still come from GET /api/products/:id.
let productOpenRequest=0;
function productDetailActions(p,verified){
  if(verified&&p.has_access){
    const assets=p.assets&&p.assets.length?p.assets:[{fileName:p.file_name||'Product file',fileType:p.file_type||'file',url:`/api/products/${p.id}/file`}];
    return `<div class="product-owned-assets"><div class="product-files-head"><strong>Your product files</strong><span>${Number(p.asset_count||assets.length)} file${Number(p.asset_count||assets.length)===1?'':'s'}</span></div>${assets.map((a,i)=>`<a class="product-file-link" href="${esc(a.url)}" target="_blank" rel="noopener"><span>${a.fileType==='pdf'?'PDF':'IMG'}</span><div><strong>${esc(a.fileName||`File ${i+1}`)}</strong><small>Open protected file</small></div><b>↗</b></a>`).join('')}</div><p class="product-owned-note">Purchased quantity: ${Number(p.owned_quantity||0)}</p>`;
  }
  if(!verified&&Number(p.owned||0)>0){
    return '<div class="product-owned-assets"><strong>My purchased files</strong><p class="product-owned-note">Verifying your download access…</p></div>';
  }
  const soldOut=p.stock_mode!=='unlimited'&&Number(p.stock_quantity)<=0;
  return `<div class="product-buy-box"><div class="quantity-stepper"><button type="button" data-product-qty="minus">−</button><strong id="productQty">1</strong><button type="button" data-product-qty="plus" data-max="${p.stock_mode==='unlimited'?99:Number(p.stock_quantity||0)}">+</button></div><div class="product-actions"><button class="btn btn-secondary" data-add-cart="${p.id}" ${soldOut?'disabled':''}>Add to cart</button><button class="btn btn-primary" data-buy-product="${p.id}" ${soldOut?'disabled':''}>${p.access_type==='free'?'Get now':'Buy now'}</button></div></div>`;
}
function productDetailMarkup(p,verified){
  const stock=p.stock_mode==='unlimited'?'Unlimited stock':Number(p.stock_quantity)>0?`${Number(p.stock_quantity)} in stock`:'Out of stock';
  const soldOut=p.stock_mode!=='unlimited'&&Number(p.stock_quantity)<=0;
  return `<div class="product-detail"><div class="product-balance"><span>Available balance</span><strong id="productDetailBalance">${fmtMoney(state.wallet.balanceMinor,state.wallet.currency)}</strong></div><div class="product-cover">${p.display_image_url?`<img src="${esc(p.display_image_url)}" alt="${esc(p.name)}">`:`<div class="product-cover-fallback">${esc(initials(p.name))}</div>`}</div><div class="product-title-row"><div><span class="eyebrow">${p.premium?'PREMIUM PRODUCT':'DIGITAL PRODUCT'}</span><h2>${esc(p.name)}</h2></div><strong class="product-price" id="productDetailPrice">${esc(productPrice(p))}</strong></div><div id="productDetailStock" class="product-stock ${soldOut?'sold-out':''}">${esc(stock)}</div><p id="productDetailDescription" class="product-description">${esc(p.description||p.short_description||'Digital product available through ToolCart.')}</p><div id="productDetailActionSlot">${productDetailActions(p,verified)}</div></div>`;
}
async function openProduct(id){
  const request=++productOpenRequest;
  const listing=state.products.find(p=>Number(p.id)===id);
  // This happens synchronously, before any network round trip.
  if(listing){
    showDetail(productDetailMarkup(listing,false));
    $('#detailModal').classList.add('marketplace-detail');
    $('#detailContent').dataset.productId=String(id);
  }
  try{
    const d=await api(`/api/products/${id}`),p=d.product;
    // Never bring an old product or a closed detail sheet back to the screen.
    if(request!==productOpenRequest||$('#detailModal').classList.contains('hidden')&&listing||listing&&Number($('#detailContent').dataset.productId)!==id)return;
    state.wallet=d.wallet||state.wallet;
    if(d.cartCount!==undefined)state.cartCount=Number(d.cartCount||0);
    updateBadges();
    if(!listing){
      showDetail(productDetailMarkup(p,true));
      $('#detailModal').classList.add('marketplace-detail');
      $('#detailContent').dataset.productId=String(id);
      return;
    }
    // Update only the live metadata and entitlement actions. Keep the cover <img>
    // node mounted so its already-decoded R2 image cannot flash on iPhone Safari.
    $('#productDetailBalance').textContent=fmtMoney(state.wallet.balanceMinor,state.wallet.currency);
    $('#productDetailPrice').textContent=productPrice(p);
    const stock=$('#productDetailStock');
    stock.textContent=p.stock_mode==='unlimited'?'Unlimited stock':Number(p.stock_quantity)>0?`${Number(p.stock_quantity)} in stock`:'Out of stock';
    stock.classList.toggle('sold-out',p.stock_mode!=='unlimited'&&Number(p.stock_quantity)<=0);
    $('#productDetailDescription').textContent=p.description||p.short_description||'Digital product available through ToolCart.';
    const quantity=Number($('#productQty')?.textContent||1);
    $('#productDetailActionSlot').innerHTML=productDetailActions(p,true);
    if($('#productQty'))$('#productQty').textContent=String(Math.max(1,Math.min(quantity,p.stock_mode==='unlimited'?99:Number(p.stock_quantity||1))));
  }catch(e){
    if(request!==productOpenRequest)return;
    if(listing&&!$('#detailModal').classList.contains('hidden')){
      // Product information stays visible; warn the customer that the verification failed.
      const slot=$('#productDetailActionSlot');
      if(slot)slot.innerHTML='<p class="product-owned-note">Could not verify current availability. Close and open this product again.</p>';
    }
    toast(e.message,'error');
  }
}
async function refreshMarketplaceState(){try{const d=await api('/api/products');state.products=d.products||[];state.wallet=d.wallet||state.wallet;state.cartCount=Number(d.cartCount||0);renderApps();updateBadges()}catch{}}
async function addCurrentProductToCart(id){
  const q=Number($('#productQty')?.textContent||1);
  const button=$(`[data-add-cart="${id}"]`);
  if(button?.disabled)return;
  if(button){button.disabled=true;button.textContent='Adding…';}
  try{
    const d=await api('/api/cart/items',{method:'POST',body:{productId:Number(id),quantity:q}});
    state.cartCount=Number(d.cartCount||0);
    updateBadges();
    updateLocalCartItem(Number(id),q);
    closeModals();
    openCart();
    toast('Added to cart.');
  }catch(e){toast(e.message,'error');}
  finally{if(button?.isConnected){button.disabled=false;button.textContent='Add to cart';}}
}
async function buyCurrentProduct(id){const q=Number($('#productQty')?.textContent||1);const b=$(`[data-buy-product="${id}"]`);if(b)b.disabled=true;try{const d=await api(`/api/products/${id}/buy`,{method:'POST',body:{quantity:q}});if(d.method==='paystack'&&d.authorizationUrl){location.href=d.authorizationUrl;return}toast(d.message||'Purchase complete.');await refreshMarketplaceState();await openProduct(Number(id))}catch(e){toast(e.message,'error');if(b)b.disabled=false}}

// Cart is hydrated from the authenticated bootstrap so it opens without waiting for a request.
// GET /api/cart runs silently afterward and remains authoritative for balances, stock and checkout.
function renderCart(){
  const cartBox=$('#cartContent');if(!cartBox||!state.cartReady)return;
  const d={items:state.cartItems,totalMinor:state.cartTotalMinor,currency:state.cartCurrency,wallet:state.wallet};
  const signature=JSON.stringify([d.items.map(x=>[x.id,x.name,x.quantity,x.price_minor,x.display_image_url,x.stock_mode,x.stock_quantity]),d.totalMinor,d.currency,d.wallet.balanceMinor,d.wallet.currency]);
  if(signature===state.cartRenderSignature)return;
  state.cartRenderSignature=signature;
  cartBox.innerHTML=`<div class="cart-sheet"><div class="product-balance"><span>Available balance</span><strong>${fmtMoney(state.wallet.balanceMinor,state.wallet.currency)}</strong></div><div class="product-title-row"><div><span class="eyebrow">YOUR CART</span><h2>Cart</h2></div><strong>${fmtMoney(d.totalMinor,d.currency)}</strong></div>${d.items.length?`<div class="cart-items">${d.items.map(x=>`<article class="cart-item"><div class="cart-thumb">${x.display_image_url?`<img src="${esc(x.display_image_url)}" alt="">`:esc(initials(x.name))}</div><div class="cart-copy"><strong>${esc(x.name)}</strong><span>${esc(productPrice(x))}</span><div class="cart-qty"><button data-cart-qty="minus" data-cart-product-id="${x.id}" data-qty="${x.quantity}">−</button><b>${x.quantity}</b><button data-cart-qty="plus" data-cart-product-id="${x.id}" data-qty="${x.quantity}" data-max="${x.stock_mode==='unlimited'?99:x.stock_quantity}">+</button><button class="cart-remove" data-cart-remove="${x.id}">Remove</button></div></div></article>`).join('')}</div><button class="btn btn-primary cart-checkout" data-cart-checkout>Checkout ${fmtMoney(d.totalMinor,d.currency)}</button>`:empty('Your cart is empty','Add a product to your cart and it will appear here.')}</div>`;
}
function applyCartData(d){
  if(!Array.isArray(d?.items))return;
  state.cartItems=d.items;
  state.cartTotalMinor=Number(d.totalMinor||0);
  state.cartCurrency=d.currency||'NGN';
  if(d.wallet)state.wallet=d.wallet;
  state.cartCount=Number(d.cartCount||0);
  state.cartReady=true;
  state.cartRevision++;
  updateBadges();
  renderWalletView();
  renderCart();
}
function calculateCartTotal(){
  state.cartTotalMinor=state.cartItems.reduce((sum,p)=>sum+(p.access_type==='free'?0:Number(p.price_minor||0)*Number(p.quantity||0)),0);
  state.cartCurrency=state.cartItems[0]?.currency||'NGN';
  state.cartReady=true;
  state.cartRevision++;
  state.cartRenderSignature=null;
  renderCart();
}
function updateLocalCartItem(id,quantity){
  const item=state.cartItems.find(x=>Number(x.id)===Number(id));
  if(quantity<=0)state.cartItems=state.cartItems.filter(x=>Number(x.id)!==Number(id));
  else if(item)item.quantity=quantity;
  else{const product=state.products.find(x=>Number(x.id)===Number(id));if(product)state.cartItems.unshift({...product,quantity});}
  calculateCartTotal();
}
// Cart quantity changes are optimistic: show the result on the same tap, and
// serialize writes for each product. Repeated quick taps collapse to the latest
// desired quantity instead of creating an API request for every tap.
const cartQuantityWrites=new Map();
let cartCheckoutPending=false;
function adjustCartQuantityInstant(button){
  if(cartCheckoutPending)return;
  const id=Number(button.dataset.cartProductId);
  const item=state.cartItems.find(x=>Number(x.id)===id);
  if(!item)return;
  const current=Math.max(1,Number(item.quantity)||1);
  const upper=item.stock_mode==='unlimited'?99:Math.min(99,Math.max(1,Number(item.stock_quantity)||1));
  const desired=button.dataset.cartQty==='plus'?Math.min(upper,current+1):Math.max(1,current-1);
  if(desired===current)return;
  updateLocalCartItem(id,desired);
  state.cartCount=state.cartItems.reduce((total,x)=>total+Number(x.quantity||0),0);
  updateBadges();
  queueCartQuantityWrite(id,desired);
}
function queueCartQuantityWrite(id,desired){
  let operation=cartQuantityWrites.get(id);
  if(operation){operation.desired=desired;return;}
  operation={desired,promise:null};
  cartQuantityWrites.set(id,operation);
  operation.promise=(async()=>{
    let succeeded=true;
    try{
      while(true){
        const sending=operation.desired;
        await api(`/api/cart/items/${id}`,{method:'PATCH',body:{quantity:sending}});
        // If the user tapped again while the request was in flight, update the
        // server once more with the latest value. Never apply an older response.
        if(operation.desired===sending)break;
      }
    }catch(error){
      succeeded=false;
      toast(error.message||'Could not update the quantity.','error');
    }finally{
      cartQuantityWrites.delete(id);
      // One authoritative refresh after all edits; do not overwrite other
      // still-pending optimistic quantities with stale server snapshots.
      if(cartQuantityWrites.size===0)await refreshCart();
    }
    return succeeded;
  })();
}
async function refreshCart(){
  if(cartQuantityWrites.size)return;
  const revision=state.cartRevision;
  try{
    const d=await api('/api/cart');
    // Ignore reads started before newer edits, even after their writes finish.
    if(revision!==state.cartRevision||cartQuantityWrites.size)return;
    applyCartData(d);
  }catch(e){if(!state.cartReady&&state.activeTab==='cart')toast('Could not refresh your cart. Try again.','error');}
}
let cartLastRefreshAt=0;
function openCart(){
  closeModals();closeStoreMenu();switchTab('cart');
  // Already hydrated at login: the view is ready in the current DOM.
  renderCart();
  if(Date.now()-cartLastRefreshAt>15000){cartLastRefreshAt=Date.now();void refreshCart();}
}

async function checkoutCartNow(){
  if(cartCheckoutPending)return;
  cartCheckoutPending=true;
  const b=$('[data-cart-checkout]');if(b)b.disabled=true;try{
  // Checkout must not race a pending optimistic quantity change.
  if(cartQuantityWrites.size){
    if(b)b.textContent='Confirming cart…';
    const completed=await Promise.all([...cartQuantityWrites.values()].map(op=>op.promise));
    if(completed.some(ok=>!ok))throw new Error('Cart quantity could not be saved. Please check your cart before checkout.');
  }
  const d=await api('/api/cart/checkout',{method:'POST',body:{}});if(d.method==='paystack'&&d.authorizationUrl){location.href=d.authorizationUrl;return}toast(d.message||'Purchase complete.');await refreshMarketplaceState();await openCart()}catch(e){toast(e.message,'error');if(b)b.disabled=false}finally{cartCheckoutPending=false}}
let toolOpenPending=null;
async function openApp(id){
  if(toolOpenPending===id)return;
  toolOpenPending=id;
  const tool=state.apps.find(a=>Number(a.id)===id);
  // Immediate visual response, while retaining the server-authorized launch route.
  showInfo(`Opening ${tool?.name||'tool'}…`,'Checking tool availability.','WORKING TOOL');
  try{
    const d=await api(`/api/apps/${id}/open`,{method:'POST'});
    if(d.action==='open'){window.location.href=d.url;return}
    if(d.action==='maintenance')return showInfo('Under maintenance',d.message,'maintenance');
    if(d.action==='coming_soon')return showInfo('Coming soon',d.message,'soon');
    if(d.action==='upgrade')return openSetting('subscription',`This app requires ${d.requiredPlan}.`);
    showInfo('App unavailable',d.message||'This app cannot be opened right now.');
  }catch(e){closeModals();toast(e.message,'error')}
  finally{toolOpenPending=null}
}
async function toggleFavorite(id){try{const d=await api(`/api/apps/${id}/favorite`,{method:'POST'});const a=state.apps.find(x=>x.id===id);if(a)a.favorite=d.favorite;renderApps()}catch(e){toast(e.message,'error')}}
async function openUpdate(id){const u=state.updates.find(x=>x.id===id);if(!u)return;try{if(!u.is_read){await api(`/api/updates/${id}/read`,{method:'POST'});u.is_read=1;updateBadges();renderUpdates()} }catch{}showDetail(`<div class="detail-hero"><span class="eyebrow">${esc(humanStatus(u.update_type))}</span><h2>${esc(u.title)}</h2><p>${esc(u.summary)}</p><div class="detail-meta"><span class="status-badge">${esc(humanStatus(u.priority))}</span><span class="status-badge">${fmtDate(u.publish_at)}</span></div></div><div class="detail-body"><p style="white-space:pre-wrap;line-height:1.65;color:var(--muted)">${esc(u.content)}</p>${u.external_url?`<div class="detail-actions"><button class="btn btn-primary" data-external="${esc(u.external_url)}">${esc(u.cta_label||'Open link')}</button></div>`:''}</div>`)}

function switchTab(tab,scroll=true){closeStoreMenu();const valid=['home','apps','wishlist','cart','purchases','wallet','updates','requests','settings'];if(!valid.includes(tab))tab='home';state.activeTab=tab;$$('.view').forEach(v=>v.classList.remove('active'));const view=$(`#${tab}View`)||$('#homeView');view.classList.add('active');$$('#dock [data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));$('#dock [data-open-cart]')?.classList.toggle('active',tab==='cart');document.body.dataset.activeView=tab;if(tab==='home'){renderHeader()}if(tab==='wishlist')renderWishlist();if(tab==='purchases')renderPurchases();if(tab==='wallet')renderWalletView();if(tab==='requests')loadRequests();if(scroll)window.scrollTo({top:0,left:0,behavior:'auto'})}

async function loadRequests(){try{const d=await api('/api/requests');state.requests=d.requests||[];renderRequests()}catch(e){$('#requestsList').innerHTML=empty('Could not load requests',e.message)}}
function renderRequests(){const box=$('#requestsList');box.innerHTML=state.requests.length?state.requests.map(r=>`<article class="request-card" data-request-id="${r.id}"><div class="request-card-top"><div><strong>${esc(r.subject)}</strong><p>${esc(r.reference_number)} · ${fmtDate(r.updated_at)}</p></div><span class="status-pill ${r.status==='resolved'?'resolved':''}">${esc(humanStatus(r.status))}</span></div></article>`).join(''):empty('No requests yet','Use New request whenever you need help.','↗')}
function newRequest(){const options=state.apps.map(a=>`<option value="${a.id}">${esc(a.name)}</option>`).join('');showDetail(`<h2>New request</h2><p class="modal-sub">Send your request directly to the ToolCart team.</p><form id="requestForm" class="form-grid"><div class="field"><label>Category</label><select name="category"><option value="feature_request">Feature request</option><option value="bug_report">Bug report</option><option value="general_request">General request</option><option value="payment_issue">Payment issue</option><option value="account_issue">Account issue</option><option value="app_access_request">App access request</option><option value="partnership_inquiry">Partnership inquiry</option><option value="other">Other</option></select></div><div class="field"><label>Associated app</label><select name="appId"><option value="">General / none</option>${options}</select></div><div class="field"><label>Subject</label><input name="subject" required maxlength="160"></div><div class="field"><label>Message</label><textarea name="message" required maxlength="5000"></textarea></div><button class="btn btn-primary">Submit request</button></form>`);$('#requestForm').addEventListener('submit',submitRequest)}
async function submitRequest(e){e.preventDefault();const f=new FormData(e.currentTarget);const btn=$('button',e.currentTarget);btn.disabled=true;try{const d=await api('/api/requests',{method:'POST',body:{category:f.get('category'),appId:f.get('appId')||null,subject:f.get('subject'),message:f.get('message')}});toast(`Request ${d.referenceNumber} submitted.`);closeModals();await loadRequests()}catch(err){toast(err.message,'error');btn.disabled=false}}
async function openRequest(id){try{const d=await api(`/api/requests/${id}`);const r=d.request;showDetail(`<div class="detail-hero"><span class="eyebrow">${esc(r.reference_number)}</span><h2>${esc(r.subject)}</h2><div class="detail-meta"><span class="status-pill">${esc(humanStatus(r.status))}</span><span class="status-badge">${esc(humanStatus(r.category))}</span></div></div><div class="timeline">${d.messages.map(m=>`<div class="timeline-item ${m.sender_type==='admin'?'admin':''}"><small>${m.sender_type==='admin'?'ToolCart Support':'You'} · ${fmtDate(m.created_at)}</small><p>${esc(m.message)}</p></div>`).join('')}</div>${r.status!=='closed'?`<form id="requestReplyForm" class="form-grid" style="margin-top:14px"><div class="field"><label>Add reply</label><textarea name="message" required maxlength="5000"></textarea></div><button class="btn btn-primary">Send reply</button></form>`:''}`);const form=$('#requestReplyForm');if(form)form.addEventListener('submit',async e=>{e.preventDefault();const msg=new FormData(form).get('message');try{await api(`/api/requests/${id}/messages`,{method:'POST',body:{message:msg}});await openRequest(id);await loadRequests()}catch(err){toast(err.message,'error')}})}catch(e){toast(e.message,'error')}}

async function openNotifications(filter=state.notifFilter){state.notifFilter=filter;try{const d=await api(`/api/notifications?filter=${encodeURIComponent(filter)}`);state.notifications=d.notifications||[];renderNotifications();openModal('#notificationSheet')}catch(e){toast(e.message,'error')}}
function renderNotifications(){$$('#notificationFilters .chip').forEach(b=>b.classList.toggle('active',b.dataset.notifFilter===state.notifFilter));$('#notificationList').innerHTML=state.notifications.length?state.notifications.map(n=>`<article class="notification-card ${n.read_at?'':'unread'}" data-notification-id="${n.id}"><h3>${esc(n.title)}</h3><p>${esc(n.message)}</p><small>${fmtDate(n.created_at)} · ${esc(humanStatus(n.notification_type))}</small><div class="notification-actions"><button class="micro-btn" data-notif-action="${n.read_at?'unread':'read'}" data-id="${n.id}">${n.read_at?'Mark unread':'Mark read'}</button><button class="micro-btn" data-notif-action="dismiss" data-id="${n.id}">Dismiss</button></div></article>`).join(''):empty('All caught up','There are no notifications in this view.','✓');setupNotificationSwipe()}
async function notifAction(id,action){try{await api(`/api/notifications/${id}/${action}`,{method:'POST'});if(action==='dismiss')state.notifications=state.notifications.filter(n=>n.id!==id);else{const n=state.notifications.find(n=>n.id===id);if(n)n.read_at=action==='read'?new Date().toISOString():null}renderNotifications();const fresh=await api('/api/bootstrap');state.notifications=fresh.notifications||[];updateBadges()}catch(e){toast(e.message,'error')}}
function setupNotificationSwipe(){$$('.notification-card').forEach(card=>{let x=0,y=0;card.addEventListener('touchstart',e=>{x=e.touches[0].clientX;y=e.touches[0].clientY},{passive:true});card.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-x,dy=e.changedTouches[0].clientY-y;if(Math.abs(dx)>70||dy<-70)notifAction(Number(card.dataset.notificationId),'dismiss')},{passive:true})})}

async function openSetting(kind,note=''){
  if(kind==='account')kind='profile';
  if(kind==='profile')return profileSetting();if(kind==='security')return securitySetting();if(kind==='appearance')return appearanceSetting();if(kind==='devices')return devicesSetting();if(kind==='subscription')return subscriptionSetting(note);if(kind==='payments')return paymentsSetting();if(kind==='support')return supportSetting();if(kind==='privacy')return privacySetting();if(kind==='notifications')return openNotifications('all');
}
function profileSetting(){const u=state.user;showDetail(`<h2>Account</h2><p class="modal-sub">Update the profile details connected to your collection account.</p><form id="profileForm" class="form-grid"><div class="field"><label>Profile picture</label><input type="file" id="avatarFile" accept="image/jpeg,image/png,image/webp"></div><div class="field"><label>Full name</label><input name="fullName" value="${esc(u.fullName)}" required></div><div class="field"><label>Email</label><input value="${esc(u.email)}" disabled></div><div class="field"><label>Phone</label><input name="phone" value="${esc(u.phone||'')}"></div><div class="field"><label>Country</label><input name="country" value="${esc(u.country||'')}"></div><div class="field"><label>Timezone</label><input name="timezone" value="${esc(u.timezone||Intl.DateTimeFormat().resolvedOptions().timeZone)}"></div><button class="btn btn-primary">Save profile</button></form>`);$('#profileForm').addEventListener('submit',async e=>{e.preventDefault();const fd=new FormData(e.currentTarget);try{await api('/api/profile',{method:'PATCH',body:{fullName:fd.get('fullName'),phone:fd.get('phone'),country:fd.get('country'),timezone:fd.get('timezone'),preferredLanguage:'en',preferredTheme:state.user.preferredTheme}});const file=$('#avatarFile').files[0];if(file){const optimized=await optimizeImage(file,512,.86);const up=new FormData();up.append('file',optimized,'avatar.webp');await api('/api/profile/avatar',{method:'POST',body:up})}const p=await api('/api/profile');state.user=p.user;renderHeader();renderSettingsProfile();closeModals();toast('Profile updated.')}catch(err){toast(err.message,'error')}})}
function securitySetting(){showDetail(`<h2>Security</h2><p class="modal-sub">Use a strong password unique to ToolCart.</p><form id="passwordForm" class="form-grid"><div class="field"><label>Current password</label><input type="password" name="current" autocomplete="current-password" required></div><div class="field"><label>New password</label><input type="password" name="next" autocomplete="new-password" minlength="10" required></div><button class="btn btn-primary">Change password</button></form>`);$('#passwordForm').addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(e.currentTarget);try{await api('/api/account/change-password',{method:'POST',body:{currentPassword:f.get('current'),newPassword:f.get('next')}});closeModals();toast('Password changed.')}catch(err){toast(err.message,'error')}})}
function appearanceSetting(){const current=document.documentElement.dataset.theme;showDetail(`<h2>Appearance</h2><p class="modal-sub">ToolCart's Tempo storefront uses its signature bright black, white and gold design.</p><div class="form-grid"><button class="btn ${current==='midnight'?'btn-primary':'btn-secondary'}" data-theme-choice="midnight">Midnight</button><button class="btn ${current==='pearl'?'btn-primary':'btn-secondary'}" data-theme-choice="pearl">Pearl</button></div>`)}
async function devicesSetting(){showDetail('<h2>Devices</h2><p class="modal-sub">Loading active sessions...</p>');try{const d=await api('/api/sessions');$('#detailContent').innerHTML=`<h2>Devices</h2><p class="modal-sub">Sessions signed into your ToolCart account.</p><div class="timeline">${d.sessions.map(s=>`<div class="timeline-item"><small>${s.current?'CURRENT DEVICE · ':''}${fmtDate(s.last_seen_at)}</small><p><strong>${esc(s.device_label||'Browser session')}</strong><br>${esc((s.user_agent||'').slice(0,90))}</p>${!s.current&&!s.revoked_at?`<button class="micro-btn" data-revoke-session="${s.id}">Revoke</button>`:''}</div>`).join('')}</div>`}catch(e){toast(e.message,'error')}}
async function subscriptionSetting(note=''){showDetail(`<h2>Subscription</h2><p class="modal-sub">${esc(note||'Choose the membership that fits how you shop and work.')}</p><div id="plansBox">${empty('Loading plans','')}</div>`);try{const d=await api('/api/subscriptions/plans');$('#plansBox').innerHTML=`<div class="timeline">${d.plans.map(p=>`<div class="timeline-item"><small>${esc(p.billing_frequency.toUpperCase())}</small><p><strong>${esc(p.name)} · ${fmtMoney(p.price_minor,p.currency)}</strong><br>${esc(p.description)}</p><div style="color:var(--muted);font-size:12px;margin:8px 0">${(p.features||[]).map(x=>`• ${esc(x)}`).join('<br>')}</div>${p.price_minor>0?`<button class="btn btn-primary compact" data-buy-plan="${p.id}">Choose ${esc(p.name)}</button>`:'<span class="status-badge ok">Included</span>'}</div>`).join('')}</div>`}catch(e){$('#plansBox').innerHTML=empty('Could not load plans',e.message)}}
async function paymentsSetting(){showDetail(`<h2>Payments</h2><p class="modal-sub">Verified payment history for your ToolCart account.</p><div id="paymentsBox">${empty('Loading payments','')}</div>`);try{const d=await api('/api/payments');$('#paymentsBox').innerHTML=d.payments.length?`<div class="timeline">${d.payments.map(p=>`<div class="timeline-item" data-payment-id="${p.id}"><small>${fmtDate(p.paid_at||p.created_at)} · ${esc(p.provider_reference)}</small><p><strong>${fmtMoney(p.amount_minor,p.currency)} · ${esc(humanStatus(p.status))}</strong><br>${esc(p.purpose)}</p></div>`).join('')}</div>`:empty('No payments yet','Completed and pending transactions will appear here.') }catch(e){$('#paymentsBox').innerHTML=empty('Could not load payments',e.message)}}
function supportSetting(){showDetail(`<h2>Support</h2><p class="modal-sub">Get help with your ToolCart purchases and services.</p><div class="settings-group"><button data-support-new><span>Contact Support</span><b>›</b></button><button data-tab-jump="requests"><span>My Requests</span><b>›</b></button><button><span>Payment help</span><b>›</b></button><button><span>Account help</span><b>›</b></button></div><div class="detail-hero" style="margin-top:14px"><span class="eyebrow">SUPPORT EMAIL</span><p>${esc(state.settings.support_email||'Configured by your administrator')}</p></div>`)}
function privacySetting(){showDetail(`<h2>Privacy</h2><p class="modal-sub">ToolCart records only the ToolCart activity needed to provide features such as recently opened apps, favorites, requests and payment history. It does not capture private page content from external products.</p><div class="detail-hero"><span class="eyebrow">ACCOUNT CONTROL</span><h2 style="font-size:18px">Deletion request</h2><p>Request account deletion. Your session will be signed out and the account will be queued for administrator handling.</p><button class="btn btn-secondary compact" id="deleteRequestBtn">Request deletion</button></div>`)}

function openModal(sel){$('#modalBackdrop').classList.remove('hidden');$(sel).classList.remove('hidden');document.body.style.overflow='hidden'}
function showDetail(html){$('#detailModal').classList.remove('marketplace-detail');$('#detailContent').innerHTML=html;openModal('#detailModal')}
function showInfo(title,message,type){showDetail(`<div class="detail-hero"><span class="eyebrow">${esc(type||'TOOLCART')}</span><h2>${esc(title)}</h2><p>${esc(message)}</p></div><button class="btn btn-primary" data-close-modal>Close</button>`)}
function closeModals(){$$('.modal').forEach(m=>m.classList.add('hidden'));$('#modalBackdrop').classList.add('hidden');document.body.style.overflow=''}

function authForm(mode='login',token=''){
  if(mode==='login')return `<h2>Welcome back.</h2><p class="modal-sub">Sign in to open your ToolCart collection.</p><form id="loginForm" class="form-grid"><div class="field"><label>Email</label><input name="email" type="email" autocomplete="email" required></div><div class="field"><label>Password</label><input name="password" type="password" autocomplete="current-password" required></div><button class="btn btn-primary">Sign in</button></form><div class="form-foot"><button data-auth-switch="forgot">Forgot password?</button> · <button data-auth-switch="register">Create account</button></div>`;
  if(mode==='register')return `<h2>Create your account.</h2><p class="modal-sub">One secure account for the products and services in your ToolCart collection.</p><form id="registerForm" class="form-grid"><div class="field"><label>Full name</label><input name="fullName" autocomplete="name" required></div><div class="field"><label>Email</label><input name="email" type="email" autocomplete="email" required></div><div class="field"><label>Password</label><input name="password" type="password" autocomplete="new-password" minlength="10" required></div><button class="btn btn-primary">Create account</button></form><div class="form-foot">Already a member? <button data-auth-switch="login">Sign in</button></div>`;
  if(mode==='forgot')return `<h2>Reset password.</h2><p class="modal-sub">Enter your email and ToolCart will send a secure reset link if the account exists.</p><form id="forgotForm" class="form-grid"><div class="field"><label>Email</label><input name="email" type="email" required></div><button class="btn btn-primary">Send reset link</button></form><div class="form-foot"><button data-auth-switch="login">Back to sign in</button></div>`;
  if(mode==='reset')return `<h2>Choose a new password.</h2><p class="modal-sub">Your new password must be at least 10 characters.</p><form id="resetForm" class="form-grid" data-token="${esc(token)}"><div class="field"><label>New password</label><input name="password" type="password" minlength="10" required></div><button class="btn btn-primary">Update password</button></form>`;
  return '';
}
function openAuth(mode,token=''){$('#authContent').innerHTML=authForm(mode,token);openModal('#authModal');bindAuthForms()}
function bindAuthForms(){
  $('#loginForm')?.addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(e.currentTarget),b=$('button',e.currentTarget);b.disabled=true;try{const d=await api('/api/auth/login',{method:'POST',body:{email:f.get('email'),password:f.get('password')}});state.user=d.user;state.csrf=d.csrfToken;closeModals();await enterApp()}catch(err){toast(err.message,'error');b.disabled=false}});
  $('#registerForm')?.addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(e.currentTarget),b=$('button',e.currentTarget);b.disabled=true;try{const d=await api('/api/auth/register',{method:'POST',body:{fullName:f.get('fullName'),email:f.get('email'),password:f.get('password')}});if(d.user&&d.csrfToken){state.user=d.user;state.csrf=d.csrfToken;closeModals();toast('Account created. Welcome to ToolCart.');await enterApp();return}$('#authContent').innerHTML=`<h2>Check your email.</h2><p class="modal-sub">${esc(d.message)}</p><button class="btn btn-primary" data-auth-switch="login">Back to sign in</button>`}catch(err){toast(err.message,'error');b.disabled=false}});
  $('#forgotForm')?.addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(e.currentTarget);try{const d=await api('/api/auth/forgot-password',{method:'POST',body:{email:f.get('email')}});$('#authContent').innerHTML=`<h2>Check your inbox.</h2><p class="modal-sub">${esc(d.message)}</p><button class="btn btn-primary" data-auth-switch="login">Back to sign in</button>`}catch(err){toast(err.message,'error')}});
  $('#resetForm')?.addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(e.currentTarget);try{const d=await api('/api/auth/reset-password',{method:'POST',body:{token:e.currentTarget.dataset.token,password:f.get('password')}});toast(d.message);history.replaceState({},'',location.pathname);openAuth('login')}catch(err){toast(err.message,'error')}})
}
async function handleDeepLinks(){const p=new URLSearchParams(location.search);if(p.get('verify')){try{const d=await api('/api/auth/verify-email',{method:'POST',body:{token:p.get('verify')}});history.replaceState({},'',location.pathname);toast(d.message);openAuth('login')}catch(e){toast(e.message,'error')}}if(p.get('reset'))openAuth('reset',p.get('reset'));if(p.get('payment')==='complete'&&p.get('reference')&&state.user){try{const d=await api(`/api/payments/paystack/verify?reference=${encodeURIComponent(p.get('reference'))}`);toast(d.status==='success'?'Payment confirmed.':'Payment is still being verified.');history.replaceState({},'',location.pathname);await enterApp()}catch(e){toast(e.message,'error')}}}

function bindGlobalEvents(){
  document.addEventListener('click',async e=>{
    if(e.target.closest('#menuBtn')){openStoreMenu();return;}
    if(e.target.closest('#menuCloseBtn')||e.target.id==='toolcartMenuBackdrop'){closeStoreMenu();return;}
    const menuTab=e.target.closest('[data-menu-tab]');if(menuTab){const tab=menuTab.dataset.menuTab;closeStoreMenu();switchTab(tab);return;}
    if(e.target.closest('[data-menu-cart]')){closeStoreMenu();return openCart();}
    const menuSetting=e.target.closest('[data-menu-setting]');if(menuSetting){closeStoreMenu();return openSetting(menuSetting.dataset.menuSetting);}
    if(e.target.closest('[data-menu-logout]')){closeStoreMenu();$('#signOutBtn')?.click();return;}
    const auth=e.target.closest('[data-auth]');if(auth)return openAuth(auth.dataset.auth);
    const sw=e.target.closest('[data-auth-switch]');if(sw)return openAuth(sw.dataset.authSwitch);
    if(e.target.closest('[data-close-modal]')||e.target.id==='modalBackdrop')return closeModals();
    if(e.target.closest('[data-open-search]')){openModal('#searchSheet');setTimeout(()=>$('#globalSearch')?.focus(),80);return;}
    if(e.target.closest('[data-open-cart]'))return openCart();
    const filter=e.target.closest('[data-store-filter]');if(filter){state.appCategory=filter.dataset.storeFilter;switchTab('apps');renderApps();return;}
    const tab=e.target.closest('[data-tab]');if(tab)return switchTab(tab.dataset.tab);
    if(e.target.closest('[data-go-home]'))return switchTab('home');
    const category=e.target.closest('[data-t06-cat]');if(category){state.tempo06Category=category.dataset.t06Cat;$$('[data-t06-cat]').forEach(b=>b.classList.toggle('active',b===category));renderApps();switchTab('home',false);document.querySelector('.tempo-products-section')?.scrollIntoView({behavior:'smooth',block:'start'});return}
    if(e.target.closest('[data-show-free]')){state.tempo06Category='free';$$('[data-t06-cat]').forEach(b=>b.classList.toggle('active',false));renderApps();switchTab('home',false);document.querySelector('.tempo-products-section')?.scrollIntoView({behavior:'smooth',block:'start'});return}
    const saver=e.target.closest('[data-t06-save]');if(saver){e.stopPropagation();return t06ToggleSave(Number(saver.dataset.t06Save))}
    const cardAdd=e.target.closest('[data-card-add]');if(cardAdd){e.stopPropagation();return addProductCardToCart(Number(cardAdd.dataset.cardAdd),cardAdd)}
    const launch=e.target.closest('[data-tool-launch]');if(launch){e.stopPropagation();return openApp(Number(launch.dataset.toolLaunch))}
    const fav=e.target.closest('[data-favorite]');if(fav){e.stopPropagation();return toggleFavorite(Number(fav.dataset.favorite))}
    const app=e.target.closest('[data-app-id]');if(app)return openApp(Number(app.dataset.appId));
    // The active detail sheet has data-product-id for background verification.
    // Do NOT treat every button inside it as a request to reopen the product: that
    // swallowed Add to cart, Buy now and the quantity-stepper clicks.
    const product=e.target.closest('[data-product-id]');if(product&&!product.closest('#detailModal'))return openProduct(Number(product.dataset.productId));
    const addCart=e.target.closest('[data-add-cart]');if(addCart)return addCurrentProductToCart(Number(addCart.dataset.addCart));
    const buyProduct=e.target.closest('[data-buy-product]');if(buyProduct)return buyCurrentProduct(Number(buyProduct.dataset.buyProduct));
    const qty=e.target.closest('[data-product-qty]');if(qty){const el=$('#productQty');if(!el)return;let n=Number(el.textContent||1);if(qty.dataset.productQty==='plus')n=Math.min(Number(qty.dataset.max||99),n+1);else n=Math.max(1,n-1);el.textContent=String(n);return}
    const cqty=e.target.closest('[data-cart-qty]');if(cqty){e.preventDefault();return adjustCartQuantityInstant(cqty)}
    const crem=e.target.closest('[data-cart-remove]');if(crem){try{const d=await api(`/api/cart/items/${crem.dataset.cartRemove}`,{method:'DELETE'});state.cartCount=Number(d.cartCount||0);updateBadges();updateLocalCartItem(Number(crem.dataset.cartRemove),0);void refreshCart();return}catch(err){return toast(err.message,'error')}}
    if(e.target.closest('[data-cart-checkout]'))return checkoutCartNow();
    const upd=e.target.closest('[data-update-id]');if(upd)return openUpdate(Number(upd.dataset.updateId));
    const cat=e.target.closest('[data-category]');if(cat){state.appCategory=cat.dataset.category;renderApps();return}
    const uf=e.target.closest('[data-update-filter]');if(uf){state.updateFilter=uf.dataset.updateFilter;$$('#updateFilters .chip').forEach(x=>x.classList.toggle('active',x===uf));renderUpdatesPage();return}
    const req=e.target.closest('[data-request-id]');if(req)return openRequest(Number(req.dataset.requestId));
    const set=e.target.closest('[data-setting]');if(set)return openSetting(set.dataset.setting);
    const nf=e.target.closest('[data-notif-filter]');if(nf)return openNotifications(nf.dataset.notifFilter);
    const na=e.target.closest('[data-notif-action]');if(na)return notifAction(Number(na.dataset.id),na.dataset.notifAction);
    const ext=e.target.closest('[data-external]');if(ext)return location.href=ext.dataset.external;
    const promo=e.target.closest('[data-promo-url]');if(promo)return location.href=promo.dataset.promoUrl;
    const theme=e.target.closest('[data-theme-choice]');if(theme){setTheme(theme.dataset.themeChoice);state.user.preferredTheme=theme.dataset.themeChoice;try{await api('/api/profile',{method:'PATCH',body:{fullName:state.user.fullName,phone:state.user.phone,country:state.user.country,timezone:state.user.timezone,preferredLanguage:state.user.preferredLanguage||'en',preferredTheme:theme.dataset.themeChoice}})}catch{}return appearanceSetting()}
    const revoke=e.target.closest('[data-revoke-session]');if(revoke){try{await api(`/api/sessions/${revoke.dataset.revokeSession}/revoke`,{method:'POST'});toast('Session revoked.');devicesSetting()}catch(err){toast(err.message,'error')}return}
    const buy=e.target.closest('[data-buy-plan]');if(buy){buy.disabled=true;try{const d=await api('/api/payments/paystack/initialize',{method:'POST',body:{planId:Number(buy.dataset.buyPlan),callbackUrl:`${location.origin}/?payment=complete`}});location.href=d.authorizationUrl}catch(err){toast(err.message,'error');buy.disabled=false}return}
    if(e.target.closest('[data-support-new]')){closeModals();switchTab('requests');newRequest();return}
    const jump=e.target.closest('[data-tab-jump]');if(jump){closeModals();switchTab(jump.dataset.tabJump);return}
    if(e.target.id==='deleteRequestBtn'){if(confirm('Request account deletion and sign out?')){try{await api('/api/account/delete-request',{method:'POST'});location.reload()}catch(err){toast(err.message,'error')}}}
  });
  $('#searchBtn')?.addEventListener('click',()=>{openModal('#searchSheet');setTimeout(()=>$('#globalSearch').focus(),80)});
  $('#cartBtn')?.addEventListener('click',openCart);
  $('#notificationsBtn')?.addEventListener('click',()=>openNotifications('unread'));
  $('#profileBtn')?.addEventListener('click',()=>switchTab('settings'));
  $('#newRequestBtn')?.addEventListener('click',newRequest);
  $('#signOutBtn')?.addEventListener('click',async()=>{try{await api('/api/auth/logout',{method:'POST'})}catch{}location.reload()});
  $('#appSearch')?.addEventListener('input',renderAppsPage);
  $('#tempo06Sort')?.addEventListener('change',renderApps);
  let timer;$('#globalSearch')?.addEventListener('input',e=>{clearTimeout(timer);timer=setTimeout(()=>runSearch(e.target.value),220)});
  $('#modalBackdrop').addEventListener('click',closeModals);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('#toolcartMenu')?.classList.contains('hidden')){closeStoreMenu();$('#menuBtn')?.focus()}else closeModals();}if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(state.user){openModal('#searchSheet');setTimeout(()=>$('#globalSearch')?.focus(),80);}}});
}
async function runSearch(q){q=q.trim();if(q.length<2){$('#searchResults').innerHTML=empty('Search ToolCart','Type at least two characters.','⌕');return}try{const d=await api(`/api/search?q=${encodeURIComponent(q)}`);const groups=[];if(d.apps.length)groups.push(searchGroup('Tools',d.apps.map(a=>`<div class="search-row" data-app-id="${a.id}">${iconHtml(a)}<div><strong>${esc(a.name)}</strong><p>${esc(a.short_description||'')}</p></div></div>`).join('')));if(d.products?.length)groups.push(searchGroup('Products',d.products.map(p=>`<div class="search-row" data-product-id="${p.id}"><div class="app-icon">${p.display_image_url?`<img src="${esc(p.display_image_url)}" alt="">`:esc(initials(p.name))}</div><div><strong>${esc(p.name)}</strong><p>${esc(p.short_description||p.stock_label||'Digital product')}</p></div></div>`).join('')));if(d.updates.length)groups.push(searchGroup('Updates',d.updates.map(u=>`<div class="search-row" data-update-id="${u.id}"><div class="update-type">U</div><div><strong>${esc(u.title)}</strong><p>${esc(u.summary||'')}</p></div></div>`).join('')));if(d.requests.length)groups.push(searchGroup('Requests',d.requests.map(r=>`<div class="search-row" data-request-id="${r.id}"><div class="update-type">R</div><div><strong>${esc(r.subject)}</strong><p>${esc(r.reference_number)}</p></div></div>`).join('')));if(d.settings.length)groups.push(searchGroup('Settings',d.settings.map(s=>`<div class="search-row" data-setting="${esc(s.name.toLowerCase())}"><div class="update-type">S</div><strong>${esc(s.name)}</strong></div>`).join('')));$('#searchResults').innerHTML=groups.join('')||empty('No results','Try another phrase.','⌕')}catch(e){$('#searchResults').innerHTML=empty('Search unavailable',e.message)}}
function searchGroup(title,rows){return `<section class="search-group"><h3>${esc(title)}</h3>${rows}</section>`}

async function optimizeImage(file,max=512,quality=.86){if(file.type==='image/webp'&&file.size<700000)return file;const bmp=await createImageBitmap(file);const scale=Math.min(1,max/Math.max(bmp.width,bmp.height));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(bmp.width*scale));c.height=Math.max(1,Math.round(bmp.height*scale));c.getContext('2d',{alpha:false}).drawImage(bmp,0,0,c.width,c.height);bmp.close?.();return new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(new File([b],'image.webp',{type:'image/webp'})):reject(new Error('Could not optimize image.')),'image/webp',quality))}
function setupViewportDock(){if(!window.visualViewport)return;const vv=window.visualViewport;const update=()=>{const keyboard=window.innerHeight-vv.height>150;$('#dock')?.classList.toggle('keyboard-hidden',keyboard)};vv.addEventListener('resize',update);vv.addEventListener('scroll',update);update()}
window.addEventListener('pageshow',event=>{if(event.persisted&&state.user&&!$('#appShell').classList.contains('hidden')){if(state.activeTab==='cart')void refreshCart();}})

boot();
