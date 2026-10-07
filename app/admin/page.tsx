import {redirect} from 'next/navigation';
import {isAdmin} from '@/lib/auth';
import {loadContent} from '@/lib/content';
import AdminEditor from '@/components/admin/AdminEditor';
export const dynamic='force-dynamic';
export const metadata={title:'Website editor | AIESEC in Suez',robots:{index:false,follow:false}};
export default async function Admin(){if(!await isAdmin())redirect('/admin/login');const data=await loadContent();return <AdminEditor initial={data.content} source={data.source} warning={data.warning}/>}
