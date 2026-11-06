import {escapeHTML as esc,CATEGORIES,VEHICLE_TYPES,filterEntries,sortEntries} from './core.js';
import {icon,icons} from './icons.js';
import {carArtwork,vehicleAppearance} from './vehicle.js';
import {prepareIllustrations} from './vehicle-illustration.js';
import {historySearch,historySearchResults,updateHistorySearch,setupHistorySearch} from './history-search.js';

const $=selector=>document.querySelector(selector);
const number=value=>new Intl.NumberFormat('es-AR').format(value);
const money=value=>new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(value);
const date=(value,options={day:'2-digit',month:'short',year:'numeric'})=>new Intl.DateTimeFormat('es-AR',options).format(new Date(value+'T12:00:00'));
const categoryIcon=value=>({mantenimiento:'oil',reparacion:'wrench',mejora:'spark',revision:'check',otro:'wrench'})[value];
const isImage=file=>/^image\/(png|jpeg|webp|gif|avif|bmp)$/i.test(file.type);
const token=location.pathname.match(/^\/compartir\/([A-Za-z0-9_-]{43})\/?$/)?.[1];
let history=null,query='',category='todos',sort='newest';
const fileURL=(id,download=false)=>`/api/public/${encodeURIComponent(token)}/files/${encodeURIComponent(id)}${download?'?download=1':''}`;

function render(){
  const {car,entries}=history,name=[car.make,car.model].filter(Boolean).join(' '),latest=sortEntries(entries)[0];
  const total=entries.reduce((sum,entry)=>sum+(entry.cost||0),0),hasCost=entries.some(entry=>entry.cost!==null);
  document.title=`${name} · Historial compartido`;
  $('#public-content').innerHTML=`<section class="page-title"><div><div class="eyebrow">CADA KILÓMETRO CUENTA</div><h1>Una historia para compartir<span>.</span></h1><p>Consultá los cuidados de este vehículo, en un solo lugar.</p></div></section>
    <section class="vehicle-hero" aria-label="Datos del vehículo"><div class="vehicle-info"><div class="vehicle-label"><span></span> HISTORIAL COMPARTIDO</div><h2>${esc(name)}</h2><div class="vehicle-meta">${car.year?`<span>${car.year}</span><span>·</span>`:''}<span>${esc(VEHICLE_TYPES[car.type]||'Vehículo')}</span></div><div class="vehicle-km">${icon('gauge')}<strong>${number(car.km)}</strong><span>km recorridos</span></div></div><div class="vehicle-art">${carArtwork(car)}</div><span class="hero-caption">${esc(vehicleAppearance(car).drawingLabel)} · ILUSTRACIÓN</span></section>
    <section class="stats" aria-label="Resumen del historial"><div class="stat"><div><span class="stat-label">Trabajos registrados</span><div class="stat-value">${String(entries.length).padStart(2,'0')}</div><div class="stat-foot">Cada cuidado cuenta</div></div><span class="stat-icon">${icon('wrench')}</span></div><div class="stat"><div><span class="stat-label">Último trabajo</span><div class="stat-value small">${latest?date(latest.date,{day:'2-digit',month:'short'}):'Por empezar'}</div><div class="stat-foot">${latest?number(latest.km)+' km':'Sin registros todavía'}</div></div><span class="stat-icon">${icon('calendar')}</span></div><div class="stat"><div><span class="stat-label">Inversión registrada</span><div class="stat-value small">${hasCost?money(total):'$ —'}</div><div class="stat-foot">Costos declarados · ARS</div></div><span class="stat-icon">${icon('wallet')}</span></div></section>
    <section aria-label="Historial de trabajos"><div class="history-header"><h2 class="section-title">Historial de cuidados <span class="count-badge">${entries.length}</span></h2><select id="public-sort" class="sort-select" aria-label="Ordenar historial"><option value="newest">Más recientes primero</option><option value="oldest">Más antiguos primero</option><option value="km">Mayor kilometraje</option></select></div><div class="toolbar history-toolbar">${historySearch("public-search","public-timeline")}<div class="filter-tabs" role="group" aria-label="Filtrar por tipo de trabajo">${[['todos','Todos'],...Object.entries(CATEGORIES)].map(([key,label])=>`<button class="filter ${key==='todos'?'active':''}" data-public-filter="${key}" aria-pressed="${key==='todos'}">${label}</button>`).join('')}</div></div>${historySearchResults("public-search")}<div class="timeline" id="public-timeline"></div></section>
    <p class="shared-disclosure">${icon('shield')} Este enlace permite consultar el historial actualizado. ${history.attachmentsShared?'Incluye los adjuntos que el titular decidió compartir.':'Las fotos y comprobantes permanecen privados.'}</p>`;
  $('#public-status').hidden=true;$('#public-content').hidden=false;
  prepareIllustrations($('#public-content'));renderTimeline();
}
function renderTimeline(){
  const entries=sortEntries(filterEntries(history.entries,query,category),sort);let month='';
  updateHistorySearch('public-search',{query,shown:entries.length,total:history.entries.length,filtered:Boolean(query.trim())||category!=='todos'});
  $('#public-timeline').innerHTML=entries.length?entries.map(entry=>{
    const group=sort==='km'?'':entry.date.slice(0,7);let heading='';
    if(group!==month){month=group;heading=`<div class="month-heading">${date(entry.date,{month:'long',year:'numeric'}).toUpperCase()}</div>`;}
    return heading+`<article class="entry-card" data-public-entry="${esc(entry.id)}" tabindex="0" role="button" aria-label="Ver ${esc(entry.title)}"><span class="entry-icon ${entry.category}">${icon(categoryIcon(entry.category))}</span><div class="entry-main"><div class="entry-title-row"><h3 class="entry-title">${esc(entry.title)}</h3><span class="category-pill ${entry.category}">${esc(CATEGORIES[entry.category])}</span></div><div class="entry-meta"><span>${icon('calendar')}${date(entry.date)}</span><span>${icon('clock')}${entry.time} h</span><span>${icon('gauge')}${number(entry.km)} km</span></div>${entry.notes?`<p class="entry-description">${esc(entry.notes)}</p>`:''}<div class="entry-footer"><span>${entry.attachments.length?`<span class="attachment-badge">${icon('paperclip')}${entry.attachments.length} adjuntos</span>`:''}</span><span class="entry-workshop">${esc(entry.workshop)}</span></div></div><div class="entry-side"><span class="entry-cost ${entry.cost===null?'empty':''}">${entry.cost===null?'Sin costo':money(entry.cost)}</span><span class="entry-open">${icon('arrow')}</span></div></article>`;
  }).join(''):`<div class="empty-state"><span class="empty-symbol">${icon('history')}</span><h3>${history.entries.length?'No encontramos registros':'Todavía no hay registros para mostrar'}</h3><p>${history.entries.length?'Probá con otra búsqueda o categoría.':'Los cuidados registrados por el titular aparecerán acá.'}</p></div>`;
}
function showDetail(id){
  const entry=history?.entries.find(item=>item.id===id);if(!entry)return;
  const dialog=$('#public-detail');
  dialog.innerHTML=`<div class="modal-heading"><div><div class="eyebrow">UN CAPÍTULO DE SU HISTORIA</div><h2>${esc(entry.title)}</h2></div><button type="button" class="icon-button" data-public-close aria-label="Cerrar">${icon('x')}</button></div><div class="modal-body"><div class="record-summary"><span class="entry-icon ${entry.category}">${icon(categoryIcon(entry.category))}</span><span class="category-pill ${entry.category}">${esc(CATEGORIES[entry.category])}</span></div><dl class="record-details"><div><dt>Fecha y hora del trabajo</dt><dd>${date(entry.date)} · ${entry.time} h</dd></div><div><dt>Kilometraje del momento</dt><dd>${number(entry.km)} km</dd></div><div><dt>Costo total · ARS</dt><dd>${entry.cost===null?'Sin costo registrado':money(entry.cost)}</dd></div><div><dt>Taller o responsable</dt><dd>${esc(entry.workshop)||'Sin especificar'}</dd></div></dl>${entry.notes?`<h3 class="detail-section-title">Notas del trabajo</h3><p class="record-notes">${esc(entry.notes)}</p>`:''}${entry.attachments.length?`<h3 class="detail-section-title">Adjuntos (${entry.attachments.length})</h3><div class="record-files">${entry.attachments.map(file=>`<div class="record-file">${isImage(file)?`<img src="${fileURL(file.id)}" alt="${esc(file.name)}" loading="lazy">`:icon('file')}<div><strong title="${esc(file.name)}">${esc(file.name)}</strong><small>${number(Math.ceil(file.size/1024))} KB</small></div><a class="record-download" href="${fileURL(file.id,true)}" rel="noreferrer">Descargar ${icon('download')}</a></div>`).join('')}</div>`:''}</div><div class="modal-actions"><span class="read-only-note">${icon('shield')} Solo lectura</span><button type="button" class="button secondary" data-public-close>Cerrar</button></div>`;
  dialog.showModal();
}

