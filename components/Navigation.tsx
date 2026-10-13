'use client';
import Link from 'next/link';
import Image from 'next/image';
import {Menu,X,ChevronDown,ArrowUp} from 'lucide-react';
import {useEffect,useRef,useState} from 'react';
import {ordered,type SiteContent} from '@/lib/schema';
export default function Navigation({content,inner=false}:{content:SiteContent;inner?:boolean}){
 const [open,setOpen]=useState(false),[scrolled,setScrolled]=useState(inner),[active,setActive]=useState('home');
 const toggle=useRef<HTMLButtonElement>(null),more=useRef<HTMLDetailsElement>(null),header=useRef<HTMLElement>(null);
 useEffect(()=>{const close=(e:PointerEvent)=>{if(!header.current?.contains(e.target as Node)){setOpen(false);if(more.current)more.current.open=false;}};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close);},[]);
 useEffect(()=>{const scroll=()=>setScrolled(inner||window.scrollY>30);scroll();window.addEventListener('scroll',scroll,{passive:true});const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)setActive(entry.target.id);},{rootMargin:'-15% 0px -65% 0px'});document.querySelectorAll('main section[id]').forEach(s=>observer.observe(s));return()=>{window.removeEventListener('scroll',scroll);observer.disconnect();}},[inner]);
 const items=ordered(content.navigation).map(item=>({...item,url:item.url==='#submission'&&/endorsement/i.test(item.label)?'#endorsement-letter':item.url==='#submission'&&/personal photo/i.test(item.label)?'#personal-photo':item.url}));
 const extraLinks=[{url:'#functional',label:content.functions.title,enabled:content.functions.enabled},{url:'#endorsement-letter',label:content.endorsementLetter.title,enabled:content.endorsementLetter.enabled},{url:'#personal-photo',label:'Personal Photo',enabled:content.package.items.some(x=>x.enabled&&(x.id==='item-6'||x.title.trim().toLowerCase()==='personal photo'))}];
 for(const item of extraLinks){if(item.enabled&&!content.navigation.some(x=>x.url===item.url||x.label===item.label))items.push({...item,id:`auto-${item.url}`,order:100,inMore:true,newTab:false});}
 const sequence=['#home','#lcp-word','#about','#timeline','#commitments','#package','#questionnaire','#direction','#functional','#endorsement-letter','#assessment','#cv','#personal-photo','#submission'];
 const rank=(url:string)=>{const index=sequence.indexOf(url==='/questionnaire'?'#questionnaire':url);return index<0?100:index;};
 items.sort((a,b)=>rank(a.url)-rank(b.url)||a.order-b.order);
 const primary=items.filter(i=>!i.inMore).slice(0,4);
 const overflow=items.filter(i=>!primary.some(p=>p.id===i.id));
 const close=()=>{setOpen(false);if(more.current)more.current.open=false;};
 const href=(url:string)=>inner&&url.startsWith('#')?`/${url}`:url;
 const render=(item:typeof items[number])=><Link key={item.id} href={href(item.url)||'/'} target={item.newTab?'_blank':undefined} rel={item.newTab?'noopener noreferrer':undefined} onClick={close} className={active===item.url.slice(1)?'active':''} aria-current={active===item.url.slice(1)?'location':undefined}>{item.label}</Link>;
 return <><a className="skip-link" href="#main">Skip to content</a><header ref={header} className={`navbar ${scrolled||open||!content.home.enabled||!content.hero.enabled?'solid':''}`}><div className="nav-inner"><Link className="brand" href="/">{content.settings.logo&&<Image className="brand-logo" src={content.settings.logo} alt="" width={34} height={34} unoptimized/>}{content.settings.lcName}<small>LCEB APPLICATION {content.settings.applicationYear}</small></Link><button ref={toggle} className="menu-toggle" aria-label={open?'Close navigation':'Open navigation'} aria-expanded={open} aria-controls="main-navigation" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button><nav id="main-navigation" aria-label="Main navigation" className={open?'nav-links open':'nav-links'} onKeyDown={e=>{if(e.key==='Escape'){close();toggle.current?.focus();}}}>{primary.map(render)}{overflow.length>0&&<details ref={more} className="more"><summary>More <ChevronDown size={14}/></summary><div className="more-menu">{overflow.map(render)}</div></details>}</nav></div></header>{scrolled&&<a href="#main" className="back-top" aria-label="Back to top"><ArrowUp size={20}/></a>}</>;
}
