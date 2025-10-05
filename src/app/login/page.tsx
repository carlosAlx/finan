'use client';
import { useState } from 'react';
import { useLogin } from '@/hooks/useAuth';
import styles from './login.module.css';
import { Eye, EyeSlash } from 'phosphor-react';
import { Button } from '@/components/Button/Button';
import { Input } from '@/components/Input/Input';
import { FormField } from '@/components/FormField/FormField';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useLogin();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(formData);
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
          <a href="/cadastro">cadastrar</a>
          {error && <p role="alert" style={{ color: 'var(--color-danger-600)' }}>{error}</p>}
          <Button aria-label="Login" type="submit" title="Login" variant="primary" disabled={loading}>
            {loading ? 'Entrando...' : 'Login'}
          </Button>
        </form>
      </div>
    </div>
  );
}
