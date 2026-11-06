import {api} from './cloud.js';

export function setupSharing({vehicleId,vehicleName,notify}){
  const $=selector=>document.querySelector(selector),dialog=$('#share-dialog'),links=new Map();
  let selected=null,status={active:false},busy=false,loaded=false,sequence=0;
  function render(){
    const cached=links.get(selected),url=cached&&cached.createdAt===status.createdAt?cached.url:'';
    $('#share-status').textContent=busy?'Preparando el enlace…':status.active
      ? url?'El enlace está activo. Cualquier persona que lo tenga puede consultar este historial.':'Ya hay un enlace activo. Si generás otro, el anterior dejará de funcionar.'
      : 'El historial es privado. Generá un enlace cuando quieras compartirlo.';
    $('#share-link-panel').hidden=!url;$('#share-url').value=url;$('#share-open').href=url||'#';
    $('#share-create').textContent=status.active?'Generar nuevo enlace':'Generar enlace';
    $('#share-revoke').hidden=!status.active;
    dialog.setAttribute('aria-busy',String(busy));
    for(const button of dialog.querySelectorAll('[data-share-control]'))button.disabled=busy||!loaded;
  }
  async function open(){
    const id=vehicleId();if(!id)return;
    selected=id;status={active:false};const request=++sequence;busy=true;loaded=false;
    $('#share-error').hidden=true;$('#share-vehicle-name').textContent=vehicleName();
    $('#share-link-panel').hidden=true;$('#share-status').textContent='Consultando el enlace…';
    dialog.showModal();render();
    try{
      const result=await api(`/api/vehicles/${encodeURIComponent(id)}/share`);
      if(request!==sequence)return;status=result;loaded=true;$('#share-attachments').checked=Boolean(status.includeAttachments);
    }catch(error){if(request===sequence){$('#share-error').textContent=error.message;$('#share-error').hidden=false;}}
    finally{if(request===sequence){busy=false;render();}}
  }
  async function update(method){
    if(busy||!selected)return;busy=true;const request=++sequence;$('#share-error').hidden=true;render();
    try{
      const result=await api(`/api/vehicles/${encodeURIComponent(selected)}/share`,{method,...(method==='POST'?{body:JSON.stringify({includeAttachments:$('#share-attachments').checked})}:{})});
      if(request!==sequence)return;
      status=result;
      if(result.token){
        links.set(selected,{url:new URL(`/compartir/${result.token}`,location.origin).href,createdAt:result.createdAt});
        notify('Enlace de solo lectura generado. Ya podés copiarlo.');
      }else{links.delete(selected);notify('Enlace revocado. Ya no permite consultar el historial.');}
    }catch(error){if(request===sequence){$('#share-error').textContent=error.message;$('#share-error').hidden=false;}}
    finally{if(request===sequence){busy=false;render();}}
  }
  async function copy(){
    const input=$('#share-url');if(!input.value)return;
    try{await navigator.clipboard.writeText(input.value);notify('Enlace copiado.');}
    catch{
      input.focus();input.select();input.setSelectionRange(0,input.value.length);
      if(document.execCommand('copy'))notify('Enlace copiado.');
      else notify('El enlace quedó seleccionado para copiarlo.',true);
    }
  }
  $('#share-history').addEventListener('click',open);
  $('#share-create').addEventListener('click',()=>update('POST'));
  $('#share-revoke').addEventListener('click',()=>update('DELETE'));
  $('#share-copy').addEventListener('click',copy);
  return {reset(){sequence++;selected=null;links.clear();busy=false;loaded=false;status={active:false};$('#share-url').value='';}};
}
