import { NextResponse } from 'next/server';
import prisma from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    if (type === 'firebase') {
      const firebaseApps = await prisma.firebaseApp.findMany({
        orderBy: { updatedAt: 'desc' },
        include: { releases: { orderBy: { displayDate: 'desc' }, take: 10 } }
      });
      // Map to a common format if needed, but for now just return them
      return NextResponse.json(firebaseApps);
    }

    const apps = await prisma.app.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    return NextResponse.json(apps);
  } catch (error) {
    console.error('Failed to fetch apps:', error);
    return NextResponse.json({ error: 'Failed to fetch apps' }, { status: 500 });
  }
}
