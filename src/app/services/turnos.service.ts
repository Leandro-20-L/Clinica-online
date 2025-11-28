import { Injectable } from '@angular/core';
import {supabase } from "../supabase.client";

@Injectable({
  providedIn: 'root'
})
export class TurnosService {

  constructor() {}

  
  async crearTurno(turno: any) {
    const { data, error } = await supabase
      .from('turno')
      .insert([turno]);

    if (error) {
      console.error('Error al crear el turno:', error.message);
      throw error;
    }

    return data;
  }

  async obtenerTurnosPaciente(idPaciente: number) {
   const { data, error } = await supabase
    .from('turno')
    .select(`
      id_turno,
      id_paciente,
      id_especialista,
      especialidad,
      fecha,
      hora,
      estado,
      comentario_cancelacion,
      resena,
      calificacion,
      completo_encuesta,
      usuarios:usuarios!turno_id_especialista_fkey (
        nombre,
        apellido
      ),
      historia_clinica (
        altura,
        peso,
        temperatura,
        presion,
        dato_opcional_1,
        dato_opcional_2,
        dato_opcional_3
      )
    `)
    .eq('id_paciente', idPaciente)
    .order('fecha', { ascending: true });

  if (error) {
    console.error('Error obteniendo turnos:', error.message);
    return [];
  }

  return data ?? [];
}


async cancelarTurno(idTurno: number) {
  const { error } = await supabase
    .from('turno')
    .update({ estado: 'cancelado' })
    .eq('id_turno', idTurno);

  if (error) throw error;
}

async obtenerTurnosEspecialista(idEspecialista: number) {
 const { data, error } = await supabase
    .from('turno')
    .select(`
      id_turno,
      id_paciente,
      id_especialista,
      fecha,
      hora,
      estado,
      especialidad,
      comentario_cancelacion,
      resena,
      calificacion,
      completo_encuesta,
      usuarios!turno_id_paciente_fkey (
        id,
        nombre,
        apellido,
        obra_social
      ),
      historia_clinica (
        altura,
        peso,
        temperatura,
        presion,
        dato_opcional_1,
        dato_opcional_2,
        dato_opcional_3
      )
    `)
    .eq('id_especialista', idEspecialista)
    .order('fecha', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

  async actualizarEstadoTurno(idTurno: number, nuevoEstado: string, comentario?: string) {
    const updateData: any = { estado: nuevoEstado };
    if (comentario) updateData.comentario_cancelacion = comentario;

    const { error } = await supabase
      .from('turno')
      .update(updateData)
      .eq('id_turno', idTurno);

    if (error) throw error;
  }

  actualizarTurno(id_turno: number, campos: any) {
  return supabase
    .from('turno')
    .update(campos)
    .eq('id_turno', id_turno);
}

async guardarHistoriaClinica(historia: any) {
  const { data, error } = await supabase
    .from('historia_clinica')
    .insert(historia);

  if (error) throw error;

  return data;
}

async obtenerPacientesDeEspecialista(idEspecialista: number) {
  const { data, error } = await supabase
    .from('turno')
    .select(`
      id_paciente,
      usuarios:usuarios!turno_id_paciente_fkey(id, nombre, apellido, imagen1)
    `)
    .eq('id_especialista', idEspecialista)
    .eq('estado', 'realizado');

  if (error) throw error;

  
  const mapa = new Map();
  data.forEach(t => mapa.set(t.id_paciente, t.usuarios));
  return Array.from(mapa.values());
}

async obtenerHistoriasClinicasPaciente(idPaciente: number) {
  const { data, error } = await supabase
    .from('historia_clinica')
    .select(`
      *,
      turno:turno!inner(
        fecha,
        hora,
        especialidad,
        id_especialista,
        especialista:usuarios!turno_id_especialista_fkey(
          id,
          nombre,
          apellido
        )
      )
    `)
    .eq('id_paciente', idPaciente)
    .order('id_historia', { ascending: false });

  if (error) throw error;

  return data;
}

async obtenerTurnosDePaciente(idPaciente: number) {
  const { data, error } = await supabase
    .from('turno')
    .select(`
      *,
      especialista:usuarios!turno_id_especialista_fkey(id, nombre, apellido)
    `)
    .eq('id_paciente', idPaciente);

  if (error) throw error;
  return data || [];
}

async obtenerTurnosPorEspecialistaYFecha(id: number, fecha: string) {
  return supabase
    .from('turno')
    .select('*')
    .eq('id_especialista', id)
    .eq('fecha', fecha)
    .eq('estado', 'pendiente');
}

async obtenerPacientePorId(id: number) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error al obtener paciente:', error);
    return null;
  }

  return data;
}

 async obtenerCantidadTurnosPorEspecialidad() {
    const { data, error } = await supabase
      .from('turno')
      .select('especialidad');

    if (error) throw error;

    const conteo: Record<string, number> = {};

    for (const t of data as any[]) {
      const esp = t.especialidad || 'Sin especialidad';
      conteo[esp] = (conteo[esp] || 0) + 1;
    }

    return Object.entries(conteo).map(([especialidad, count]) => ({
      especialidad,
      count
    }));
  }

  // 2) Cantidad de turnos por día (con rango opcional)
  async obtenerCantidadTurnosPorDia(desde?: string, hasta?: string) {
    let query = supabase
      .from('turno')
      .select('fecha');

    if (desde) {
      query = query.gte('fecha', desde);
    }
    if (hasta) {
      query = query.lte('fecha', hasta);
    }

    const { data, error } = await query;

    if (error) throw error;

    const conteo: Record<string, number> = {};

    for (const t of data as any[]) {
      const fecha = t.fecha;          // '2025-11-26'
      conteo[fecha] = (conteo[fecha] || 0) + 1;
    }

    return Object.entries(conteo)
      .sort(([f1], [f2]) => f1.localeCompare(f2))
      .map(([fecha, count]) => ({ fecha, count }));
  }

  // 3) Turnos SOLICITADOS por médico en un lapso
  async obtenerTurnosSolicitadosPorMedico(
    idEspecialista: number,
    desde: string,
    hasta: string
  ) {
    const { data, error } = await supabase
      .from('turno')
      .select('fecha, estado')
      .eq('id_especialista', idEspecialista)
      .gte('fecha', desde)
      .lte('fecha', hasta);
      // si querés excluir cancelados/rechazados:
      // .not('estado', 'in', '("cancelado","rechazado")');

    if (error) throw error;

    const conteo: Record<string, number> = {};

    for (const t of data as any[]) {
      const fecha = t.fecha;
      conteo[fecha] = (conteo[fecha] || 0) + 1;
    }

    return Object.entries(conteo)
      .sort(([f1], [f2]) => f1.localeCompare(f2))
      .map(([fecha, count]) => ({ fecha, count }));
  }

  // 4) Turnos FINALIZADOS por médico en un lapso
  async obtenerTurnosFinalizadosPorMedico(
    idEspecialista: number,
    desde: string,
    hasta: string
  ) {
    const { data, error } = await supabase
      .from('turno')
      .select('fecha')
      .eq('id_especialista', idEspecialista)
      .eq('estado', 'realizado')    // ajustá si tu estado se llama distinto
      .gte('fecha', desde)
      .lte('fecha', hasta);

    if (error) throw error;

    const conteo: Record<string, number> = {};

    for (const t of data as any[]) {
      const fecha = t.fecha;
      conteo[fecha] = (conteo[fecha] || 0) + 1;
    }

    return Object.entries(conteo)
      .sort(([f1], [f2]) => f1.localeCompare(f2))
      .map(([fecha, count]) => ({ fecha, count }));
  }

}

