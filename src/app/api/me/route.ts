import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  const transactions = await prisma.transaction.findMany({
    where: { OR: [{ fromUserId: user.id }, { toUserId: user.id }] },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, balanceCents: user.balanceCents },
    transactions,
  });
}