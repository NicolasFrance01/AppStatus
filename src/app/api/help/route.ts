import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/client';
import { sendUserHelpEmail } from '@/lib/email';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { username, message } = await req.json();

    if (!username || !message) {
      return NextResponse.json({ error: 'Faltan campos' }, { status: 400 });
    }
    
    // Fetch admins to send email
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' }
    });
    
    const adminEmails = admins.map(a => a.email);

    // Save alert in DB
    await prisma.alert.create({
      data: {
        type: 'USER_HELP',
        message: `El usuario ${username} reportó: ${message}`,
        metadata: { username, rawMessage: message }
      }
    });

    // Send email
    if (adminEmails.length > 0) {
      await sendUserHelpEmail(adminEmails, username, message);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Help API error:', error);
    return NextResponse.json({ error: 'Error interno conectando con el soporte.' }, { status: 500 });
  }
}
