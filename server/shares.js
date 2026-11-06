import {createHash,randomBytes} from 'node:crypto';
import {database,transaction} from './db.js';
import {ownedVehicle,vehicleHistory,fail,uuid} from './garage.js';

export function shareTokenHash(token){
  if(typeof token!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(token))fail('Este enlace no está disponible o fue revocado.',404);
  return createHash('sha256').update(token).digest('hex');
}
export async function shareStatus(userId,id){
  await ownedVehicle(userId,id);
  const {rows}=await database().query('SELECT include_attachments,created_at FROM vehicle_shares WHERE vehicle_id=$1 AND user_id=$2',[id,userId]);
  return rows[0]?{active:true,includeAttachments:rows[0].include_attachments,createdAt:rows[0].created_at}:{active:false};
}
export async function createShare(userId,id,options){
  if(typeof options.includeAttachments!=='boolean')fail('Elegí si querés compartir los adjuntos.');
  return transaction(async client=>{
    await ownedVehicle(userId,id,client,true);
    const token=randomBytes(32).toString('base64url');
    const {rows}=await client.query(`INSERT INTO vehicle_shares(vehicle_id,user_id,token_hash,include_attachments) VALUES($1,$2,$3,$4)
      ON CONFLICT(vehicle_id) DO UPDATE SET token_hash=EXCLUDED.token_hash,include_attachments=EXCLUDED.include_attachments,created_at=now() RETURNING created_at`,[id,userId,shareTokenHash(token),options.includeAttachments]);
    return {active:true,token,includeAttachments:options.includeAttachments,createdAt:rows[0].created_at};
  });
}
export async function revokeShare(userId,id){
  await transaction(async client=>{
    await ownedVehicle(userId,id,client,true);
    await client.query('DELETE FROM vehicle_shares WHERE vehicle_id=$1 AND user_id=$2',[id,userId]);
  });
}
export async function publicHistory(token){
  const hash=shareTokenHash(token);
  return transaction(async client=>{
    const {rows}=await client.query('SELECT v.*,s.include_attachments,s.created_at AS shared_at FROM vehicle_shares s JOIN vehicles v ON v.id=s.vehicle_id AND v.user_id=s.user_id WHERE s.token_hash=$1 FOR SHARE OF v',[hash]);
    const vehicle=rows[0];if(!vehicle)fail('Este enlace no está disponible o fue revocado.',404);
    const history=await vehicleHistory(client,vehicle);
    const {type,make,model,year,km,body}=history.car;
    return {car:{type,make,model,year,km,body},entries:history.entries.map(entry=>({...entry,attachments:vehicle.include_attachments?entry.attachments:[]})),attachmentsShared:vehicle.include_attachments,sharedAt:vehicle.shared_at};
  });
}
export async function publicFile(token,id){
  const hash=shareTokenHash(token);if(!uuid(id))fail('Adjunto no encontrado.',404);
  const {rows}=await database().query(`SELECT f.* FROM vehicle_shares s JOIN vehicle_files f ON f.vehicle_id=s.vehicle_id AND f.user_id=s.user_id
    WHERE s.token_hash=$1 AND s.include_attachments=true AND f.id=$2 AND f.uploaded=true AND f.entry_id IS NOT NULL`,[hash,id]);
  if(!rows[0])fail('Adjunto no encontrado.',404);
  return rows[0];
}