icons();
setupHistorySearch('public-search',value=>{if(query!==value){query=value;renderTimeline();}});
document.addEventListener('change',event=>{if(event.target.id==='public-sort'){sort=event.target.value;renderTimeline();}});
document.addEventListener('click',event=>{
  if(event.target.closest('[data-public-close]')){$('#public-detail').close();return;}
  const filter=event.target.closest('[data-public-filter]');
  if(filter){category=filter.dataset.publicFilter;document.querySelectorAll('[data-public-filter]').forEach(button=>{const active=button.dataset.publicFilter===category;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});renderTimeline();return;}
  const card=event.target.closest('[data-public-entry]');if(card)showDetail(card.dataset.publicEntry);
});
document.addEventListener('keydown',event=>{const card=event.target.closest('[data-public-entry]');if(card&&['Enter',' '].includes(event.key)){event.preventDefault();showDetail(card.dataset.publicEntry);}});
$('#public-detail').addEventListener('click',event=>{if(event.target===$('#public-detail')){const rect=event.target.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)event.target.close();}});
try{
  if(!token)throw new Error('Este enlace no está disponible o fue revocado.');
  const response=await fetch(`/api/public/${encodeURIComponent(token)}`,{credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer'});
  if(!response.ok)throw new Error(response.status===404?'Este enlace no está disponible o fue revocado.':'No pudimos abrir el historial. Volvé a intentar en unos minutos.');
  history=await response.json();render();
}catch(error){
  document.title='Enlace no disponible · Bitácora';
  $('#public-status').setAttribute('role','alert');
  $('#public-status').innerHTML=`${icon('link')}<h1>No pudimos abrir esta historia</h1><p>${esc(error.message)}</p><a class="button secondary" href="/">Ir a Bitácora ${icon('arrow')}</a>`;
}
