"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [idCliente, setIdCliente] = useState("");
  
  const [formData, setFormData] = useState({
    nombre: "",
    codigoInterno: "",
    instagramUser: "",
    instagramPass: "",
    montoMensual: "",
    montoSecundario: "",
    celular: "",
    cuit: ""
  });

  useEffect(() => {
    params.then((parametrosResueltos) => {
      setIdCliente(parametrosResueltos.id);
      
      fetch(`/api/clientes/${parametrosResueltos.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.nombre) {
            setFormData({
              nombre: data.nombre || "",
              codigoInterno: data.codigoInterno || "",
              instagramUser: data.instagramUser || "",
              instagramPass: data.instagramPass || "",
              montoMensual: data.montoMensual?.toString() || "",
              montoSecundario: data.montoSecundario?.toString() || "",
              celular: data.celular || "",
              cuit: data.cuit || ""
            });
          }
          setCargando(false);
        });
    });
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    const res = await fetch(`/api/clientes/${idCliente}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      router.push("/dashboard/clientes");
      router.refresh();
    } else {
      alert("Error al guardar.");
      setGuardando(false);
    }
  };

  // NUEVA FUNCIÓN: Dar de baja al cliente
  const handleEliminar = async () => {
    // Confirmación de seguridad
    if (!window.confirm(`¿Estás seguro de que querés dar de baja a ${formData.nombre}? Dejará de aparecer en la lista de clientes vigentes.`)) {
      return;
    }

    setGuardando(true);
    const res = await fetch(`/api/clientes/${idCliente}`, {
      method: "DELETE"
    });

    if (res.ok) {
      router.push("/dashboard/clientes");
      router.refresh();
    } else {
      alert("Error al intentar dar de baja al cliente.");
      setGuardando(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (cargando) return <div className="p-8 text-center text-gray-500">Cargando cliente...</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Editar Cliente</h2>
        <Link href="/dashboard/clientes" className="text-blue-600 hover:underline font-medium">
          ← Volver a la lista
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre de Cliente *</label>
            <input required type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">ID / Código</label>
            <input type="text" name="codigoInterno" value={formData.codigoInterno} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Monto Mensual USD *</label>
            <input required type="number" step="0.01" name="montoMensual" value={formData.montoMensual} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Monto Secundario USD</label>
            <input type="number" step="0.01" name="montoSecundario" value={formData.montoSecundario} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Usuario de Instagram</label>
            <input type="text" name="instagramUser" value={formData.instagramUser} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Clave de Instagram</label>
            <input type="text" name="instagramPass" value={formData.instagramPass} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-green-700 font-bold">Nro. de Celular (Oculto)</label>
            <input type="text" name="celular" value={formData.celular} onChange={handleChange} className="mt-1 block w-full rounded-md border border-green-300 bg-green-50 px-3 py-2 text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-green-700 font-bold">CUIT (Oculto)</label>
            <input type="text" name="cuit" value={formData.cuit} onChange={handleChange} className="mt-1 block w-full rounded-md border border-green-300 bg-green-50 px-3 py-2 text-black" />
          </div>
        </div>

        <button disabled={guardando} type="submit" className="w-full mt-6 bg-blue-600 text-white font-medium py-3 px-4 rounded-md hover:bg-blue-700 transition-colors">
          {guardando ? "Procesando..." : "Guardar Cambios"}
        </button>
      </form>

      {/* ZONA DE PELIGRO: Dar de baja */}
      <div className="mt-8 bg-red-50 p-6 rounded-xl border border-red-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-bold text-red-800 text-lg">Dar de baja al cliente</h3>
          <p className="text-sm text-red-600 mt-1">El cliente se ocultará del listado, pero se mantendrá su historial de pagos en la bóveda.</p>
        </div>
        <button 
          onClick={handleEliminar}
          disabled={guardando}
          className="bg-white border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold py-2 px-6 rounded-md transition-colors whitespace-nowrap"
        >
          Dar de baja
        </button>
      </div>

    </div>
  );
}