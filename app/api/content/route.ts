import {NextRequest} from 'next/server';
import {authorizeWrite,isAdmin} from '@/lib/auth';
import {loadContent,saveContent} from '@/lib/content';
import {contentSchema} from '@/lib/schema';
export async function GET(){if(!await isAdmin())return Response.json({error:'Sign in required.'},{status:401});return Response.json(await loadContent(),{headers:{'Cache-Control':'no-store'}});}
export async function PUT(request:NextRequest){const denied=await authorizeWrite(request);if(denied)return denied;try{const raw=await request.text();if(raw.length>1500000)return Response.json({error:'Content is too large.'},{status:413});const parsed=contentSchema.safeParse(JSON.parse(raw));if(!parsed.success)return Response.json({error:parsed.error.issues.map(i=>`${i.path.join('.')}: ${i.message}`).slice(0,6).join('\n')},{status:400});await saveContent(parsed.data);return Response.json({ok:true});}catch(error){console.error('Content save failed:',error);return Response.json({error:'Save failed. Check storage connectivity and try again. Your edits have been kept.'},{status:503});}}
