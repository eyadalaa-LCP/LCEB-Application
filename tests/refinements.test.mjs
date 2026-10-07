import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {contentSchema,functionGroupSchema} from '../lib/schema.ts';
const defaults=JSON.parse(readFileSync(new URL('../data/default-content.json',import.meta.url),'utf8'));
const group={id:'igv',title:'IGV',enabled:true,order:0,questions:[]};

test('legacy numbered questions migrate individually without losing existing questions',()=>{
 const saved={id:'saved',text:'Existing question?',enabled:false,order:5};
 const result=functionGroupSchema.parse({...group,questions:[saved],description:'1- First question?\nExplain your answer.\n2. Second question?\n3) Third question?'});
 assert.equal(result.title,'IGV');assert.equal(result.questions.length,4);assert.deepEqual(result.questions[0],saved);
 assert.deepEqual(result.questions.slice(1).map(q=>q.text),['First question?\nExplain your answer.','Second question?','Third question?']);
 assert.deepEqual(result.questions.map(q=>q.order),[5,6,7,8]);assert.ok(!('description' in result));assert.deepEqual(functionGroupSchema.parse(result),result);
});
test('migration keeps ambiguous prose and separates clear paragraphs',()=>{
 const result=functionGroupSchema.parse({...group,description:'Unnumbered first prompt?\n\nUnnumbered second prompt?'});
 assert.deepEqual(result.questions.map(q=>q.text),['Unnumbered first prompt?','Unnumbered second prompt?']);
});
test('migration retains blank numbered drafts without publishing them',()=>{
 const result=functionGroupSchema.parse({...group,description:'1-\n2-'});
 assert.equal(result.questions.length,2);assert.ok(result.questions.every(q=>q.text===''&&!q.enabled));
});
test('seed notices do not become questions and duplicated legacy copy is not appended',()=>{
 assert.equal(functionGroupSchema.parse({...group,description:'Functional questions will be published here when confirmed.'}).questions.length,0);
 const result=functionGroupSchema.parse({...group,questions:[{id:'q',text:'Existing?',enabled:true,order:0}],description:'1. Existing?\n2. New?'});
 assert.deepEqual(result.questions.map(q=>q.text),['Existing?','New?']);
});
test('old submissions retain cards and emails and migrate default contact labels once',()=>{
 const old=structuredClone(defaults);delete old.submissionGuidelines.contactCardId;
 old.submissionGuidelines.contacts[0].role='LCPe';old.submissionGuidelines.contacts[1].role='My custom label';
 const result=contentSchema.parse(old);
 assert.deepEqual(result.submissionGuidelines.cards,old.submissionGuidelines.cards);
 assert.equal(result.submissionGuidelines.contactCardId,'guideline-3');
 assert.equal(result.submissionGuidelines.contacts[0].role,'LCPe / Current');
 assert.equal(result.submissionGuidelines.contacts[1].role,'My custom label');
 assert.equal(result.submissionGuidelines.contacts[0].email,'eyadalaa@aiesec.net');
 result.submissionGuidelines.contacts[0].role='LCPe';assert.equal(contentSchema.parse(result).submissionGuidelines.contacts[0].role,'LCPe');
});
test('new content keeps all eight original functions, existing hero and LCP controls',()=>{
 const c=contentSchema.parse(defaults);
 assert.deepEqual(c.functions.groups.map(g=>g.title),['IGV','OGV','B2C','IGTe','OGTa','TM','F&L','BD']);
 assert.ok(c.functions.groups.every(g=>Array.isArray(g.questions)&&!('description' in g)));
 assert.equal(c.footer.developerCredit,'Developed by Mohammed Tamer');
 c.hero.backgroundWord='LEGACY';c.hero.backgroundWordMobileVisible=false;c.hero.heroImages.reverse();c.lcpWord.photoObjectPosition='top';
 const saved=contentSchema.parse(JSON.parse(JSON.stringify(c)));assert.deepEqual(saved,c);
});
