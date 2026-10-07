import {NextRequest,NextResponse} from 'next/server';
import {sameOrigin} from '@/lib/auth';
import {SESSION_COOKIE} from '@/lib/auth/session';
export async function POST(request:NextRequest){if(!sameOrigin(request))return NextResponse.json({error:'Request origin is not allowed.'},{status:403});const response=NextResponse.json({ok:true});response.cookies.set(SESSION_COOKIE,'',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',maxAge:0,path:'/'});return response;}
