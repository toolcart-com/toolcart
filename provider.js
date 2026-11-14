// ToolCart V1.58 — Provider onboarding and owner-approved dashboard.
// Uses existing ToolCart accounts. No customer orders or payouts in this release.
const $=selector=>document.querySelector(selector);
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const state={csrf:null,user:null,profile:null,mode:'login'};
async function api(path,options={}){
  const method=options.method||'GET',headers=new Headers(options.headers||{});
  if(options.body!==undefined){headers.set('content-type','application/json');options.body=JSON.stringify(options.body);}
  if(state.csrf&&!['GET','HEAD'].includes(method))headers.set('x-csrf-token',state.csrf);
  const response=await fetch(path,{...options,method,credentials:'same-origin',headers,cache:'no-store'});
  const data=await response.json().catch(()=>({ok:false,error:'Invalid server response.'}));
  if(!response.ok){const error=new Error(data.error||'Request failed.');error.status=response.status;throw error;}
  return data;
}
function show(id){for(const key of ['providerLoading','providerAuth','providerApply','providerDashboard'])$('#'+key).classList.toggle('hidden',key!==id);}
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
  const info=approved?'Your provider account has been approved. Order fulfillment and withdrawals will be introduced in later releases.':pending?'Your application is being reviewed. Our support team will contact you if further information is needed.':p.status==='banned'?'You cannot receive assignments or apply again using this account. Contact ToolCart support if you believe this decision was incorrect.':p.status==='restricted'?'Provider access has been restricted. Contact ToolCart support to resolve the issue.':'Your application was not approved. Contact ToolCart support for more information.';
  $('#providerDashboard').innerHTML=`<div class="provider-panel-head"><span class="eyebrow">TOOLCART PROVIDER ACCOUNT</span><button class="provider-outline" type="button" data-provider-logout>Sign out</button></div><div class="provider-approval ${esc(p.status)}"><div class="provider-state-icon" aria-hidden="true">${icon}</div><span class="provider-state-label">${esc(escapeStatus(p.status))}</span><h2>${esc(headline)}</h2><p>${esc(info)}</p>${p.reviewMessage?`<p class="provider-decision-note">Message from ToolCart: ${esc(p.reviewMessage)}</p>`:''}</div><div class="provider-id-card"><div><span class="eyebrow">YOUR UNIQUE PROVIDER ID</span><strong id="providerCode">${esc(p.providerCode)}</strong><small>Used by ToolCart to identify and assign approved service partners. This is not a password.</small></div><button type="button" class="provider-outline" id="providerCopyCode">Copy ID</button></div><div class="provider-details"><div><small>Full name</small><strong>${esc(p.fullName)}</strong></div><div><small>WhatsApp (private)</small><strong>${esc(p.whatsapp)}</strong></div><div><small>Account status</small><strong>${esc(escapeStatus(p.status))}</strong></div></div>${pending?`<div class="provider-note">You can correct your application while it is pending.</div><button type="button" class="provider-outline full" id="providerRefreshStatus">Check approval status</button><button type="button" class="provider-outline full" id="providerEditApplication">Edit pending application</button>`:''}${approved?`<div class="provider-service-workspace"><h3>Service workspace</h3><p>Assigned requests and deliveries will appear here once secure order routing is enabled.</p><div class="provider-stats"><div><small>Assigned requests</small><strong>0</strong></div><div><small>Available earnings</small><strong>₦0.00</strong></div></div><button type="button" class="provider-primary" disabled>Withdrawals coming soon</button><small>No customer information is accessible in this release.</small></div>`:''}`;
  $('#providerCopyCode')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(p.providerCode);notify('Provider ID copied.');}catch{notify('Copy the provider ID shown above.');}});
  $('#providerRefreshStatus')?.addEventListener('click',()=>{void loadProfile();});
  $('#providerEditApplication')?.addEventListener('click',()=>{show('providerApply');const f=$('#providerApplyForm');f.elements.namedItem('fullName').value=p.fullName;f.elements.namedItem('whatsapp').value=p.whatsapp;f.elements.namedItem('serviceSummary').value=p.serviceSummary||'';f.dataset.edit='yes';f.querySelector('button[type=submit]').textContent='Save pending application';});
}
async function loadProfile(){
  show('providerLoading');clearNotice();
  try{
    const session=await api('/api/session');state.csrf=session.csrfToken;state.user=session.user;
    const data=await api('/api/provider/me');state.profile=data.profile;renderProvider();
  }catch(error){
    if(error.status===401){state.csrf=null;state.user=null;state.profile=null;show('providerAuth');setMode('login');}
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
