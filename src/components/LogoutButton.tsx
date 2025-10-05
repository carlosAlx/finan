'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from './Button/Button';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      title="Sair"
      variant="secondary"
      onClick={handleLogout}
      disabled={loading}
    >
      {loading ? 'Saindo...' : 'Sair'}
    </Button>
  );
}