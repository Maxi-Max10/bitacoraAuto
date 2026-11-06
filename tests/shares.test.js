import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {shareTokenHash} from '../server/shares.js';
import {handleRequest} from '../api/index.js';

test('los enlaces usan tokens opacos y rechazan identificadores o rutas inválidas',()=>{
  const token=randomBytes(32).toString('base64url');
  assert.match(shareTokenHash(token),/^[a-f0-9]{64}$/);
  assert.equal(shareTokenHash(token),shareTokenHash(token));
  assert.notEqual(shareTokenHash(token),shareTokenHash(randomBytes(32).toString('base64url')));
  for(const value of [null,undefined,'','vehicle-id','../garage','x'.repeat(44),['a'.repeat(43)]])assert.throws(()=>shareTokenHash(value),error=>error.status===404);
});

test('la ruta pública rechaza escrituras antes de consultar datos o autenticar',async()=>{
  const token=randomBytes(32).toString('base64url');
  for(const method of ['POST','PUT','PATCH','DELETE']){
    const response=await handleRequest(new Request(`https://bitacoraauto.vercel.app/api/public/${token}`,{method}));
    assert.equal(response.status,405);assert.equal(response.headers.get('allow'),'GET');
    assert.match(response.headers.get('cache-control'),/no-store/);
  }
  const response=await handleRequest(new Request('https://bitacoraauto.vercel.app/api/public/invalid'));
  assert.equal(response.status,404);
});
