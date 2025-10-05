'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

type ActionResult = { ok: true; message?: string; balanceCents?: number | null } | { ok: false; error: string };

export async function depositAction(amount: number): Promise<ActionResult> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return { ok: false, error: 'Não autenticado' };

    const parsed = z.number().positive().safeParse(amount);
    if (!parsed.success) return { ok: false, error: 'Dados inválidos' };

    const amountCents = Math.round(parsed.data * 100);
    const freshUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!freshUser) return { ok: false, error: 'Usuário não encontrado' };
    const incrementCents = freshUser.balanceCents < 0 ? amountCents + Math.abs(freshUser.balanceCents) : amountCents;

    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: user.id }, data: { balanceCents: { increment: incrementCents } } });
      await tx.transaction.create({
        data: {
          type: 'DEPOSIT',
          amountCents: incrementCents,
          toUserId: user.id,
        },
      });
    });

    const updated = await prisma.user.findUnique({ where: { id: user.id } });
    return { ok: true, message: 'Depósito realizado', balanceCents: updated?.balanceCents ?? null };
  } catch (err) {
    return { ok: false, error: 'Erro interno' };
  }
}

export async function transferAction(toEmail: string, amount: number): Promise<ActionResult> {
  try {
    const fromUser = await getAuthenticatedUser();
    if (!fromUser) return { ok: false, error: 'Não autenticado' };

    const schema = z.object({ toEmail: z.string().email(), amount: z.number().positive() });
    const parsed = schema.safeParse({ toEmail, amount });
    if (!parsed.success) return { ok: false, error: 'Dados inválidos' };

    const amountCents = Math.round(parsed.data.amount * 100);
    const toUser = await prisma.user.findUnique({ where: { email: parsed.data.toEmail } });
    if (!toUser) return { ok: false, error: 'Destinatário não encontrado' };
    if (toUser.id === fromUser.id) return { ok: false, error: 'Não é possível transferir para si mesmo' };

    const freshFrom = await prisma.user.findUnique({ where: { id: fromUser.id } });
    if (!freshFrom || freshFrom.balanceCents < amountCents) {
      return { ok: false, error: 'Saldo insuficiente' };
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: fromUser.id }, data: { balanceCents: { decrement: amountCents } } });
      await tx.user.update({ where: { id: toUser.id }, data: { balanceCents: { increment: amountCents } } });
      await tx.transaction.create({
        data: {
          type: 'TRANSFER',
          amountCents,
          fromUserId: fromUser.id,
          toUserId: toUser.id,
        },
      });
    });

    const updated = await prisma.user.findUnique({ where: { id: fromUser.id } });
    return { ok: true, message: 'Transferência realizada', balanceCents: updated?.balanceCents ?? null };
  } catch (err) {
    return { ok: false, error: 'Erro interno' };
  }
}

export async function reversalAction(transactionId: number): Promise<ActionResult> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return { ok: false, error: 'Não autenticado' };

    const parsed = z.number().int().positive().safeParse(transactionId);
    if (!parsed.success) return { ok: false, error: 'Dados inválidos' };

    const original = await prisma.transaction.findUnique({ where: { id: parsed.data } });
    if (!original) return { ok: false, error: 'Transação não encontrada' };
    if (original.status === 'REVERSED') return { ok: false, error: 'Transação já revertida' };

    await prisma.$transaction(async (tx) => {
      if (original.type === 'DEPOSIT') {
        if (!original.toUserId) throw new Error('Transação inválida');
        await tx.user.update({ where: { id: original.toUserId }, data: { balanceCents: { decrement: original.amountCents } } });
      } else if (original.type === 'TRANSFER') {
        if (!original.fromUserId || !original.toUserId) throw new Error('Transação inválida');
        await tx.user.update({ where: { id: original.toUserId }, data: { balanceCents: { decrement: original.amountCents } } });
        await tx.user.update({ where: { id: original.fromUserId }, data: { balanceCents: { increment: original.amountCents } } });
      }

      await tx.transaction.update({ where: { id: original.id }, data: { status: 'REVERSED' } });
      await tx.transaction.create({
        data: {
          type: 'REVERSAL',
          amountCents: original.amountCents,
          fromUserId: original.toUserId ?? undefined,
          toUserId: original.fromUserId ?? undefined,
          relatedTransactionId: original.id,
        },
      });
    });

    return { ok: true, message: 'Operação revertida' };
  } catch (err) {
    return { ok: false, error: 'Erro interno' };
  }
}