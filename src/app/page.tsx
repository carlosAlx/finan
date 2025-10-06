import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth';

export default async function Home() {
  const user = await getAuthenticatedUser();
  if (user) {
    redirect('/operacoes');
  }
  redirect('/login');
}