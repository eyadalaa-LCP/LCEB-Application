'use client';
import Image from 'next/image';
import {useState} from 'react';
import {ImageIcon} from 'lucide-react';
export default function Photo({src,alt,className='',position='center',priority=false}:{src:string;alt:string;className?:string;position?:string;priority?:boolean}) {
 const [failed,setFailed]=useState('');
 return <div className={`photo ${className}`}>{src&&failed!==src?<Image src={src} alt={alt} fill sizes="(max-width: 768px) 90vw, 45vw" style={{objectFit:'cover',objectPosition:position}} priority={priority} unoptimized={!src.includes('.public.blob.vercel-storage.com')} onError={()=>setFailed(src)}/>:<div className="photo-placeholder"><ImageIcon size={28} strokeWidth={1}/><span>{alt}</span><small>Photo to be added</small></div>}</div>;
}
