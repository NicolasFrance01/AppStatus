"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";
import { PrismaClient, Role } from "@/generated/client";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "./email";

// Use same workaround for server actions
const prisma = new PrismaClient();

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    throw new Error("No autorizado. Se requiere rol ADMIN.");
  }
}

export async function getUsers() {
  await checkAdmin();
  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      role: true,
      createdAt: true,
      passwordExpiresAt: true,
      mustChangePassword: true,
    }
  });
}

export async function createUser(data: { email: string; name: string; username: string; password?: string; role: Role }) {
  await checkAdmin();
  
  // Ensure @ prefix
  const normalizedUsername = data.username.startsWith('@') ? data.username : `@${data.username}`;

  const existingEmail = await prisma.user.findUnique({
    where: { email: data.email }
  });
  if (existingEmail) throw new Error("El email ya está registrado.");

  const existingUser = await prisma.user.findUnique({
    where: { username: normalizedUsername }
  });
  if (existingUser) throw new Error("El nombre de usuario ya está en uso.");

  const rawPassword = data.password || Math.random().toString(36).slice(-8);
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  // Set expiration to 48h from now if it's a new password
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 48);

  const newUser = await prisma.user.create({
    data: {
      email: data.email,
      username: normalizedUsername,
      name: data.name,
      password: hashedPassword,
      role: data.role,
      passwordExpiresAt: expiresAt,
      mustChangePassword: true,
    }
  });

  // Send Welcome Email
  try {
    const loginUrl = process.env.NEXTAUTH_URL || 'https://app-status-green.vercel.app';
    await sendWelcomeEmail(data.email, data.name, normalizedUsername, rawPassword, loginUrl);
  } catch (err) {
    console.error("Failed to send welcome email:", err);
    // Continue anyway as user is created
  }

  return newUser;
}

export async function deleteUser(id: string) {
  await checkAdmin();
  
  // Prevent deleting self (optional but safer)
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.id === id) {
    throw new Error("No puedes eliminar tu propio usuario.");
  }

  return await prisma.user.delete({
    where: { id }
  });
}

export async function updateUserRole(id: string, role: Role) {
  await checkAdmin();
  
  return await prisma.user.update({
    where: { id },
    data: { role }
  });
}

export async function updateUser(id: string, data: { email: string; name: string; username: string; password?: string; role: Role }) {
  await checkAdmin();
  
  const normalizedUsername = data.username.startsWith('@') ? data.username : `@${data.username}`;

  // Checking conflicts
  const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingEmail && existingEmail.id !== id) throw new Error("El email ya está registrado por otro usuario.");

  const existingUser = await prisma.user.findUnique({ where: { username: normalizedUsername } });
  if (existingUser && existingUser.id !== id) throw new Error("El nombre de usuario ya está en uso por otro integrante.");

  const updateData: any = {
    email: data.email,
    username: normalizedUsername,
    name: data.name,
    role: data.role,
  };

  if (data.password && data.password.trim() !== "") {
    updateData.password = await bcrypt.hash(data.password, 10);
    // If admin resets password, we set expiration to 48h again as priority
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);
    updateData.passwordExpiresAt = expiresAt;
    updateData.mustChangePassword = true;
  }

  return await prisma.user.update({
    where: { id },
    data: updateData
  });
}

export async function updateMyProfile(data: { email: string; password?: string }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("No autenticado.");
  
  const userId = (session.user as any).id;
  
  const updateData: any = {
    email: data.email,
  };

  if (data.password && data.password.trim() !== "") {
    updateData.password = await bcrypt.hash(data.password, 10);
    updateData.passwordExpiresAt = null;
    updateData.mustChangePassword = false;
  }

  return await prisma.user.update({
    where: { id: userId },
    data: updateData
  });
}
