import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';
import {handleRequest} from '../api/index.js';
import {database} from '../server/db.js';

test('cuentas aisladas, varios vehículos y control de concurrencia en PostgreSQL',{skip:!process.env.DATABASE_URL},async()=>{
  const base=process.env.BETTER_AUTH_URL||'http://localhost:4260';
  const code=randomBytes(8).toString('hex'),password=randomBytes(24).toString('base64url');
  const emails=[`integration-${code}-a@example.invalid`,`integration-${code}-b@example.invalid`];
  function client(ip){let cookie='';return async(path,method='GET',data)=>{
    const response=await handleRequest(new Request(base+path,{method,headers:{Origin:base,'x-real-ip':ip,...(cookie?{Cookie:cookie}:{}),...(data!==undefined?{'Content-Type':'application/json'}:{})},...(data!==undefined?{body:JSON.stringify(data)}:{})}));
    const cookies=response.headers.getSetCookie();if(cookies.length)cookie=cookies.map(value=>value.split(';')[0]).join('; ');
    return {status:response.status,data:await response.json()};
  };}
  const a=client('192.0.2.11'),b=client('192.0.2.12'),anonymous=client('192.0.2.13');
  try{
    assert.equal((await anonymous('/api/index?__route=auth/ok')).status,200);
    for(const [request,email] of [[a,emails[0]],[b,emails[1]]])assert.equal((await request('/api/auth/sign-up/email','POST',{name:'Integration QA',email,password})).status,200);
    const car={type:'car',make:'Ford',model:'Fiesta',year:2015,plate:'QA',km:1000,body:'auto'};
    const first=await a('/api/vehicles','POST',{car}),second=await a('/api/vehicles','POST',{car:{...car,type:'motorcycle',make:'Honda',model:'Wave'}});
    assert.equal(first.status,201);assert.equal(second.status,201);
    assert.equal((await a('/api/vehicles')).data.vehicles.length,2);
    assert.equal((await b('/api/vehicles')).data.vehicles.length,0);
    const id=first.data.id;
    assert.equal((await anonymous('/api/vehicles')).status,401);
    assert.equal((await b(`/api/vehicles/${id}`)).status,404);
    assert.equal((await b(`/api/vehicles/${id}`,'PUT',first.data)).status,404);
    assert.equal((await b(`/api/vehicles/${id}`,'DELETE')).status,404);
    const entry={id:randomUUID(),title:'Trabajo QA',category:'mantenimiento',date:'2026-01-01',time:'12:00',km:1000,cost:0,workshop:'',notes:'',attachments:[]};
    assert.equal((await a(`/api/vehicles/${id}`,'PUT',{...first.data,entries:[entry]})).status,200);
    assert.equal((await a(`/api/vehicles/${id}`,'PUT',first.data)).status,409);
    assert.equal((await a(`/api/vehicles/${id}`)).data.entries[0].cost,0);
    assert.equal((await a(`/api/vehicles/${second.data.id}`)).data.entries.length,0);
    assert.equal((await a('/api/vehicles','POST',{car:{...car,type:'invalid'}})).status,400);
    assert.equal((await a('/api/files?id='+randomUUID())).status,404);
    assert.equal((await a('/api/auth/sign-out','POST',{})).status,200);
    assert.equal((await a('/api/vehicles')).status,401);
  }finally{
    await database().query('DELETE FROM "user" WHERE email=ANY($1::text[]) AND name=$2',[emails,'Integration QA']);
    await database().end();
  }
});
