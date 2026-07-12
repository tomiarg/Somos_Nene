"use client";

import { useState } from "react";

export default function TableroTareas({ tareasIniciales }: { tareasIniciales: any[] }) {
  const [tareas, setTareas] = useState(tareasIniciales);
  const [clientesExpandidos, setClientesExpandidos] = useState<Record<string, boolean>>({});
  
  // NUEVO ESTADO: Controla si vemos el tablero agrupado por "CLIENTE" o por "FECHA"
  const [vista, setVista] = useState<"FECHA" | "CLIENTE">("FECHA");

  const hoy = new Date().toISOString().split('T')[0];
  const mesActual = new Date().getMonth();
  
  const tareasParaHoy = tareas.filter(t => new Date(t.fechaAsignada).toISOString().split('T')[0] === hoy && t.estado !== "COMPLETADO").length;
  const tareasPendientes = tareas.filter(t => t.estado !== "COMPLETADO").length;
  const completadasEsteMes = tareas.filter(t => 
    t.estado === "COMPLETADO" && new Date(t.fechaAsignada).getMonth() === mesActual
  ).length;

  // ----------------------------------------------------
  // AGRUPACIÓN 1: POR CLIENTE (Como estaba antes)
  // ----------------------------------------------------
  const tareasPorCliente = tareas.reduce((acc, tarea) => {
    const nombreCliente = tarea.cliente.instagramUser ? `@${tarea.cliente.instagramUser}` : tarea.cliente.nombre;
    if (!acc[nombreCliente]) acc[nombreCliente] = [];
    acc[nombreCliente].push(tarea);
    return acc;
  }, {} as Record<string, any[]>);

  // ----------------------------------------------------
  // AGRUPACIÓN 2: POR FECHA (Lo nuevo)
  // ----------------------------------------------------
  const tareasAtrasadas = tareas.filter(t => t.estado !== "COMPLETADO" && new Date(t.fechaAsignada).toISOString().split('T')[0] < hoy);
  const tareasHoy = tareas.filter(t => t.estado !== "COMPLETADO" && new Date(t.fechaAsignada).toISOString().split('T')[0] === hoy);
  
  // Ordenamos las próximas para que las más urgentes salgan primero
  const tareasProximas = tareas.filter(t => t.estado !== "COMPLETADO" && new Date(t.fechaAsignada).toISOString().split('T')[0] > hoy)
                               .sort((a, b) => new Date(a.fechaAsignada).getTime() - new Date(b.fechaAsignada).getTime());
                               
  const tareasCompletadas = tareas.filter(t => t.estado === "COMPLETADO");

  // ----------------------------------------------------
  // FUNCIONES DE INTERACCIÓN
  // ----------------------------------------------------
  const toggleCliente = (cliente: string) => {
    setClientesExpandidos(prev => ({ ...prev, [cliente]: !prev[cliente] }));
  };

  const toggleCompletado = async (tareaId: string, estadoActual: string) => {
    const nuevoEstado = estadoActual === "COMPLETADO" ? "PENDIENTE" : "COMPLETADO";
    setTareas(tareas.map(t => t.id === tareaId ? { ...t, estado: nuevoEstado } : t));

    await fetch(`/api/tareas/${tareaId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado })
    });
  };

  const guardarFeedback = async (tareaId: string, texto: string) => {
    setTareas(tareas.map(t => t.id === tareaId ? { ...t, paginasCanva: texto } : t));
    await fetch(`/api/tareas/${tareaId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paginasCanva: texto })
    });
  };

  // ----------------------------------------------------
  // COMPONENTE: TARJETA DE TAREA
  // ----------------------------------------------------
  const renderTarjetaTarea = (tarea: any, index: number) => (
    <li key={tarea.id} className={`flex flex-col p-5 bg-white rounded-xl border transition-all hover:shadow-md ${tarea.estado === "COMPLETADO" ? "border-green-200 bg-green-50/30" : "border-gray-200 shadow-sm"}`}>
      <div className="flex items-start gap-4">
        
        <div className="pt-1">
          <input 
            type="checkbox" 
            checked={tarea.estado === "COMPLETADO"}
            onChange={() => toggleCompletado(tarea.id, tarea.estado)}
            className="w-6 h-6 text-green-600 rounded-md border-gray-300 cursor-pointer focus:ring-green-500"
          />
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2 flex-wrap gap-2">
            <p className={`text-lg font-bold flex items-center gap-2 ${tarea.estado === "COMPLETADO" ? "text-green-600 line-through opacity-70" : "text-gray-800"}`}>
              {/* Le agregamos una etiqueta con el nombre del cliente para que no se pierda en la vista de Fechas */}
              <span className="text-xs font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-1 rounded-md">
                {tarea.cliente.instagramUser ? `@${tarea.cliente.instagramUser}` : tarea.cliente.nombre}
              </span>
              {tarea.titulo}
            </p>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              new Date(tarea.fechaAsignada).toISOString().split('T')[0] < hoy && tarea.estado !== "COMPLETADO" 
                ? "bg-red-100 text-red-700" // Rojo si está atrasada
                : new Date(tarea.fechaAsignada).toISOString().split('T')[0] === hoy && tarea.estado !== "COMPLETADO"
                ? "bg-green-100 text-green-700" // Verde si es hoy
                : "bg-gray-100 text-gray-500" // Gris normal
            }`}>
              📅 {new Date(tarea.fechaAsignada).toLocaleDateString()}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 text-sm">
            {tarea.instrucciones && (
              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg">
                <span className="block text-xs font-bold uppercase mb-1 opacity-70">Instrucciones / Espíritu</span>
                {tarea.instrucciones}
              </div>
            )}
            
            {tarea.caption && (
              <div className="bg-gray-50 text-gray-700 p-3 rounded-lg">
                <span className="block text-xs font-bold uppercase mb-1 opacity-70">Caption del Post</span>
                {tarea.caption}
              </div>
            )}

            {(tarea.linkCanva || tarea.linkMaterial) && (
              <div className="flex flex-wrap gap-3 pt-1">
                {tarea.linkCanva && (
                  <a href={tarea.linkCanva} target="_blank" className="inline-flex items-center gap-1 text-purple-700 hover:text-purple-900 hover:underline font-bold bg-purple-100 px-4 py-2 rounded-lg transition-colors">
                    🎨 Link Original de Canva ↗
                  </a>
                )}
                {tarea.linkMaterial && (
                  <a href={tarea.linkMaterial} target="_blank" className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 hover:underline font-bold bg-blue-100 px-4 py-2 rounded-lg transition-colors">
                    📁 Link de Materiales / Drive ↗
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="pt-3">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              📥 Entregable (Link de Drive o Páginas de Canva)
            </label>
            <input
              type="text"
              placeholder="Ej: Ya está subido al Drive / Son las páginas 6 a 12..."
              defaultValue={tarea.paginasCanva || ""}
              onBlur={(e) => guardarFeedback(tarea.id, e.target.value)}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 text-sm text-black focus:border-green-500 focus:ring-green-500 outline-none transition-colors"
            />
          </div>
        </div>
      </div>
    </li>
  );

  const categoriasContenido = [
    { id: "REEL", titulo: "Reels", icono: "🎥" },
    { id: "CARRUSEL", titulo: "Carruseles", icono: "🖼️" },
    { id: "STORY", titulo: "Stories", icono: "📱" },
    { id: "POSTEO", titulo: "Posteos Planos", icono: "📝" },
  ];

  return (
    <div className="space-y-8 text-black">
      
      {/* SECCIÓN 0: SWITCH DE VISTAS (NUEVO) */}
      <div className="flex justify-center sm:justify-end">
        <div className="inline-flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setVista("FECHA")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${vista === "FECHA" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            ⏱️ Ver por Fecha
          </button>
          <button 
            onClick={() => setVista("CLIENTE")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${vista === "CLIENTE" ? "bg-white text-purple-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            👥 Ver por Cliente
          </button>
        </div>
      </div>

      {/* SECCIÓN 1: ESTADÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 border-l-4 border-l-blue-500">
          <p className="text-sm text-gray-500 font-medium">Para Hoy</p>
          <p className="text-3xl font-bold text-gray-800">{tareasParaHoy}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 border-l-4 border-l-orange-500">
          <p className="text-sm text-gray-500 font-medium">Total Pendientes</p>
          <p className="text-3xl font-bold text-gray-800">{tareasPendientes}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 border-l-4 border-l-green-500">
          <p className="text-sm text-gray-500 font-medium">Completadas del Mes</p>
          <p className="text-3xl font-bold text-gray-800">{completadasEsteMes}</p>
        </div>
      </div>

      {/* SECCIÓN 2: RENDERIZADO DINÁMICO SEGÚN LA VISTA ELEGIDA */}
      {vista === "FECHA" ? (
        
        /* ---------------------------------------------------- */
        /* VISTA POR FECHAS (Ideal para producción diaria)      */
        /* ---------------------------------------------------- */
        <div className="space-y-8">
          
          {/* TAREAS ATRASADAS */}
          {tareasAtrasadas.length > 0 && (
            <div className="bg-red-50 p-6 rounded-xl border border-red-100">
              <h3 className="text-xl font-black text-red-700 mb-4 flex items-center gap-2">
                🔴 Atrasadas / Vencidas ({tareasAtrasadas.length})
              </h3>
              <ul className="space-y-4">
                {tareasAtrasadas.map((tarea, index) => renderTarjetaTarea(tarea, index))}
              </ul>
            </div>
          )}

          {/* TAREAS DE HOY */}
          <div className="bg-green-50 p-6 rounded-xl border border-green-100 shadow-sm">
            <h3 className="text-xl font-black text-green-700 mb-4 flex items-center gap-2">
              🟢 Meta de Hoy ({tareasHoy.length})
            </h3>
            {tareasHoy.length === 0 ? (
              <p className="text-green-600 font-medium text-center py-4">¡Todo al día por hoy! 🚀</p>
            ) : (
              <ul className="space-y-4">
                {tareasHoy.map((tarea, index) => renderTarjetaTarea(tarea, index))}
              </ul>
            )}
          </div>

          {/* TAREAS PRÓXIMAS */}
          {tareasProximas.length > 0 && (
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h3 className="text-xl font-black text-blue-700 mb-4 flex items-center gap-2">
                🔵 Próximos días ({tareasProximas.length})
              </h3>
              <ul className="space-y-4">
                {tareasProximas.map((tarea, index) => renderTarjetaTarea(tarea, index))}
              </ul>
            </div>
          )}

        </div>

      ) : (

        /* ---------------------------------------------------- */
        /* VISTA POR CLIENTES (Como estaba antes)               */
        /* ---------------------------------------------------- */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {Object.keys(tareasPorCliente).length === 0 ? (
            <div className="p-8 text-center text-gray-500">No hay tareas asignadas.</div>
          ) : (
            Object.entries(tareasPorCliente).map(([cliente, tareasDelCliente]: [string, any]) => {
              const estaExpandido = clientesExpandidos[cliente];

              return (
                <div key={cliente} className="border-b border-gray-100 last:border-0 bg-gray-50/50">
                  
                  <button 
                    onClick={() => toggleCliente(cliente)}
                    className="w-full flex justify-between items-center p-5 hover:bg-gray-100 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-gray-800">{cliente}</span>
                      <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">
                        {tareasDelCliente.length} tareas
                      </span>
                    </div>
                    <span className="text-gray-400 font-bold text-xl">
                      {estaExpandido ? "−" : "+"}
                    </span>
                  </button>

                  {estaExpandido && (
                    <div className="p-6 space-y-8 bg-gray-50 inset-shadow">
                      {categoriasContenido.map(categoria => {
                        const tareasDeEsteTipo = tareasDelCliente.filter((t: any) => t.tipo === categoria.id && t.estado !== "COMPLETADO");
                        
                        if (tareasDeEsteTipo.length === 0) return null;

                        return (
                          <div key={categoria.id}>
                            <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                              <span className="text-xl">{categoria.icono}</span> {categoria.titulo}
                            </h4>
                            <ul className="space-y-4">
                              {tareasDeEsteTipo.map((tarea: any, index: number) => renderTarjetaTarea(tarea, index))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAREAS COMPLETADAS (Globales, al final de la pantalla) */}
      {tareasCompletadas.length > 0 && (
        <div className="mt-12 opacity-70 hover:opacity-100 transition-opacity">
          <h3 className="text-lg font-bold text-gray-500 mb-4 flex items-center gap-2">
            ✅ Tareas Completadas
          </h3>
          <ul className="space-y-4">
            {tareasCompletadas.map((tarea, index) => renderTarjetaTarea(tarea, index))}
          </ul>
        </div>
      )}

    </div>
  );
}