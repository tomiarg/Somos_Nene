import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Verificamos quién está intentando entrar
  const session = await getServerSession();

  // Si no hay sesión, lo mandamos de vuelta al login
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Barra de Navegación Superior */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Somos Nene - Panel</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Hola, <strong>{session.user?.email}</strong>
          </span>
          {/* Botón temporal de salida (luego le daremos funcionalidad real) */}
          <a href="/api/auth/signout" className="text-sm text-red-500 hover:underline">
            Cerrar Sesión
          </a>
        </div>
      </nav>

      {/* Contenido Principal */}
      <main className="p-8 flex-1">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Bienvenido al nuevo sistema 🚀
          </h2>

          {/* 👇 AGREGA ESTA LÍNEA TEMPORAL 👇 */}
    <pre className="bg-gray-200 p-4 rounded text-xs mt-4">
      {JSON.stringify(session, null, 2)}
    </pre>
          <p className="text-gray-600 mb-8">
            Tu inicio de sesión y conexión a la base de datos están funcionando al 100%.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="font-bold text-blue-800">Clientes Vigentes</h3>
              <p className="text-blue-600 text-sm mt-2">Próximamente...</p>
            </div>
            <div className="p-6 bg-purple-50 rounded-lg border border-purple-100">
              <h3 className="font-bold text-purple-800">Calendario (Tareas)</h3>
              <p className="text-purple-600 text-sm mt-2">Próximamente...</p>
            </div>
            <div className="p-6 bg-green-50 rounded-lg border border-green-100">
              <h3 className="font-bold text-green-800">Pagos</h3>
              <p className="text-green-600 text-sm mt-2">Próximamente...</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}