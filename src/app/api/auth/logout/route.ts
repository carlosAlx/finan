import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const jar = await cookies();
  const hasToken = jar.get('token');
  if (hasToken) {
    jar.delete('token');
  }
  return NextResponse.json({ message: 'Logout realizado' });
}

export async function GET() {
  const jar = await cookies();
  const hasToken = jar.get('token');
  if (hasToken) {
    jar.delete('token');
  }
  return NextResponse.json({ message: 'Logout realizado' });
}