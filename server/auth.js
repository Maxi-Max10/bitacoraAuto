import {betterAuth} from 'better-auth';
import {database} from './db.js';

let instance;
export function authentication() {
  if (!instance) {
    if (!process.env.BETTER_AUTH_SECRET) throw new Error('BETTER_AUTH_SECRET no está configurada.');
    instance=betterAuth({
      appName:'Bitácora',
      baseURL:process.env.BETTER_AUTH_URL || 'https://bitacoraauto.vercel.app',
      secret:process.env.BETTER_AUTH_SECRET,
      database:database(),
      emailAndPassword:{enabled:true, minPasswordLength:10, maxPasswordLength:128},
      session:{expiresIn:60*60*24*7, updateAge:60*60*24},
      rateLimit:{enabled:true, storage:'database', window:60, max:100,
        customRules:{'/sign-in/email':{window:60,max:10},'/sign-up/email':{window:60,max:5}}},
      advanced:{ipAddress:{ipAddressHeaders:['x-real-ip']}},
    });
  }
  return instance;
}

export async function authenticatedUser(request) {
  const session=await authentication().api.getSession({headers:request.headers});
  if (!session) { const error=new Error('Iniciá sesión para continuar.'); error.status=401; throw error; }
  return session.user;
}
