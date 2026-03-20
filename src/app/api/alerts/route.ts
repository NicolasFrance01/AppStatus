import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const alerts = await prisma.alert.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return NextResponse.json(alerts);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener alertas' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { id, isRead } = await req.json();
    
    if (id === 'all') {
      await prisma.alert.updateMany({
        where: { isRead: false },
        data: { isRead: true }
      });
    } else {
      await prisma.alert.update({
        where: { id },
        data: { isRead }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar alerta' }, { status: 500 });
  }
}
