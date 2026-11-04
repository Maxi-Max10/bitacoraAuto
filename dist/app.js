import { carArtwork, vehicleAppearance } from './vehicle.js';
import { CATEGORIES, BODY_TYPES, VEHICLE_TYPES, MAX_FILES, MAX_FILE_SIZE, freshState, escapeHTML as esc, validateEntry, validateCar, serializeBackup, deserializeBackup, sortEntries, filterEntries, openDatabase, loadState } from './core.js';
import * as cloud from './cloud.js';

const paths = {
  gauge:'<path d="M4.9 19a9 9 0 1 1 14.2 0M12 12l5-5"/><circle cx="12" cy="12" r="1"/>',
  history:'<path d="M3 11a9 9 0 1 1 2.4 7.1M3 4v7h7M12 7v5l3 2"/>',
  car:'<path d="m5 7 1.5-4h11L19 7l2 3v9h-3v-3H6v3H3v-9l2-3ZM5 7h14M3 12h18M6 10h1m10 0h1"/>',
  paperclip:'<path d="m8 13 6-6a3 3 0 0 1 4 4l-8 8a5 5 0 0 1-7-7l9-9a2 2 0 0 1 3 3l-9 9a1 1 0 0 0 2 2l8-8"/>',
  download:'<path d="M12 3v12m-5-5 5 5 5-5M4 15v5h16v-5"/>',
  upload:'<path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  x:'<path d="m6 6 12 12M6 18 18 6"/>',
  arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18M7 15h2m3 0h2m3 0h1"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  wrench:'<path d="m14 6 4 4 3-3a6 6 0 0 1-8 8l-6 6a3 3 0 0 1-4-4l6-6a6 6 0 0 1 8-8l-3 3Z"/>',
  oil:'<path d="M3 9h3l3-4h6v4l6 3v6H6l-3-6V9Zm7-4V3m-2 0h6M7 13h9M19 5c3 3 3 5 0 5s-3-2 0-5Z"/>',
  spark:'<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z"/>',
  check:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  wallet:'<path d="M20 7V4H6a3 3 0 0 0 0 6h15v10H5a3 3 0 0 1-3-3V7m19 6h-5v4h5M6 7h14"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  edit:'<path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 15v5Z"/>',
  archive:'<path d="M4 7v14h16V7M2 3h20v4H2zM9 11h6m-3 0v5m-3-2 3 3 3-3"/>',
  file:'<path d="M14 2H5v20h14V7l-5-5Zm0 0v6h5M8 12h8m-8 4h6"/>',
  shield:'<path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4Z"/><path d="m8 12 3 3 5-6"/>',
  alert:'<path d="m12 3 10 18H2L12 3Zm0 6v5m0 3v1"/>',
  trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  pin:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>'
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.file}</svg>`;
function icons(root = document) { root.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); }); }
const $ = selector => document.querySelector(selector);
const number = value => new Intl.NumberFormat('es-AR').format(value);
const money = value => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);
const dateLabel = (date, options = {day:'2-digit', month:'short', year:'numeric'}) => new Intl.DateTimeFormat('es-AR', options).format(new Date(`${date}T12:00:00`));
const categoryIcon = category => ({mantenimiento:'oil', reparacion:'wrench', mejora:'spark', revision:'check', otro:'wrench'})[category];
const localNow = () => { const d = new Date(); return { date: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`, time: `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}` }; };
const isImage = f => /^image\/(png|jpeg|webp|gif|avif|bmp)$/i.test(f.type);
let state = freshState(), db, demo = null, page = 'garage', query = '', category = 'todos', sort = 'newest', editingId = null, pendingFiles = [], toastTimer, saveBusy = false;
let account=null,vehicles=[],legacy=null,creatingCar=false,authMode='login',switchBusy=false;
let previewURLs = [];
const current = () => demo || state;
function toast(message, error = false) { const el = $('#toast'); clearTimeout(toastTimer); el.textContent = message; el.classList.toggle('error', error); el.hidden = false; toastTimer = setTimeout(() => el.hidden = true, error ? 9000 : 4500); }
function showError(id, message) { const el = $(id); el.textContent = message; el.hidden = false; }
function fileURL(file) { if(file.remote)return `/api/files?id=${encodeURIComponent(file.id)}`; const url = URL.createObjectURL(file.blob); previewURLs.push(url); return url; }
function revokeURLs() { previewURLs.forEach(url => URL.revokeObjectURL(url)); previewURLs = []; }
async function persist(next) {
  if (demo) { demo = next; return; }
  if (!account||!state.id) throw new Error('Elegí un vehículo de tu garage.');
  state=await cloud.save({...next,id:state.id,revision:state.revision},account.id);
  vehicles=vehicles.map(vehicle=>vehicle.id===state.id?{...vehicle,...state.car,revision:state.revision,entryCount:state.entries.length}:vehicle);
}

