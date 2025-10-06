'use client';
import { useState } from 'react';
import { registerAction } from '@/app/auth/actions';
import { Button } from '@/components/Button/Button';
import { Input } from '@/components/Input/Input';
import { FormField } from '@/components/FormField/FormField';
import '../globals.css';
import styles from './cadastro.module.css';
import { Eye, EyeSlash } from 'phosphor-react';
import { useRouter } from 'next/navigation';

export default function CadastroPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const nameError = (() => {
    const name = formData.name?.trim();
    if (!name) return undefined;
    if (name.length < 2) return 'Nome deve ter pelo menos 2 caracteres';
    return undefined;
  })();

  const emailError = (() => {
    const email = formData.email.trim();
    if (!email) return undefined;
    if (!emailRegex.test(email)) return 'Email inválido';
    return undefined;
  })();

  const passwordError = (() => {
    const password = formData.password.trim();
    if (!password) return undefined;
    if (password.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
    return undefined;
  })();

  const confirmError = (() => {
    const password = formData.password.trim();
    const confirmPassword = formData.confirmPassword.trim();
    if (!confirmPassword) return undefined;
    if (password !== confirmPassword) return 'As senhas não conferem';
    return undefined;
  })();

  function validate(): string | null {
    const name = formData.name?.trim();
    const email = formData.email.trim();
    const password = formData.password.trim();
    const confirmPassword = formData.confirmPassword.trim();

    if (!emailRegex.test(email)) return 'Email inválido';
    if (password.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
    if (name && name.length > 0 && name.length < 2) return 'Nome deve ter pelo menos 2 caracteres';
    if (password !== confirmPassword) return 'As senhas não conferem';
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setMessageType(null);
    const v = validate();
    if (v) {
      setMessage(v);
      setMessageType("error");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await registerAction({
        name: formData.name || undefined,
        email: formData.email,
        password: formData.password,
      });
      if (!result.ok) {
        setMessage(result.error || 'Falha no cadastro');
        setMessageType('error');
        return;
      }
      setMessage('Cadastro realizado com sucesso. Redirecionando para login...');
      setMessageType('success');
      setTimeout(() => router.push('/login'), 1200);
    } catch {
      setMessage('Erro inesperado');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container_cadastro}>
      <div className={styles.container_form}>
      <h1>Cadastro</h1>
      {message && (
        <div
          aria-live="polite"
          className={`${styles.message} ${messageType === 'error' ? styles.message_error : styles.message_success}`}
        >
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="stack" noValidate>
        <FormField id="name" label="Nome:" error={nameError}
        >
          <Input
            type="text"
            id="name"
            name="name"
            placeholder="Seu nome"
            onChange={handleChange}
            minLength={2}
            invalid={Boolean(nameError)}
          />
        </FormField>

        <FormField id="email" label="Email:" error={emailError}>
          <Input
            type="email"
            id="email"
            name="email"
            placeholder="email@email.com"
            onChange={handleChange}
            required
            invalid={Boolean(emailError)}
          />
        </FormField>

        <FormField id="password" label="Senha:" error={passwordError}>
          <div className={styles.password_input}>
            <Input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              placeholder="********"
              onChange={handleChange}
              minLength={6}
              required
              invalid={Boolean(passwordError)}
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

        <FormField id="confirmPassword" label="Confirmar Senha:" error={confirmError}>
          <div className={styles.password_input}>
            <Input
              type={showConfirm ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              placeholder="********"
              onChange={handleChange}
              minLength={6}
              required
              invalid={Boolean(confirmError)}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              aria-label={showConfirm ? 'Ocultar confirmação' : 'Mostrar confirmação'}
              title={showConfirm ? 'Ocultar confirmação' : 'Mostrar confirmação'}
            >
              {showConfirm ? <EyeSlash /> : <Eye />}
            </button>
          </div>
        </FormField>
        <Button
          type="submit"
          title="Cadastrar"
          variant="primary"
          disabled={
            loading || Boolean(nameError || emailError || passwordError || confirmError)
          }
        >
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </Button>
        <Button
          type="button"
          title="realizar login"
          variant="secondary"
          onClick={() => router.push('/login')}
        >
          Entrar
        </Button>
      </form>
    </div>
  </div>
  );
}
