import {NextRequest,NextResponse} from 'next/server';
import {sameOrigin} from '@/lib/auth';
import {passwordMatches,createSession,SESSION_COOKIE,SESSION_SECONDS} from '@/lib/auth/session';
const attempts=new Map<string,{count:number;until:number}>();
export async function POST(request:NextRequest){
 if(!sameOrigin(request))return NextResponse.json({error:'Request origin is not allowed.'},{status:403});
 const now=Date.now();for(const [key,value] of attempts)if(value.until<now)attempts.delete(key);
 const ip=process.env.VERCEL?request.headers.get('x-vercel-forwarded-for')||'unknown':'local';
 for(const [key,limit] of [[ip,8],['global',100]] as const){const entry=attempts.get(key)||{count:0,until:now+10*60*1000};entry.count++;attempts.set(key,entry);if(entry.count>limit)return NextResponse.json({error:'Too many attempts. Please try again in 10 minutes.'},{status:429,headers:{'Retry-After':'600'}});}
 try{if(Number(request.headers.get('content-length'))>4096)return NextResponse.json({error:'Request too large.'},{status:413});const body=await request.json();if(typeof body.password!=='string'||body.password.length>1024||!passwordMatches(body.password))return NextResponse.json({error:'Invalid password. Please try again.'},{status:401});const response=NextResponse.json({ok:true});response.cookies.set(SESSION_COOKIE,createSession(),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',maxAge:SESSION_SECONDS,path:'/'});attempts.delete(ip);return response;}catch{return NextResponse.json({error:'Login is unavailable. Check the admin environment settings.'},{status:503});}
}
