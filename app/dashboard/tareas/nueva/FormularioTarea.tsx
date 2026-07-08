"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FormularioTarea({ clientes, usuarios }: { clientes: any[], usuarios: any[] }) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  
  const [formData, setFormData] = useState({
    titulo: "",
    tipo: "CARRUSEL",
    fechaAsignada: "",
    clienteId: "",
    asignadoAId: "",
    instrucciones: "",
    caption: "",
    linkCanva: "",
    linkMaterial: "", // <-- Agregado al estado inicial
    grupoStories: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    const res = await fetch("/api/tareas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      router.push("/dashboard/tareas");
      router.refresh();
    } else {
      alert("Error al crear la tarea");
      setCargando(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6 text-black">
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Título de la Tarea *</label>
          <input required type="text" name="titulo" onChange={handleChange} placeholder="Ej: Reel Lanzamiento" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo de Contenido *</label>
          <select name="tipo" onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white">
            <option value="CARRUSEL">Carrusel</option>
            <option value="REEL">Reel</option>
            <option value="STORY">Story</option>
            <option value="POSTEO">Posteo Plano</option>
            <option value="OTRO">Otro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Cliente *</label>
          <select required name="clienteId" onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white">
            <option value="">Seleccionar Cliente...</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Asignar a *</label>
          <select required name="asignadoAId" onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white">
            <option value="">Seleccionar Miembro...</option>
            {usuarios.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha Límite / Publicación *</label>
          <input required type="date" name="fechaAsignada" onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>

        <div>
          {/* El espacio libre que quedaba en la grilla lo usamos acá */}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Link de Canva</label>
          <input type="url" name="linkCanva" onChange={handleChange} placeholder="https://canva.com/..." className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Link de Materiales / Drive</label>
          <input type="url" name="linkMaterial" onChange={handleChange} placeholder="https://drive.google.com/..." className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Instrucciones (Espíritu del Reel, Detalle de Slides)</label>
        <textarea name="instrucciones" onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Detallar qué tiene que hacer Mumi..."></textarea>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Caption (Texto para Instagram)</label>
        <textarea name="caption" onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Escribir el copy que acompañará al post..."></textarea>
      </div>

      <button disabled={cargando} type="submit" className="w-full bg-purple-600 text-white font-medium py-3 px-4 rounded-md hover:bg-purple-700 transition-colors">
        {cargando ? "Asignando..." : "Crear y Asignar Tarea"}
      </button>
    </form>
  );
}