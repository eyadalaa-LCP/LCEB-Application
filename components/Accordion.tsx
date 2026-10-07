'use client';
import {useState} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'framer-motion';
import {Plus,Minus} from 'lucide-react';
import {ordered,type SiteContent} from '@/lib/schema';
type AccordionGroup = SiteContent['functions']['groups'][number] & {description?:string};
export default function Accordion({groups,prefix,minimal=false}:{groups:AccordionGroup[];prefix:string;minimal?:boolean}){
 const [open,setOpen]=useState<string[]>([]),reduced=useReducedMotion();
 return <div className={`accordion${minimal?' functional-accordion':''}`}>{ordered(groups).map((group,i)=>{const expanded=open.includes(group.id),id=`${prefix}-${group.id}`;return <div className="accordion-item" key={group.id}><h3><button id={`${id}-button`} onClick={()=>setOpen(expanded?open.filter(x=>x!==group.id):[...open,group.id])} aria-expanded={expanded} aria-controls={id}>{!minimal&&<span className="accordion-number">{String(i+1).padStart(2,'0')}</span>}<span className="accordion-title">{group.title}</span>{!minimal&&<span className="question-count">{ordered(group.questions).length} questions</span>}{expanded?<Minus size={20} aria-hidden="true"/>:<Plus size={20} aria-hidden="true"/>}</button></h3><AnimatePresence initial={false}>{expanded&&<motion.div id={id} role="region" aria-labelledby={`${id}-button`} initial={{height:reduced?'auto':0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:reduced?0:0.3}} className="accordion-content"><div className="accordion-inside">{!minimal&&group.description&&<p>{group.description}</p>}<ol>{ordered(group.questions).map(q=><li key={q.id}>{q.text}</li>)}</ol></div></motion.div>}</AnimatePresence></div>})}</div>;
}
