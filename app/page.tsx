import type {Metadata} from 'next';
import PublicSite from '@/components/PublicSite';
import {getContent} from '@/lib/content';
import {withYear} from '@/lib/schema';
export const dynamic='force-dynamic';
export async function generateMetadata():Promise<Metadata>{const {settings:s}=await getContent();const title=withYear(s.seoTitle,s.applicationYear),description=withYear(s.seoDescription,s.applicationYear);return {title,description,icons:{icon:s.favicon||'/favicon.svg'},openGraph:{title:withYear(s.ogTitle||s.seoTitle,s.applicationYear),description:withYear(s.ogDescription||s.seoDescription,s.applicationYear),...(s.socialImage?{images:[s.socialImage]}:{})},twitter:{card:s.socialImage?'summary_large_image':'summary',title,description,...(s.socialImage?{images:[s.socialImage]}:{})}};}
export default async function Home(){return <PublicSite content={await getContent()}/>}
