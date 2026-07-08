import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Armamos un objeto inteligente con lo que venga en la petición
    const dataToUpdate: any = {};
    
    if (body.estado !== undefined) {
      dataToUpdate.estado = body.estado;
      dataToUpdate.fechaCompletado = body.estado === "COMPLETADO" ? new Date() : null;
    }

    if (body.paginasCanva !== undefined) {
      dataToUpdate.paginasCanva = body.paginasCanva;
    }

    const tareaActualizada = await prisma.tarea.update({
      where: { id },
      data: dataToUpdate
    });

    return NextResponse.json(tareaActualizada);
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar la tarea" }, { status: 500 });
  }
}