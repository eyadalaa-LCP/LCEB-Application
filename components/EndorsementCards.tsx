export default function EndorsementCards({description}:{description:string}) {
 const lines=description.replace(/\r\n?/g,'\n').split('\n');
 const marker=/^\s*(?:\d+[.)\-:]|[-*•])\s+(.+)$/;
 const intro:string[]=[];
 const cards:string[]=[];
 for(const line of lines){
  const match=line.match(marker);
  if(match)cards.push(match[1]);
  else if(cards.length)cards[cards.length-1]+=`\n${line}`;
  else intro.push(line);
 }
 if(!cards.length){cards.push(...description.split(/\n\s*\n/).filter(x=>x.trim()));intro.length=0;}
 return <div className="endorsement-content">{intro.join('\n').trim()&&<p className="endorsement-intro">{intro.join('\n')}</p>}<ol className="endorsement-grid">{cards.map((text,i)=><li className="endorsement-card" key={i}><span className="endorsement-number" aria-hidden="true">{String(i+1).padStart(2,'0')}</span><p>{text.trim()}</p></li>)}</ol></div>;
}
