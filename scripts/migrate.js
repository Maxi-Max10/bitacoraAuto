import {readFile} from 'node:fs/promises';
import {getMigrations} from 'better-auth/db/migration';
import {authentication} from '../server/auth.js';
import {database,transaction} from '../server/db.js';

const required=['DATABASE_URL','BETTER_AUTH_SECRET','BLOB_READ_WRITE_TOKEN'];
const missing=required.filter(name=>!process.env[name]);
if(missing.length)throw new Error(`Faltan variables: ${missing.join(', ')}`);
const migration=await getMigrations(authentication().options);
await migration.runMigrations();
const schema=await readFile(new URL('../server/schema.sql',import.meta.url),'utf8');
await transaction(client=>client.query(schema));
await database().end();
console.log('Migraciones de autenticación y garage aplicadas.');
