'use client';
import {motion,useReducedMotion} from 'framer-motion';
export default function Reveal({children,className='',direction='up'}:{children:React.ReactNode;className?:string;direction?:'up'|'left'|'right'}) {
 const reduced=useReducedMotion();
 return <motion.div className={className} initial={false} whileInView={reduced?{}:{opacity:[0.65,1],y:direction==='up'?[22,0]:0,x:direction==='left'?[-22,0]:direction==='right'?[22,0]:0}} viewport={{once:true,amount:0.12}} transition={{duration:0.55}}>{children}</motion.div>;
}
