import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nueva = await prisma.publicacion.create({
      data: {
        tipo: body.tipo,
        fechaPrevista: new Date(body.fechaPrevista),
        clienteId: body.clienteId,
      },
      include: { cliente: { select: { nombre: true } } }
    });
    return NextResponse.json(nueva);
  } catch (error) {
    console.error("ERROR DE PRISMA AL CREAR:", error);
    return NextResponse.json({ error: "Error al crear" }, { status: 500 });
  }
}