'use client';
import { use, useState } from 'react';
import styles from './login.module.css';
import { Eye, EyeSlash } from 'phosphor-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { FormField } from '@/components/FormField';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
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
          <a href="/cadastro">Cadastrar</a>
          <Button aria-label="Login" type="submit" title="Login">
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}
