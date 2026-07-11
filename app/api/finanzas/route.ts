import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 1. OBTENER DATOS DEL DASHBOARD (Filtrado por mes/concepto)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conceptoFiltro = searchParams.get("concepto");

    // Buscamos todos los meses/conceptos que existen creados en el historial
    const todosLosConceptos = await prisma.pago.groupBy({
      by: ['concepto'],
      _max: { createdAt: true },
      orderBy: { _max: { createdAt: 'desc' } }
    });
    
    const listaMeses = todosLosConceptos.map(c => c.concepto);

    // Si estás abriendo la app por primera vez, audita el mes más reciente de la lista
    const mesAAuditar = conceptoFiltro || listaMeses[0] || "Abono Julio 2026";

    // Buscamos los pagos específicos de ese mes elegido
    const pagos = await prisma.pago.findMany({
      where: { concepto: mesAAuditar },
      include: { cliente: { select: { nombre: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const totalFacturado = pagos.reduce((acc, p) => acc + p.monto, 0);
    const totalCobrado = pagos.reduce((acc, p) => p.estado === "PAGADO" ? acc + p.monto : acc, 0);
    const totalDeuda = totalFacturado - totalCobrado;

    // NUEVO: Buscamos los gastos REALES guardados para este mes específico
    const gastosDB = await prisma.gastoMes.findUnique({
      where: { mes: mesAAuditar }
    });
    
    // Si todavía no cargaste gastos para este mes, arranca en 0
    const gastosYCostos = gastosDB || { pauta: 0, empleados: 0, contenido: 0 };
    
    const totalGastos = gastosYCostos.pauta + gastosYCostos.empleados + gastosYCostos.contenido;
    const gananciaNeta = totalCobrado - totalGastos;
    const margenUtilidad = totalCobrado > 0 ? Math.round((gananciaNeta / totalCobrado) * 100) : 0;

    const finanzasPorCliente: Record<string, { facturado: number; cobrado: number }> = {};
    pagos.forEach(p => {
      const name = p.cliente.nombre;
      if (!finanzasPorCliente[name]) finanzasPorCliente[name] = { facturado: 0, cobrado: 0 };
      finanzasPorCliente[name].facturado += p.monto;
      if (p.estado === "PAGADO") finanzasPorCliente[name].cobrado += p.monto;
    });

    return NextResponse.json({
      resumen: { 
        totalFacturado, 
        totalCobrado, 
        totalDeuda, 
        totalGastos, 
        gananciaNeta, 
        margenUtilidad, 
        puntoEquilibrio: totalGastos, 
        superadoPuntoEquilibrio: totalCobrado >= totalGastos 
      },
      gastos: gastosYCostos,
      clientesGrafico: Object.entries(finanzasPorCliente).map(([name, data]) => ({ name, facturado: data.facturado, cobrado: data.cobrado })),
      todosLosPagos: pagos.map(p => ({
        id: p.id,
        cliente: p.cliente.nombre,
        concepto: p.concepto,
        monto: p.monto,
        estado: p.estado,
        moneda: p.moneda,
        cuentaDestino: p.cuentaDestino,
        fechaPago: p.fechaPago // Agregamos la fecha para que el frontend la pueda leer al editar
      })),
      listaMeses: listaMeses.length ? listaMeses : ["Abono Julio 2026"]
    });
  } catch (error) {
    console.error("Error en GET finanzas:", error);
    return NextResponse.json({ error: "Error en GET finanzas" }, { status: 500 });
  }
}

// 2. BOTÓN "INICIAR NUEVO MES": Crea deudas en $0 para todos tus clientes activos
export async function POST(request: Request) {
  try {
    const { concepto } = await request.json(); // Recibe ej: "Abono Agosto 2026"
    const clientes = await prisma.cliente.findMany({ where: { activo: true } });
    
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(10); // Seteamos vencimiento estimado para el 10

    const promesas = clientes.map(cliente => 
      prisma.pago.create({
        data: {
          monto: 0,
          concepto,
          fechaVencimiento,
          estado: "PENDIENTE",
          clienteId: cliente.id
        }
      })
    );

    await Promise.all(promesas);
    return NextResponse.json({ message: "Mes generado exitosamente" });
  } catch (error) {
    return NextResponse.json({ error: "Error al generar mes" }, { status: 500 });
  }
}

// 3. MULTI-ACCIÓN: Registrar Cobro, Editar Gastos o Editar Pago Viejo
export async function PUT(request: Request) {
  try {
    const body = await request.json(); 

    // ACCIÓN A: EDITAR GASTOS OPERATIVOS DEL MES
    if (body.accion === "EDITAR_GASTOS") {
      const { mes, empleados, pauta, contenido } = body;
      
      // Upsert: Si el mes ya existe lo actualiza, si no existe lo crea de cero
      const gastosActualizados = await prisma.gastoMes.upsert({
        where: { mes: mes },
        update: { empleados, pauta, contenido },
        create: { mes, empleados, pauta, contenido }
      });
      return NextResponse.json(gastosActualizados);
    }

    // ACCIÓN B: EDITAR UN PAGO YA COBRADO (Corregir errores)
    if (body.accion === "EDITAR_PAGO") {
      const { pagoId, monto, moneda, cuentaDestino, fechaPago } = body;
      
      // Convertimos el string de la fecha ("YYYY-MM-DD") a un objeto Date real
      // Agregamos horas para evitar desfases de zona horaria
      const fechaExacta = new Date(`${fechaPago}T12:00:00`); 

      const actualizado = await prisma.pago.update({
        where: { id: pagoId },
        data: {
          monto: parseFloat(monto),
          moneda,
          cuentaDestino,
          fechaPago: fechaExacta
        }
      });
      return NextResponse.json(actualizado);
    }

    // ACCIÓN C: REGISTRAR UN COBRO NUEVO (El flujo normal que ya tenías)
    const actualizado = await prisma.pago.update({
      where: { id: body.pagoId },
      data: {
        monto: parseFloat(body.monto),
        moneda: body.moneda,
        cuentaDestino: body.cuentaDestino,
        estado: "PAGADO",
        fechaPago: new Date() // Si es un cobro nuevo, le clava la fecha de HOY
      }
    });

    return NextResponse.json(actualizado);
  } catch (error) {
    console.error("Error en PUT finanzas:", error);
    return NextResponse.json({ error: "Error al actualizar la base de datos" }, { status: 500 });
  }
}