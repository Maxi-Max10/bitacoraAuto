import {authentication,authenticatedUser} from '../server/auth.js';
import {database} from '../server/db.js';
import {listVehicles,createVehicle,loadVehicle,storeVehicle,removeVehicle,ownedVehicle,fileData,fail,uuid} from '../server/garage.js';
import {MAX_FILE_SIZE} from '../dist/core.js';
import {handleUpload} from '@vercel/blob/client';
import {get,head,del} from '@vercel/blob';

function json(value,status=200) { return Response.json(value,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}}); }
function originCheck(request) {
  const expected=new URL(process.env.BETTER_AUTH_URL||'https://bitacoraauto.vercel.app').origin;
  if(request.headers.get('origin')!==expected)fail('El origen de la solicitud no está permitido.',403);
}
async function bodyJSON(request) {
  if(!request.headers.get('content-type')?.includes('application/json'))fail('Se esperaba una solicitud JSON.',415);
  const text=await request.text();if(text.length>2500000)fail('El historial es demasiado grande para guardarlo en una sola operación.',413);
  let value;try{value=JSON.parse(text);}catch{fail('El contenido recibido no es JSON válido.');}
  if(!value||typeof value!=='object'||Array.isArray(value))fail('El contenido recibido no es válido.');return value;
}
async function cleanupFiles() {
  const {rows}=await database().query('SELECT pathname FROM file_garbage ORDER BY created_at LIMIT 25');
  for(const file of rows){
    try{await del(file.pathname);await database().query('DELETE FROM file_garbage WHERE pathname=$1',[file.pathname]);}
    catch{console.error('blob.cleanup_failed');}
  }
}
async function uploadHandler(request) {
  const body=await bodyJSON(request);
  const result=await handleUpload({request,body,
    onBeforeGenerateToken:async(pathname,clientPayload)=>{
      originCheck(request);
      const user=await authenticatedUser(request);
      let payload;try{payload=JSON.parse(clientPayload||'{}');}catch{fail('Adjunto inválido.');}
      const file=fileData(payload,user.id);
      await ownedVehicle(user.id,file.vehicleId);
      if(pathname!==file.pathname)fail('La ruta del adjunto no es válida.',403);
      const {rows}=await database().query('SELECT count(*)::int AS total FROM vehicle_files WHERE user_id=$1 AND entry_id IS NULL',[user.id]);
      if(rows[0].total>=100)fail('Hay demasiados archivos pendientes. Guardá tus registros antes de subir más.',429);
      await database().query('INSERT INTO vehicle_files(id,vehicle_id,user_id,name,mime,size,pathname) VALUES($1,$2,$3,$4,$5,$6,$7)',[file.id,file.vehicleId,user.id,file.name,file.type,file.size,file.pathname]);
      return {maximumSizeInBytes:Math.min(MAX_FILE_SIZE,file.size||1),validUntil:Date.now()+10*60*1000,addRandomSuffix:false,allowOverwrite:false,tokenPayload:JSON.stringify({id:file.id,userId:user.id,vehicleId:file.vehicleId,pathname:file.pathname})};
    },
    onUploadCompleted:async({blob,tokenPayload})=>{
      const payload=JSON.parse(tokenPayload||'{}');
      if(payload.pathname!==blob.pathname)throw new Error('Invalid upload callback');
      const {rows}=await database().query('SELECT size FROM vehicle_files WHERE id=$1 AND user_id=$2 AND vehicle_id=$3 AND pathname=$4',[payload.id,payload.userId,payload.vehicleId,blob.pathname]);
      if(!rows[0])return;
      const stored=await head(blob.pathname);if(stored.size!==rows[0].size)throw new Error('Upload size mismatch');
      await database().query('UPDATE vehicle_files SET uploaded=true WHERE id=$1 AND user_id=$2 AND vehicle_id=$3 AND pathname=$4',[payload.id,payload.userId,payload.vehicleId,blob.pathname]);
    }
  });
  return json(result);
}