function rememberedVehicle(id) { try{if(id)localStorage.setItem(`bitacora:vehicle:${account.id}`,id);else return localStorage.getItem(`bitacora:vehicle:${account.id}`);}catch{} }
function legacyImported(){try{return localStorage.getItem(`bitacora:legacy:${account.id}`)==='yes';}catch{return false;}}
async function accountGarage(){
  const result=await cloud.list();account=result.user;vehicles=result.vehicles;
  const selected=vehicles.find(v=>v.id===rememberedVehicle())||vehicles[0];
  state=selected?await cloud.load(selected.id):freshState();
  if(selected)rememberedVehicle(selected.id);
  document.body.classList.remove('signed-out');$('#auth-screen').hidden=true;$('#boot-screen').hidden=true;
  readPage();
}
async function boot(){
  $('#boot-screen').hidden=false;$('#boot-retry').hidden=true;$('#boot-message').textContent='Abriendo tu garage…';
  try{
    const result=await cloud.session();
    if(result?.user){account=result.user;await accountGarage();}
    else{account=null;state=freshState();vehicles=[];document.body.classList.add('signed-out');$('#boot-screen').hidden=true;$('#auth-screen').hidden=false;}
  }catch(error){$('#boot-message').textContent='No se pudo conectar con tu garage. Tus datos siguen guardados.';$('#boot-retry').hidden=false;}
}
function authTab(mode){
  authMode=mode;const register=mode==='register';$('#auth-error').hidden=true;
  $('#auth-name-label').hidden=!register;$('#auth-name').required=register;$('#auth-password-help').hidden=!register;
  $('#auth-password').autocomplete=register?'new-password':'current-password';$('#auth-password').minLength=register?10:1;
  $('#auth-title').textContent=register?'Creá tu garage':'Volvé a tu garage';$('#auth-subtitle').textContent=register?'Tu cuenta puede tener todos tus vehículos.':'Ingresá con tu email y contraseña.';
  $('#auth-submit').textContent=register?'Crear cuenta':'Ingresar';
  for(const [id,active] of [['auth-login',!register],['auth-register',register]]){$('#'+id).classList.toggle('active',active);$('#'+id).setAttribute('aria-pressed',String(active));}
}
async function authenticate(event){
  event.preventDefault();const button=$('#auth-submit');button.disabled=true;$('#auth-error').hidden=true;
  try{
    const data=new FormData(event.target);
    if(authMode==='register')await cloud.signUp(data.get('name').trim(),data.get('email').trim(),data.get('password'));
    else await cloud.signIn(data.get('email').trim(),data.get('password'));
    $('#auth-password').value='';await accountGarage();
  }catch(error){showError('#auth-error',error.message);}finally{button.disabled=false;}
}
async function logout(){
  if(saveBusy)return toast('Esperá a que termine el guardado.');
  try{await cloud.signOut();clearAccount();}catch(error){toast(error.message,true);}
}
function clearAccount(){
  revokeURLs();account=null;vehicles=[];state=freshState();demo=null;pendingFiles=[];editingId=null;
  document.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());$('#page-content').innerHTML='';
  document.body.classList.add('signed-out');$('#auth-screen').hidden=false;$('#boot-screen').hidden=true;$('#auth-form').reset();authTab('login');
}
async function selectVehicle(id){
  if(saveBusy||switchBusy)return;switchBusy=true;
  try{state=await cloud.load(id);demo=null;query='';category='todos';rememberedVehicle(id);page='historial';location.hash='historial';render();}
  catch(error){toast(error.message,true);}finally{switchBusy=false;}
}
function garagePage(){
  const legacyCard=legacy&&!legacyImported()?`<section class="migration-card"><div>${icon('archive')}<h3>Encontramos tu historial anterior</h3><p>${esc(legacy.car.make)} ${esc(legacy.car.model)} · ${legacy.entries.length} registros guardados en este navegador.</p></div><button class="button secondary" data-action="import-legacy">Sumarlo a mi cuenta ${icon('arrow')}</button></section>`:'';
  if(!vehicles.length)return `${legacyCard}<section class="garage-empty"><div class="eyebrow">ESTE ES TU PUNTO DE PARTIDA</div><h2>Un garage para todos<br>tus vehículos<span>.</span></h2><p>Sumá un auto, una moto, una camioneta o cualquier otro vehículo. Cada uno tiene su propio historial.</p><button class="button primary" data-action="new-vehicle">${icon('plus')} Agregar mi primer vehículo</button><div class="garage-types">Auto <span>·</span> Moto <span>·</span> Pickup <span>·</span> Y más</div></section>`;
  return `${legacyCard}<section class="garage-grid" aria-label="Mis vehículos">${vehicles.map(vehicle=>`<article class="garage-card"><button class="garage-card-main" data-select-vehicle="${esc(vehicle.id)}"><span class="garage-type">${esc(VEHICLE_TYPES[vehicle.type]||'Vehículo')}${vehicle.id===state.id?'<span class="active-vehicle">ACTIVO</span>':''}</span><div class="garage-car-art">${carArtwork(vehicle)}</div><h2>${esc(vehicle.make)} ${esc(vehicle.model)}</h2><p>${vehicle.year?`${vehicle.year} · `:''}${vehicle.plate?esc(vehicle.plate):'Sin patente registrada'}</p><div class="garage-card-stats"><span><strong>${number(vehicle.km)}</strong> km</span><span>${vehicle.entryCount} registros ${icon('arrow')}</span></div></button><button class="garage-delete" data-delete-vehicle="${esc(vehicle.id)}" aria-label="Eliminar ${esc(vehicle.make)} ${esc(vehicle.model)}">${icon('trash')}</button></article>`).join('')}</section>`;
}
async function deleteVehicle(id){
  if(saveBusy)return;
  const vehicle=vehicles.find(v=>v.id===id);if(!vehicle)return;
  if(!await confirmAction('¿Eliminar este vehículo?',`Se eliminarán ${vehicle.make} ${vehicle.model}, sus ${vehicle.entryCount} registros y sus adjuntos. Descargá una copia antes si querés conservarlos.`))return;
  saveBusy=true;try{await cloud.remove(id);await accountGarage();toast('Vehículo eliminado.');}catch(error){toast(error.message,true);}finally{saveBusy=false;}
}
async function importLegacy(){
  if(saveBusy||!legacy)return;
  if(!await confirmAction('¿Sumar el historial anterior?',`Se agregará como un vehículo de la cuenta ${account.email}. Los datos del navegador se conservan.`,'Importar a mi cuenta'))return;
  saveBusy=true;
  try{state=await cloud.importVehicle(legacy,account.id);rememberedVehicle(state.id);try{localStorage.setItem(`bitacora:legacy:${account.id}`,'yes');}catch{}await accountGarage();location.hash='historial';toast('Tu historial anterior ya está en tu cuenta.');}
  catch(error){toast(error.message,true);}finally{saveBusy=false;}
}

