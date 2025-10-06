'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

type ActionOk = { ok: true; message?: string };
type ActionErr = { ok: false; error: string };
export type ActionResult = ActionOk | ActionErr;

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2).optional(),
});

export async function registerAction(payload: { email: string; password: string; name?: string }): Promise<ActionResult> {
  try {
    const parsed = RegisterSchema.safeParse(payload);
    if (!parsed.success) return { ok: false, error: 'Dados inválidos' };

    const { email, password, name } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { ok: false, error: 'E-mail já cadastrado' };

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { email, passwordHash, name } });
    return { ok: true, message: 'Cadastro realizado' };
  } catch {
    return { ok: false, error: 'Erro interno' };
  }
}

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function loginAction(payload: { email: string; password: string }): Promise<ActionResult> {
  try {
    const parsed = LoginSchema.safeParse(payload);
    if (!parsed.success) return { ok: false, error: 'Dados inválidos' };

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { ok: false, error: 'Credenciais inválidas' };

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return { ok: false, error: 'Credenciais inválidas' };

    const token = signToken(user.id);
    const jar = await cookies();
    jar.set('token', token, { httpOnly: true, sameSite: 'lax', secure: false, path: '/' });

    return { ok: true, message: 'Login realizado' };
  } catch {
    return { ok: false, error: 'Erro interno' };
  }
}