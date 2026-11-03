import { test } from 'node:test';
import assert from 'node:assert/strict';
import { freshState, validateEntry, validDate, deserializeBackup, sortEntries, filterEntries, escapeHTML } from '../dist/core.js';

const entry = () => ({id:'one',title:'Cambio de aceite',category:'mantenimiento',date:'2026-11-03',time:'14:30',km:42000,cost:45000,workshop:'Mecánica José',notes:'Aceite 5W-30',attachments:[]});
const backup = () => ({format:'bitacora-auto',version:1,car:freshState().car,entries:[entry()]});
test('acepta fecha local sin convertirla de zona horaria y rechaza fechas imposibles',()=>{
  assert.equal(validDate('2024-02-29','23:59'),true);
  for(const [date,time] of [['2026-02-29','10:00'],['2026-04-31','10:00'],['2026-11-03','24:00'],['2026-11-03','12:60']])assert.equal(validDate(date,time),false);
});
test('no confunde costo cero con costo sin registrar y valida km',()=>{
  assert.equal(validateEntry({...entry(),cost:0}).cost,0);
  assert.equal(validateEntry({...entry(),cost:null}).cost,null);
  assert.throws(()=>validateEntry({...entry(),km:-1}));
  assert.throws(()=>validateEntry({...entry(),km:1.2}));
  assert.throws(()=>validateEntry({...entry(),cost:NaN}));
});
test('restaura exactamente el archivo binario y el kilometraje del historial',async()=>{
  const b=backup();b.entries[0].attachments=[{id:'file-1',name:'factura.pdf',type:'application/pdf',data:'data:application/pdf;base64,AAH+/0E='}];
  const restored=deserializeBackup(JSON.stringify(b));
  assert.deepEqual([...new Uint8Array(await restored.entries[0].attachments[0].blob.arrayBuffer())],[0,1,254,255,65]);
  assert.equal(restored.entries[0].attachments[0].name,'factura.pdf');
  assert.equal(restored.car.km,42000);
});
test('rechaza copias corruptas, identificadores repetidos y archivos inválidos',()=>{
  assert.throws(()=>deserializeBackup('{invalid'));
  assert.throws(()=>deserializeBackup('{"entries":[]}'));
  const b=backup();b.entries.push(entry());assert.throws(()=>deserializeBackup(JSON.stringify(b)));
  const c=backup();c.entries[0].attachments=[{id:'f',name:'x',type:'image/png',data:'javascript:alert(1)'}];assert.throws(()=>deserializeBackup(JSON.stringify(c)));
});
test('busca sin acentos por taller y notas y combina categoría',()=>{
  assert.equal(filterEntries([entry()],'jose','todos').length,1);
  assert.equal(filterEntries([entry()],'5w-30','mantenimiento').length,1);
  assert.equal(filterEntries([entry()],'jose','reparacion').length,0);
});
test('ordena por fecha y hora o kilometraje sin alterar el original',()=>{
  const a=entry(),b={...entry(),id:'two',time:'16:30',km:41000};const list=[a,b];
  assert.equal(sortEntries(list)[0].id,'two');assert.equal(sortEntries(list,'km')[0].id,'one');assert.equal(list[0].id,'one');
});
test('escapa contenido aportado por el usuario antes de insertarlo en la interfaz',()=>assert.equal(escapeHTML('<img src="x">&'), '&lt;img src=&quot;x&quot;&gt;&amp;'));
