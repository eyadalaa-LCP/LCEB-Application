import 'server-only';
import {cookies} from 'next/headers';
import {NextRequest} from 'next/server';
import {SESSION_COOKIE,validSession} from './session';
export async function isAdmin(){return validSession((await cookies()).get(SESSION_COOKIE)?.value);}
export function sameOrigin(request:NextRequest){const origin=request.headers.get('origin');if(!origin)return false;try{const provided=new URL(origin);if(process.env.SITE_URL)return provided.origin===new URL(process.env.SITE_URL).origin;const host=request.headers.get('host');return Boolean(host)&&provided.host===host&&(provided.protocol==='https:'||(process.env.NODE_ENV!=='production'&&provided.protocol==='http:'));}catch{return false;}}
export async function authorizeWrite(request:NextRequest){if(!sameOrigin(request))return Response.json({error:'Request origin is not allowed.'},{status:403});if(!await isAdmin())return Response.json({error:'Your session has expired. Sign in again; your unsaved edits are still on this page.'},{status:401});return null;}
