import {upload} from '@vercel/blob/client';

const authMessages={INVALID_EMAIL_OR_PASSWORD:'El email o la contraseña no son correctos.',USER_ALREADY_EXISTS:'Ya existe una cuenta con este email.',USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:'Ya existe una cuenta con este email.',PASSWORD_TOO_SHORT:'Usá una contraseña de al menos 10 caracteres.',TOO_MANY_REQUESTS:'Hubo demasiados intentos. Esperá un minuto y volvé a probar.'};
export async function api(path,options={}) {
  const response=await fetch(path,{credentials:'same-origin',cache:'no-store',...options,headers:{...(options.body?{'Content-Type':'application/json'}:{}),...options.headers}});
  let data;try{data=await response.json();}catch{data={};}
  if(!response.ok){
    const error=new Error(authMessages[data.code]||data.error||data.message||(response.status===429?'Hubo demasiados intentos. Esperá un minuto.':'No se pudo conectar con tu garage.'));
    error.status=response.status;if(response.status===401&&!path.startsWith('/api/auth/'))window.dispatchEvent(new Event('session-expired'));
    throw error;
  }
  return data;
}
export const session=()=>api('/api/auth/get-session');
export const signIn=(email,password)=>api('/api/auth/sign-in/email',{method:'POST',body:JSON.stringify({email,password})});
export const signUp=(name,email,password)=>api('/api/auth/sign-up/email',{method:'POST',body:JSON.stringify({name,email,password})});
export const signOut=()=>api('/api/auth/sign-out',{method:'POST',body:'{}'});
export const list=()=>api('/api/vehicles');
export const load=id=>api(`/api/vehicles/${encodeURIComponent(id)}`);
export const create=car=>api('/api/vehicles',{method:'POST',body:JSON.stringify({car})});
export const remove=id=>api(`/api/vehicles/${encodeURIComponent(id)}`,{method:'DELETE'});

export async function save(state,userId) {
  const entries=[],uploadedIds=[];
  try{
  for(const entry of state.entries){
    const attachments=[];
    for(const file of entry.attachments){
      if(file.remote){attachments.push({id:file.id,name:file.name,type:file.type,size:file.size,remote:true});continue;}
      const id=crypto.randomUUID(),pathname=`garage/${userId}/${state.id}/${id}`;
      uploadedIds.push(id);
      const type=file.type||'application/octet-stream';
      await upload(pathname,file.blob,{access:'private',handleUploadUrl:'/api/upload',contentType:type,
        clientPayload:JSON.stringify({id,vehicleId:state.id,name:file.name,type,size:file.blob.size})});
      await api('/api/files/finish',{method:'POST',body:JSON.stringify({id})});
      attachments.push({id,name:file.name,type,size:file.blob.size,remote:true});
    }
    entries.push({...entry,attachments});
  }
  const result=await api(`/api/vehicles/${state.id}`,{method:'PUT',body:JSON.stringify({revision:state.revision,car:state.car,entries})});
  return {...state,entries,revision:result.revision};
  }catch(error){
    await Promise.allSettled(uploadedIds.map(id=>api(`/api/files?id=${id}`,{method:'DELETE'})));
    throw error;
  }
}
export async function fileBlob(file) {
  if(file.blob instanceof Blob)return file.blob;
  const response=await fetch(`/api/files?id=${encodeURIComponent(file.id)}&download=1`,{credentials:'same-origin',cache:'no-store'});
  if(!response.ok)throw new Error('No se pudo descargar uno de los adjuntos. Volvé a iniciar sesión si hace falta.');
  return response.blob();
}
export async function materialize(state) {
  return {...state,entries:await Promise.all(state.entries.map(async entry=>({...entry,attachments:await Promise.all(entry.attachments.map(async file=>({...file,blob:await fileBlob(file)})))})))};
}
export async function importVehicle(original,userId) {
  const car={...original.car,type:original.car.type||'car',body:original.car.body||'auto',make:original.car.make||'Sin marca',model:original.car.model||'Vehículo importado'};
  const empty=await create(car);
  try{
    return await save({...empty,entries:original.entries.map(entry=>({...entry,id:crypto.randomUUID(),attachments:entry.attachments.map(file=>({...file,id:crypto.randomUUID()}))}))},userId);
  }catch(error){try{await remove(empty.id);}catch{}throw error;}
}
