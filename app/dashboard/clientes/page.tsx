import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export default async function ClientesPage() {
  const session = await getServerSession(authOptions);
  const esAdmin = (session?.user as any)?.role === "ADMIN";

  if (!session || !esAdmin) {
    redirect("/dashboard");
  }
  
  const clientes = await prisma.cliente.findMany({
    where: { activo: true },
    orderBy: { createdAt: 'desc' }
  });
  
  const totalMensual = clientes.reduce((acc, cliente) => acc + Number(cliente.montoMensual || 0), 0);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Clientes Vigentes</h2>
        <span className="bg-green-100 text-green-800 font-bold px-3 py-1 rounded-full text-sm">
          Total: ${totalMensual.toLocaleString("es-AR", { maximumFractionDigits: 0 })} USD
        </span>
        <Link href="/dashboard/clientes/nuevo" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium">
          + Nuevo Cliente
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b">
            <tr>
              <th className="px-6 py-4 font-semibold">Cliente (Instagram)</th>
              <th className="px-6 py-4 font-semibold">ID</th>
              {esAdmin && <th className="px-6 py-4 font-semibold">Monto USD</th>}
              <th className="px-6 py-4 font-semibold">Clave IG</th>
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
                  
                  {/* COLUMNA PRINCIPAL: Ahora prioriza el Instagram */}
                  <td className="px-6 py-4">
                    <div className="font-bold text-purple-700 text-base">
                      {cliente.instagramUser ? `@${cliente.instagramUser}` : cliente.nombre}
                    </div>
                    {cliente.instagramUser && (
                      <div className="text-xs text-gray-500 mt-0.5">{cliente.nombre}</div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 text-gray-500">{cliente.codigoInterno || "-"}</td>
                  
                  {esAdmin && (
                    <td className="px-6 py-4">
                      <span className="font-medium text-green-700">${Number(cliente.montoMensual).toLocaleString("es-AR", { maximumFractionDigits: 0 })}</span>
                      {Number(cliente.montoSecundario) > 0 && (
                        <span className="text-gray-400 ml-2 block text-xs">
                          Sec: ${Number(cliente.montoSecundario).toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                        </span>
                      )}
                    </td>
                  )}
                  
                  <td className="px-6 py-4">
                    <div className="font-mono text-xs text-gray-500">{cliente.instagramPass || "-"}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
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