import {randomUUID} from 'node:crypto';
import {database, transaction} from './db.js';
import {validateCar, validateEntry, MAX_FILE_SIZE} from '../dist/core.js';

export function fail(message,status=400) { const error=new Error(message); error.status=status; throw error; }
export function uuid(value) { return typeof value==='string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value); }
export function carData(raw) {
  const car={type:raw?.type??'car',make:raw?.make,model:raw?.model,year:raw?.year,plate:raw?.plate,km:raw?.km,body:raw?.body??'auto'};
  try{validateCar(car);}catch(error){fail(error.message);}
  if(!car.make.trim()||!car.model.trim())fail('Completá la marca y el modelo.');
  return {...car,make:car.make.trim(),model:car.model.trim(),plate:car.plate.trim().toUpperCase()};
}
export function fromVehicle(row) { return {type:row.type,make:row.make,model:row.model,year:row.year??'',plate:row.plate,km:row.km,body:row.body}; }
export async function ownedVehicle(userId,id,client=database(),lock=false) {
  if(!uuid(id))fail('Vehículo no encontrado.',404);
  const {rows}=await client.query(`SELECT * FROM vehicles WHERE id=$1 AND user_id=$2${lock?' FOR UPDATE':''}`,[id,userId]);
  if(!rows[0])fail('Vehículo no encontrado.',404);
  return rows[0];
}
export async function listVehicles(userId) {
  const {rows}=await database().query('SELECT v.*,count(e.id)::int AS entry_count FROM vehicles v LEFT JOIN maintenance_entries e ON e.vehicle_id=v.id AND e.user_id=v.user_id WHERE v.user_id=$1 GROUP BY v.id ORDER BY v.created_at,v.id',[userId]);
  return rows.map(v=>({id:v.id,...fromVehicle(v),entryCount:v.entry_count,revision:v.revision}));
}
export async function createVehicle(userId,raw) {
  const car=carData(raw.car);
  const id=raw.id??randomUUID();if(!uuid(id))fail('Identificador inválido.');
  await database().query('INSERT INTO vehicles(id,user_id,type,make,model,year,plate,km,body) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(id) DO NOTHING',[id,userId,car.type,car.make,car.model,car.year||null,car.plate,car.km,car.body]);
  await ownedVehicle(userId,id);
  return loadVehicle(userId,id);
}
export async function loadVehicle(userId,id) {
  return transaction(async client=>{
  const v=await ownedVehicle(userId,id,client,true);
  return vehicleHistory(client,v);
  });
}
export async function vehicleHistory(client,v) {
  const {id,user_id:userId}=v;
  const {rows:entries}=await client.query('SELECT *,to_char(date,\'YYYY-MM-DD\') AS day FROM maintenance_entries WHERE vehicle_id=$1 AND user_id=$2 ORDER BY date DESC,time DESC',[id,userId]);
  const {rows:files}=await client.query('SELECT id,entry_id,name,mime,size FROM vehicle_files WHERE vehicle_id=$1 AND user_id=$2 AND entry_id IS NOT NULL AND uploaded=true',[id,userId]);
  return {version:1,id,revision:v.revision,car:fromVehicle(v),entries:entries.map(e=>({id:e.id,title:e.title,category:e.category,date:e.day,time:e.time,km:e.km,cost:e.cost===null?null:Number(e.cost),workshop:e.workshop,notes:e.notes,attachments:files.filter(f=>f.entry_id===e.id).map(f=>({id:f.id,name:f.name,type:f.mime,size:f.size,remote:true}))}))};
}
export async function storeVehicle(userId,id,raw) {
  const car=carData(raw.car);
  if(!Number.isInteger(raw.revision)||!Array.isArray(raw.entries)||raw.entries.length>5000)fail('El historial recibido no es válido.');
  const entryIds=new Set(),fileIds=new Set();
  const entries=raw.entries.map(rawEntry=>{
    if(!uuid(rawEntry.id)||entryIds.has(rawEntry.id))fail('Hay registros repetidos o inválidos.');entryIds.add(rawEntry.id);
    let entry;
    try{entry=validateEntry({...rawEntry,attachments:(rawEntry.attachments||[]).map(f=>{
      if(!uuid(f.id)||fileIds.has(f.id))fail('Hay adjuntos repetidos o inválidos.');fileIds.add(f.id);
      return {...f,blob:undefined,remote:true};
    })});}catch(error){fail(error.message);}
    if(entry.km>car.km)fail('El kilometraje actual no puede ser menor al de un trabajo.');
    return entry;
  });
  return transaction(async client=>{
    const v=await ownedVehicle(userId,id,client,true);
    if(v.revision!==raw.revision)fail('Este vehículo cambió en otra pestaña o dispositivo. Recargá para ver los cambios antes de guardar.',409);
    if(fileIds.size){
      const result=await client.query('SELECT id FROM vehicle_files WHERE id=ANY($1::uuid[]) AND vehicle_id=$2 AND user_id=$3 AND uploaded=true',[[...fileIds],id,userId]);
      if(result.rowCount!==fileIds.size)fail('Uno de los adjuntos no pertenece a este vehículo o no terminó de subirse.');
    }
    const removed=await client.query('DELETE FROM vehicle_files WHERE vehicle_id=$1 AND user_id=$2 AND entry_id IS NOT NULL AND NOT(id=ANY($3::uuid[])) RETURNING pathname',[id,userId,[...fileIds]]);
    for(const file of removed.rows)await client.query('INSERT INTO file_garbage(pathname) VALUES($1) ON CONFLICT DO NOTHING',[file.pathname]);
    await client.query('DELETE FROM maintenance_entries WHERE vehicle_id=$1 AND user_id=$2 AND NOT(id=ANY($3::uuid[]))',[id,userId,[...entryIds]]);
    for(const e of entries){
      const result=await client.query(`INSERT INTO maintenance_entries(id,vehicle_id,user_id,title,category,date,time,km,cost,workshop,notes) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      ON CONFLICT(id) DO UPDATE SET title=EXCLUDED.title,category=EXCLUDED.category,date=EXCLUDED.date,time=EXCLUDED.time,km=EXCLUDED.km,cost=EXCLUDED.cost,workshop=EXCLUDED.workshop,notes=EXCLUDED.notes
      WHERE maintenance_entries.vehicle_id=EXCLUDED.vehicle_id AND maintenance_entries.user_id=EXCLUDED.user_id RETURNING id`,[e.id,id,userId,e.title,e.category,e.date,e.time,e.km,e.cost,e.workshop,e.notes]);
      if(!result.rowCount)fail('Registro no disponible.',404);
      for(const f of e.attachments)await client.query('UPDATE vehicle_files SET entry_id=$1 WHERE id=$2 AND vehicle_id=$3 AND user_id=$4',[e.id,f.id,id,userId]);
    }
    await client.query('UPDATE vehicles SET type=$1,make=$2,model=$3,year=$4,plate=$5,km=$6,body=$7,revision=revision+1,updated_at=now() WHERE id=$8 AND user_id=$9',[car.type,car.make,car.model,car.year||null,car.plate,car.km,car.body,id,userId]);
    return {revision:v.revision+1};
  });
}
export async function removeVehicle(userId,id) {
  await transaction(async client=>{
    await ownedVehicle(userId,id,client,true);
    const {rows}=await client.query('SELECT pathname FROM vehicle_files WHERE vehicle_id=$1 AND user_id=$2',[id,userId]);
    for(const f of rows)await client.query('INSERT INTO file_garbage(pathname) VALUES($1) ON CONFLICT DO NOTHING',[f.pathname]);
    await client.query('DELETE FROM vehicles WHERE id=$1 AND user_id=$2',[id,userId]);
  });
}
export function fileData(raw,userId) {
  if(!uuid(raw?.id)||!uuid(raw?.vehicleId)||typeof raw.name!=='string'||!raw.name||raw.name.length>255||typeof raw.type!=='string'||raw.type.length>160||!Number.isInteger(raw.size)||raw.size<0||raw.size>MAX_FILE_SIZE)fail('El adjunto no es válido.');
  if(raw.type&&!/^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/i.test(raw.type))fail('El tipo del archivo no es válido.');
  return {id:raw.id,vehicleId:raw.vehicleId,name:raw.name,type:raw.type||'application/octet-stream',size:raw.size,pathname:`garage/${userId}/${raw.vehicleId}/${raw.id}`};
}
