/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    // No role check here - allowing all roles to fetch alerts per recent change
    // But casting to satisfy ESLint
    const userRole = (session.user as { role?: string }).role;
    console.log("[API/alerts] Fetching alerts for role:", userRole);

    const alerts = await prisma.alert.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("[API/alerts] Error:", error);
    return NextResponse.json({ error: 'Error al obtener alertas' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
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
