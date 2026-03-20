/* eslint-disable @typescript-eslint/no-explicit-any */
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

    let config = await prisma.systemConfig.findUnique({
      where: { id: 'singleton' }
    });

    if (!config) {
      config = await prisma.systemConfig.create({
        data: { id: 'singleton' }
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("[API/config] GET Error:", error);
    return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { syncIntervalMinutes, autoSyncEnabled } = await req.json();

    const config = await prisma.systemConfig.upsert({
      where: { id: 'singleton' },
      update: {
        syncIntervalMinutes: syncIntervalMinutes !== undefined ? Number(syncIntervalMinutes) : undefined,
        autoSyncEnabled: autoSyncEnabled !== undefined ? Boolean(autoSyncEnabled) : undefined,
      },
      create: {
        id: 'singleton',
        syncIntervalMinutes: syncIntervalMinutes !== undefined ? Number(syncIntervalMinutes) : 60,
        autoSyncEnabled: autoSyncEnabled !== undefined ? Boolean(autoSyncEnabled) : true,
      }
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("[API/config] POST Error:", error);
    return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 });
  }
}
