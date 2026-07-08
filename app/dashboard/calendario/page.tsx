import { PrismaClient } from "@prisma/client";
import CalendarioGrid from "./CalendarioGrid";

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export default async function CalendarioPage() {
  // 1. Buscamos las publicaciones reales en lugar de las tareas
  const publicaciones = await prisma.publicacion.findMany({
    include: { cliente: { select: { nombre: true } } },
    orderBy: { fechaPrevista: 'asc' }
  });

  // 2. Traemos los clientes para el menú desplegable de "Nuevo Evento"
  const clientes = await prisma.cliente.findMany({
    where: { activo: true },
    select: { id: true, nombre: true },
    orderBy: { nombre: 'asc' }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Grilla de Publicación</h2>
        <p className="text-gray-500">Hacé clic en un día para programar. Clic en un posteo para completarlo y reprogramar el próximo.</p>
      </div>
      
      {/* 3. Le pasamos las variables con los nombres exactos que espera el hijo */}
      <CalendarioGrid publicacionesIniciales={publicaciones} clientes={clientes} />
    </div>
  );
}