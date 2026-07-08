"use client";

import { useState } from "react";

export default function CalendarioGrid({ publicacionesIniciales, clientes }: { publicacionesIniciales: any[], clientes: any[] }) {
  const [publicaciones, setPublicaciones] = useState(publicacionesIniciales);
  const [fechaBase, setFechaBase] = useState(new Date());

  // Estados para los Modales
  const [modalNuevo, setModalNuevo] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState("");
  
  const [modalCompletar, setModalCompletar] = useState(false);
  const [pubSeleccionada, setPubSeleccionada] = useState<any>(null);
  
  // Estados de los formularios
  const [formNuevo, setFormNuevo] = useState({ clienteId: "", tipo: "REEL" });
  const [formReprogramar, setFormReprogramar] = useState({ dias: 3, tipo: "STORY" });

  // Lógicas de calendario
  const mesActual = fechaBase.getMonth();
  const anioActual = fechaBase.getFullYear();
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const primerDiaDelMes = new Date(anioActual, mesActual, 1).getDay();
  const diasEnElMes = new Date(anioActual, mesActual + 1, 0).getDate();
  const offset = primerDiaDelMes === 0 ? 6 : primerDiaDelMes - 1;

  const dias = [];
  for (let i = 0; i < offset; i++) { dias.push(null); }
  for (let i = 1; i <= diasEnElMes; i++) { dias.push(i); }

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
  const abrirModalNuevo = (dia: number) => {
    const fecha = `${anioActual}-${String(mesActual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    setDiaSeleccionado(fecha);
    setModalNuevo(true);
  };

  const crearPublicacion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Verificamos que haya elegido un cliente
    if (!formNuevo.clienteId) {
      alert("⚠️ ¡Por favor, seleccioná un cliente en el menú desplegable!");
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
        setModalNuevo(false); // Cerramos el modal si todo salió bien
      } else {
        alert("❌ Hubo un error al guardar en la base de datos.");
      }
    } catch (error) {
      alert("📡 Error de conexión con el servidor.");
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
      body: JSON.stringify({ 
        clienteId: pubSeleccionada.clienteId, 
        tipo: formReprogramar.tipo, 
        fechaPrevista: nuevaFechaStr 
      })
    });

    if (res.ok) {
      const nueva = await res.json();
      setPublicaciones(prev => 
        prev.map(p => p.id === pubSeleccionada.id ? { ...p, estado: "PUBLICADO" } : p)
      );
      setPublicaciones(prev => [...prev, nueva]);
      setModalCompletar(false);
    }
  };

  return (
    <div className="relative text-black">
      
      {/* --- EL CALENDARIO --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
          <button onClick={() => setFechaBase(new Date(anioActual, mesActual - 1, 1))} className="px-3 py-1 bg-white border rounded shadow-sm text-sm hover:bg-gray-100">&lt; Mes</button>
          <h3 className="text-lg font-bold uppercase">{meses[mesActual]} {anioActual}</h3>
          <button onClick={() => setFechaBase(new Date(anioActual, mesActual + 1, 1))} className="px-3 py-1 bg-white border rounded shadow-sm text-sm hover:bg-gray-100">Mes &gt;</button>
        </div>

        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-100/50">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(dia => (
            <div key={dia} className="text-center py-2 text-xs font-bold text-gray-500 uppercase">{dia}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-[minmax(120px,auto)]">
          {dias.map((dia, index) => {
            if (!dia) return <div key={index} className="border-r border-b border-gray-100 bg-gray-50/30"></div>;

            const fechaStr = `${anioActual}-${String(mesActual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            const pubsDelDia = publicaciones.filter(p => new Date(p.fechaPrevista).toISOString().split('T')[0] === fechaStr);
            const esHoy = new Date().toISOString().split('T')[0] === fechaStr;

            return (
              <div 
                key={index} 
                onClick={() => abrirModalNuevo(dia)}
                className={`border-r border-b border-gray-100 p-2 cursor-pointer transition-colors hover:bg-gray-50 ${esHoy ? 'bg-blue-50/20' : ''}`}
              >
                <div className="mb-2"><span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${esHoy ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>{dia}</span></div>
                
                <div className="space-y-1">
                  {pubsDelDia.map(pub => (
                    <div 
                      key={pub.id} 
                      onClick={(e) => { e.stopPropagation(); abrirModalCompletar(pub); }}
                      className={`text-[10px] p-1 px-1.5 rounded truncate font-semibold shadow-sm border cursor-pointer hover:opacity-80 transition-opacity ${getColorPorTipo(pub.tipo, pub.estado)}`}
                    >
                      {pub.cliente?.nombre} - {pub.tipo}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- MODAL NUEVO --- */}
      {modalNuevo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Programar para el {diaSeleccionado.split('-')[2]}</h3>
            <form onSubmit={crearPublicacion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Cliente</label>
                <select required className="mt-1 w-full border rounded p-2" onChange={e => setFormNuevo({...formNuevo, clienteId: e.target.value})}>
                  <option value="">Seleccionar...</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Contenido</label>
                <select className="mt-1 w-full border rounded p-2" value={formNuevo.tipo} onChange={e => setFormNuevo({...formNuevo, tipo: e.target.value})}>
                  <option value="REEL">Reel</option>
                  <option value="CARRUSEL">Carrusel</option>
                  <option value="STORY">Story</option>
                  <option value="POSTEO">Posteo Plano</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModalNuevo(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded font-bold">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded font-bold">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL COMPLETAR --- */}
      {modalCompletar && pubSeleccionada && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full border-t-4 border-green-500">
            <h3 className="text-xl font-bold text-gray-800 mb-1">¡Posteo Completado! 🎉</h3>
            <p className="text-sm text-gray-500 mb-5">Has publicado el {pubSeleccionada.tipo} de {pubSeleccionada.cliente?.nombre}.</p>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-5">
              <h4 className="font-bold text-gray-700 mb-3 text-sm">¿Cuándo volver a publicar para este cliente?</h4>
              <form onSubmit={completarYReprogramar} className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase">En cuántos días</label>
                    <input type="number" min="1" value={formReprogramar.dias} onChange={e => setFormReprogramar({...formReprogramar, dias: parseInt(e.target.value)})} className="mt-1 w-full border rounded p-2 font-bold text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase">Qué formato</label>
                    <select value={formReprogramar.tipo} onChange={e => setFormReprogramar({...formReprogramar, tipo: e.target.value})} className="mt-1 w-full border rounded p-2 text-sm">
                      <option value="REEL">Reel</option>
                      <option value="CARRUSEL">Carrusel</option>
                      <option value="STORY">Story</option>
                      <option value="POSTEO">Post Plano</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold shadow-sm hover:bg-green-700 transition-colors">
                  Tachar y Programar Próximo
                </button>
              </form>
            </div>
            <button onClick={() => setModalCompletar(false)} className="w-full text-sm text-gray-500 hover:underline">Cancelar (No publicar aún)</button>
          </div>
        </div>
      )}

    </div>
  );
}