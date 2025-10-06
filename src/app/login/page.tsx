'use client';
import { useState } from 'react';
import { loginAction } from '@/app/auth/actions';
import styles from './login.module.css';
import { Eye, EyeSlash } from 'phosphor-react';
import { Button } from '@/components/Button/Button';
import { Input } from '@/components/Input/Input';
import { FormField } from '@/components/FormField/FormField';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await loginAction({ email: formData.email, password: formData.password });
      if (!result.ok) {
        setError(result.error || 'Falha no login');
        return;
      }
      router.push('/operacoes');
    } catch {
      setError('Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container_login}>
      <div className={styles.container_form}>
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <FormField id="email" label="Email:">
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="email@email.com"
              onChange={handleChange}
            />
          </FormField>
          <FormField id="password" label="Password:">
            <div className={styles.password_input}>
              <Input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="*********"
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeSlash /> : <Eye />}
              </button>
            </div>
          </FormField>
          {error && <p role="alert" className={styles.error}>{error}</p>}
          <Button aria-label="Login" type="submit" title="Login" variant="primary" disabled={loading}>
            {loading ? 'Entrando...' : 'Login'}
          </Button>
          <Button aria-label="Cadastrar" type="button" title="Cadastrar" variant="secondary" onClick={() => router.push('/cadastro')}>
            Cadastrar
          </Button>
        </form>
      </div>
    </div>
  );
}
