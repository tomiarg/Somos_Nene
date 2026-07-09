import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import FormularioTarea from "./FormularioTarea"; // Un componente que vamos a crear ahora

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export default async function NuevaTareaPage() {
  const session = await getServerSession();
  const esAdmin = (session?.user as any)?.role === "ADMIN";

  if (!esAdmin) {
    redirect("/dashboard"); // Si un empleado intenta entrar acá, lo pateamos
}

  // Buscamos los clientes activos y los empleados para pasárselos al formulario
  const clientes = await prisma.cliente.findMany({
    where: { activo: true },
    select: { id: true, nombre: true },
    orderBy: { nombre: 'asc' }
  });

  const usuarios = await prisma.user.findMany({
    select: { id: true, name: true, role: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Asignar Nueva Tarea</h2>
      <FormularioTarea clientes={clientes} usuarios={usuarios} />
    </div>
  );
}