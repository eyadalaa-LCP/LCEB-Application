import {redirect} from 'next/navigation';
import {isAdmin} from '@/lib/auth';
export default async function AdminSubroute(){redirect(await isAdmin()?'/admin':'/admin/login');}
