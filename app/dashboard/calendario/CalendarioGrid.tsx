"use client";

import { useState } from "react";

export default function CalendarioGrid({ publicacionesIniciales, clientes }: { publicacionesIniciales: any[], clientes: any[] }) {
  const [publicaciones, setPublicaciones] = useState(publicacionesIniciales);
  const [fechaBase, setFechaBase] = useState(new Date());
  
  // NUEVO: Control de vista (Mes o Semana)
  const [vistaCal, setVistaCal] = useState<"MES" | "SEMANA">("MES");

  // Estados para los Modales
  const [modalNuevo, setModalNuevo] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState("");
  
  const [modalCompletar, setModalCompletar] = useState(false);
  const [pubSeleccionada, setPubSeleccionada] = useState<any>(null);
  
  // Estados de los formularios
  const [formNuevo, setFormNuevo] = useState({ clienteId: "", tipo: "REEL" });
  const [formReprogramar, setFormReprogramar] = useState({ dias: 3, tipo: "STORY" });

  // Lógicas de calendario (Mes)
  const mesActual = fechaBase.getMonth();
  const anioActual = fechaBase.getFullYear();
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const primerDiaDelMes = new Date(anioActual, mesActual, 1).getDay();
  const diasEnElMes = new Date(anioActual, mesActual + 1, 0).getDate();
  const offset = primerDiaDelMes === 0 ? 6 : primerDiaDelMes - 1;

  const dias = [];
  for (let i = 0; i < offset; i++) { dias.push(null); }
  for (let i = 1; i <= diasEnElMes; i++) { dias.push(i); }

  // Lógica de calendario (Semana)
  const obtenerDiasSemana = (fecha: Date) => {
    const inicio = new Date(fecha);
    const dia = inicio.getDay();
    const diff = inicio.getDate() - dia + (dia === 0 ? -6 : 1); // Ajusta para que empiece el Lunes
    inicio.setDate(diff);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(inicio);
      d.setDate(d.getDate() + i);
      return d;
    });
  };
  const diasDeLaSemana = obtenerDiasSemana(fechaBase);

  // Navegación de tiempo
  const cambiarFecha = (direccion: number) => {
    if (vistaCal === "MES") {
      setFechaBase(new Date(anioActual, mesActual + direccion, 1));
    } else {
      const nueva = new Date(fechaBase);
      nueva.setDate(nueva.getDate() + (direccion * 7));
      setFechaBase(nueva);
    }
  };

  const getColorPorTipo = (tipo: string, estado: string) => {
    if (estado === "PUBLICADO") return "bg-gray-200 text-gray-500 border-gray-300 line-through opacity-70";
    switch (tipo) {
      case "REEL": return "bg-pink-500 text-white border-pink-600";
      case "CARRUSEL": return "bg-blue-500 text-white border-blue-600";
      case "STORY": return "bg-orange-400 text-white border-orange-500";
      default: return "bg-teal-500 text-white border-teal-600";
    }
  };

  // --- ACCIONES DE EVENTOS ---
  const abrirModalNuevoStr = (fechaStr: string) => {
    setDiaSeleccionado(fechaStr);
    setModalNuevo(true);
  };

  const abrirModalNuevoMes = (dia: number) => {
    const fecha = `${anioActual}-${String(mesActual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    abrirModalNuevoStr(fecha);
  };

  const crearPublicacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNuevo.clienteId) {
      alert("⚠️ ¡Por favor, seleccioná un cliente!");
      return;
    }

    try {
      const res = await fetch("/api/publicaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formNuevo, fechaPrevista: diaSeleccionado })
      });
      if (res.ok) {
        const nueva = await res.json();
        setPublicaciones([...publicaciones, nueva]);
        setModalNuevo(false);
      } else {
        alert("❌ Hubo un error al guardar.");
      }
    } catch (error) {
      alert("📡 Error de conexión.");
    }
  };

  const abrirModalCompletar = (pub: any) => {
    if (pub.estado === "PUBLICADO") return;
    setPubSeleccionada(pub);
    setFormReprogramar({ dias: 3, tipo: pub.tipo });
    setModalCompletar(true);
  };

  const completarYReprogramar = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/publicaciones/${pubSeleccionada.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "PUBLICADO" })
    });

    const fechaVieja = new Date(pubSeleccionada.fechaPrevista);
    fechaVieja.setDate(fechaVieja.getDate() + formReprogramar.dias);
    const nuevaFechaStr = fechaVieja.toISOString().split('T')[0];

    const res = await fetch("/api/publicaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clienteId: pubSeleccionada.clienteId, tipo: formReprogramar.tipo, fechaPrevista: nuevaFechaStr })
    });

    if (res.ok) {
      const nueva = await res.json();
      setPublicaciones(prev => prev.map(p => p.id === pubSeleccionada.id ? { ...p, estado: "PUBLICADO" } : p));
      setPublicaciones(prev => [...prev, nueva]);
      setModalCompletar(false);
    }
  };

  return (
    <div className="relative text-black space-y-4">
      
      {/* --- PANEL DE CONTROL SUPERIOR --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        
        {/* Pestañas Mes / Semana */}
        <div className="bg-gray-100 p-1 rounded-lg inline-flex w-full sm:w-auto">
          <button onClick={() => setVistaCal("SEMANA")} className={`flex-1 sm:flex-none px-6 py-2 text-sm font-bold rounded-md transition-all ${vistaCal === "SEMANA" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"}`}>Semana</button>
          <button onClick={() => setVistaCal("MES")} className={`flex-1 sm:flex-none px-6 py-2 text-sm font-bold rounded-md transition-all ${vistaCal === "MES" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"}`}>Mes</button>
        </div>

        {/* Controles de Tiempo */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button onClick={() => cambiarFecha(-1)} className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm text-gray-600 font-bold hover:bg-gray-100 transition-colors">&lt;</button>
          <h3 className="text-sm sm:text-base font-bold uppercase text-center min-w-[140px] text-gray-800">
            {vistaCal === "MES" 
              ? `${meses[mesActual]} ${anioActual}` 
              : `${diasDeLaSemana[0].getDate()} ${meses[diasDeLaSemana[0].getMonth()].substring(0,3)} - ${diasDeLaSemana[6].getDate()} ${meses[diasDeLaSemana[6].getMonth()].substring(0,3)}`
            }
          </h3>
          <button onClick={() => cambiarFecha(1)} className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm text-gray-600 font-bold hover:bg-gray-100 transition-colors">&gt;</button>
        </div>
      </div>

      {/* --- CONTENEDOR PRINCIPAL DEL CALENDARIO --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {vistaCal === "MES" ? (
          
          /* ======================================================== */
          /* VISTA MENSUAL (Grilla)                                   */
          /* ======================================================== */
          <>
            <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/80">
              {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(dia => (
                <div key={dia} className="text-center py-2.5 text-[10px] sm:text-xs font-bold text-gray-500 uppercase">{dia}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 auto-rows-[minmax(100px,auto)] sm:auto-rows-[minmax(120px,auto)]">
              {dias.map((dia, index) => {
                if (!dia) return <div key={index} className="border-r border-b border-gray-50 bg-gray-50/30"></div>;

                const fechaStr = `${anioActual}-${String(mesActual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
                const pubsDelDia = publicaciones.filter(p => new Date(p.fechaPrevista).toISOString().split('T')[0] === fechaStr);
                const esHoy = new Date().toISOString().split('T')[0] === fechaStr;

                return (
                  <div 
                    key={index} 
                    onClick={() => abrirModalNuevoMes(dia)}
                    className={`border-r border-b border-gray-100 p-1 sm:p-2 cursor-pointer transition-colors hover:bg-gray-50 ${esHoy ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className="mb-1.5 sm:mb-2 flex justify-center sm:justify-start">
                      <span className={`text-[10px] sm:text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full ${esHoy ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500'}`}>{dia}</span>
                    </div>
                    
                    <div className="space-y-1">
                      {pubsDelDia.map(pub => (
                        <div 
                          key={pub.id} 
                          onClick={(e) => { e.stopPropagation(); abrirModalCompletar(pub); }}
                          // MAGIA RESPONSIVE: Texto más chico, paddings microscópicos en celular
                          className={`text-[9px] sm:text-[10px] p-0.5 px-1 sm:p-1 sm:px-1.5 rounded overflow-hidden whitespace-nowrap text-ellipsis font-bold shadow-sm border cursor-pointer hover:opacity-80 transition-opacity ${getColorPorTipo(pub.tipo, pub.estado)}`}
                        >
                          {/* Eliminamos el "@" en celulares para ganar esos 2 caracteres clave */}
                          {pub.cliente?.instagramUser || pub.cliente?.nombre}
                          <span className="hidden sm:inline"> - {pub.tipo}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>

        ) : (

          /* ======================================================== */
          /* VISTA SEMANAL (Lista vertical, ideal para celular)       */
          /* ======================================================== */
          <div className="divide-y divide-gray-100">
            {diasDeLaSemana.map((diaObj, index) => {
              const fechaStr = diaObj.toISOString().split('T')[0];
              const pubsDelDia = publicaciones.filter(p => new Date(p.fechaPrevista).toISOString().split('T')[0] === fechaStr);
              const esHoy = new Date().toISOString().split('T')[0] === fechaStr;
              const nombreDia = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][diaObj.getDay()];

              return (
                <div key={index} className={`flex flex-col sm:flex-row p-4 sm:p-6 gap-4 sm:gap-8 transition-colors ${esHoy ? 'bg-blue-50/20' : 'hover:bg-gray-50'}`}>
                  
                  {/* Columna Izquierda: Fecha */}
                  <div className="sm:w-32 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start sm:pr-6 sm:border-r border-gray-100">
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
                      <span className={`text-sm font-bold uppercase ${esHoy ? 'text-blue-600' : 'text-gray-500'}`}>{nombreDia}</span>
                      <span className={`text-3xl font-black ${esHoy ? 'text-blue-600' : 'text-gray-800'}`}>{diaObj.getDate()}</span>
                    </div>
                    <button onClick={() => abrirModalNuevoStr(fechaStr)} className="sm:mt-3 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors shadow-sm">
                      + Programar
                    </button>
                  </div>
                  
                  {/* Columna Derecha: Tarjetas de Eventos Grandes */}
                  <div className="flex-1 flex flex-col gap-3">
                    {pubsDelDia.length === 0 ? (
                      <span className="text-sm text-gray-400 italic py-2">Día libre, sin publicaciones programadas.</span>
                    ) : (
                      pubsDelDia.map(pub => (
                        <div 
                          key={pub.id} 
                          onClick={() => abrirModalCompletar(pub)} 
                          className={`p-4 rounded-xl border shadow-sm cursor-pointer hover:shadow-md transition-all flex justify-between items-center ${getColorPorTipo(pub.tipo, pub.estado)}`}
                        >
                          <div>
                            <p className="font-black text-base sm:text-lg tracking-tight">
                              {pub.cliente?.instagramUser ? `@${pub.cliente.instagramUser}` : pub.cliente?.nombre}
                            </p>
                            <p className="text-xs opacity-90 font-bold mt-1 uppercase tracking-wider flex items-center gap-1.5">
                              {pub.tipo === 'REEL' ? '🎥' : pub.tipo === 'CARRUSEL' ? '🖼️' : pub.tipo === 'STORY' ? '📱' : '📝'} {pub.tipo}
                            </p>
                          </div>
                          {pub.estado !== "PUBLICADO" && (
                            <div className="bg-white/20 text-white px-4 py-2 rounded-lg text-xs font-bold backdrop-blur-sm border border-white/30">
                              ✓ Completar
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- MODAL NUEVO --- */}
      {modalNuevo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Programar para el {diaSeleccionado.split('-')[2]}</h3>
            <form onSubmit={crearPublicacion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Cliente</label>
                <select required className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 bg-white" onChange={e => setFormNuevo({...formNuevo, clienteId: e.target.value})}>
                  <option value="">Seleccionar...</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Formato</label>
                <select className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 bg-white" value={formNuevo.tipo} onChange={e => setFormNuevo({...formNuevo, tipo: e.target.value})}>
                  <option value="REEL">Reel 🎥</option>
                  <option value="CARRUSEL">Carrusel 🖼️</option>
                  <option value="STORY">Story 📱</option>
                  <option value="POSTEO">Posteo Plano 📝</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setModalNuevo(false)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-bold hover:bg-gray-200">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-bold shadow-sm hover:bg-blue-700">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL COMPLETAR --- */}
      {modalCompletar && pubSeleccionada && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full border-t-4 border-green-500">
            <h3 className="text-xl font-bold text-gray-800 mb-1">¡Posteo Completado! 🎉</h3>
            <p className="text-sm text-gray-500 mb-5">
              Has publicado el {pubSeleccionada.tipo} de <strong>{pubSeleccionada.cliente?.instagramUser ? `@${pubSeleccionada.cliente.instagramUser}` : pubSeleccionada.cliente?.nombre}</strong>.
            </p>
            
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mb-5 shadow-inner">
              <h4 className="font-bold text-gray-700 mb-4 text-sm">¿Cuándo reprogramamos este ciclo?</h4>
              <form onSubmit={completarYReprogramar} className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Días de pausa</label>
                    <input type="number" min="1" value={formReprogramar.dias} onChange={e => setFormReprogramar({...formReprogramar, dias: parseInt(e.target.value)})} className="w-full border border-gray-300 rounded-lg p-2.5 font-black text-blue-600 outline-none focus:border-blue-500 text-lg text-center" />
                  </div>
                  <div className="flex-[2]">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Formato</label>
                    <select value={formReprogramar.tipo} onChange={e => setFormReprogramar({...formReprogramar, tipo: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 text-sm font-bold bg-white h-[46px]">
                      <option value="REEL">Reel 🎥</option>
                      <option value="CARRUSEL">Carrusel 🖼️</option>
                      <option value="STORY">Story 📱</option>
                      <option value="POSTEO">Post Plano 📝</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold shadow-md hover:bg-green-700 transition-colors uppercase tracking-wider text-sm mt-2">
                  Tachar y Reprogramar
                </button>
              </form>
            </div>
            <button onClick={() => setModalCompletar(false)} className="w-full py-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">Cancelar (No tachar aún)</button>
          </div>
        </div>
      )}

    </div>
  );
}