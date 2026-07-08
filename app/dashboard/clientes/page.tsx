import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { getServerSession } from "next-auth"; // Importamos el lector de sesiones

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export default async function ClientesPage() {
  // 1. Verificamos quién es el usuario y si es ADMIN
  const session = await getServerSession();
  const esAdmin = (session?.user as any)?.role === "ADMIN";

  const clientes = await prisma.cliente.findMany({
    where: { activo: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Clientes Vigentes</h2>
        <Link href="/dashboard/clientes/nuevo" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium">
          + Nuevo Cliente
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b">
            <tr>
              <th className="px-6 py-4 font-semibold">Cliente</th>
              <th className="px-6 py-4 font-semibold">ID</th>
              
              {/* Ocultamos la cabecera si NO es admin */}
              {esAdmin && <th className="px-6 py-4 font-semibold">Monto USD</th>}
              
              <th className="px-6 py-4 font-semibold">Instagram</th>
              <th className="px-6 py-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-black">
            {clientes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Todavía no hay clientes cargados.
                </td>
              </tr>
            ) : (
              clientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{cliente.nombre}</td>
                  <td className="px-6 py-4 text-gray-500">{cliente.codigoInterno || "-"}</td>
                  
                  {/* Ocultamos la celda del monto si NO es admin */}
                  {esAdmin && (
                    <td className="px-6 py-4">
                      <span className="font-medium text-green-700">${cliente.montoMensual.toFixed(2)}</span>
                      {cliente.montoSecundario && (
                        <span className="text-gray-400 ml-2 block text-xs">Sec: ${cliente.montoSecundario.toFixed(2)}</span>
                      )}
                    </td>
                  )}
                  
                  <td className="px-6 py-4">
                    <div className="font-medium">{cliente.instagramUser || "-"}</div>
                    <div className="font-mono text-xs text-gray-500">{cliente.instagramPass || "-"}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {/* Botón para ver CUIT, Celular y Editar */}
                    <Link 
                      href={`/dashboard/clientes/${cliente.id}`} 
                      className="text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1 rounded-md"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}