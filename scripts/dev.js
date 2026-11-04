import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {Readable} from 'node:stream';
import {handleRequest} from '../api/index.js';

const root=path.resolve('dist'),port=Number(process.env.PORT||4260);
http.createServer(async(req,res)=>{
  try{
    const requestURL=`http://localhost:${port}${req.url}`;
    if(req.url.startsWith('/api/')){
      const request=new Request(requestURL,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Readable.toWeb(req),duplex:'half'}:{})});
      const response=await handleRequest(request);
      res.statusCode=response.status;
      for(const [name,value] of response.headers)if(name!=='set-cookie')res.setHeader(name,value);
      const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);
      if(response.body)Readable.fromWeb(response.body).pipe(res);else res.end();return;
    }
    const url=new URL(requestURL),file=path.resolve(root,'.'+(url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname)));
    if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
    const data=await readFile(file);
    res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'}[path.extname(file)]||'application/octet-stream')+'; charset=utf-8','Cache-Control':'no-store'}).end(data);
  }catch(error){res.writeHead(error.code==='ENOENT'?404:500).end('No se pudo abrir el recurso.');}
}).listen(port,'127.0.0.1',()=>console.log(`Bitácora: http://localhost:${port}`));
