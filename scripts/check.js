import {readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
async function check(dir){
  for(const entry of await readdir(dir,{withFileTypes:true})){
    const file=`${dir}/${entry.name}`;
    if(entry.isDirectory())await check(file);
    else if(file.endsWith('.js')){const result=spawnSync(process.execPath,['--check',file],{stdio:'inherit',windowsHide:true});if(result.status)process.exit(result.status);}
  }
}
for(const dir of ['dist','src','server','api','scripts'])await check(dir);
