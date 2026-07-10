"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function FinanzasPage() {
  const { data: session, status } = useSession() || {};
  const [datos, setDatos] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [mesSeleccionado, setMesSeleccionado] = useState<string>("");
  
  // Estados para procesar los cobros individuales
  const [procesandoId, setProcesandoId] = useState<string | null>(null);
  const [formCobro, setFormCobro] = useState({ monto: "", moneda: "ARS", cuentaDestino: "Mercado Pago" });

  const cargarFinanzas = async (conceptoFiltro?: string) => {
    setCargando(true);
    try {
      const url = conceptoFiltro ? `/api/finanzas?concepto=${encodeURIComponent(conceptoFiltro)}` : "/api/finanzas";
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setDatos(json);
        if (!conceptoFiltro && json.listaMeses?.length) {
          setMesSeleccionado(json.listaMeses[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarFinanzas(); }, []);

  const cambiarDeMes = (mes: string) => {
    setMesSeleccionado(mes);
    cargarFinanzas(mes);
  };

  const iniciarNuevoMes = async () => {
    const nombreMes = prompt("Ingresá el concepto del nuevo ciclo (Ej: Abono Julio 2026):");
    if (!nombreMes) return;

    const res = await fetch("/api/finanzas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ concepto: nombreMes })
    });
    if (res.ok) {
      alert(`🎉 Ciclo ${nombreMes} iniciado con éxito.`);
      setMesSeleccionado(nombreMes);
      cargarFinanzas(nombreMes);
    }
  };

  const procesarCobroSubmit = async (e: React.FormEvent, pagoId: string) => {
    e.preventDefault();
    const res = await fetch("/api/finanzas", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pagoId, ...formCobro })
    });
    if (res.ok) {
      setProcesandoId(null);
      setFormCobro({ monto: "", moneda: "ARS", cuentaDestino: "Mercado Pago" });
      cargarFinanzas(mesSeleccionado);
    }
  };

  // 1. Espera a que cargue tanto la sesión como los datos
  if (status === "loading" || cargando) return <div className="p-8 text-black font-bold">Calculando libros contables...</div>;

  // 2. 🔒 CANDADO REAL: Si no hay usuario logueado, o su rol NO es ADMIN, lo rebota.
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return (
      <div className="p-8 max-w-xl mx-auto mt-20 text-center bg-white border border-red-100 rounded-2xl shadow-xl">
        <span className="text-6xl">🚫</span>
        <h2 className="text-2xl font-black text-red-600 mt-4 uppercase">Acceso Restringido</h2>
        <p className="text-gray-500 mt-2 font-medium">Este espacio financiero está reservado únicamente para los dueños de SOMOS NENE.</p>
      </div>
    );
  }

  // 🧹 LIMPIEZA DE DATOS: Si no hay data real de la API, arrancamos todo en cero absoluto.
  const resumen = datos?.resumen || { 
    totalFacturado: 0, 
    totalCobrado: 0, 
    totalDeuda: 0, 
    totalGastos: 0, 
    gananciaNeta: 0, 
    margenUtilidad: 0, 
    puntoEquilibrio: 0, 
    superadoPuntoEquilibrio: false 
  };
  
  const gastos = datos?.gastos || { pauta: 0, empleados: 0, contenido: 0 };
  const todosLosPagos = datos?.todosLosPagos || [];
  const listaMeses = datos?.listaMeses?.length ? datos.listaMeses : [];

  const pendientes = todosLosPagos.filter((p: any) => p.estado === "PENDIENTE");
  const cobrados = todosLosPagos.filter((p: any) => p.estado === "PAGADO");

  // Prevención de división por cero matemática
  const divisorGastos = resumen.totalGastos > 0 ? resumen.totalGastos : 1;
  const pctPauta = Math.round((gastos.pauta / divisorGastos) * 100) || 0;
  const pctEmpleados = Math.round((gastos.empleados / divisorGastos) * 100) || 0;
  const pctContenido = Math.round((gastos.contenido / divisorGastos) * 100) || 0;

  // Cálculo seguro para la barra de Punto de Equilibrio
  const divisorMeta = resumen.puntoEquilibrio > 0 ? resumen.puntoEquilibrio : 1;
  const pctMeta = Math.min(Math.round((resumen.totalCobrado / divisorMeta) * 100), 100) || 0;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto text-black space-y-8">
      
      {/* HEADER CON SELECCIÓN HISTÓRICA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900">Bóveda y Control de Caja</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Período Auditado:</span>
            <select 
              value={mesSeleccionado} 
              onChange={(e) => cambiarDeMes(e.target.value)}
              className="bg-gray-100 border-2 border-gray-200 text-sm font-bold px-3 py-1.5 rounded-lg text-purple-700 outline-none focus:border-purple-500 bg-white"
            >
              {listaMeses.length > 0 ? (
                listaMeses.map((mes: string) => (
                  <option key={mes} value={mes}>{mes}</option>
                ))
              ) : (
                <option value="">Sin períodos activos</option>
              )}
            </select>
          </div>
        </div>
        <button onClick={iniciarNuevoMes} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-3 rounded-xl shadow-md transition-all text-sm uppercase tracking-wider flex items-center gap-2 w-full sm:w-auto justify-center">
          📅 Iniciar Nuevo Mes
        </button>
      </div>

      {/* REPORTE DE SALUD FINANCIERA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Caja Cobrada Real</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">${resumen.totalCobrado.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Piso Costos Operativos</p>
          <p className="text-2xl font-black text-gray-800 mt-1">${resumen.totalGastos.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Utilidad Neta Actual</p>
          <p className={`text-2xl font-black mt-1 ${resumen.gananciaNeta >= 0 ? 'text-blue-600' : 'text-red-600'}`}>${resumen.gananciaNeta.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">Margen Estratégico</p>
          <p className="text-2xl font-black text-purple-700 mt-1">{resumen.margenUtilidad}%</p>
        </div>
      </div>

      {/* ANÁLISIS ESTRATÉGICO DE GASTOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 space-y-6">
          <div>
            <h3 className="font-bold text-lg text-gray-800">Distribución Estratégica del Gasto</h3>
            <p className="text-xs text-gray-400">Distribución mensual de los egresos de la agencia.</p>
          </div>
          <div className="w-full h-8 bg-gray-100 rounded-xl overflow-hidden flex shadow-inner">
            <div className="bg-orange-500 h-full flex items-center justify-center text-[11px] text-white font-bold" style={{ width: `${pctEmpleados}%` }}>
              {pctEmpleados > 0 ? `${pctEmpleados}%` : ''}
            </div>
            <div className="bg-blue-500 h-full flex items-center justify-center text-[11px] text-white font-bold" style={{ width: `${pctPauta}%` }}>
              {pctPauta > 0 ? `${pctPauta}%` : ''}
            </div>
            <div className="bg-indigo-500 h-full flex items-center justify-center text-[11px] text-white font-bold" style={{ width: `${pctContenido}%` }}>
              {pctContenido > 0 ? `${pctContenido}%` : ''}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-3 rounded-xl bg-orange-50/40 border border-orange-100">
              <span className="text-xs font-bold text-gray-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Equipo</span>
              <p className="text-lg font-black text-gray-800 mt-1">${gastos.empleados.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50/40 border border-blue-100">
              <span className="text-xs font-bold text-gray-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Pauta Ads</span>
              <p className="text-lg font-black text-gray-800 mt-1">${gastos.pauta.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50/40 border border-indigo-100">
              <span className="text-xs font-bold text-gray-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Software / Contenido</span>
              <p className="text-lg font-black text-gray-800 mt-1">${gastos.contenido.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-lg text-gray-800">Punto de Equilibrio</h3>
            <p className="text-xs text-gray-400 mb-4">Piso requerido para cubrir costos operativos fijos.</p>
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-bold text-gray-500">
                <span>Caja: ${resumen.totalCobrado.toLocaleString()}</span>
                <span>Meta: ${resumen.puntoEquilibrio.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden shadow-inner relative">
                <div className={`h-full rounded-full ${resumen.superadoPuntoEquilibrio ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${pctMeta}%` }}></div>
              </div>
            </div>
          </div>
          <div className={`p-4 rounded-xl text-center font-bold text-xs uppercase tracking-wide ${resumen.superadoPuntoEquilibrio ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
            {resumen.superadoPuntoEquilibrio ? "🚀 Zona de Ganancia Real" : "⚠️ Costos fijos no cubiertos"}
          </div>
        </div>
      </div>

      {/* SECCIÓN INTERACTIVA DE PROCESAMIENTO DE PAGOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* COLUMNA 1: CLIENTES PENDIENTES */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">🔴 Cuentas por Cobrar ({pendientes.length})</h3>
          <p className="text-xs text-gray-400">Ingresá el cobro de los clientes listados en el mes seleccionado.</p>

          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {pendientes.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No hay deudas pendientes en este período.</p>
            ) : (
              pendientes.map((p: any) => (
                <div key={p.id} className="p-4 rounded-xl border border-red-100 bg-red-50/20 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm text-gray-800">{p.cliente}</h4>
                      <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{p.concepto}</span>
                    </div>
                    {procesandoId !== p.id && (
                      <button onClick={() => setProcesandoId(p.id)} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors">
                        💰 Registrar Pago
                      </button>
                    )}
                  </div>

                  {procesandoId === p.id && (
                    <form onSubmit={(e) => procesarCobroSubmit(e, p.id)} className="bg-white p-3 rounded-lg border border-gray-200 grid grid-cols-3 gap-2 text-xs">
                      <div className="col-span-3 font-bold text-gray-500 pb-1">Detalles de la Transacción:</div>
                      <div>
                        <label className="block font-bold mb-1">Monto Cobrado</label>
                        <input required type="number" placeholder="Monto" className="w-full border p-1.5 rounded text-black" value={formCobro.monto} onChange={e => setFormCobro({...formCobro, monto: e.target.value})} />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">Moneda</label>
                        <select className="w-full border p-1.5 rounded bg-white text-black" value={formCobro.moneda} onChange={e => setFormCobro({...formCobro, moneda: e.target.value})}>
                          <option value="ARS">Pesos ($)</option>
                          <option value="USD">Dólares (US$)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold mb-1">Caja/Destino</label>
                        <select className="w-full border p-1.5 rounded bg-white text-black" value={formCobro.cuentaDestino} onChange={e => setFormCobro({...formCobro, cuentaDestino: e.target.value})}>
                          <option value="Mercado Pago">Mercado Pago</option>
                          <option value="Banco Galicia">Galicia</option>
                          <option value="Efectivo / Cash">Efectivo / Cash</option>
                          <option value="Crypto / Binance">Binance / Crypto</option>
                        </select>
                      </div>
                      <div className="col-span-3 flex gap-2 pt-2">
                        <button type="button" onClick={() => setProcesandoId(null)} className="flex-1 bg-gray-100 py-1.5 rounded text-gray-600 font-bold">Cancelar</button>
                        <button type="submit" className="flex-1 bg-emerald-600 text-white py-1.5 rounded font-bold hover:bg-emerald-700">Confirmar</button>
                      </div>
                    </form>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMNA 2: HISTORIAL DE INGRESOS */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">🟢 Historial de Caja ({cobrados.length})</h3>
          <p className="text-xs text-gray-400">Flujo de dinero verificado que ingresó exitosamente a las cuentas.</p>

          <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
            {cobrados.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">Todavía no se registraron cobros en este período.</p>
            ) : (
              cobrados.map((p: any) => (
                <div key={p.id} className="p-3 bg-emerald-50/20 border border-emerald-100 rounded-xl flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm text-gray-800">{p.cliente}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">🏦 {p.cuentaDestino}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-emerald-600">
                      {p.moneda === "ARS" ? "$" : "US$"} {p.monto.toLocaleString()}
                    </span>
                    <p className="text-[9px] text-gray-400 font-bold">RECIBIDO ✓</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}