export async function handleRequest(request) {
  try{
    const routedURL=new URL(request.url);
    if(routedURL.searchParams.has('__route')){
      routedURL.pathname='/api/'+routedURL.searchParams.get('__route');routedURL.searchParams.delete('__route');
      request=new Request(routedURL,request);
    }
    const url=new URL(request.url),path=url.pathname.replace(/\/$/,'');
    if(path.startsWith('/api/auth/'))return await authentication().handler(request);
    if(path==='/api/upload'&&request.method==='POST')return await uploadHandler(request);
    const user=await authenticatedUser(request);
    if(!['GET','HEAD'].includes(request.method))originCheck(request);
    if(path==='/api/vehicles'){
      if(request.method==='GET')return json({vehicles:await listVehicles(user.id),user:{id:user.id,name:user.name,email:user.email}});
      if(request.method==='POST')return json(await createVehicle(user.id,await bodyJSON(request)),201);
    }
    const match=path.match(/^\/api\/vehicles\/([^/]+)$/);
    if(match){
      const id=match[1];
      if(request.method==='GET')return json(await loadVehicle(user.id,id));
      if(request.method==='PUT'){
        const result=await storeVehicle(user.id,id,await bodyJSON(request));
        await cleanupFiles();return json(result);
      }
      if(request.method==='DELETE'){await removeVehicle(user.id,id);await cleanupFiles();return json({ok:true});}
    }
    if(path==='/api/files/finish'&&request.method==='POST'){
      const raw=await bodyJSON(request);if(!uuid(raw.id))fail('Adjunto no encontrado.',404);
      const {rows}=await database().query('SELECT * FROM vehicle_files WHERE id=$1 AND user_id=$2',[raw.id,user.id]);
      const file=rows[0];if(!file)fail('Adjunto no encontrado.',404);
      const stored=await head(file.pathname);
      if(stored.size!==file.size||stored.pathname!==file.pathname)fail('El archivo subido no coincide con el adjunto.');
      await database().query('UPDATE vehicle_files SET uploaded=true WHERE id=$1 AND user_id=$2',[file.id,user.id]);
      return json({ok:true});
    }
    if(path==='/api/files'&&request.method==='GET'){
      const id=url.searchParams.get('id');if(!uuid(id))fail('Adjunto no encontrado.',404);
      const {rows}=await database().query('SELECT f.* FROM vehicle_files f JOIN vehicles v ON v.id=f.vehicle_id AND v.user_id=f.user_id WHERE f.id=$1 AND f.user_id=$2 AND f.uploaded=true AND f.entry_id IS NOT NULL',[id,user.id]);
      const file=rows[0];if(!file)fail('Adjunto no encontrado.',404);
      const blob=await get(file.pathname,{access:'private'});if(!blob||blob.statusCode!==200)fail('El archivo no está disponible.',404);
      const inline=/^image\/(png|jpeg|webp|gif|avif|bmp)$/i.test(file.mime)&&url.searchParams.get('download')!=='1';
      const filename=encodeURIComponent(file.name).replace(/['()]/g,c=>'%'+c.charCodeAt(0).toString(16));
      return new Response(blob.stream,{headers:{'Content-Type':inline?file.mime:'application/octet-stream','Content-Length':String(file.size),'Content-Disposition':`${inline?'inline':'attachment'}; filename*=UTF-8''${filename}`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox"}});
    }
    if(path==='/api/files'&&request.method==='DELETE'){
      const id=url.searchParams.get('id');if(!uuid(id))fail('Adjunto no encontrado.',404);
      const {rows}=await database().query('DELETE FROM vehicle_files WHERE id=$1 AND user_id=$2 AND entry_id IS NULL RETURNING pathname',[id,user.id]);
      if(rows[0]){await database().query('INSERT INTO file_garbage(pathname) VALUES($1) ON CONFLICT DO NOTHING',[rows[0].pathname]);await cleanupFiles();}
      return json({ok:true});
    }
    return json({error:'Recurso no encontrado.'},404);
  }catch(error){
    if(!error.status)console.error('api.request_failed',{name:error.name,code:error.code});
    return json({error:error.status?error.message:'No se pudo completar la operación. Intentá de nuevo.'},error.status||500);
  }
}
export default {fetch:handleRequest};
