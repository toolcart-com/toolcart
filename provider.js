// ToolCart V1.58 — Provider onboarding and owner-approved dashboard.
// Uses existing ToolCart accounts. No customer orders or payouts in this release.
const $=selector=>document.querySelector(selector);
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const state={csrf:null,user:null,profile:null,mode:'login',services:[],editingService:null,requirements:[],tour:null};
async function api(path,options={}){
  const method=options.method||'GET',headers=new Headers(options.headers||{});
  if(options.body!==undefined){headers.set('content-type','application/json');options.body=JSON.stringify(options.body);}
  if(state.csrf&&!['GET','HEAD'].includes(method))headers.set('x-csrf-token',state.csrf);
  const response=await fetch(path,{...options,method,credentials:'same-origin',headers,cache:'no-store'});
  const data=await response.json().catch(()=>({ok:false,error:'Invalid server response.'}));
  if(!response.ok){const error=new Error(data.error||'Request failed.');error.status=response.status;throw error;}
  return data;
}
function show(id){for(const key of ['providerLoading','providerAuth','providerApply','providerDashboard','providerServiceEditor','providerOrderDetail'])$('#'+key).classList.toggle('hidden',key!==id);}
function notify(message,error=false){const box=$('#providerStatus');box.className='provider-alert'+(error?' error':'');box.textContent=message;}
function clearNotice(){const box=$('#providerStatus');box.textContent='';box.classList.add('hidden');}
function setMode(mode){state.mode=mode;$('#providerLoginPane').classList.toggle('hidden',mode!=='login');$('#providerRegisterPane').classList.toggle('hidden',mode!=='register');$('#providerShowLogin').classList.toggle('active',mode==='login');$('#providerShowRegister').classList.toggle('active',mode==='register');clearNotice();}
function escapeStatus(s){return ({pending:'Pending approval',approved:'Approved',rejected:'Application declined',restricted:'Account restricted',banned:'Account permanently banned'})[s]||'Unknown';}
function renderProvider(){
  const p=state.profile;
  if(!p){show('providerApply');$('#providerApplyForm').elements.namedItem('fullName').value=state.user?.fullName||'';return;}
  show('providerDashboard');
  const approved=p.status==='approved',pending=p.status==='pending';
  const icon=approved?'✓':pending?'◷':'!';
  const headline=approved?'Welcome to your provider dashboard':pending?'Application under review':p.status==='banned'?'Provider account permanently banned':p.status==='restricted'?'Provider account restricted':'Application not approved';
  const info=approved?'Your provider account has been approved. Deliver customer orders through your secure request inbox. Withdrawals remain unavailable.':pending?'Your application is being reviewed. Our support team will contact you if further information is needed.':p.status==='banned'?'You cannot receive assignments or apply again using this account. Contact ToolCart support if you believe this decision was incorrect.':p.status==='restricted'?'Provider access has been restricted. Contact ToolCart support to resolve the issue.':'Your application was not approved. Contact ToolCart support for more information.';
  $('#providerDashboard').innerHTML=`<div class="provider-panel-head"><span class="eyebrow">TOOLCART PROVIDER ACCOUNT</span><button class="provider-outline" type="button" data-provider-logout>Sign out</button></div><div class="provider-approval ${esc(p.status)}"><div class="provider-state-icon" aria-hidden="true">${icon}</div><span class="provider-state-label">${esc(escapeStatus(p.status))}</span><h2>${esc(headline)}</h2><p>${esc(info)}</p>${p.reviewMessage?`<p class="provider-decision-note">Message from ToolCart: ${esc(p.reviewMessage)}</p>`:''}</div><div class="provider-id-card" id="providerIdCard"><div><span class="eyebrow">YOUR UNIQUE PROVIDER ID</span><strong id="providerCode">${esc(p.providerCode)}</strong><small>Used by ToolCart to identify and assign approved service partners. This is not a password.</small></div><button type="button" class="provider-outline" id="providerCopyCode">Copy ID</button></div><div class="provider-details"><div><small>Full name</small><strong>${esc(p.fullName)}</strong></div><div><small>WhatsApp (private)</small><strong>${esc(p.whatsapp)}</strong></div><div><small>Account status</small><strong>${esc(escapeStatus(p.status))}</strong></div></div>${pending?`<div class="provider-note">You can correct your application while it is pending.</div><button type="button" class="provider-outline full" id="providerRefreshStatus">Check approval status</button><button type="button" class="provider-outline full" id="providerEditApplication">Edit pending application</button>`:''}${approved?`<div class="provider-service-workspace" id="providerWorkspace"><h3>Service workspace</h3><p>Publish your own Premium Services. ToolCart handles the pricing calculation. Assigned customer requests appear below after customers submit their requirements. Secure delivery is enabled for active requests. Withdrawals remain unavailable.</p><button type="button" class="provider-primary" id="providerNewService">＋ Add a service</button><div id="providerServiceList"></div><div class="provider-stats"><div><small>Submitted requests</small><strong id="providerAssignedRequests">0</strong></div><div><small>Pending service earnings</small><strong id="providerPendingEarnings">₦0.00</strong></div></div><div class="provider-panel-head"><h3>Service request inbox</h3><button type="button" class="provider-outline" id="providerRefreshOrders">Refresh</button></div><div id="providerOrderInbox" role="status">Checking assigned requests…</div><button type="button" class="provider-primary" disabled>Withdrawals coming soon</button><small>Only submitted orders assigned to your approved provider account are shown.</small></div>`:''}`;
  if(approved){$('#providerNewService')?.addEventListener('click',()=>openProviderServiceEditor());void loadProviderServices();void loadProviderOrders();$('#providerRefreshOrders')?.addEventListener('click',()=>void loadProviderOrders());}
  $('#providerCopyCode')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(p.providerCode);notify('Provider ID copied.');}catch{notify('Copy the provider ID shown above.');}});
  $('#providerRefreshStatus')?.addEventListener('click',()=>{void loadProfile();});
  $('#providerEditApplication')?.addEventListener('click',()=>{show('providerApply');const f=$('#providerApplyForm');f.elements.namedItem('fullName').value=p.fullName;f.elements.namedItem('whatsapp').value=p.whatsapp;f.elements.namedItem('serviceSummary').value=p.serviceSummary||'';f.dataset.edit='yes';f.querySelector('button[type=submit]').textContent='Save pending application';});
}
async function loadProfile(){
  show('providerLoading');clearNotice();
  try{
    const session=await api('/api/session');state.csrf=session.csrfToken;state.user=session.user;
    const data=await api('/api/provider/me');state.profile=data.profile;renderProvider();void maybeProviderTour();
  }catch(error){
    if(error.status===401){state.csrf=null;state.user=null;state.profile=null;show('providerAuth');setMode(new URLSearchParams(location.search).get('register')==='1'?'register':'login');}
    else{show('providerAuth');setMode('login');notify(error.message,true);}
  }
}
function formBusy(form,busy,text){const button=form.querySelector('button[type=submit]');button.disabled=busy;if(busy){button.dataset.oldText=button.textContent;button.textContent=text;}else button.textContent=button.dataset.oldText||button.textContent;}
$('#providerShowLogin').addEventListener('click',()=>setMode('login'));
$('#providerShowRegister').addEventListener('click',()=>setMode('register'));
$('#providerLoginForm').addEventListener('submit',async event=>{
  event.preventDefault();const form=event.currentTarget;formBusy(form,true,'Signing in…');clearNotice();
  try{const data=await api('/api/auth/login',{method:'POST',body:{email:form.elements.namedItem('email').value,password:form.elements.namedItem('password').value}});state.csrf=data.csrfToken;form.reset();await loadProfile();}
  catch(error){notify(error.message,true);}finally{formBusy(form,false);}
});
$('#providerRegisterForm').addEventListener('submit',async event=>{
  event.preventDefault();const form=event.currentTarget;formBusy(form,true,'Creating account…');clearNotice();
  try{
    const data=await api('/api/auth/register',{method:'POST',body:{fullName:form.elements.namedItem('fullName').value,email:form.elements.namedItem('email').value,password:form.elements.namedItem('password').value}});
    if(data.csrfToken){state.csrf=data.csrfToken;form.reset();await loadProfile();}
    else{setMode('login');$('#providerLoginForm').elements.namedItem('email').value=form.elements.namedItem('email').value;notify(data.message||'Verify your email, then sign in to complete your provider application.');}
  }catch(error){notify(error.message,true);}finally{formBusy(form,false);}
});
$('#providerApplyForm').addEventListener('submit',async event=>{
  event.preventDefault();const form=event.currentTarget;formBusy(form,true,'Submitting securely…');clearNotice();
  const payload={fullName:form.elements.namedItem('fullName').value,whatsapp:form.elements.namedItem('whatsapp').value,serviceSummary:form.elements.namedItem('serviceSummary').value};
  try{
    const editing=form.dataset.edit==='yes';
    const data=await api(editing?'/api/provider/application':'/api/provider/apply',{method:editing?'PATCH':'POST',body:payload});
    form.dataset.edit='';form.querySelector('button[type=submit]').textContent='Submit application';
    await loadProfile();notify(data.message||'Application submitted.');
  }catch(error){notify(error.message,true);}finally{formBusy(form,false);}
});
document.addEventListener('click',async event=>{
  if(event.target.closest('[data-provider-logout]')){
    try{await api('/api/auth/logout',{method:'POST'});}catch{}
    state.csrf=null;state.user=null;state.profile=null;$('#providerLoginForm').reset();$('#providerRegisterForm').reset();show('providerAuth');setMode('login');notify('Signed out.');
  }
});
loadProfile();