function hero() {
  const car = current().car; const configured = car.make || car.model;
  return `<section class="vehicle-hero" aria-label="Resumen de mi auto"><div class="vehicle-info"><div class="vehicle-label"><span></span> MI COMPAÑERO DE CAMINO</div><h2>${configured ? `${esc(car.make)} ${esc(car.model)}` : 'Tu próximo capítulo'}</h2><div class="vehicle-meta">${configured ? `${car.year ? `<span>${car.year}</span><span>·</span>` : ''}<span>${car.plate ? `<span class="plate">${esc(car.plate)}</span>` : 'Sin patente registrada'}</span>` : '<span>Agregá tu auto y empezá a escribir su historia.</span>'}</div><div class="vehicle-km">${icon('gauge')}<strong>${number(car.km)}</strong><span>km recorridos</span></div></div><div class="vehicle-art">${carArtwork(car)}</div><button class="hero-edit" data-action="edit-car">${icon('edit')} ${configured ? 'Editar vehículo' : 'Configurar mi vehículo'}</button><span class="hero-caption">${configured ? `${esc(vehicleAppearance(car).drawingLabel)} · ILUSTRACIÓN` : 'LISTO PARA LO QUE VIENE ↗'}</span></section>`;
}
function stats() {
  const entries = current().entries, latest = sortEntries(entries)[0], sum = entries.reduce((total, e) => total + (e.cost || 0), 0), hasCost = entries.some(e => e.cost !== null);
  return `<section class="stats" aria-label="Resumen del historial"><div class="stat"><div><span class="stat-label">Trabajos registrados</span><div class="stat-value">${String(entries.length).padStart(2,'0')}</div><div class="stat-foot">Cada cuidado cuenta</div></div><span class="stat-icon">${icon('wrench')}</span></div><div class="stat"><div><span class="stat-label">Último trabajo</span><div class="stat-value small">${latest ? dateLabel(latest.date,{day:'2-digit',month:'short'}) : 'Por empezar'}</div><div class="stat-foot">${latest ? `${number(latest.km)} km · ${esc(CATEGORIES[latest.category])}` : 'Sumá tu primer registro'}</div></div><span class="stat-icon">${icon('calendar')}</span></div><div class="stat"><div><span class="stat-label">Inversión en tu auto</span><div class="stat-value small">${hasCost ? money(sum) : '$ —'}</div><div class="stat-foot">${hasCost ? `${entries.filter(e=>e.cost!==null).length} trabajos con costo · ARS` : 'Los costos son opcionales · ARS'}</div></div><span class="stat-icon">${icon('wallet')}</span></div></section>`;
}
function historyPage() {
  return `${hero()}${stats()}<section aria-label="Historial de trabajos"><div class="history-header"><h2 class="section-title">Historial de cuidados <span class="count-badge">${current().entries.length}</span></h2><select class="sort-select" id="sort-entries" aria-label="Ordenar historial"><option value="newest">Más recientes primero</option><option value="oldest">Más antiguos primero</option><option value="km">Mayor kilometraje</option></select></div><div class="toolbar"><div class="search-box">${icon('search')}<input id="search-entries" type="search" placeholder="Buscar en tu historial…" aria-label="Buscar por trabajo, notas, kilómetros o taller" value="${esc(query)}"></div><div class="filter-tabs" role="group" aria-label="Filtrar por tipo de trabajo">${[['todos','Todos'],...Object.entries(CATEGORIES).filter(([k])=>k!=='otro')].map(([key,label])=>`<button class="filter ${category===key?'active':''}" data-filter="${key}" aria-pressed="${category===key}">${label}</button>`).join('')}</div></div><div class="timeline" id="timeline"></div></section>`;
}
function entryCard(e) {
  return `<article class="entry-card" data-entry="${esc(e.id)}" tabindex="0" role="button" aria-label="Ver ${esc(e.title)}"><span class="entry-icon ${e.category}">${icon(categoryIcon(e.category))}</span><div class="entry-main"><div class="entry-title-row"><h3 class="entry-title">${esc(e.title)}</h3><span class="category-pill ${e.category}">${CATEGORIES[e.category]}</span></div><div class="entry-meta"><span>${icon('calendar')}${dateLabel(e.date)}</span><span>${icon('clock')}${e.time} h</span><span>${icon('gauge')}${number(e.km)} km</span></div>${e.notes?`<p class="entry-description">${esc(e.notes)}</p>`:''}<div class="entry-footer"><span>${e.attachments.length?`<span class="attachment-badge">${icon('paperclip')}${e.attachments.length} ${e.attachments.length===1?'adjunto':'adjuntos'}</span>`:''}</span><span class="entry-workshop">${esc(e.workshop)}</span></div></div><div class="entry-side"><span class="entry-cost ${e.cost===null?'empty':''}">${e.cost===null?'Sin costo':money(e.cost)}</span><span class="entry-open">${icon('arrow')}</span></div></article>`;
}
function renderTimeline() {
  const entries = sortEntries(filterEntries(current().entries,query,category),sort); let lastGroup='';
  $('#timeline').innerHTML = entries.length ? entries.map(e => {
    const group = sort==='km' ? '' : e.date.slice(0,7); let heading='';
    if (group !== lastGroup) { lastGroup=group; heading=`<div class="month-heading">${dateLabel(e.date,{month:'long',year:'numeric'}).toUpperCase()}</div>`; }
    return heading+entryCard(e);
  }).join('') : current().entries.length ? `<div class="empty-state"><span class="empty-symbol">${icon('search')}</span><h3>No encontramos registros</h3><p>Probá con otra búsqueda o cambiá el tipo de trabajo.</p><button class="button secondary" data-action="clear-filters">Limpiar filtros</button></div>` : `<div class="empty-state"><span class="empty-symbol">${icon('history')}</span><h3>Toda gran historia empieza con un registro</h3><p>Ese cambio de aceite, las cubiertas nuevas, una pequeña reparación.<br>Guardá cada cuidado para tenerlo siempre a mano.</p><div class="empty-actions"><button class="button primary" data-action="new-entry">${icon('plus')} Mi primer registro</button><button class="text-button" data-action="start-demo">Ver un ejemplo ${icon('arrow')}</button></div></div>`;
}
function carPage() {
  const car=current().car;
  return `${hero()}<section class="car-details"><div class="history-header"><h3>Los datos de tu vehículo</h3><button class="text-button" data-action="edit-car">${icon('edit')} Editar datos</button></div><dl class="detail-grid">${[['Marca',car.make],['Modelo',car.model],['Año',car.year],['Patente',car.plate],['Kilometraje actual',`${number(car.km)} km`],['Trabajos registrados',current().entries.length]].map(([key,value])=>`<div><dt>${key}</dt><dd>${value!==''?esc(value):'Por completar'}</dd></div>`).join('')}</dl></section><div class="storage-note">${icon('shield')}<div><h3>Tu garage, en tu cuenta</h3><p>Los datos y adjuntos de este vehículo son privados de tu cuenta. Ingresá desde otro dispositivo para encontrarlos.</p><button class="text-button" data-action="backup">Descargar mi copia ${icon('arrow')}</button></div></div>`;
}
function attachmentsPage() {
  const files = sortEntries(current().entries).flatMap(e=>e.attachments.map(f=>({f,e})));
  if (!files.length) return `<div class="empty-state"><span class="empty-symbol">${icon('paperclip')}</span><h3>Los detalles también hacen historia</h3><p>Las fotos y comprobantes que adjuntes a tus trabajos<br>van a aparecer acá, todos juntos.</p><button class="button primary" data-action="new-entry">${icon('plus')} Registrar un trabajo</button></div>`;
  return `<p class="files-summary">${files.length} ${files.length===1?'archivo guardado':'archivos guardados'} · Fotos, comprobantes y documentos de tu auto</p><section class="files-grid" aria-label="Adjuntos guardados">${files.map(({f,e})=>`<article class="file-card"><button class="file-preview" data-download="${esc(f.id)}" aria-label="Descargar ${esc(f.name)}">${isImage(f)?`<img src="${fileURL(f)}" alt="${esc(f.name)}" loading="lazy">`:icon('file')}</button><div class="file-info"><h3 title="${esc(f.name)}">${esc(f.name)}</h3><p>${dateLabel(e.date)} · ${fileSize((f.blob?.size ?? f.size))}</p><button data-view="${esc(e.id)}">Ver registro ${icon('arrow')}</button></div></article>`).join('')}</section>`;
}
function render() {
  if(!account)return;
  revokeURLs();
  const titles={garage:['Tu garage','Todos tus vehículos y sus historias, en un solo lugar.'],historial:['Tu auto, su historia','Todos los cuidados de tu auto, en un solo lugar.'],auto:['Tu compañero de camino','Los datos de tu vehículo, siempre a mano.'],adjuntos:['Cada detalle, guardado','Fotos, facturas y comprobantes de tus trabajos.']};
  $('#page-heading').innerHTML=`${titles[page][0]}<span>.</span>`;
  $('#page-subtitle').textContent=titles[page][1];
  $('#breadcrumb-page').textContent={garage:'Mis vehículos',historial:'Historial',auto:'Vehículo',adjuntos:'Adjuntos'}[page];
  document.querySelectorAll('[data-page]').forEach(el=>{const active=el.dataset.page===page;el.classList.toggle('active',active);if(active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
  $('#nav-count').textContent=current().entries.length;
  $('#vehicle-count').textContent=String(vehicles.length).padStart(2,'0');
  $('#account-name').textContent=account.name;
  $('#vehicle-select').innerHTML=vehicles.length?vehicles.map(v=>`<option value="${esc(v.id)}">${esc(v.make)} ${esc(v.model)}${v.plate?' · '+esc(v.plate):''}</option>`).join(''):'<option value="">Todavía no agregaste vehículos</option>';
  $('#vehicle-select').value=state.id||'';$('#vehicle-select').disabled=!vehicles.length||!!demo;
  $('#new-entry').hidden=page==='garage'||(!state.id&&!demo);$('#new-vehicle').hidden=page!=='garage';
  $('#export-data').disabled=!state.id&&!demo;
  $('#demo-banner').hidden=!demo;
  $('#page-content').innerHTML=page==='garage'?garagePage():page==='historial'?historyPage():page==='auto'?carPage():attachmentsPage();
  if(page==='historial'){ $('#sort-entries').value=sort; renderTimeline(); }
}
function readPage(){const hash=location.hash.slice(1);page=['garage','historial','auto','adjuntos'].includes(hash)?hash:'garage';if(!state.id&&!demo)page='garage';render();}
function openEntry(id=null) {
  if(!state.id&&!demo){toast('Agregá o elegí un vehículo para registrar un trabajo.');location.hash='garage';return;}
  const form=$('#entry-form');form.reset();editingId=id;$('#entry-error').hidden=true;
  const e=id?current().entries.find(e=>e.id===id):null;
  if(id&&!e)return;
  const values=e||{...localNow(),title:'',category:'mantenimiento',km:current().car.km,cost:'',notes:'',workshop:''};
  ['title','category','km','date','time','cost','workshop','notes'].forEach(key=>form.elements.namedItem(key).value=values[key]??'');
  pendingFiles=[...(e?.attachments||[])];$('#attachment-input').value='';renderPending();
  $('#editor-title').textContent=e?'Editar registro':'Nuevo registro';
  $('#save-entry').innerHTML=`${e?'Guardar cambios':'Guardar registro'} ${icon('arrow')}`;
  $('#editor-dialog').showModal();
}
function fileSize(bytes) { return bytes>=1024*1024?`${(bytes/1024/1024).toLocaleString('es-AR',{maximumFractionDigits:1})} MB`:`${Math.max(1,Math.ceil(bytes/1024))} KB`; }
function renderPending(){ $('#pending-files').innerHTML=pendingFiles.map(f=>`<div class="pending-file">${icon('file')}<span>${esc(f.name)}</span><small>${fileSize((f.blob?.size ?? f.size))}</small><button type="button" data-remove-file="${esc(f.id)}" aria-label="Quitar ${esc(f.name)}">${icon('x')}</button></div>`).join(''); }
function addFiles(files) {
  $('#entry-error').hidden=true;
  if(pendingFiles.length+files.length>MAX_FILES){showError('#entry-error','Podés adjuntar hasta 10 archivos por registro.');return;}
  if(files.some(f=>f.size>MAX_FILE_SIZE)){showError('#entry-error','Cada archivo puede pesar hasta 15 MB.');return;}
  for(const file of files)pendingFiles.push({id:crypto.randomUUID(),name:file.name,type:file.type||'application/octet-stream',blob:file});
  renderPending();
}
async function submitEntry(event) {
  event.preventDefault();if(saveBusy)return;saveBusy=true;$('#save-entry').disabled=true;$('#entry-error').hidden=true;
  try {
    const f=new FormData(event.target),cost=f.get('cost').trim();
    const entry=validateEntry({id:editingId||crypto.randomUUID(),title:f.get('title').trim(),category:f.get('category'),km:Number(f.get('km')),date:f.get('date'),time:f.get('time'),cost:cost===''?null:Number(cost),workshop:f.get('workshop').trim(),notes:f.get('notes').trim(),attachments:[...pendingFiles]});
    const s=current(),entries=editingId?s.entries.map(e=>e.id===editingId?entry:e):[...s.entries,entry];
    await persist({...s,car:{...s.car,km:Math.max(s.car.km,entry.km)},entries});
    $('#editor-dialog').close();query='';category='todos';sort='newest';render();toast(demo?'Registro guardado en el ejemplo.':editingId?'Cambios guardados.':'Un cuidado más, guardado en tu historia.');
  }catch(error){showError('#entry-error',error.message);}finally{saveBusy=false;$('#save-entry').disabled=false;}
}
function renderCarPreview() {
  const form = $('#car-form');
  const car = { make: form.elements.namedItem('make').value, model: form.elements.namedItem('model').value, year: form.elements.namedItem('year').value, type: form.elements.namedItem('type').value, body: form.elements.namedItem('body').value };
  const appearance = vehicleAppearance(car);
  $('#body-type-label').hidden=!['car','suv','pickup','van'].includes(car.type);
  const key = `${appearance.profileId}:${appearance.stage}:${appearance.trim}`;
  const art = $('#car-preview-art');
  if (art.dataset.drawingKey !== key) { art.innerHTML = carArtwork(car); art.dataset.drawingKey = key; }
  art.querySelector('svg').setAttribute('aria-label', `Dibujo animado de ${[car.make, car.model, car.year].filter(Boolean).join(' ') || 'tu auto'}`);
  $('#car-preview-label').textContent = appearance.stage === 0 ? 'Primero, la marca' : appearance.stage === 1 ? 'Ahora, el modelo' : appearance.drawingLabel;
  $('#car-preview-help').textContent = appearance.stage < 2
    ? 'El auto se va dibujando mientras completás marca, modelo y año.'
    : appearance.profile
      ? appearance.stage === 3 ? 'Dibujo del modelo y generación seleccionados. Los cambios se ven antes de guardar.' : 'Dibujo del modelo seleccionado. Completá el año para ajustar su generación y terminaciones.'
      : 'Este modelo todavía no tiene un dibujo propio: se muestra una base por carrocería.';
}
function openCar(add=false){
  creatingCar=add&&!demo;const f=$('#car-form');f.reset();$('#car-error').hidden=true;
  const car=creatingCar?freshState().car:current().car;
  for(const key of ['make','model','year','plate','km'])f.elements.namedItem(key).value=car[key];
  f.elements.namedItem('type').value=car.type||'car';f.elements.namedItem('body').value=car.body||'auto';
  $('#car-editor-title').textContent=creatingCar?'Agregar vehículo':'Mi vehículo';renderCarPreview();$('#car-dialog').showModal();
}
async function submitCar(event){
  event.preventDefault();if(saveBusy)return;saveBusy=true;const submit=event.target.querySelector('[type=submit]');submit.disabled=true;$('#car-error').hidden=true;
  try{const f=new FormData(event.target);const car=validateCar({make:f.get('make').trim(),model:f.get('model').trim(),year:f.get('year')===''?'':Number(f.get('year')),plate:f.get('plate').trim().toUpperCase(),km:Number(f.get('km')),body:f.get('body'),type:f.get('type')});
    if(!car.make||!car.model)throw new Error('Completá la marca y el modelo del auto.');
    if(!creatingCar&&current().entries.some(e=>e.km>car.km))throw new Error('El kilometraje actual no puede ser menor al de un trabajo registrado.');
    if(creatingCar){state=await cloud.create(car);vehicles.push({id:state.id,...state.car,entryCount:0,revision:state.revision});rememberedVehicle(state.id);page='auto';location.hash='auto';}
    else await persist({...current(),car});
    $('#car-dialog').close();render();toast(creatingCar?'Vehículo agregado a tu garage.':'Los datos del vehículo están actualizados.');creatingCar=false;
  }catch(error){showError('#car-error',error.message);}finally{saveBusy=false;submit.disabled=false;}
}
function showDetail(id){
  const e=current().entries.find(e=>e.id===id);if(!e)return;
  const dialog=$('#detail-dialog');
  dialog.innerHTML=`<div class="modal-heading"><div><div class="eyebrow">UN CAPÍTULO DE TU HISTORIA</div><h2>${esc(e.title)}</h2></div><button data-close class="icon-button" aria-label="Cerrar">${icon('x')}</button></div><div class="modal-body"><div class="record-summary"><span class="entry-icon ${e.category}">${icon(categoryIcon(e.category))}</span><span class="category-pill ${e.category}">${CATEGORIES[e.category]}</span></div><dl class="record-details"><div><dt>Fecha y hora del trabajo</dt><dd>${dateLabel(e.date)} · ${e.time} h</dd></div><div><dt>Kilometraje del momento</dt><dd>${number(e.km)} km</dd></div><div><dt>Costo total · ARS</dt><dd>${e.cost===null?'Sin costo registrado':new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS'}).format(e.cost)}</dd></div><div><dt>Taller o responsable</dt><dd>${esc(e.workshop)||'Sin especificar'}</dd></div></dl>${e.notes?`<h3 class="detail-section-title">Notas del trabajo</h3><p class="record-notes">${esc(e.notes)}</p>`:'<p class="no-notes">Este registro no tiene notas adicionales.</p>'}${e.attachments.length?`<h3 class="detail-section-title">Adjuntos (${e.attachments.length})</h3><div class="record-files">${e.attachments.map(f=>`<div class="record-file">${isImage(f)?`<img src="${fileURL(f)}" alt="${esc(f.name)}">`:icon('file')}<div><strong>${esc(f.name)}</strong><small>${fileSize((f.blob?.size ?? f.size))}</small></div><button data-download="${esc(f.id)}">Descargar ${icon('download')}</button></div>`).join('')}</div>`:''}</div><div class="modal-actions"><button class="delete-record" data-delete="${esc(e.id)}">${icon('trash')} Eliminar</button><button data-close class="button secondary">Cerrar</button><button class="button primary" data-edit="${esc(e.id)}">${icon('edit')} Editar registro</button></div>`;
  dialog.showModal();
}
function confirmAction(title,message,label='Eliminar'){
  $('#confirm-title').textContent=title;$('#confirm-message').textContent=message;$('#confirm-ok').textContent=label;
  const dialog=$('#confirm-dialog');dialog.returnValue='';dialog.showModal();
  return new Promise(resolve=>{dialog.addEventListener('close',()=>resolve(dialog.returnValue==='yes'),{once:true});});
}
async function deleteEntry(id){
  if(!await confirmAction('¿Eliminar este registro?','Se eliminarán las notas y sus adjuntos. Esta acción no se puede deshacer.'))return;
  try{await persist({...current(),entries:current().entries.filter(e=>e.id!==id)});$('#detail-dialog').close();render();toast('Registro eliminado.');}catch(error){toast(error.message,true);}
}
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
async function downloadFile(id){const file=current().entries.flatMap(e=>e.attachments).find(f=>f.id===id);if(!file)return;try{download(await cloud.fileBlob(file),file.name);}catch(error){toast(error.message,true);}}
function openBackup(){ $('#backup-error').hidden=true;$('#import-data').value='';$('#backup-dialog').showModal(); }
async function exportData(){const btn=$('#export-data');btn.disabled=true;$('#backup-error').hidden=true;try{const text=await serializeBackup(await cloud.materialize(current()));download(new Blob([text],{type:'application/json'}),`bitacora-${demo?'ejemplo-':''}${localNow().date}.json`);toast('Copia preparada con todos tus registros y adjuntos.');}catch(error){showError('#backup-error',error.message);}finally{btn.disabled=false;}}
async function importData(event){
  const file=event.target.files[0];if(!file||saveBusy)return;$('#backup-error').hidden=true;
  try{
    if(file.size>200*1024*1024)throw new Error('La copia supera el límite de 200 MB.');
    const restored=deserializeBackup(await file.text());
    if(!await confirmAction(demo?'¿Restaurar el ejemplo?':'¿Importar este vehículo?',`Contiene ${restored.entries.length} registros. ${demo?'Reemplazará los datos del ejemplo.':'Se agregará a tu garage como un vehículo nuevo, con todos sus adjuntos.'}`,'Importar'))return;
    saveBusy=true;
    if(demo)demo=restored;
    else{state=await cloud.importVehicle(restored,account.id);rememberedVehicle(state.id);await accountGarage();location.hash='historial';}
    $('#backup-dialog').close();query='';category='todos';render();toast('Copia importada con sus registros y adjuntos.');
  }catch(error){showError('#backup-error',error.message||'No se pudo importar la copia.');}finally{saveBusy=false;event.target.value='';}
}

function startDemo(){
  const receipt=new Blob(['BITÁCORA · COMPROBANTE DE EJEMPLO\nCambio de aceite y filtros\nEste archivo es una demostración, no una factura real.'],{type:'text/plain'});
  demo={version:1,car:{make:'Volkswagen',model:'Golf 1.4 TSI',year:2018,plate:'AB 123 CD',km:84520},entries:[
    {id:'demo-1',title:'Cambio de aceite y filtros',category:'mantenimiento',date:'2026-10-28',time:'10:30',km:84520,cost:98500,workshop:'Taller de confianza',notes:'Aceite sintético 5W-30. Se cambiaron el filtro de aceite y el filtro de aire. Todo listo para seguir sumando kilómetros.',attachments:[{id:'demo-file',name:'Comprobante de ejemplo.txt',type:'text/plain',blob:receipt}]},
    {id:'demo-2',title:'Pastillas de freno delanteras',category:'reparacion',date:'2026-10-12',time:'16:15',km:83840,cost:125000,workshop:'Frenos del barrio',notes:'Se reemplazaron las pastillas delanteras y se revisó el estado de los discos. Desapareció el ruido al frenar.',attachments:[]},
    {id:'demo-3',title:'Alineación y balanceo',category:'mantenimiento',date:'2026-09-20',time:'09:00',km:82450,cost:42000,workshop:'Gomería Central',notes:'Se alinearon las cuatro ruedas y se corrigió el balanceo. El volante quedó centrado.',attachments:[]},
    {id:'demo-4',title:'Revisión antes de salir a la ruta',category:'revision',date:'2026-09-05',time:'11:45',km:81200,cost:null,workshop:'En casa',notes:'Revisé presión de neumáticos, luces, refrigerante y nivel de aceite.',attachments:[]}
  ]};query='';category='todos';render();window.scrollTo({top:0,behavior:'smooth'});
}

icons();
$('#vehicle-type').innerHTML=Object.entries(VEHICLE_TYPES).map(([value,label])=>`<option value="${value}">${label}</option>`).join('');
$('#auth-login').addEventListener('click',()=>authTab('login'));$('#auth-register').addEventListener('click',()=>authTab('register'));
$('#auth-form').addEventListener('submit',authenticate);$('#sign-out').addEventListener('click',logout);$('#boot-retry').addEventListener('click',boot);
$('#vehicle-select').addEventListener('change',event=>selectVehicle(event.target.value));
$('#new-vehicle').addEventListener('click',()=>openCar(true));
window.addEventListener('session-expired',()=>{clearAccount();showError('#auth-error','Tu sesión venció. Ingresá de nuevo para continuar.');});
$('#car-body').innerHTML = '<option value="auto">Automática según el modelo</option>' + Object.entries(BODY_TYPES).map(([value,label])=>`<option value="${value}">${label}</option>`).join('');
$('#car-form').addEventListener('input', event => { if (['make','model','year','body','type'].includes(event.target.name)) renderCarPreview(); });
$('#car-body').addEventListener('change', renderCarPreview);
$('#today').textContent=new Intl.DateTimeFormat('es-AR',{day:'numeric',month:'long',year:'numeric'}).format(new Date());
window.addEventListener('hashchange',readPage);
$('#new-entry').addEventListener('click',()=>openEntry());
$('#entry-form').addEventListener('submit',submitEntry);
$('#car-form').addEventListener('submit',submitCar);
$('#attachment-input').addEventListener('change',e=>{addFiles([...e.target.files]);e.target.value='';});
const zone=$('#upload-zone');
['dragenter','dragover'].forEach(name=>zone.addEventListener(name,e=>{e.preventDefault();zone.classList.add('dragover');}));
['dragleave','drop'].forEach(name=>zone.addEventListener(name,e=>{e.preventDefault();zone.classList.remove('dragover');}));
zone.addEventListener('drop',e=>addFiles([...e.dataTransfer.files]));
$('#backup-button').addEventListener('click',openBackup);
$('#footer-backup').addEventListener('click',openBackup);
$('#export-data').addEventListener('click',exportData);
$('#import-data').addEventListener('change',importData);
$('#exit-demo').addEventListener('click',()=>{demo=null;query='';category='todos';render();toast('Volviste a tu garage personal.');});
$('#confirm-ok').addEventListener('click',()=>$('#confirm-dialog').close('yes'));
$('#confirm-cancel').addEventListener('click',()=>$('#confirm-dialog').close('no'));
document.addEventListener('input',e=>{if(e.target.id==='search-entries'){query=e.target.value;renderTimeline();}});
document.addEventListener('change',e=>{if(e.target.id==='sort-entries'){sort=e.target.value;renderTimeline();}});
document.addEventListener('keydown',e=>{const card=e.target.closest('[data-entry]');if(card&&(e.key==='Enter'||e.key===' ')){e.preventDefault();showDetail(card.dataset.entry);}});
document.addEventListener('click',e=>{
  const close=e.target.closest('[data-close]');if(close){close.closest('dialog').close();return;}
  const remove=e.target.closest('[data-remove-file]');if(remove){pendingFiles=pendingFiles.filter(f=>f.id!==remove.dataset.removeFile);renderPending();return;}
  const filter=e.target.closest('[data-filter]');if(filter){category=filter.dataset.filter;document.querySelectorAll('[data-filter]').forEach(el=>{el.classList.toggle('active',el.dataset.filter===category);el.setAttribute('aria-pressed',el.dataset.filter===category);});renderTimeline();return;}
  const select=e.target.closest('[data-select-vehicle]');if(select){selectVehicle(select.dataset.selectVehicle);return;}
  const deleteCar=e.target.closest('[data-delete-vehicle]');if(deleteCar){deleteVehicle(deleteCar.dataset.deleteVehicle);return;}
  const action=e.target.closest('[data-action]')?.dataset.action;
  if(action==='new-vehicle')openCar(true);if(action==='import-legacy')importLegacy();
  if(action==='new-entry')openEntry();if(action==='edit-car')openCar();if(action==='backup')openBackup();if(action==='start-demo')startDemo();
  if(action==='clear-filters'){query='';category='todos';render();}
  const edit=e.target.closest('[data-edit]');if(edit){$('#detail-dialog').close();openEntry(edit.dataset.edit);return;}
  const del=e.target.closest('[data-delete]');if(del){deleteEntry(del.dataset.delete);return;}
  const file=e.target.closest('[data-download]');if(file){downloadFile(file.dataset.download);return;}
  const view=e.target.closest('[data-view]');if(view){showDetail(view.dataset.view);return;}
  const card=e.target.closest('[data-entry]');if(card)showDetail(card.dataset.entry);
});
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',e=>{if(e.target===dialog){const rect=dialog.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)dialog.close();}}));
try{db=await openDatabase();const stored=await loadState(db);if(stored.car.make||stored.car.model||stored.entries.length)legacy=stored;}catch{legacy=null;}
await boot();
