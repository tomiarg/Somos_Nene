    import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const nuevoCliente = await prisma.cliente.create({
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

    return NextResponse.json(nuevoCliente);
  } catch (error) {
    console.error("Error al crear cliente:", error);
    return NextResponse.json({ error: "Error al crear el cliente" }, { status: 500 });
  }
}