// ---------- V1.60 provider-managed services ----------
const serviceTypes=[['short_text','Short text'],['long_text','Paragraph'],['phone','Phone'],['email','Email'],['number','Number'],['select','Dropdown'],['date','Date'],['image','Image upload'],['file','PDF / image file']];
const formatNgn=minor=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:2}).format(Number(minor)/100);
function previewSplit(){
  const input=$('#providerServiceForm [name="quote"]'),out=$('#providerPriceBreakdown');if(!input||!out)return;
  const n=Number(input.value);if(!Number.isFinite(n)||n<1){out.textContent='Enter your base quote to see the automatic split.';return;}
  const q=Math.round(n*100),fee=Math.round(q*.15);
  out.innerHTML=`<div><span>Your quote</span><strong>${formatNgn(q)}</strong></div><div><span>Customer price (+15%)</span><strong>${formatNgn(q+fee)}</strong></div><div><span>Your earnings after acceptance (−15%)</span><strong>${formatNgn(q-fee)}</strong></div><div><span>ToolCart gross share (30% of quote)</span><strong>${formatNgn(2*fee)}</strong></div><small>No service payment or earnings are collected in this version.</small>`;
}
async function loadProviderServices(){
  const container=$('#providerServiceList');if(!container||state.profile?.status!=='approved')return;
  try{const d=await api('/api/provider/services');state.services=d.services||[];renderProviderServiceList();}
  catch(e){container.textContent=e.message;}
}
function renderProviderServiceList(){
  const el=$('#providerServiceList');if(!el)return;
  el.innerHTML=state.services.length?state.services.map(s=>`<article class="provider-service-item"><div class="provider-service-title"><strong>${esc(s.name)}</strong><span>${esc(s.status)}</span></div><p>${esc(s.short_description)}</p><div class="provider-price-pair"><span>Customer: <b>${formatNgn(s.customer_price_minor)}</b></span><span>Provider earnings: <b>${formatNgn(s.provider_earnings_minor)}</b></span></div><div class="provider-service-actions"><button type="button" class="provider-outline" data-provider-edit="${Number(s.id)}">Edit</button>${s.status!=='restricted'?`<button type="button" class="provider-outline" data-provider-status="${Number(s.id)}" data-next-status="${s.status==='published'?'paused':'published'}">${s.status==='published'?'Hide':'Show'}</button><button type="button" class="provider-outline" data-provider-status="${Number(s.id)}" data-next-status="removed">Remove</button>`:'<span class="provider-hint">Restricted by ToolCart. Contact support.</span>'}</div></article>`).join(''):'<p class="provider-hint">You have not published a service yet. Add one above to display it in Premium Tools.</p>';
  el.querySelectorAll('[data-provider-edit]').forEach(b=>b.addEventListener('click',()=>openProviderServiceEditor(state.services.find(s=>Number(s.id)===Number(b.dataset.providerEdit)))));
  el.querySelectorAll('[data-provider-status]').forEach(b=>b.addEventListener('click',async()=>{
    const id=Number(b.dataset.providerStatus),status=b.dataset.nextStatus;
    if(status==='removed'&&!confirm('Remove this service from ToolCart?'))return;
    b.disabled=true;try{await api(`/api/provider/services/${id}/status`,{method:'POST',body:{status}});notify('Service updated.');await loadProviderServices();}
    catch(e){notify(e.message,true);b.disabled=false;}
  }));
}
function createRequirement(){const id=String(Date.now())+Math.random().toString(16).slice(2,5);state.requirements.push({id,key:'field_'+(state.requirements.length+1),label:'',type:'short_text',required:true,help:'',options:[]});renderProviderRequirementEditor();}
function renderProviderRequirementEditor(){
  const list=$('#providerRequirementList');if(!list)return;
  list.innerHTML=state.requirements.map((f,i)=>`<div class="provider-requirement" data-req-id="${esc(f.id)}"><div class="provider-service-title"><strong>Requirement ${i+1}</strong><button class="provider-outline" type="button" data-req-remove="${esc(f.id)}" aria-label="Remove requirement ${i+1}">Remove</button></div><label>Field label<input data-req-property="label" value="${esc(f.label)}" maxlength="100" placeholder="Full name"></label><label>Answer type<select data-req-property="type">${serviceTypes.map(([v,label])=>`<option value="${v}" ${v===f.type?'selected':''}>${label}</option>`).join('')}</select></label><label>Help text (optional)<input data-req-property="help" value="${esc(f.help)}" maxlength="280"></label>${f.type==='select'?`<label>Dropdown choices, one per line<textarea rows="3" data-req-property="options">${esc((f.options||[]).join('\n'))}</textarea></label>`:''}<label class="provider-required"><input type="checkbox" data-req-property="required" ${f.required?'checked':''}> Required</label></div>`).join('');
  list.querySelectorAll('[data-req-remove]').forEach(b=>b.addEventListener('click',()=>{state.requirements=state.requirements.filter(f=>f.id!==b.dataset.reqRemove);renderProviderRequirementEditor();}));
  list.querySelectorAll('[data-req-property]').forEach(el=>el.addEventListener(el.tagName==='SELECT'?'change':'input',()=>{
    const row=el.closest('[data-req-id]'),f=state.requirements.find(v=>v.id===row.dataset.reqId),key=el.dataset.reqProperty;
    if(!f)return;f[key]=key==='required'?el.checked:key==='options'?el.value.split(/\r?\n/).map(s=>s.trim()).filter(Boolean):el.value;
    if(key==='type'){if(f.type==='select'&&f.options.length<2)f.options=['Option 1','Option 2'];renderProviderRequirementEditor();}
  }));
}
function openProviderServiceEditor(item=null){
  if(state.profile?.status!=='approved')return;
  state.editingService=item?.id||null;
  state.requirements=(item?.requirements||[]).map((f,i)=>({...f,id:String(i+1),options:[...(f.options||[])]}));
  const editing=$('#providerServiceEditor');if(!editing)return;
  editing.classList.remove('hidden');
  editing.innerHTML=`<div class="provider-panel-head"><div><span class="eyebrow">PREMIUM SERVICES</span><h2>${item?'Edit service':'Create a service'}</h2></div><button class="provider-outline" type="button" id="providerServiceCancel">Close</button></div><p class="provider-subtitle">Describe what you offer. The platform calculates customer pricing and your earnings. Only approved providers can publish.</p><form id="providerServiceForm" class="provider-form"><label>Service name<input name="name" required maxlength="120" value="${esc(item?.name||'')}" placeholder="e.g. Custom business flyer design"></label><label>Short description<input name="shortDescription" required maxlength="280" value="${esc(item?.short_description||'')}" placeholder="What customers receive"></label><label>Full description<textarea name="description" minlength="20" required maxlength="12000" rows="5">${esc(item?.description||'')}</textarea></label><label>Cover image (optional)<input id="providerCoverFile" type="file" accept="image/webp,image/png,image/jpeg"><input type="hidden" name="coverKey" value="${esc(item?.cover_key||'')}"></label><p id="providerCoverStatus" class="provider-hint">${item?.cover_key?'Existing cover retained.':'Use a clear image that represents your service.'}</p><label>My base service quote (₦)<input name="quote" type="number" min="1" max="10000000" step="0.01" inputmode="decimal" value="${item?(Number(item.quote_minor)/100).toFixed(2):''}" required></label><div class="provider-price-breakdown" id="providerPriceBreakdown" aria-live="polite"></div><div class="provider-panel-head"><div><h3>Customer information required</h3><p class="provider-subtitle">Choose the fields customers will fill after secure checkout becomes available.</p></div><button type="button" class="provider-outline" id="providerAddRequirement">＋ Add</button></div><div id="providerRequirementList"></div><button type="submit" class="provider-primary" id="providerServiceSubmit">${item?'Save service':'Publish service'}</button></form>`;
  renderProviderRequirementEditor();previewSplit();
  $('#providerServiceCancel').addEventListener('click',()=>editing.classList.add('hidden'));
  $('#providerAddRequirement').addEventListener('click',createRequirement);
  $('#providerServiceForm [name="quote"]').addEventListener('input',previewSplit);
  $('#providerCoverFile').addEventListener('change',async e=>{
    const f=e.target.files?.[0];if(!f)return;
    const status=$('#providerCoverStatus');status.textContent='Uploading cover…';
    const form=new FormData();form.append('file',f);
    try{const d=await api('/api/provider/service-cover',{method:'POST',body:form});$('#providerServiceForm [name="coverKey"]').value=d.key;status.textContent='Cover uploaded.';}
    catch(err){status.textContent=err.message;}e.target.value='';
  });
  $('#providerServiceForm').addEventListener('submit',async e=>{
    e.preventDefault();const f=e.currentTarget,b=$('#providerServiceSubmit');if(b.disabled)return;
    const quote=String(f.elements.namedItem('quote').value).trim();
    if(!/^\d+(?:\.\d{1,2})?$/.test(quote)){notify('Enter a price with up to two decimal places.',true);return;}
    const payload={name:f.elements.namedItem('name').value,shortDescription:f.elements.namedItem('shortDescription').value,description:f.elements.namedItem('description').value,quoteMinor:Math.round(Number(quote)*100),coverKey:f.elements.namedItem('coverKey').value,requirements:state.requirements};
    b.disabled=true;b.textContent='Saving service…';
    try{const id=state.editingService;const d=await api(id?`/api/provider/services/${id}`:'/api/provider/services',{method:id?'PATCH':'POST',body:payload});notify(d.message||'Service saved.');editing.classList.add('hidden');await loadProviderServices();}
    catch(error){notify(error.message,true);}finally{b.disabled=false;b.textContent=item?'Save service':'Publish service';}
  });
  editing.scrollIntoView({block:'start',behavior:'auto'});
}
// Per-account, server-persisted provider walkthrough. Both Next and Skip are optional.
async function maybeProviderTour(){
  if(!state.profile||state.tour)return;
  try{const d=await api('/api/tour/status?context=provider');if(!d.complete&&state.profile)startProviderTour();}catch{}
}
function startProviderTour(){
  if(state.tour)return;
  const steps=[
    {sel:'#providerIdCard',title:'Your unique provider ID',desc:'Use this code when speaking to ToolCart support. It is not a password.'},
    {sel:'.provider-details',title:'Your account details',desc:'Your contact information is private. Your approval status appears here.'},
    ...(state.profile?.status==='approved'?[{sel:'#providerNewService',title:'Publish your service',desc:'Create your listings and define the required customer information.'},{sel:'#providerServiceList',title:'Manage your listings',desc:'Edit, hide or remove services at any time.'}]:[])
  ];
  state.tour={steps,index:0};const host=document.createElement('div');host.id='providerTour';host.className='provider-tour';host.innerHTML='<div class="provider-tour-dim"></div><div class="provider-tour-card" role="dialog" aria-label="Service provider guide"><small></small><h3></h3><p></p><div><button type="button" data-provider-tour-skip>Skip</button><button type="button" data-provider-tour-next>Next →</button></div></div>';document.body.append(host);
  host.addEventListener('click',e=>{if(e.target.closest('[data-provider-tour-skip]'))finishProviderTour();if(e.target.closest('[data-provider-tour-next]')){state.tour.index++;state.tour.index>=steps.length?finishProviderTour():positionProviderTour();}});
  positionProviderTour();
}
function positionProviderTour(){
  if(!state.tour)return;
  const step=state.tour.steps[state.tour.index],host=$('#providerTour'),card=host.querySelector('.provider-tour-card');
  document.querySelector('.provider-tour-highlight')?.classList.remove('provider-tour-highlight');
  const el=$(step.sel);el?.scrollIntoView({block:'center',behavior:'auto'});el?.classList.add('provider-tour-highlight');
  card.querySelector('small').textContent=`STEP ${state.tour.index+1} / ${state.tour.steps.length}`;card.querySelector('h3').textContent=step.title;card.querySelector('p').textContent=step.desc;
  card.querySelector('[data-provider-tour-next]').textContent=state.tour.index===state.tour.steps.length-1?'Finish':'Next →';
  const r=el?.getBoundingClientRect(),h=card.offsetHeight||205;
  card.style.top=`${Math.max(16,Math.round(r&&r.bottom+h+20<innerHeight?r.bottom+12:r&&r.top-h>12?r.top-h-12:innerHeight-h-18))}px`;
}
function finishProviderTour(){document.querySelector('.provider-tour-highlight')?.classList.remove('provider-tour-highlight');$('#providerTour')?.remove();state.tour=null;void api('/api/tour/complete',{method:'POST',body:{context:'provider'}}).catch(()=>{});}
// V1.61: assigned work arrives only after buyer submits their paid requirements.
async function loadProviderOrders(){
  const box=$('#providerOrderInbox');if(!box||state.profile?.status!=='approved')return;
  box.textContent='Loading requests…';
  try{
    const d=await api('/api/provider/orders');const list=d.orders||[];
    $('#providerAssignedRequests').textContent=String(list.length);
    $('#providerPendingEarnings').textContent=formatNgn(list.reduce((sum,o)=>sum+Number(o.providerEarningsMinor||0),0));
    box.innerHTML=list.length?list.map(o=>`<article class="provider-service-item"><small>${esc(o.orderNumber)} · ${esc((o.delivery?.status||o.status).replaceAll('_',' '))}</small><strong>${esc(o.serviceName)}</strong><span class="provider-hint">${formatNgn(o.providerEarningsMinor)} pending, not available for withdrawal</span><button type="button" class="provider-outline" data-provider-view-order="${o.id}">Open request</button></article>`).join(''):'<p class="provider-hint">No submitted service requests are assigned to you yet.</p>';
    box.querySelectorAll('[data-provider-view-order]').forEach(b=>b.addEventListener('click',()=>void viewProviderServiceOrder(Number(b.dataset.providerViewOrder))));
  }catch(e){box.textContent=e.message;}
}
async function viewProviderServiceOrder(id){
  try{
    const d=await api(`/api/provider/orders/${id}`),o=d.order;const box=$('#providerOrderDetail');
    const fields=(o.requirements||[]).map(f=>{
      const val=o.answers?.[f.key],file=val&&typeof val==='object'&&val.uploadId;
      return `<div class="provider-service-response"><small>${esc(f.label)}</small>${file?`<a href="/api/service-orders/${o.id}/files/${Number(val.uploadId)}" target="_blank" rel="noopener noreferrer">Download submitted ${esc(val.fileName||'file')}</a>`:`<p>${esc(val||'Not supplied')}</p>`}</div>`;
    }).join('');
    const latest=o.delivery;
    const deliveryNotice=latest?.status==='delivered'?`<div class="provider-note">Revision ${latest.revision} sent for customer review. You cannot replace it until the customer responds.</div>`:latest?.status==='accepted'?'<div class="provider-note">Customer accepted the delivery. Earnings remain pending and cannot be withdrawn yet.</div>':latest?.status==='revision_requested'?`<div class="provider-note"><strong>Correction requested:</strong> ${esc(latest.customerFeedback)}. Upload a revised original and preview.</div>`:'';
    const deliverForm=o.status==='in_progress'&&(!latest||latest.status==='revision_requested')?`<form id="providerDeliveryForm" class="provider-delivery-form"><h3>${latest?'Submit a revised delivery':'Deliver completed work'}</h3><label>Final original (PDF or image, max 16 MB)<input type="file" name="original" required accept="application/pdf,image/jpeg,image/png,image/webp"></label><label>PDF preview image (only required for PDF originals)<input type="file" name="previewImage" accept="image/jpeg,image/png,image/webp"></label><label>Message to customer (optional)<textarea name="note" maxlength="1200" rows="3"></textarea></label><p class="provider-hint">ToolCart will create a watermarked, reduced-size preview. The full original remains private until customer acceptance.</p><button class="provider-primary" type="submit">Send delivery for review</button></form>`:'';
    box.innerHTML=`<button type="button" class="provider-outline" id="providerBackToDashboard">← Back to requests</button><span class="eyebrow">ASSIGNED SERVICE REQUEST</span><h2>${esc(o.serviceName)}</h2><p class="provider-subtitle">${esc(o.orderNumber)} · ${esc(latest?.status||o.status).replaceAll('_',' ')}</p><div class="provider-requirements-readonly">${fields}</div>${o.status==='submitted'?`<button type="button" class="provider-primary" id="providerStartWork">Mark as in progress</button>`:''}${deliveryNotice}${deliverForm}`;
    $('#providerDeliveryForm')?.addEventListener('submit',event=>void uploadProviderDelivery(event,id,o.orderNumber));
    show('providerOrderDetail');$('#providerBackToDashboard').addEventListener('click',()=>{show('providerDashboard');void loadProviderOrders();});
    $('#providerStartWork')?.addEventListener('click',async e=>{const btn=e.currentTarget;btn.disabled=true;try{await api(`/api/provider/orders/${id}/start`,{method:'POST'});notify('Marked in progress.');await viewProviderServiceOrder(id);}catch(err){notify(err.message,true);btn.disabled=false;}});
  }catch(e){notify(e.message,true)}
}


