import Sidebar from "./Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* El Menú que armamos recién */}
      <Sidebar />

      {/* 
        El contenedor principal. 
        Le ponemos pt-16 para que en celular el contenido no quede tapado por la barra superior. 
        En compu (md:pt-0) se ve normal.
      */}
      <main className="flex-1 w-full pt-16 md:pt-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}