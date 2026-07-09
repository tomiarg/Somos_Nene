"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const { data: session } = useSession() || {};
  const pathname = usePathname();
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Nuestra lista de secciones. Podés agregar más en el futuro acá mismo.
  const links = [
    { href: "/dashboard/clientes", icon: "👥", label: "Clientes" },
    { href: "/dashboard/tareas", icon: "✅", label: "Producción (Mumi)" },
    { href: "/dashboard/calendario", icon: "📅", label: "Calendario" },
  ];
  if ((session?.user as any)?.role === "ADMIN") {
    links.push({ href: "/dashboard/finanzas", icon: "📊", label: "Bóveda" });
  }

  // Función para saber si un link está activo
  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <>
      {/* 📱 BARRA SUPERIOR PARA CELULARES (Visible solo en mobile) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900 text-white flex items-center justify-between px-4 z-40 shadow-md">
        <span className="font-bold text-lg tracking-wide">SOMOS NENE</span>
        <button 
          onClick={() => setMenuAbierto(!menuAbierto)} 
          className="p-2 bg-gray-800 rounded-md focus:outline-none"
        >
          {/* Ícono de Hamburguesa (SVG) */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuAbierto ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* 📱 CORTINA OSCURA PARA CELULARES (Al abrir el menú) */}
      {menuAbierto && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMenuAbierto(false)}
        ></div>
      )}

      {/* 💻 BARRA LATERAL (Fija en compu, deslizable en celu) */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out flex flex-col ${
        menuAbierto ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 md:static md:h-screen md:sticky md:top-0`}>
        
        {/* Logo de la Agencia */}
        <div className="h-16 flex items-center justify-center border-b border-gray-800 md:h-20">
          <h1 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            SOMOS NENE
          </h1>
        </div>

        {/* Links de Navegación */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {links.map((link) => {
            const activo = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuAbierto(false)} // Cierra el menú al tocar en celular
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  activo 
                    ? "bg-purple-600 text-white shadow-md shadow-purple-900/50" 
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <span className="text-xl">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Botón de Salir (Base visual por ahora) */}
        <div className="p-4 border-t border-gray-800">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-colors font-medium">
            <span className="text-xl">🚪</span> Cerrar Sesión
          </button>
        </div>
      </div>
    </>
  );
}