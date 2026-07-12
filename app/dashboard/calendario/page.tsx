import { PrismaClient } from "@prisma/client";
import CalendarioGrid from "./CalendarioGrid";

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export default async function CalendarioPage() {
  // 1. Buscamos las publicaciones reales en lugar de las tareas
  const publicaciones = await prisma.publicacion.findMany({
    include: { cliente: { select: { nombre: true, instagramUser: true } } },
    orderBy: { fechaPrevista: 'asc' }
  });

  // 2. Traemos los clientes para el menú desplegable de "Nuevo Evento"
  const clientes = await prisma.cliente.findMany({
    where: { activo: true },
    select: { id: true, nombre: true },
    orderBy: { nombre: 'asc' }
  });

 return (
    // 👇 Fijate acá, cambiamos p-8 por p-2 sm:p-8
    <div className="p-2 sm:p-8 max-w-7xl mx-auto">
      <div className="mb-4 sm:mb-8 px-2 sm:px-0">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Grilla de Publicación</h2>
        <p className="text-xs sm:text-base text-gray-500 mt-1">Hacé clic en un día para programar. Clic en un posteo para completarlo y reprogramar.</p>
      </div>
      
      <CalendarioGrid publicacionesIniciales={publicaciones} clientes={clientes} />
    </div>
  );
}