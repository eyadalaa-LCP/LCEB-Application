import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {mediaDirectory} from '@/lib/media';
export async function GET(_request:Request,{params}:{params:Promise<{filename:string}>}){const {filename}=await params;if(process.env.VERCEL||!/^[a-zA-Z0-9_-]+\.(jpg|png|webp)$/.test(filename))return new Response('Not found',{status:404});try{const data=await readFile(path.join(mediaDirectory,filename));return new Response(data,{headers:{'Content-Type':filename.endsWith('.jpg')?'image/jpeg':filename.endsWith('.png')?'image/png':'image/webp','Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff'}});}catch{return new Response('Not found',{status:404});}}
