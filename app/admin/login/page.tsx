import {redirect} from 'next/navigation';
import {isAdmin} from '@/lib/auth';
import Login from '@/components/admin/Login';
export const metadata={title:'Admin login | AIESEC in Suez',robots:{index:false,follow:false}};
export default async function LoginPage(){if(await isAdmin())redirect('/admin');return <Login/>}
