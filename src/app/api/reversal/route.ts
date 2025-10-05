import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

const ReversalSchema = z.object({ transactionId: z.number().int().positive() });

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const body = await request.json();
    const parsed = ReversalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 });
    }

    const original = await prisma.transaction.findUnique({ where: { id: parsed.data.transactionId } });
    if (!original) return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 });
    if (original.status === 'REVERSED') return NextResponse.json({ error: 'Transação já revertida' }, { status: 400 });

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

    return NextResponse.json({ message: 'Operação revertida' });
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}