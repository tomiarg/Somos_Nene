import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";

const prisma = new PrismaClient();

// Crear una nueva tarea
export async function POST(request: Request) {
  try {
    // const esAdmin = (session?.user as any)?.role === "ADMIN";

    // Solo los administradores pueden crear/asignar tareas
    // if (!esAdmin) {
    //   return NextResponse.json({ error: "No autorizado" }, { status: 401 }
    //}

    const body = await request.json();
    
    const nuevaTarea = await prisma.tarea.create({
      data: {
        titulo: body.titulo,
        tipo: body.tipo, // CARRUSEL, REEL, STORY, etc.
        fechaAsignada: new Date(body.fechaAsignada), // Convertimos el texto a fecha real
        estado: "PENDIENTE",
        instrucciones: body.instrucciones || null,
        caption: body.caption || null,
        linkCanva: body.linkCanva || null,
        grupoStories: body.grupoStories || null,
        clienteId: body.clienteId,
        asignadoAId: body.asignadoAId || null, // A quién se la damos (ej: Mumi)
      }
    });

    return NextResponse.json(nuevaTarea);
  } catch (error) {
    console.error("Error al crear tarea:", error);
    return NextResponse.json({ error: "Error al crear la tarea" }, { status: 500 });
  }
}

// Leer las tareas (Con filtro inteligente por rol)
export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const userId = (session?.user as any)?.id;
    const esAdmin = (session?.user as any)?.role === "ADMIN";

    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    // Si es ADMIN, trae TODAS las tareas. Si es EMPLEADO, trae SOLO las suyas.
    //const filtro = esAdmin ? {} : { asignadoAId: userId };

    const tareas = await prisma.tarea.findMany({
      //where: filtro,
      include: {
        cliente: { select: { nombre: true } }, // Traemos el nombre del cliente asociado
        asignadoA: { select: { name: true } }  // Traemos el nombre de a quién se le asignó
      },
      orderBy: { fechaAsignada: 'asc' }
    });

    return NextResponse.json(tareas);
  } catch (error) {
    return NextResponse.json({ error: "Error al cargar tareas" }, { status: 500 });
  }
}