import {createHmac,randomBytes,timingSafeEqual,createHash} from 'node:crypto';
export const SESSION_COOKIE='suez_admin';
export const SESSION_SECONDS=8*60*60;
function config() {
 const production=process.env.NODE_ENV==='production';
 const password=process.env.ADMIN_PASSWORD || (!production?'ana borio':'');
 const secret=process.env.SESSION_SECRET || (!production?'local-development-only-change-in-production':'');
 if(!password||!secret||(production&&(password==='ana borio'||secret.length<32))) throw new Error('Admin is not configured. Set a strong ADMIN_PASSWORD and SESSION_SECRET.');
 return {password,secret};
}
const hash=(value:string)=>createHash('sha256').update(value).digest();
export function passwordMatches(input:string) { return timingSafeEqual(hash(input),hash(config().password)); }
function sign(payload:string) {const {password,secret}=config();return createHmac('sha256',secret+hash(password).toString('hex')).update(payload).digest('base64url');}
export function createSession(now=Date.now()) {const payload=Buffer.from(JSON.stringify({expires:now+SESSION_SECONDS*1000,nonce:randomBytes(24).toString('hex')})).toString('base64url');return `${payload}.${sign(payload)}`;}
export function validSession(value:string|undefined,now=Date.now()) {
 try {if(!value||value.length>1024)return false;const [payload,signature,...extra]=value.split('.');if(!payload||!signature||extra.length)return false;const expected=sign(payload);if(signature.length!==expected.length||!timingSafeEqual(Buffer.from(signature),Buffer.from(expected)))return false;const data=JSON.parse(Buffer.from(payload,'base64url').toString());return typeof data.expires==='number'&&data.expires>now&&data.expires<=now+SESSION_SECONDS*1000;} catch {return false;}
}
