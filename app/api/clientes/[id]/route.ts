import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// Obtener un cliente específico
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cliente = await prisma.cliente.findUnique({ where: { id } });
    
    if (!cliente) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json(cliente);
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// Actualizar el cliente
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 1. Verificamos la sesión con el método que ya nos funciona perfecto
    const session = await getServerSession(authOptions);
    const esAdmin = (session?.user as any)?.role === "ADMIN";
    
    if (!session || !esAdmin) {
      return NextResponse.json({ error: "No autorizado. Solo ADMIN puede editar." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    // 2. Actualizamos el cliente
    const clienteActualizado = await prisma.cliente.update({
      where: { id },
      data: {
        nombre: body.nombre,
        codigoInterno: body.codigoInterno || null,
        instagramUser: body.instagramUser || null,
        instagramPass: body.instagramPass || null,
        montoMensual: parseFloat(body.montoMensual),
        montoSecundario: body.montoSecundario ? parseFloat(body.montoSecundario) : null,
        celular: body.celular || null,
        cuit: body.cuit || null,
      }
    });

    return NextResponse.json(clienteActualizado);
  } catch (error) {
    console.error("Error al actualizar:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}