// V1.62: create a *rasterized* watermarked image in the browser before upload.
// Original is always uploaded separately to private R2. PDFs require a separate preview picture.
async function makeToolCartPreview(imageFile,orderNumber){
 const img=await createImageBitmap(imageFile);
 try{
  const scale=Math.min(1,1100/Math.max(img.width,img.height));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));
  const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw new Error('Image preview unavailable.');
  ctx.drawImage(img,0,0,canvas.width,canvas.height);
  const w=canvas.width,h=canvas.height;const size=Math.max(20,Math.round(Math.min(w,h)/12));
  ctx.save();ctx.translate(w/2,h/2);ctx.rotate(-Math.PI/5);
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`900 ${size}px system-ui, sans-serif`;
  const distance=size*4;ctx.fillStyle='rgba(255,255,255,0.45)';ctx.strokeStyle='rgba(8,8,8,0.65)';ctx.lineWidth=Math.max(2,size/16);
  for(let y=-h*1.3;y<h*1.3;y+=distance)for(let x=-w*1.5;x<w*1.5;x+=size*13){
   ctx.strokeText('TOOLCART PREVIEW',x,y);ctx.fillText('TOOLCART PREVIEW',x,y);
  }
  ctx.restore();ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,h-Math.max(38,size*1.45),w,Math.max(38,size*1.45));
  ctx.fillStyle='#fff';ctx.font=`700 ${Math.max(13,Math.round(size*.62))}px system-ui, sans-serif`;ctx.textAlign='center';
  ctx.fillText(`TOOLCART REVIEW · ${orderNumber}`,w/2,h-Math.max(19,size*.6));
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Could not watermark preview.')),'image/jpeg',.78));
  if(blob.size>4*1024*1024)throw new Error('Watermarked preview is too large.');
  return new File([blob],'toolcart-watermarked-preview.jpg',{type:'image/jpeg'});
 }finally{img.close?.()}
}
async function uploadProviderDelivery(event,orderId,orderNumber){
 event.preventDefault();const form=event.currentTarget,button=form.querySelector('button[type=submit]');if(button.disabled)return;
 const original=form.elements.namedItem('original').files?.[0],previewInput=form.elements.namedItem('previewImage').files?.[0];
 if(!original)return notify('Choose a final file.',true);
 if(original.size>16*1024*1024)return notify('Final file exceeds 16 MB.',true);
 const image=original.type==='application/pdf'?previewInput:original;
 if(!image||!['image/jpeg','image/png','image/webp'].includes(image.type))return notify('PDF deliveries need a JPEG, PNG or WebP preview image.',true);
 button.disabled=true;button.textContent='Preparing private delivery…';
 try{
  const watermarked=await makeToolCartPreview(image,orderNumber);const fd=new FormData();fd.append('original',original);fd.append('preview',watermarked);fd.append('note',form.elements.namedItem('note').value||'');
  const headers=new Headers();headers.set('x-csrf-token',state.csrf);
  const response=await fetch(`/api/provider/orders/${orderId}/delivery`,{method:'POST',body:fd,headers,credentials:'same-origin',cache:'no-store'});
  const result=await response.json().catch(()=>({error:'Invalid delivery response.'}));
  if(!response.ok)throw new Error(result.error||'Delivery failed.');
  notify('Completed work submitted securely for customer review.');await viewProviderServiceOrder(orderId);
 }catch(e){notify(e.message,true);button.disabled=false;button.textContent='Send delivery for review';}
}
