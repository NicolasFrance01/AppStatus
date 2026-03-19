import { NextResponse } from 'next/server';
import prisma from "@/lib/db";

export async function GET() {
  try {
    const apps = await prisma.app.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    return NextResponse.json(apps);
  } catch (error) {
    console.error('Failed to fetch apps:', error);
    return NextResponse.json({ error: 'Failed to fetch apps' }, { status: 500 });
  }
}
