import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type LoginPayload = { email: string; password: string };
type RegisterPayload = { email: string; password: string; name?: string };

export function useLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (payload: LoginPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Falha no login');
        return { ok: false, data };
      }
      router.push('/operacoes');
      return { ok: true, data };
    } catch (e) {
      setError('Erro de rede');
      return { ok: false };
    } finally {
      setLoading(false);
    }
  }, [router]);

  return { login, loading, error };
}

export function useRegister() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async (payload: RegisterPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Falha no cadastro');
        return { ok: false, data };
      }
      router.push('/login');
      return { ok: true, data };
    } catch (e) {
      setError('Erro de rede');
      return { ok: false };
    } finally {
      setLoading(false);
    }
  }, [router]);

  return { register, loading, error };
}