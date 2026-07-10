import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link"; // Agregamos Link para que las tarjetas sean clickeables

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Verificamos si el usuario es ADMIN
  const isAdmin = (session.user as any).role === "ADMIN";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Barra de Navegación Superior (El botón de salir ahora está en el Sidebar, acá lo simplificamos) */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Somos Nene - Panel</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Hola, <strong>{session.user?.name || session.user?.email}</strong>
          </span>
        </div>
      </nav>

      {/* Contenido Principal */}
      <main className="p-8 flex-1">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            ¡Bienvenido al sistema! 🚀
          </h2>
          <p className="text-gray-600 mb-8">
            Seleccioná una opción para comenzar a trabajar.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* VISTA PARA ADMINS */}
            {isAdmin ? (
              <>
                <Link href="/dashboard/clientes" className="p-6 bg-blue-50 rounded-lg border border-blue-100 hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-blue-800 text-lg">👥 Clientes Vigentes</h3>
                  <p className="text-blue-600 text-sm mt-2">Gestionar clientes y montos mensuales</p>
                </Link>
                
                <Link href="/dashboard/calendario" className="p-6 bg-purple-50 rounded-lg border border-purple-100 hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-purple-800 text-lg">📅 Calendario</h3>
                  <p className="text-purple-600 text-sm mt-2">Ver cronograma general de la agencia</p>
                </Link>

                <Link href="/dashboard/finanzas" className="p-6 bg-green-50 rounded-lg border border-green-100 hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-green-800 text-lg">📊 Bóveda (Pagos)</h3>
                  <p className="text-green-600 text-sm mt-2">Control de finanzas y facturación</p>
                </Link>
              </>
            ) : (
              
              /* VISTA PARA EMPLEADOS */
              <>
                <Link href="/dashboard/tareas" className="p-6 bg-orange-50 rounded-lg border border-orange-100 hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-orange-800 text-lg">✅ Tareas Pendientes</h3>
                  <p className="text-orange-600 text-sm mt-2">Ver tu lista de producción asignada</p>
                </Link>
              </>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}