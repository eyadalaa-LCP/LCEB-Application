import type { Pattern } from '@/lib/schema';
export default function PatternBackground({pattern,imageUrl}: {pattern:Pattern;imageUrl?:string}) {
 const url=imageUrl||pattern.imageUrl;
 if(!url) return null;
 return <div aria-hidden="true" className="pattern" style={{backgroundImage:`${pattern.gradientOverlay?'linear-gradient(180deg, transparent, var(--navy)), ':''}url(${JSON.stringify(url)})`,opacity:pattern.opacity,backgroundSize:pattern.size,backgroundPosition:pattern.position,backgroundRepeat:pattern.repeat,mixBlendMode:pattern.blendMode}}/>;
}
