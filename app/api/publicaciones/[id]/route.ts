import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const actualizada = await prisma.publicacion.update({
      where: { id },
      data: { estado: body.estado }
    });
    return NextResponse.json(actualizada);
  } catch (error) {
    console.error("ERROR DE PRISMA AL ACTUALIZAR:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}