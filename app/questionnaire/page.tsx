import PublicSite from '@/components/PublicSite';
import {getContent} from '@/lib/content';
export const dynamic='force-dynamic';
export async function generateMetadata(){const c=await getContent();return {title:`Questionnaire | ${c.settings.lcName} ${c.settings.applicationYear}`,description:'Personal, leadership, management and AIESEC questions for your Executive Board application.'};}
export default async function Questionnaire(){return <PublicSite content={await getContent()} questionnaireOnly/>}
