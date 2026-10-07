import 'server-only';
import {list,put} from '@vercel/blob';
import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {renameSync} from 'node:fs';
import path from 'node:path';
import {cache} from 'react';
import {randomUUID} from 'node:crypto';
import defaults from '@/data/default-content.json';
import {contentSchema,type SiteContent} from './schema';
const local=path.join(process.cwd(),'.local','content.json');
export const defaultContent=()=>contentSchema.parse(defaults);
export async function loadContent():Promise<{content:SiteContent;source:string;warning:string}> {
 try {
  if(process.env.BLOB_READ_WRITE_TOKEN){
   const blobs=[];let cursor:string|undefined;
   do {const result=await list({prefix:'content/revision-',cursor,limit:1000});blobs.push(...result.blobs);cursor=result.hasMore?result.cursor:undefined;}while(cursor);
   const latest=blobs.sort((a,b)=>b.pathname.localeCompare(a.pathname))[0];
   if(latest){const response=await fetch(latest.url,{cache:'no-store',signal:AbortSignal.timeout(8000)});if(!response.ok)throw new Error('Content could not be fetched.');return {content:contentSchema.parse(await response.json()),source:'Vercel Blob',warning:''};}
   return {content:defaultContent(),source:'Default content',warning:''};
  }
  if(process.env.NODE_ENV!=='production'||!process.env.VERCEL){try{return {content:contentSchema.parse(JSON.parse(await readFile(local,'utf8'))),source:'Local file',warning:''};}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}}
  return {content:defaultContent(),source:'Default content',warning:process.env.VERCEL?'Connect Vercel Blob to enable saving and uploads.':''};
 }catch{return {content:defaultContent(),source:'Default fallback',warning:'Stored content is unavailable or invalid. The public site is showing the bundled fallback. Try again before saving.'};}
}
export const getContent=cache(async()=> (await loadContent()).content);
export async function saveContent(input:unknown){const content=contentSchema.parse(input);if(process.env.BLOB_READ_WRITE_TOKEN){await put(`content/revision-${Date.now()}-${randomUUID()}.json`,JSON.stringify(content),{access:'public',addRandomSuffix:false,contentType:'application/json'});}else{if(process.env.VERCEL)throw new Error('Connect Vercel Blob before saving on Vercel.');await mkdir(path.dirname(local),{recursive:true});const temp=`${local}.${randomUUID()}.tmp`;await writeFile(temp,JSON.stringify(content,null,2));try{await rename(temp,local);}catch(error){if(process.platform!=='win32'||(error as NodeJS.ErrnoException).code!=='EPERM')throw error;renameSync(temp,local);}}return content;}
