'use client';
import {ArrowDown,ArrowUp,Copy,Plus,Trash2} from 'lucide-react';
import type {SiteContent} from '@/lib/schema';

type FunctionBlock=SiteContent['functions']['groups'][number];
type Question=FunctionBlock['questions'][number];
type Functions=SiteContent['functions'];
const normalize=<T extends {order:number}>(items:T[])=>items.map((item,order)=>({...item,order}));
const move=<T,>(items:T[],index:number,offset:number)=>{const copy=[...items];[copy[index],copy[index+offset]]=[copy[index+offset],copy[index]];return copy;};

function ListControls({index,length,noun,onMove,onDuplicate,onDelete}:{index:number;length:number;noun:string;onMove:(offset:number)=>void;onDuplicate:()=>void;onDelete:()=>void}) {
 return <div className="repeat-controls">
  <button type="button" className="mini-button" disabled={index===0} aria-label={`Move ${noun} up`} onClick={()=>onMove(-1)}><ArrowUp size={14}/> Up</button>
  <button type="button" className="mini-button" disabled={index===length-1} aria-label={`Move ${noun} down`} onClick={()=>onMove(1)}><ArrowDown size={14}/> Down</button>
  <button type="button" className="mini-button" aria-label={`Duplicate ${noun}`} onClick={onDuplicate}><Copy size={14}/> Duplicate</button>
  <button type="button" className="mini-button danger" aria-label={`Delete ${noun}`} onClick={()=>{if(confirm(`Delete this ${noun}? The change will be applied when you save.`))onDelete();}}><Trash2 size={14}/> Delete</button>
 </div>;
}

export default function FunctionalEditor({value,onChange}:{value:Functions;onChange:(value:Functions)=>void}) {
 const groups=[...value.groups].sort((a,b)=>a.order-b.order);
 const setGroups=(items:FunctionBlock[])=>onChange({...value,groups:normalize(items)});
 const update=(id:string,change:Partial<FunctionBlock>)=>setGroups(groups.map(group=>group.id===id?{...group,...change}:group));
 const setQuestions=(id:string,questions:Question[])=>update(id,{questions:normalize(questions)});
 return <div className="functional-editor">
  <div className="admin-fields">
   <label className="field-check"><input type="checkbox" checked={value.enabled} onChange={e=>onChange({...value,enabled:e.target.checked})}/>Section enabled</label>
   <label className="field"><span className="field-label">Section title</span><textarea value={value.title} onChange={e=>onChange({...value,title:e.target.value})} rows={2}/></label>
   <label className="field"><span className="field-label">Section subtitle</span><input value={value.subtitle} onChange={e=>onChange({...value,subtitle:e.target.value})}/></label>
  </div>
  <div className="repeatable-heading"><h3>Functions</h3><button type="button" className="mini-button" onClick={()=>setGroups([...groups,{id:crypto.randomUUID(),title:'New function',enabled:true,order:groups.length,questions:[]}])}><Plus size={14}/>Add Function</button></div>
  {groups.map((group,index)=>{
   const questions=[...group.questions].sort((a,b)=>a.order-b.order);
   return <details className="repeat-item function-editor-block" key={group.id}>
    <summary>{group.title||'Untitled function'}{!group.enabled?' · Hidden':''}</summary>
    <ListControls index={index} length={groups.length} noun="function" onMove={offset=>setGroups(move(groups,index,offset))} onDuplicate={()=>{const copy={...group,id:crypto.randomUUID(),questions:questions.map(q=>({...q,id:crypto.randomUUID()}))};const next=[...groups];next.splice(index+1,0,copy);setGroups(next);}} onDelete={()=>setGroups(groups.filter(x=>x.id!==group.id))}/>
    <div className="admin-fields">
     <label className="field"><span className="field-label">Function title</span><input value={group.title} onChange={e=>update(group.id,{title:e.target.value})}/></label>
     <label className="field-check"><input type="checkbox" checked={group.enabled} onChange={e=>update(group.id,{enabled:e.target.checked})}/>Function enabled</label>
    </div>
    <div className="repeatable-heading"><h4>Questions</h4></div>
    <p className="admin-note">Write each question separately. Numbering updates automatically; hidden questions are skipped on the website.</p>
    <div className="functional-question-list">
     {questions.map((question,qIndex)=><div className="functional-question-editor" key={question.id}>
      <label className="field"><span className="field-label">Question {qIndex+1}</span><textarea value={question.text} onChange={e=>setQuestions(group.id,questions.map(q=>q.id===question.id?{...q,text:e.target.value}:q))} rows={3} placeholder="Write the question without a number"/></label>
      <label className="field-check"><input type="checkbox" checked={question.enabled} onChange={e=>setQuestions(group.id,questions.map(q=>q.id===question.id?{...q,enabled:e.target.checked}:q))}/>Question enabled</label>
      <ListControls index={qIndex} length={questions.length} noun={`question ${qIndex+1}`} onMove={offset=>setQuestions(group.id,move(questions,qIndex,offset))} onDuplicate={()=>{const next=[...questions];next.splice(qIndex+1,0,{...question,id:crypto.randomUUID()});setQuestions(group.id,next);}} onDelete={()=>setQuestions(group.id,questions.filter(q=>q.id!==question.id))}/>
     </div>)}
    </div>
    <button type="button" className="mini-button add-question" onClick={()=>setQuestions(group.id,[...questions,{id:crypto.randomUUID(),text:'',enabled:true,order:questions.length}])}><Plus size={16}/>Add Question</button>
   </details>;
  })}
 </div>;
}
