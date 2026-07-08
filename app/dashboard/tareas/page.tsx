import { PrismaClient } from "@prisma/client";
import TableroTareas from "./TableroTareas"; // Nuestro componente visual mágico
import Link from "next/link";

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export default async function TareasPage() {
  // Buscamos todas las tareas, incluyendo los datos del cliente y de quién la tiene asignada
  const tareas = await prisma.tarea.findMany({
    include: {
      cliente: { select: { nombre: true } },
      asignadoA: { select: { name: true } }
    },
    orderBy: { fechaAsignada: 'asc' }
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Panel de Producción</h2>
        <Link href="/dashboard/tareas/nueva" className="bg-purple-600 text-white px-5 py-2 rounded-md hover:bg-purple-700 font-medium shadow-sm">
          + Asignar Tarea
        </Link>
      </div>

      {/* Le pasamos las tareas al componente interactivo */}
      <TableroTareas tareasIniciales={tareas} />
    </div>
  );
}
