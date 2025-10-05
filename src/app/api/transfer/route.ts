import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

const TransferSchema = z.object({
  toEmail: z.string().email(),
  amount: z.number().positive(),
});

export async function POST(request: Request) {
  try {
    const fromUser = await getAuthenticatedUser();
    if (!fromUser) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const body = await request.json();
    const parsed = TransferSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 });
    }

    const amountCents = Math.round(parsed.data.amount * 100);
    const toUser = await prisma.user.findUnique({ where: { email: parsed.data.toEmail } });
    if (!toUser) return NextResponse.json({ error: 'Destinatário não encontrado' }, { status: 404 });
    if (toUser.id === fromUser.id) return NextResponse.json({ error: 'Não é possível transferir para si mesmo' }, { status: 400 });

    const freshFrom = await prisma.user.findUnique({ where: { id: fromUser.id } });
    if (!freshFrom || freshFrom.balanceCents < amountCents) {
      return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 });
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
    return NextResponse.json({ message: 'Transferência realizada', balanceCents: updated?.balanceCents });
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}