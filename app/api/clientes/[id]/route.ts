import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";

const prisma = new PrismaClient();

// Obtener un cliente específico
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // Le decimos que espere a leer el ID
    const cliente = await prisma.cliente.findUnique({ where: { id } });
    
    if (!cliente) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json(cliente);
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// Actualizar el cliente y guardar el historial
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    const userId = (session?.user as any)?.id; 
    
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = await params; // Le decimos que espere a leer el ID
    const body = await request.json();
    
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

    await prisma.historialCliente.create({
      data: {
        accion: "EDITADO",
        detalles: "Se actualizaron los datos del cliente.",
        clienteId: clienteActualizado.id,
        usuarioId: userId
      }
    });

    return NextResponse.json(clienteActualizado);
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}