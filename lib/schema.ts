import { z } from 'zod';
const text = z.string().max(30000);
export const safeUrl = z.string().max(2048).refine(v => !v || /^(https:\/\/|mailto:|\/(?!\/)|#[a-zA-Z0-9_-])/.test(v), 'Use HTTPS, mailto, a local path, or a section anchor.');
const color = z.string().regex(/^#[\da-fA-F]{6}$/, 'Use a six-digit hex color.');
const base = { id:z.string().min(1).max(100), enabled:z.boolean(), order:z.number().int().min(0).max(10000) };
export const questionSchema = z.object({...base,text});
const image = z.object({...base,url:safeUrl,alt:text});
const item = z.object({...base,number:text,title:text,subtitle:text,description:text,frequency:text,icon:z.enum(['users','calendar','compass','file','globe','heart','award','sparkles']),quarter:text,link:safeUrl});
const section = {enabled:z.boolean(),title:text,subtitle:text};
const pattern = z.object({imageUrl:safeUrl,opacity:z.number().min(0).max(1),size:text,position:text,repeat:z.enum(['repeat','no-repeat']),blendMode:z.enum(['normal','overlay','soft-light','multiply','screen']),gradientOverlay:z.boolean()});
const group = z.object({...base,title:text,description:text,questions:z.array(questionSchema).max(100)});
/** Upgrade old functional descriptions without mutating the stored document. */
export function migrateFunctionGroup(input: unknown): unknown {
 if (!input || typeof input !== 'object' || Array.isArray(input)) return input;
 const source = input as Record<string, unknown>;
 if (source.questions !== undefined && !Array.isArray(source.questions)) return input;
 const questions = [...(source.questions as unknown[] | undefined || [])];
 const description = typeof source.description === 'string' ? source.description.trim() : '';
 if (description && description !== 'Functional questions will be published here when confirmed.') {
  const lines = description.replace(/\r\n?/g, '\n').split('\n');
  const marker = /^\s*(?:\d+\s*[.)\-:]\s*|[-*•]\s+)(.*)$/;
  let texts: string[];
  if (lines.some(line => marker.test(line))) {
   texts = [];
   for (const line of lines) {
    const match = line.match(marker);
    if (match) texts.push(match[1]);
    else if (texts.length) texts[texts.length - 1] += `\n${line}`;
    else if (line.trim()) texts.push(line);
   }
  } else {
   texts = description.split(/\n\s*\n/);
  }
  const existing = new Set(questions.flatMap(q => q && typeof q === 'object' && 'text' in q && typeof q.text === 'string' ? [q.text.trim()] : []));
  const ids = new Set(questions.flatMap(q => q && typeof q === 'object' && 'id' in q ? [q.id] : []));
  let order = questions.reduce<number>((max,q) => q && typeof q === 'object' && 'order' in q && typeof q.order === 'number' ? Math.max(max,q.order + 1) : max, 0);
  texts.forEach((value,index) => {
   const text = value.trim();
   if (text && existing.has(text)) return;
   let id = `legacy-${String(source.id || 'function').slice(0,65)}-${index + 1}`;
   while (ids.has(id)) id += '-x';
   ids.add(id);
   questions.push({id,text,enabled:Boolean(text),order:order++});
  });
 }
 return {id:source.id,title:source.title,enabled:source.enabled,order:source.order,questions};
}
export const functionGroupSchema = z.preprocess(migrateFunctionGroup,z.object({...base,title:text,questions:z.array(questionSchema).max(100)}));
function migrateSubmission(input:unknown):unknown {
 if (!input || typeof input!=='object' || Array.isArray(input)) return input;
 const source=input as Record<string,unknown>;
 if ('contactCardId' in source) return source;
 return {...source,contactCardId:'guideline-3',contacts:Array.isArray(source.contacts)?source.contacts.map(contact=>{
  if (!contact || typeof contact!=='object') return contact;
  const value=contact as Record<string,unknown>;
  return {...value,role:value.role==='LCPe'?'LCPe / Current':value.role==='LCPc'?'LCPc / Elected':value.role};
 }):source.contacts};
}
export const contentSchema = z.object({
 settings:z.object({websiteTitle:text,lcName:text,applicationYear:z.string().min(1).max(30),primaryColor:color,secondaryColor:color,accentColor:color,logo:safeUrl,favicon:safeUrl,seoTitle:text,seoDescription:text,ogTitle:text,ogDescription:text,socialImage:safeUrl,pattern}),
 navigation:z.array(z.object({...base,label:text,url:safeUrl,inMore:z.boolean(),newTab:z.boolean()})).max(30),
 home:z.object({enabled:z.boolean(),eyebrow:text}),
 hero:z.object({enabled:z.boolean(),title:text,subtitle:text,description:text,backgroundWord:text,backgroundWordOpacity:z.number().min(0).max(1),backgroundWordSize:z.enum(['medium','large','extra-large']),backgroundWordPosition:z.enum(['top','center','bottom']),backgroundWordUppercase:z.boolean(),backgroundWordMobileVisible:z.boolean(),backgroundWordDesktopVisible:z.boolean(),backgroundImage:safeUrl,heroImages:z.array(image).max(5),patternImage:safeUrl,overlayOpacity:z.number().min(0).max(1),primaryButtonText:text,primaryButtonUrl:safeUrl,secondaryButtonText:text,secondaryButtonUrl:safeUrl}),
 lcpWord:z.object({...section,name:text,role:text,term:text,message:text,photoUrl:safeUrl,photoBackground:color,photoObjectPosition:z.enum(['center','top','bottom','left','right']),sectionBackground:color,textColor:color,signatureImage:safeUrl,quote:text,patternImage:safeUrl}),
 about:z.object({...section,paragraphs:text,story:text,images:z.array(image).max(10),statistics:z.array(z.object({...base,value:text,label:text})).max(12),values:z.array(z.object({...base,title:text,description:text})).max(12),quote:text}),
 timeline:z.object({...section,events:z.array(z.object({...base,date:z.string().refine(v=>!v||/^\d{4}-\d{2}-\d{2}$/.test(v),'Use YYYY-MM-DD.'),title:text,description:text,icon:item.shape.icon,type:z.enum(['Application Release','DDL','Elections','Selections','Announcement','Interview','Custom']),time:text,link:safeUrl})).max(50)}),
 commitments:z.object({...section,items:z.array(item).max(50)}),
 package:z.object({...section,items:z.array(item).max(50)}),
 questionnaire:z.object({...section,groups:z.array(group).max(30)}),
 direction:z.object({...section,instruction:text,steps:z.array(questionSchema).max(50)}),
 functions:z.object({...section,groups:z.array(functionGroupSchema).max(30)}),
 personalAssessment:z.object({...section,items:z.array(z.object({...base,title:text,description:text,url:safeUrl,icon:item.shape.icon,newTab:z.boolean()})).max(30)}),
 cv:z.object({...section,description:text,templateUrl:safeUrl,exampleUrl:safeUrl}),
 submissionGuidelines:z.preprocess(migrateSubmission,z.object({...section,cards:z.array(z.object({...base,title:text,description:text})).max(30),contactCardId:z.string(),contacts:z.array(z.object({...base,role:text,email:z.email()})).max(10)})),
 customSections:z.array(z.object({...base,title:text,subtitle:text,body:text,imageUrl:safeUrl,linkLabel:text,linkUrl:safeUrl,dark:z.boolean()})).max(20),
 footer:z.object({title:text,description:text,developerCredit:text,quickLinks:z.array(z.object({...base,label:text,url:safeUrl})).max(20),socialLinks:z.array(z.object({...base,label:text,url:safeUrl})).max(20)})
});
export type SiteContent = z.infer<typeof contentSchema>;
export type Pattern = SiteContent['settings']['pattern'];
export const ordered = <T extends {enabled:boolean;order:number}>(items:T[]) => items.filter(i=>i.enabled).toSorted((a,b)=>a.order-b.order);
export const withYear = (text:string, year:string) => text.replaceAll('{year}',year);
