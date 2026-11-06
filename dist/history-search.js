import {escapeHTML as esc} from './core.js';
import {icon} from './icons.js';

export function historySearch(id,targetId,query=''){
  return `<div class="history-search" role="search" aria-label="Buscar en el historial"><label for="${id}">Buscar en el historial</label><div class="search-box">${icon('search')}<input id="${id}" type="search" inputmode="search" enterkeyhint="search" autocomplete="off" spellcheck="false" placeholder="Trabajo, taller, fecha o kilómetros" aria-controls="${targetId}" aria-describedby="${id}-help ${id}-results" value="${esc(query)}"><button type="button" class="search-clear" data-history-clear="${id}" aria-label="Borrar búsqueda" ${query?'':'hidden'}>${icon('x')}</button></div><p id="${id}-help" class="search-help">También podés buscar en notas y nombres de adjuntos.</p></div>`;
}
export const historySearchResults=id=>`<p id="${id}-results" class="history-results" role="status" aria-live="polite" aria-atomic="true"></p>`;

export function updateHistorySearch(id,{query,shown,total,filtered}){
  const clear=document.querySelector(`[data-history-clear="${id}"]`);
  if(clear)clear.hidden=!query;
  const status=document.getElementById(`${id}-results`);
  if(status)status.textContent=filtered?`${shown} de ${total} registros coinciden con los filtros`:`${total} ${total===1?'registro en el historial':'registros en el historial'}`;
}

export function setupHistorySearch(id,onChange){
  function change(event){if(event.target.id===id&&!event.isComposing)onChange(event.target.value);}
  function clear(){const input=document.getElementById(id);if(!input)return;input.value='';onChange('');input.focus({preventScroll:true});}
  document.addEventListener('input',change);
  document.addEventListener('search',change,true);
  document.addEventListener('compositionend',change);
  document.addEventListener('keydown',event=>{if(event.target.id===id&&!event.isComposing&&event.key==='Escape'&&event.target.value){event.preventDefault();clear();}});
  document.addEventListener('click',event=>{if(event.target.closest(`[data-history-clear="${id}"]`))clear();});
}
