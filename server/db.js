import pg from 'pg';

let pool;
export function database() {
  if (!pool) {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL no está configurada.');
    const connection=new URL(process.env.DATABASE_URL);connection.searchParams.set('sslmode','verify-full');
    pool = new pg.Pool({connectionString:connection.toString(), max:3, idleTimeoutMillis:5000, connectionTimeoutMillis:15000, allowExitOnIdle:true});
    pool.on('error', error => console.error('database.connection', {code:error.code}));
  }
  return pool;
}

export async function transaction(work) {
  const client=await database().connect();
  try { await client.query('BEGIN'); const result=await work(client); await client.query('COMMIT'); return result; }
  catch(error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}
