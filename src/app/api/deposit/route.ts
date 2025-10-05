import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const DepositSchema = z.object({ amount: z.number().positive() });

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const body = await request.json();
    const parsed = DepositSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 });
    }

    const amountCents = Math.round(parsed.data.amount * 100);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: user.id }, data: { balanceCents: { increment: amountCents } } });
      await tx.transaction.create({
        data: {
          type: 'DEPOSIT',
          amountCents,
          toUserId: user.id,
        },
      });
    });

    const updated = await prisma.user.findUnique({ where: { id: user.id } });
    return NextResponse.json({ message: 'Depósito realizado', balanceCents: updated?.balanceCents });
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}