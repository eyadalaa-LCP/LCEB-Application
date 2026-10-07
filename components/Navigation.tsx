'use client';
import Link from 'next/link';
import Image from 'next/image';
import {Menu,X,ChevronDown,ArrowUp} from 'lucide-react';
import {useEffect,useRef,useState} from 'react';
import {ordered,type SiteContent} from '@/lib/schema';
export default function Navigation({content,inner=false}:{content:SiteContent;inner?:boolean}){
 const [open,setOpen]=useState(false),[scrolled,setScrolled]=useState(inner),[active,setActive]=useState('home');
 const toggle=useRef<HTMLButtonElement>(null);
 useEffect(()=>{const scroll=()=>setScrolled(inner||window.scrollY>30);scroll();window.addEventListener('scroll',scroll,{passive:true});const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)setActive(entry.target.id);},{rootMargin:'-15% 0px -65% 0px'});document.querySelectorAll('main section[id]').forEach(s=>observer.observe(s));return()=>{window.removeEventListener('scroll',scroll);observer.disconnect();}},[inner]);
 const items=ordered(content.navigation);
 const href=(url:string)=>inner&&url.startsWith('#')?`/${url}`:url;
 const render=(item:typeof items[number])=><Link key={item.id} href={href(item.url)||'/'} target={item.newTab?'_blank':undefined} rel={item.newTab?'noopener noreferrer':undefined} onClick={()=>setOpen(false)} className={active===item.url.slice(1)?'active':''} aria-current={active===item.url.slice(1)?'location':undefined}>{item.label}</Link>;
 return <><a className="skip-link" href="#main">Skip to content</a><header className={`navbar ${scrolled||open?'solid':''}`}><div className="nav-inner"><Link className="brand" href="/">{content.settings.logo&&<Image className="brand-logo" src={content.settings.logo} alt="" width={34} height={34} unoptimized/>}{content.settings.lcName}<small>LCEB APPLICATION {content.settings.applicationYear}</small></Link><button ref={toggle} className="menu-toggle" aria-label={open?'Close navigation':'Open navigation'} aria-expanded={open} aria-controls="main-navigation" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button><nav id="main-navigation" aria-label="Main navigation" className={open?'nav-links open':'nav-links'} onKeyDown={e=>{if(e.key==='Escape'){setOpen(false);toggle.current?.focus();}}}>{items.filter(i=>!i.inMore).map(render)}{items.some(i=>i.inMore)&&<details className="more"><summary>More <ChevronDown size={14}/></summary><div className="more-menu">{items.filter(i=>i.inMore).map(render)}</div></details>}</nav></div></header>{scrolled&&<a href={inner?'#main':'#home'} className="back-top" aria-label="Back to top"><ArrowUp size={20}/></a>}</>;
}
