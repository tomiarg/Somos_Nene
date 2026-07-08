"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NuevoClientePage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  
  // Estado para guardar lo que tipeamos en el formulario
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    const res = await fetch("/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      router.push("/dashboard/clientes"); // Volvemos a la tabla si sale bien
      router.refresh();
    } else {
      alert("Hubo un error al guardar el cliente.");
      setCargando(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Agregar Nuevo Cliente</h2>
        <Link href="/dashboard/clientes" className="text-blue-600 hover:underline">
          Volver a la lista
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre de Cliente *</label>
            <input required type="text" name="nombre" onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">ID / Código Interno (Ej: JVI)</label>
            <input type="text" name="codigoInterno" onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Monto Mensual USD *</label>
            <input required type="number" step="0.01" name="montoMensual" onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Monto Secundario USD</label>
            <input type="number" step="0.01" name="montoSecundario" onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Usuario de Instagram</label>
            <input type="text" name="instagramUser" onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Clave de Instagram</label>
            <input type="text" name="instagramPass" onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nro. de Celular</label>
            <input type="text" name="celular" onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">CUIT</label>
            <input type="text" name="cuit" onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black" />
          </div>
        </div>

        <button disabled={cargando} type="submit" className="w-full mt-6 bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700">
          {cargando ? "Guardando..." : "Guardar Cliente"}
        </button>
      </form>
    </div>
  );
}