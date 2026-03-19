"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";
import { PrismaClient, Role } from "@/generated/client";
import bcrypt from "bcryptjs";

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
      name: true,
      role: true,
      createdAt: true,
    }
  });
}

export async function createUser(data: { email: string; name: string; password?: string; role: Role }) {
  await checkAdmin();
  
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existingUser) {
    throw new Error("El email ya está registrado.");
  }

  const hashedPassword = await bcrypt.hash(data.password || "user123", 10);

  return await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: hashedPassword,
      role: data.role,
    }
  });
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
